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
  midLabel?: string
  highLabel?: string
  // true ise seçenek sırası cevap ekranında (oda bazlı sabit seed'le) karıştırılır.
  shuffleOptions?: boolean
}

export type AnswerValue = string | number

export type AnswerMap = Record<string, AnswerValue>

export type ConversationInsight = {
  tone: 'common' | 'different' | 'prompt'
  title: string
  body: string
}
