import type { ConversationInsight, Question } from '../types/domain'
import type { AnswerMap } from '../types/domain'
import { activeQuestionContents } from '../content'
import { getAnswerLabel } from '../domain/results'

type AnswerPair = {
  prompt: string
  category: string
  person1: string
  person2: string
  followup: string
  aiHint?: string
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

export async function fetchAiSummary(
  questions: Question[],
  currentAnswers: AnswerMap,
  counterpartAnswers: AnswerMap,
): Promise<ConversationInsight[] | null> {
  const pairs = buildPairs(questions, currentAnswers, counterpartAnswers)

  if (pairs.length === 0) {
    return null
  }

  try {
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairs }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (!Array.isArray(data?.insights)) {
      return null
    }

    return data.insights as ConversationInsight[]
  } catch {
    return null
  }
}
