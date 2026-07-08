import { traits, tendencyAreas, type TendencyAreaSlug, type TraitSlug } from '../content/traits'
import { activeQuestionContents } from '../content'
import { getAnswerLabel } from './results'
import type { AnswerMap, Question } from '../types/domain'

// ── Types ──

export type ConfidenceLevel = 'low' | 'medium' | 'high'

export type TendencyScore = {
  trait: TraitSlug
  area: TendencyAreaSlug
  areaLabel: string
  areaEmoji: string
  spectrum: [string, string]
  rawScore: number // -2 to +2
  sampleSize: number
  confidence: ConfidenceLevel
  variance: number
}

export type AreaSummary = {
  slug: TendencyAreaSlug
  label: string
  emoji: string
  tendencies: TendencyScore[]
}

export type BehaviorSnapshot = {
  tendencies: TendencyScore[]
  areas: AreaSummary[]
}

// ── Scoring ──

function sliderValueToWeight(value: number): 'low' | 'mid' | 'high' {
  if (value <= 2) return 'low'
  if (value >= 4) return 'high'
  return 'mid'
}

/**
 * Calculate tendency scores from answered questions.
 * Each question's answerWeights map option IDs to trait score contributions.
 */
export function calculateTendencies(
  questions: Question[],
  answers: AnswerMap,
): BehaviorSnapshot {
  // Accumulate raw contributions per trait
  const contributions: Record<string, { scores: number[]; weights: number[] }> = {}

  for (const question of questions) {
    const answerValue = answers[question.id]
    if (answerValue === undefined) continue

    // Find the question content with answerWeights
    const content = activeQuestionContents.find((c) => c.slug === question.id)
    if (!content?.answerWeights) continue

    const tendencyWeight = content.tendencyWeight ?? 1

    // Determine which weight key to use
    let weightKey: string
    if (question.type === 'slider') {
      const numValue = typeof answerValue === 'number' ? answerValue : Number(answerValue)
      weightKey = sliderValueToWeight(numValue)
    } else {
      weightKey = String(answerValue)
    }

    const traitScores = content.answerWeights[weightKey]
    if (!traitScores) continue

    for (const [traitSlug, score] of Object.entries(traitScores)) {
      if (score === undefined) continue

      if (!contributions[traitSlug]) {
        contributions[traitSlug] = { scores: [], weights: [] }
      }
      contributions[traitSlug].scores.push(score * tendencyWeight)
      contributions[traitSlug].weights.push(tendencyWeight)
    }
  }

  // Calculate final scores
  const tendencies: TendencyScore[] = []

  for (const [traitSlug, data] of Object.entries(contributions)) {
    const traitDef = traits[traitSlug as TraitSlug]
    if (!traitDef) continue

    const totalWeight = data.weights.reduce((sum, w) => sum + w, 0)
    const rawScore = totalWeight > 0
      ? data.scores.reduce((sum, s) => sum + s, 0) / totalWeight
      : 0

    // Clamp to -2..+2
    const clampedScore = Math.max(-2, Math.min(2, rawScore))

    // Calculate variance
    const mean = clampedScore
    const variance = data.scores.length > 1
      ? data.scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / data.scores.length
      : 0

    const sampleSize = data.scores.length
    const confidence: ConfidenceLevel =
      sampleSize >= 3 ? 'high' : sampleSize === 2 ? 'medium' : 'low'

    const area = traitDef.area
    const areaDef = tendencyAreas[area]

    tendencies.push({
      trait: traitSlug as TraitSlug,
      area,
      areaLabel: areaDef.label,
      areaEmoji: areaDef.emoji,
      spectrum: traitDef.spectrum,
      rawScore: clampedScore,
      sampleSize,
      confidence,
      variance,
    })
  }

  // Sort by confidence (high first), then by absolute score (strongest signals first)
  tendencies.sort((a, b) => {
    const confOrder = { high: 0, medium: 1, low: 2 }
    const confDiff = confOrder[a.confidence] - confOrder[b.confidence]
    if (confDiff !== 0) return confDiff
    return Math.abs(b.rawScore) - Math.abs(a.rawScore)
  })

  // Group into areas
  const areaMap: Record<string, TendencyScore[]> = {}
  for (const t of tendencies) {
    if (!areaMap[t.area]) areaMap[t.area] = []
    areaMap[t.area].push(t)
  }

  const areas: AreaSummary[] = Object.entries(areaMap).map(([slug, tendencyList]) => {
    const areaDef = tendencyAreas[slug as TendencyAreaSlug]
    return {
      slug: slug as TendencyAreaSlug,
      label: areaDef.label,
      emoji: areaDef.emoji,
      tendencies: tendencyList,
    }
  })

  return { tendencies, areas }
}

// ── AI Input Builder ──

export type TendencyAIInput = {
  sessionContext: {
    level: number
    questionCount: number
    hasPair: boolean
  }
  person: {
    tendencies: Array<{
      slug: string
      area: string
      areaLabel: string
      score: number
      confidence: ConfidenceLevel
      spectrum: [string, string]
      position: string
      variance: number
    }>
  }
  counterpart?: {
    tendencies: Array<{
      slug: string
      area: string
      areaLabel: string
      score: number
      confidence: ConfidenceLevel
      spectrum: [string, string]
      position: string
      variance: number
    }>
  }
  sharedQuestions: Array<{
    prompt: string
    personAnswer: string
    counterpartAnswer: string
    tendency: string
    followupPrompt: string
  }>
}

