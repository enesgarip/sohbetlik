import type { Question, QuestionOption } from '../types/domain'

// Seçenek sırası karıştırma (sıra yanlılığına karşı, rehber 9.7).
// Seed oda + soru kimliğinden türediği için iki katılımcı da aynı sırayı
// görür ve sonuç ekranı hizalı kalır.

function hashSeed(input: string) {
  let hash = 2166136261

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

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

export function getDisplayOptions(roomId: string, question: Question): QuestionOption[] {
  if (question.shuffleOptions !== true || question.options.length < 2) {
    return question.options
  }

  const random = mulberry32(hashSeed(`${roomId}:${question.id}`))
  const shuffled = [...question.options]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]
  }

  return shuffled
}
