import { describe, expect, it } from 'vitest'
import { mvpQuestions } from './questions'

describe('mvpQuestions', () => {
  it('keeps the first session lightweight and non-empty', () => {
    expect(mvpQuestions).toHaveLength(8)
    expect(mvpQuestions.every((question) => question.prompt.length > 12)).toBe(true)
    expect(mvpQuestions.every((question) => question.options.length >= 2)).toBe(true)
  })

  it('does not model compatibility scoring', () => {
    const serialized = JSON.stringify(mvpQuestions).toLowerCase()

    expect(serialized).not.toContain('uyum')
    expect(serialized).not.toContain('score')
    expect(serialized).not.toContain('puan')
  })
})
