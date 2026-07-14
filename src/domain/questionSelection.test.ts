import { describe, expect, it } from 'vitest'
import { activeQuestionContents } from '../content'
import type { QuestionLevel, QuestionType } from '../types/domain'
import {
  computeLevelQuotas,
  selectSessionQuestions,
  type SelectableQuestion,
} from './questionSelection'

// Deterministik testler için seed'li PRNG.
function mulberry32(seed: number) {
  let state = seed

  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeQuestion(overrides: Partial<SelectableQuestion> & { slug: string }): SelectableQuestion {
  return {
    category: 'kat-a',
    trait: 'trait-a',
    level: 1,
    intensity: 1,
    type: 'choice',
    sparkScore: 3,
    funScore: 4,
    ...overrides,
  }
}

// Bol çeşitlilikte sentetik havuz: her seviye için 12 kategori × farklı trait.
function makeSyntheticPool(levels: QuestionLevel[], perLevel = 24) {
  const types: QuestionType[] = ['either_or', 'choice', 'slider']
  const pool: SelectableQuestion[] = []

  for (const level of levels) {
    for (let index = 0; index < perLevel; index += 1) {
      pool.push(
        makeQuestion({
          slug: `s${level}-q${index}`,
          level,
          category: `kat-${index % 12}`,
          trait: `trait-${level}-${index % 14}`,
          type: types[index % types.length],
          intensity: ((index % 3) + 1) as 1 | 2 | 3,
          funScore: index % 2 === 0 ? 4 : 3,
        }),
      )
    }
  }

  return pool
}

describe('computeLevelQuotas', () => {
  it('assigns everything to level 1 for a level 1 room', () => {
    const quotas = computeLevelQuotas(1, 24)

    expect(quotas.get(1)).toBe(24)
  })

  it('applies the warm-up mix and absorbs rounding into the target level', () => {
    const quotas = computeLevelQuotas(2, 24)

    expect(quotas.get(1)).toBe(6)
    expect(quotas.get(2)).toBe(18)

    const level3 = computeLevelQuotas(3, 24)
    const total = [...level3.values()].reduce((sum, quota) => sum + quota, 0)

    expect(total).toBe(24)
    expect(level3.get(3)).toBeGreaterThanOrEqual(14)
  })
})

describe('selectSessionQuestions', () => {
  it('returns the requested count with unique slugs', () => {
    const pool = makeSyntheticPool([1, 2])
    const result = selectSessionQuestions({
      pool,
      level: 2,
      count: 24,
      random: mulberry32(1),
    })

    expect(result).toHaveLength(24)
    expect(new Set(result.map((question) => question.slug)).size).toBe(24)
  })

  it('never selects questions above the room level', () => {
    const pool = makeSyntheticPool([1, 2, 3, 4])
    const result = selectSessionQuestions({
      pool,
      level: 2,
      count: 24,
      random: mulberry32(2),
    })

    expect(result.every((question) => question.level <= 2)).toBe(true)
  })

  it('respects trait and category caps when the pool has slack', () => {
    const pool = makeSyntheticPool([1], 60)
    const result = selectSessionQuestions({
      pool,
      level: 1,
      count: 24,
      random: mulberry32(3),
    })

    const traitCounts = new Map<string, number>()
    const categoryCounts = new Map<string, number>()

    for (const question of result) {
      traitCounts.set(question.trait, (traitCounts.get(question.trait) ?? 0) + 1)
      categoryCounts.set(question.category, (categoryCounts.get(question.category) ?? 0) + 1)
    }

    expect(Math.max(...traitCounts.values())).toBeLessThanOrEqual(2)
    expect(Math.max(...categoryCounts.values())).toBeLessThanOrEqual(3)
  })

  it('honors exclusions when the fresh pool is big enough', () => {
    const pool = makeSyntheticPool([1], 60)
    const excludeSlugs = pool.slice(0, 20).map((question) => question.slug)
    const result = selectSessionQuestions({
      pool,
      level: 1,
      count: 24,
      excludeSlugs,
      random: mulberry32(4),
    })

    const excluded = new Set(excludeSlugs)
    expect(result.some((question) => excluded.has(question.slug))).toBe(false)
  })

  it('refills from seen questions instead of starving the session', () => {
    const pool = makeSyntheticPool([1], 24)
    const excludeSlugs = pool.slice(0, 20).map((question) => question.slug)
    const result = selectSessionQuestions({
      pool,
      level: 1,
      count: 24,
      excludeSlugs,
      random: mulberry32(5),
    })

    expect(result).toHaveLength(24)
  })

  it('never refills from hard exclusions', () => {
    const pool = makeSyntheticPool([1, 2], 24)
    const hardExcludeSlugs = pool
      .filter((question) => question.level === 1)
      .map((question) => question.slug)
    const result = selectSessionQuestions({
      pool,
      level: 2,
      count: 24,
      hardExcludeSlugs,
      random: mulberry32(12),
    })

    const hardExcluded = new Set(hardExcludeSlugs)

    expect(result).toHaveLength(24)
    expect(result.every((question) => !hardExcluded.has(question.slug))).toBe(true)
    expect(result.every((question) => question.level === 2)).toBe(true)
  })

  it('opens light and avoids heavy questions in the first three slots', () => {
    const pool = makeSyntheticPool([1, 2])
    const result = selectSessionQuestions({
      pool,
      level: 2,
      count: 24,
      random: mulberry32(6),
    })

    for (const question of result.slice(0, 2)) {
      expect(question.level).toBe(1)
      expect(question.intensity).toBe(1)
      expect(question.funScore).toBeGreaterThanOrEqual(4)
    }
  })

  it('avoids same-trait/category neighbors and 3-type runs on a generous pool', () => {
    const pool = makeSyntheticPool([1], 60)
    const result = selectSessionQuestions({
      pool,
      level: 1,
      count: 20,
      random: mulberry32(7),
    })

    for (let index = 1; index < result.length - 1; index += 1) {
      expect(
        result[index].trait,
        `pozisyon ${index}`,
      ).not.toBe(result[index - 1].trait)
    }

    for (let index = 2; index < result.length; index += 1) {
      const run =
        result[index].type === result[index - 1].type &&
        result[index - 1].type === result[index - 2].type

      expect(run, `pozisyon ${index}`).toBe(false)
    }
  })

  it('selects from the real level 1 pool for a default room', () => {
    const result = selectSessionQuestions({
      pool: activeQuestionContents,
      level: 1,
      count: 16,
      random: mulberry32(8),
    })

    expect(result).toHaveLength(16)
    // Açılış hafif ve eğlenceli, kapanış gülümseten olmalı.
    expect(result[0].intensity).toBe(1)
    expect(result[0].funScore).toBeGreaterThanOrEqual(4)
    expect(result[0].type).toBe('either_or')
    const closer = result[result.length - 1]
    expect(closer.intensity).toBe(1)
    expect(closer.funScore).toBeGreaterThanOrEqual(4)
  })

  it('keeps every real room level at the requested session count', () => {
    const levels: QuestionLevel[] = [1, 2, 3, 4]

    for (const level of levels) {
      for (let seed = 1; seed <= 25; seed += 1) {
        const result = selectSessionQuestions({
          pool: activeQuestionContents,
          level,
          count: 16,
          random: mulberry32(level * 100 + seed),
        })

        expect(result, `level ${level}, seed ${seed}`).toHaveLength(16)
        expect(Math.max(...result.map((question) => question.level))).toBe(level)
      }
    }
  })
})
