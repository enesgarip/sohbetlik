import { describe, expect, it } from 'vitest'
import { categories } from './categories'
import { questionContents } from './index'
import { traits } from './traits'

// Mekanik kalite kapısı (npm run questions:lint).
// İnsan tarafı — klişe, ton, eşit çekicilik — code review'da
// docs/product/QUESTION_WRITING_GUIDE.md checklist'iyle denetlenir.

// Rehber 14.10: ima yüklü kelimeler soru/seçenek metinlerine giremez.
// "bile" gibi masum kullanımı yaygın kelimeler mekanik kontrole uygun değildir;
// onlar review'a bırakılır.
const BANNED_WORDS = ['normal', 'normalde', 'hâlâ', 'en azından']

function normalizeForScan(text: string) {
  return ` ${text.toLocaleLowerCase('tr-TR').replace(/[.,!?;:"'()—–-]/g, ' ')} `.replace(/\s+/g, ' ')
}

function containsBannedWord(text: string) {
  const normalized = normalizeForScan(text)

  return BANNED_WORDS.find((word) => normalized.includes(` ${word} `)) ?? null
}

describe('question pool content rules', () => {
  it('has at least one question and unique slugs', () => {
    expect(questionContents.length).toBeGreaterThan(0)

    const slugs = questionContents.map((question) => question.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('uses kebab-case slugs and registered categories/traits', () => {
    for (const question of questionContents) {
      expect(question.slug, question.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(Object.keys(categories), question.slug).toContain(question.category)
      expect(Object.keys(traits), question.slug).toContain(question.trait)
    }
  })

  it('keeps prompts single-breath and non-empty metadata in range', () => {
    for (const question of questionContents) {
      expect(question.prompt.length, question.slug).toBeGreaterThan(12)
      expect(question.prompt.length, question.slug).toBeLessThanOrEqual(160)
      expect(question.estSeconds, question.slug).toBeGreaterThanOrEqual(3)
      expect(question.estSeconds, question.slug).toBeLessThanOrEqual(60)
      expect(question.followupPrompt.length, question.slug).toBeGreaterThan(10)
      expect(question.qualityNote.length, question.slug).toBeGreaterThan(10)
    }
  })

  it('enforces per-type option rules', () => {
    for (const question of questionContents) {
      const options = question.options ?? []

      if (question.type === 'either_or') {
        expect(options.length, question.slug).toBe(2)
      }

      if (question.type === 'choice') {
        expect(options.length, question.slug).toBeGreaterThanOrEqual(3)
        expect(options.length, question.slug).toBeLessThanOrEqual(4)
      }

      if (question.type === 'slider') {
        expect(options.length, question.slug).toBe(0)
        expect(question.slider, question.slug).toBeDefined()
        expect(question.slider?.lowLabel.length, question.slug).toBeGreaterThan(3)
        expect(question.slider?.highLabel.length, question.slug).toBeGreaterThan(3)
        expect(question.shuffleOptions, question.slug).toBe(false)
      } else {
        const ids = options.map((option) => option.id)
        expect(new Set(ids).size, question.slug).toBe(ids.length)

        for (const option of options) {
          expect(option.label.length, `${question.slug}:${option.id}`).toBeGreaterThan(2)
          expect(option.label.length, `${question.slug}:${option.id}`).toBeLessThanOrEqual(80)
        }
      }
    }
  })

  it('keeps judgment-laden words out of prompts and options', () => {
    for (const question of questionContents) {
      const texts = [question.prompt, ...(question.options ?? []).map((option) => option.label)]

      if (question.slider) {
        texts.push(question.slider.lowLabel, question.slider.highLabel)
      }

      for (const text of texts) {
        expect(containsBannedWord(text), `${question.slug}: "${text}"`).toBeNull()
      }
    }
  })

  it('keeps the level 1 batch within set constraints', () => {
    const level1 = questionContents.filter((question) => question.level === 1)
    const byCategory = new Map<string, number>()
    const byTrait = new Map<string, number>()

    for (const question of level1) {
      byCategory.set(question.category, (byCategory.get(question.category) ?? 0) + 1)
      byTrait.set(question.trait, (byTrait.get(question.trait) ?? 0) + 1)
    }

    for (const [category, count] of byCategory) {
      expect(count, `kategori: ${category}`).toBeLessThanOrEqual(3)
    }

    for (const [trait, count] of byTrait) {
      expect(count, `trait: ${trait}`).toBeLessThanOrEqual(2)
    }

    // Açılış ve kapanış slotları doldurulabilmeli.
    const openers = level1.filter(
      (question) =>
        question.intensity === 1 && question.funScore >= 4 && question.type === 'either_or',
    )
    const closers = level1.filter(
      (question) => question.intensity === 1 && question.funScore >= 4,
    )

    expect(openers.length).toBeGreaterThanOrEqual(2)
    expect(closers.length).toBeGreaterThanOrEqual(1)
  })
})
