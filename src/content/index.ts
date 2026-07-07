import type { Question } from '../types/domain'
import { getCategoryName } from './categories'
import { level1Questions } from './questions/level1'
import type { QuestionContent } from './types'

export const questionContents: QuestionContent[] = [...level1Questions]

export const activeQuestionContents = questionContents.filter(
  (content) => content.status === 'active',
)

// İçerik modeli zengin, UI modeli sade: cevap ekranı ve sonuçlar
// yalnızca bu alanlara ihtiyaç duyar.
export function toDomainQuestion(content: QuestionContent): Question {
  return {
    id: content.slug,
    category: getCategoryName(content.category),
    level: content.level,
    type: content.type,
    prompt: content.prompt,
    options: (content.options ?? []).map(({ id, label }) => ({ id, label })),
    lowLabel: content.slider?.lowLabel,
    highLabel: content.slider?.highLabel,
    shuffleOptions: content.shuffleOptions,
  }
}
