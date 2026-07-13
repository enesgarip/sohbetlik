import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

type DistributionRow = {
  question_id: string
  answer_value: string | number
  count: number
  total: number
  percentage: number
}

type QuestionDistribution = {
  questionId: string
  total: number
  options: Array<{
    value: string | number
    count: number
    percentage: number
  }>
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Database not configured' })
  }

  const body = req.body as { questionIds?: string[] } | undefined
  const questionIds = body?.questionIds

  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return res.status(400).json({ error: 'Missing questionIds array' })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Query answer distribution for the requested questions
    // Group by question_id and answer_value, count occurrences
    const { data, error } = await supabase
      .from('answers')
      .select('question_id, answer_value')
      .in('question_id', questionIds)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ distributions: [] })
    }

    // Aggregate in JS since Supabase REST doesn't support GROUP BY
    const counts: Record<string, Record<string, number>> = {}
    const totals: Record<string, number> = {}

    for (const row of data) {
      const qId = row.question_id
      const val = typeof row.answer_value === 'object'
        ? JSON.stringify(row.answer_value).replace(/"/g, '')
        : String(row.answer_value)

      if (!counts[qId]) counts[qId] = {}
      counts[qId][val] = (counts[qId][val] || 0) + 1
      totals[qId] = (totals[qId] || 0) + 1
    }

    const distributions: QuestionDistribution[] = Object.entries(counts).map(
      ([questionId, optionCounts]) => {
        const total = totals[questionId]
        const options = Object.entries(optionCounts)
          .map(([value, count]) => ({
            value: isNaN(Number(value)) ? value : Number(value),
            count,
            percentage: Math.round((count / total) * 100),
          }))
          .sort((a, b) => b.count - a.count)

        return { questionId, total, options }
      },
    )

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return res.status(200).json({ distributions })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
