export type QuestionLevel = 1 | 2 | 3 | 4

export type QuestionType = 'choice' | 'either_or' | 'slider'

export type QuestionOption = {
  id: string
  label: string
}

export type Question = {
  id: string
  category: string
  level: QuestionLevel
  type: QuestionType
  prompt: string
  options: QuestionOption[]
  lowLabel?: string
  highLabel?: string
}

export type AnswerValue = string | number

export type Stage = 'intro' | 'room' | 'answering' | 'waiting' | 'results'

export type ConversationInsight = {
  title: string
  body: string
}
