import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

/**
 * Question Calibration API
 *
 * Computes per-question quality metrics:
 * 1. Entropy — how evenly distributed answers are (higher = better discriminator)
 * 2. Response count — confidence in the metric
 * 3. Dominant answer ratio — if >85% pick the same option, question is weak
 * 4. Discrimination grade — A/B/C/D based on entropy + volume
 *
 * GET /api/calibration — returns all questions with metrics
 * GET /api/calibration?level=1 — filter by level
 */

type AnswerRow = {
  question_id: string
  answer_value: unknown
}

type QuestionMetric = {
  questionId: string
  responseCount: number
  optionCount: number
  entropy: number
  maxEntropy: number
  normalizedEntropy: number
  dominantOption: string
  dominantPercent: number
  grade: 'A' | 'B' | 'C' | 'D'
  recommendation: string
}

function calcEntropy(counts: number[], total: number): number {
  if (total === 0) return 0
  let entropy = 0
  for (const count of counts) {
    if (count === 0) continue
    const p = count / total
    entropy -= p * Math.log2(p)
  }
  return entropy
}

function gradeQuestion(normalizedEntropy: number, responseCount: number, dominantPercent: number): {
  grade: 'A' | 'B' | 'C' | 'D'
  recommendation: string
} {
  if (responseCount < 10) {
    return { grade: 'D', recommendation: 'Yetersiz veri — en az 10 cevap gerekli' }
  }

  if (dominantPercent >= 85) {
    return { grade: 'D', recommendation: 'Çok baskın bir cevap var — soru ya çok kolay ya da seçenekler dengesiz' }
  }

  if (dominantPercent >= 70) {
    return { grade: 'C', recommendation: 'Bir cevap baskın — seçenekleri gözden geçir veya weight düşür' }
  }

  if (normalizedEntropy >= 0.75) {
    return { grade: 'A', recommendation: 'Güçlü ayırıcı — weight artırılabilir' }
  }

  if (normalizedEntropy >= 0.5) {
    return { grade: 'B', recommendation: 'İyi ayırıcı — mevcut weight uygun' }
  }

  return { grade: 'C', recommendation: 'Zayıf ayırım — seçenekleri veya soruyu revize et' }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Database not configured' })
  }

  const level = req.query.level ? Number(req.query.level) : null

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all answers (optionally filtered by level through questions)
    let query = supabase.from('answers').select('question_id, answer_value')

    if (level) {
      // Get question IDs for this level first
      const { data: questionRows } = await supabase
        .from('questions')
        .select('id')
        .eq('level', level)

      if (questionRows && questionRows.length > 0) {
        const ids = questionRows.map((q) => q.id)
        query = query.in('question_id', ids)
      }
    }

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ metrics: [], summary: { totalQuestions: 0, totalAnswers: 0 } })
    }

    // Aggregate answers per question
    const perQuestion: Record<string, Record<string, number>> = {}

    for (const row of data as AnswerRow[]) {
      const qId = row.question_id
      const val = typeof row.answer_value === 'object'
        ? JSON.stringify(row.answer_value).replace(/"/g, '')
        : String(row.answer_value)

      if (!perQuestion[qId]) perQuestion[qId] = {}
      perQuestion[qId][val] = (perQuestion[qId][val] || 0) + 1
    }

    // Calculate metrics per question
    const metrics: QuestionMetric[] = Object.entries(perQuestion).map(([questionId, optionCounts]) => {
      const counts = Object.values(optionCounts)
      const total = counts.reduce((sum, c) => sum + c, 0)
      const optionCount = counts.length
      const entropy = calcEntropy(counts, total)
      const maxEntropy = optionCount > 1 ? Math.log2(optionCount) : 1
      const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0

      const sortedOptions = Object.entries(optionCounts).sort((a, b) => b[1] - a[1])
      const dominantOption = sortedOptions[0]?.[0] ?? ''
      const dominantPercent = total > 0 ? Math.round((sortedOptions[0]?.[1] ?? 0) / total * 100) : 0

      const { grade, recommendation } = gradeQuestion(normalizedEntropy, total, dominantPercent)

      return {
        questionId,
        responseCount: total,
        optionCount,
        entropy: Math.round(entropy * 1000) / 1000,
        maxEntropy: Math.round(maxEntropy * 1000) / 1000,
        normalizedEntropy: Math.round(normalizedEntropy * 1000) / 1000,
        dominantOption,
        dominantPercent,
        grade,
        recommendation,
      }
    })

    // Sort by grade (D first = needs attention), then by response count
    const gradeOrder = { D: 0, C: 1, B: 2, A: 3 }
    metrics.sort((a, b) => {
      const gradeDiff = gradeOrder[a.grade] - gradeOrder[b.grade]
      if (gradeDiff !== 0) return gradeDiff
      return b.responseCount - a.responseCount
    })

    const summary = {
      totalQuestions: metrics.length,
      totalAnswers: data.length,
      gradeDistribution: {
        A: metrics.filter((m) => m.grade === 'A').length,
        B: metrics.filter((m) => m.grade === 'B').length,
        C: metrics.filter((m) => m.grade === 'C').length,
        D: metrics.filter((m) => m.grade === 'D').length,
      },
      averageNormalizedEntropy: metrics.length > 0
        ? Math.round(metrics.reduce((sum, m) => sum + m.normalizedEntropy, 0) / metrics.length * 1000) / 1000
        : 0,
    }

    // Cache for 30 minutes
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    return res.status(200).json({ metrics, summary })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
