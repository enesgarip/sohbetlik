import type { Question } from '../types/domain'
import { getCategoryName } from './categories'
import { level1Questions } from './questions/level1'
import { level2Questions } from './questions/level2'
import { level3Questions } from './questions/level3'
import { level4Questions } from './questions/level4'
import type { QuestionContent } from './types'

export const questionContents: QuestionContent[] = [
  ...level1Questions,
  ...level2Questions,
  ...level3Questions,
  ...level4Questions,
]

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
    midLabel: content.slider?.midLabel,
    highLabel: content.slider?.highLabel,
    shuffleOptions: content.shuffleOptions,
  }
}
