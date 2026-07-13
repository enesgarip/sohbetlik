import type { ConversationInsight, Question } from '../types/domain'
import type { AnswerMap } from '../types/domain'
import { activeQuestionContents } from '../content'
import { getAnswerLabel } from '../domain/results'
import { calculateTendencies } from '../domain/tendencyScoring'
import type { BehaviorSnapshot } from '../domain/tendencyScoring'

type AnswerPair = {
  prompt: string
  category: string
  person1: string
  person2: string
  followup: string
  aiHint?: string
}

type TendencySummary = {
  trait: string
  area: string
  areaLabel: string
  areaEmoji: string
  spectrum: [string, string]
  score: number
  confidence: string
  variance: number
}

function buildPairs(
  questions: Question[],
  currentAnswers: AnswerMap,
  counterpartAnswers: AnswerMap,
): AnswerPair[] {
  return questions.reduce<AnswerPair[]>((pairs, question) => {
    const a = currentAnswers[question.id]
    const b = counterpartAnswers[question.id]

    if (a === undefined || b === undefined) {
      return pairs
    }

    const content = activeQuestionContents.find((c) => c.slug === question.id)

    pairs.push({
      prompt: question.prompt,
      category: question.category,
      person1: getAnswerLabel(question, a),
      person2: getAnswerLabel(question, b),
      followup: content?.followupPrompt ?? '',
      aiHint: content?.aiHint,
    })

    return pairs
  }, [])
}

function snapshotToSummaries(snapshot: BehaviorSnapshot): TendencySummary[] {
  return snapshot.tendencies
    .filter((t) => t.confidence !== 'low')
    .map((t) => ({
      trait: t.trait,
      area: t.area,
      areaLabel: t.areaLabel,
      areaEmoji: t.areaEmoji,
      spectrum: t.spectrum,
      score: Math.round(t.rawScore * 100) / 100,
      confidence: t.confidence,
      variance: Math.round(t.variance * 100) / 100,
    }))
}

export type CrossLevelInsight = {
  tone: 'growth' | 'pattern' | 'prompt'
  title: string
  body: string
}

export type LevelTendencyData = {
  level: number
  personTendencies: TendencySummary[]
  counterpartTendencies: TendencySummary[]
}

export type AiSummaryResult = {
  insights: ConversationInsight[]
  personTendencies: TendencySummary[]
  counterpartTendencies: TendencySummary[]
}

export async function fetchAiSummary(
  questions: Question[],
  currentAnswers: AnswerMap,
  counterpartAnswers: AnswerMap,
): Promise<AiSummaryResult | null> {
  const pairs = buildPairs(questions, currentAnswers, counterpartAnswers)

  if (pairs.length === 0) {
    return null
  }

  // Calculate tendency scores
  const personSnapshot = calculateTendencies(questions, currentAnswers)
  const counterpartSnapshot = calculateTendencies(questions, counterpartAnswers)

  try {
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairs,
        personTendencies: snapshotToSummaries(personSnapshot),
        counterpartTendencies: snapshotToSummaries(counterpartSnapshot),
      }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (!Array.isArray(data?.insights)) {
      return null
    }

    return {
      insights: data.insights as ConversationInsight[],
      personTendencies: snapshotToSummaries(personSnapshot),
      counterpartTendencies: snapshotToSummaries(counterpartSnapshot),
    }
  } catch {
    return null
  }
}

export function buildLevelTendencyData(
  level: number,
  questions: Question[],
  personAnswers: AnswerMap,
  counterpartAnswers: AnswerMap,
): LevelTendencyData {
  const personSnapshot = calculateTendencies(questions, personAnswers)
  const counterpartSnapshot = calculateTendencies(questions, counterpartAnswers)
  return {
    level,
    personTendencies: snapshotToSummaries(personSnapshot),
    counterpartTendencies: snapshotToSummaries(counterpartSnapshot),
  }
}

export async function fetchCrossLevelSummary(
  levels: LevelTendencyData[],
): Promise<CrossLevelInsight[] | null> {
  if (levels.length < 2) return null

  try {
    const response = await fetch('/api/cross-level-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ levels }),
    })

    if (!response.ok) return null

    const data = await response.json()
    if (!Array.isArray(data?.insights)) return null

    return data.insights as CrossLevelInsight[]
  } catch {
    return null
  }
}
