import { activeQuestionContents, toDomainQuestion } from '../content'
import { mvpQuestions } from '../data/questions'
import { selectSessionQuestions } from '../domain/questionSelection'
import type { Question, QuestionLevel } from '../types/domain'

export const SESSION_LEVEL = 1
export const SESSION_QUESTION_COUNT = 24

const activeQuestions = activeQuestionContents.map(toDomainQuestion)

// Eski demo soruları da haritada kalır: mevcut odalar (localStorage veya DB)
// pasifleştirilmiş sorulara referans veriyor olabilir.
const questionsById = new Map<string, Question>(
  [...mvpQuestions, ...activeQuestions].map((question) => [question.id, question]),
)

export type QuestionRepository = {
  getSessionQuestionIds: (input?: {
    level?: QuestionLevel
    excludeSlugs?: readonly string[]
    hardExcludeSlugs?: readonly string[]
  }) => string[]
  getQuestionsByIds: (questionIds: string[]) => Question[]
}

export const questionRepository: QuestionRepository = {
  getSessionQuestionIds(input = {}) {
    const level = input.level ?? SESSION_LEVEL

    return selectSessionQuestions({
      pool: activeQuestionContents,
      level,
      count: SESSION_QUESTION_COUNT,
      excludeSlugs: input.excludeSlugs,
      hardExcludeSlugs: input.hardExcludeSlugs,
    }).map((question) => question.slug)
  },
  getQuestionsByIds(questionIds) {
    return questionIds.flatMap((questionId) => {
      const question = questionsById.get(questionId)

      return question ? [question] : []
    })
  },
}
