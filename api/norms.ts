import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

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
  const slugs = body?.questionIds

  if (!Array.isArray(slugs) || slugs.length === 0) {
    return res.status(400).json({ error: 'Missing questionIds array' })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Resolve slugs to UUIDs
    const { data: questionRows, error: qErr } = await supabase
      .from('questions')
      .select('id, slug')
      .in('slug', slugs)

    if (qErr || !questionRows || questionRows.length === 0) {
      return res.status(200).json({ distributions: [] })
    }

    const slugByUuid = new Map(questionRows.map((q) => [q.id, q.slug]))
    const uuids = questionRows.map((q) => q.id)

    const { data, error } = await supabase
      .from('answers')
      .select('question_id, answer_value')
      .in('question_id', uuids)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ distributions: [] })
    }

    const counts: Record<string, Record<string, number>> = {}
    const totals: Record<string, number> = {}

    for (const row of data) {
      const slug = slugByUuid.get(row.question_id)
      if (!slug) continue

      const val = typeof row.answer_value === 'object'
        ? JSON.stringify(row.answer_value).replace(/"/g, '')
        : String(row.answer_value)

      if (!counts[slug]) counts[slug] = {}
      counts[slug][val] = (counts[slug][val] || 0) + 1
      totals[slug] = (totals[slug] || 0) + 1
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

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return res.status(200).json({ distributions })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
