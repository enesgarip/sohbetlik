import { describe, expect, it } from 'vitest'
import { buildConversationInsights, getAnswerLabel } from './results'
import type { AnswerMap, Question } from '../types/domain'

const questions: Question[] = [
  {
    id: 'humor-style',
    category: 'Mizah',
    level: 1,
    type: 'choice',
    prompt: 'Seni en hızlı hangi mizah yakalar?',
    options: [
      { id: 'dry', label: 'Kuru ve zeki' },
      { id: 'absurd', label: 'Absürt' },
    ],
  },
  {
    id: 'message-rhythm',
    category: 'İletişim',
    level: 2,
    type: 'slider',
    prompt: 'Mesajlaşmada gün içinde temas senin için ne kadar önemli?',
    lowLabel: 'Az ama net',
    highLabel: 'Sık temas iyi gelir',
    options: [
      { id: '1', label: '1' },
      { id: '2', label: '2' },
      { id: '3', label: '3' },
      { id: '4', label: '4' },
      { id: '5', label: '5' },
    ],
  },
]

describe('conversation results', () => {
  it('turns shared and different answers into conversation prompts', () => {
    const currentAnswers: AnswerMap = {
      'humor-style': 'dry',
      'message-rhythm': 2,
    }
    const counterpartAnswers: AnswerMap = {
      'humor-style': 'dry',
      'message-rhythm': 5,
    }
    const insights = buildConversationInsights(questions, currentAnswers, counterpartAnswers)

    expect(insights.some((insight) => insight.tone === 'common')).toBe(true)
    expect(insights.some((insight) => insight.tone === 'different')).toBe(true)
    expect(insights.some((insight) => insight.tone === 'prompt')).toBe(true)
  })

  it('keeps the result language away from scoring', () => {
    const insights = buildConversationInsights(questions, { 'humor-style': 'absurd' })
    const serialized = JSON.stringify(insights).toLocaleLowerCase('tr-TR')

    expect(serialized).not.toContain('%')
    expect(serialized).not.toContain('puan')
    expect(serialized).not.toContain('uyum')
    expect(serialized).not.toContain('uygun')
  })

  it('renders slider values in a compact label', () => {
    expect(getAnswerLabel(questions[1], 4)).toBe('4 / 5')
  })
})
