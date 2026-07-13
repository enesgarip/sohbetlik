import { useState, useEffect } from 'react'

export type OptionDistribution = {
  value: string | number
  count: number
  percentage: number
}

export type QuestionDistribution = {
  questionId: string
  total: number
  options: OptionDistribution[]
}

export type NormsMap = Record<string, QuestionDistribution>

export function useCommunityNorms(questionIds: string[]): {
  norms: NormsMap
  isLoading: boolean
} {
  const [norms, setNorms] = useState<NormsMap>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (questionIds.length === 0) return

    let cancelled = false
    setIsLoading(true)

    fetch('/api/norms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        const distributions: QuestionDistribution[] = data?.distributions ?? []
        const map: NormsMap = {}
        for (const d of distributions) {
          map[d.questionId] = d
        }
        setNorms(map)
      })
      .catch(() => {
        // Silent fail — norms are optional enrichment
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [questionIds.join(',')])

  return { norms, isLoading }
}

/**
 * Given a user's answer and the community distribution for that question,
 * returns a human-friendly label like "Kullanıcıların %67'si de böyle düşünüyor"
 * or "Cevapların sadece %12'si bu yönde — ilginç bir tercih!"
 */
export function getNormLabel(
  answerValue: string | number,
  distribution: QuestionDistribution | undefined,
): string | null {
  if (!distribution || distribution.total < 10) return null // Not enough data

  const match = distribution.options.find(
    (o) => String(o.value) === String(answerValue),
  )
  if (!match) return null

  const pct = match.percentage

  if (pct >= 60) return `Kullanıcıların %${pct}'i de böyle düşünüyor`
  if (pct <= 20) return `Sadece %${pct} bu yönde — ilginç bir tercih!`
  return null // 20-60% is unremarkable, don't show
}
