import { mvpQuestions } from '../data/questions'
import type { Question } from '../types/domain'

const questionsById = new Map(mvpQuestions.map((question) => [question.id, question]))

export type QuestionRepository = {
  getSessionQuestionIds: () => string[]
  getQuestionsByIds: (questionIds: string[]) => Question[]
}

export const questionRepository: QuestionRepository = {
  getSessionQuestionIds() {
    return mvpQuestions.map((question) => question.id)
  },
  getQuestionsByIds(questionIds) {
    return questionIds.flatMap((questionId) => {
      const question = questionsById.get(questionId)

      return question ? [question] : []
    })
  },
}