function scoreToPosition(score: number): string {
  if (score <= -1.5) return 'strong-left'
  if (score <= -0.5) return 'left-leaning'
  if (score >= 1.5) return 'strong-right'
  if (score >= 0.5) return 'right-leaning'
  return 'center'
}

function mapTendenciesForAI(snapshot: BehaviorSnapshot) {
  return snapshot.tendencies
    .filter((t) => t.confidence !== 'low')
    .map((t) => ({
      slug: t.trait,
      area: t.area,
      areaLabel: t.areaLabel,
      score: Math.round(t.rawScore * 100) / 100,
      confidence: t.confidence,
      spectrum: t.spectrum,
      position: scoreToPosition(t.rawScore),
      variance: Math.round(t.variance * 100) / 100,
    }))
}

/**
 * Build the full AI input package for the summary API.
 */
export function buildTendencyAIInput(
  questions: Question[],
  personAnswers: AnswerMap,
  counterpartAnswers?: AnswerMap,
): TendencyAIInput {
  const personSnapshot = calculateTendencies(questions, personAnswers)

  const sharedQuestions: TendencyAIInput['sharedQuestions'] = []
  for (const question of questions) {
    const pAnswer = personAnswers[question.id]
    const cAnswer = counterpartAnswers?.[question.id]
    if (pAnswer === undefined || cAnswer === undefined) continue

    const content = activeQuestionContents.find((c) => c.slug === question.id)
    sharedQuestions.push({
      prompt: question.prompt,
      personAnswer: getAnswerLabel(question, pAnswer),
      counterpartAnswer: getAnswerLabel(question, cAnswer),
      tendency: content?.trait ?? '',
      followupPrompt: content?.followupPrompt ?? '',
    })
  }

  const result: TendencyAIInput = {
    sessionContext: {
      level: questions[0]?.level ?? 1,
      questionCount: questions.length,
      hasPair: Boolean(counterpartAnswers),
    },
    person: {
      tendencies: mapTendenciesForAI(personSnapshot),
    },
    sharedQuestions,
  }

  if (counterpartAnswers) {
    const counterpartSnapshot = calculateTendencies(questions, counterpartAnswers)
    result.counterpart = {
      tendencies: mapTendenciesForAI(counterpartSnapshot),
    }
  }

  return result
}

// ── Pair Comparison ──

export type PairInsight = {
  kind: 'common' | 'different'
  trait: TraitSlug
  areaLabel: string
  areaEmoji: string
  spectrum: [string, string]
  description: string
  talkStarter: string
}

/**
 * Compare two people's tendency snapshots and generate pair insights.
 * Returns common ground + interesting differences, sorted by strength.
 */
export function compareTendencies(
  person: BehaviorSnapshot,
  counterpart: BehaviorSnapshot,
): PairInsight[] {
  const insights: PairInsight[] = []

  for (const pTendency of person.tendencies) {
    if (pTendency.confidence === 'low') continue

    const cTendency = counterpart.tendencies.find((t) => t.trait === pTendency.trait)
    if (!cTendency || cTendency.confidence === 'low') continue

    const diff = Math.abs(pTendency.rawScore - cTendency.rawScore)
    const traitDef = traits[pTendency.trait]
    if (!traitDef) continue

    // Determine position labels
    const posLabel = (score: number, spectrum: [string, string]) => {
      if (score <= -0.5) return `"${spectrum[0]}" tarafına yakın`
      if (score >= 0.5) return `"${spectrum[1]}" tarafına yakın`
      return 'ortada'
    }

    if (diff < 0.8) {
      // Similar — common ground
      const pos = posLabel(pTendency.rawScore, pTendency.spectrum)
      insights.push({
        kind: 'common',
        trait: pTendency.trait,
        areaLabel: pTendency.areaLabel,
        areaEmoji: pTendency.areaEmoji,
        spectrum: pTendency.spectrum,
        description: `İkiniz de ${pos} görünüyorsunuz.`,
        talkStarter: `Bu konuda benzer düşünmeniz güzel — birbirinize bunun günlük hayatta nasıl göründüğünü anlatın.`,
      })
    } else if (diff >= 1.2) {
      // Clearly different — interesting contrast
      const pPos = posLabel(pTendency.rawScore, pTendency.spectrum)
      const cPos = posLabel(cTendency.rawScore, cTendency.spectrum)
      insights.push({
        kind: 'different',
        trait: pTendency.trait,
        areaLabel: pTendency.areaLabel,
        areaEmoji: pTendency.areaEmoji,
        spectrum: pTendency.spectrum,
        description: `Sen ${pPos}, karşı taraf ${cPos}. Bu fark sohbetlerinizi zenginleştirebilir.`,
        talkStarter: `Bu farklılığın günlük hayatta nasıl göründüğünü merak ediyor musunuz? Birbirinize bir örnek anlatın.`,
      })
    }
  }

  // Sort: differences first (more interesting), then commons
  insights.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'different' ? -1 : 1
    return 0
  })

  // Limit to top 6 to keep UI clean
  return insights.slice(0, 6)
}
