import type { QuestionLevel, QuestionType } from '../types/domain'

// Oturum soru seçimi — tasarım: docs/product/QUESTION_SYSTEM_DESIGN.md, Bölüm 8-9.
// Saf fonksiyon: rastgelelik dışarıdan enjekte edilebilir (test için),
// sonuç oda kurulurken room_questions'a sabitlenir.

export type SelectableQuestion = {
  slug: string
  category: string
  trait: string
  level: QuestionLevel
  intensity: 1 | 2 | 3
  type: QuestionType
  sparkScore: number
  funScore: number
}

export type SelectSessionInput = {
  pool: SelectableQuestion[]
  level: QuestionLevel
  count: number
  hardExcludeSlugs?: readonly string[]
  excludeSlugs?: readonly string[]
  random?: () => number
}

const LEVEL_MIX: Record<QuestionLevel, Partial<Record<QuestionLevel, number>>> = {
  1: { 1: 1 },
  2: { 1: 0.25, 2: 0.75 },
  3: { 1: 0.15, 2: 0.25, 3: 0.6 },
  4: { 1: 0.1, 2: 0.2, 3: 0.2, 4: 0.5 },
}

const TYPE_TARGETS: Record<QuestionType, number> = {
  either_or: 0.35,
  choice: 0.45,
  slider: 0.2,
}

const MAX_PER_TRAIT = 2
const MAX_PER_CATEGORY = 3
const CLOSER_CATEGORIES = new Set(['nostalji', 'hayal'])

function shuffleInPlace<T>(items: T[], random: () => number) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[items[index], items[target]] = [items[target], items[index]]
  }

  return items
}

export function computeLevelQuotas(level: QuestionLevel, count: number) {
  const mix = LEVEL_MIX[level]
  const quotas = new Map<QuestionLevel, number>()
  let assigned = 0

  for (const [levelKey, ratio] of Object.entries(mix)) {
    const quota = Math.floor(count * ratio)
    quotas.set(Number(levelKey) as QuestionLevel, quota)
    assigned += quota
  }

  // Yuvarlama artığı odanın hedef seviyesine gider.
  quotas.set(level, (quotas.get(level) ?? 0) + (count - assigned))

  return quotas
}

type SelectionState = {
  picked: SelectableQuestion[]
  pickedSlugs: Set<string>
  traitCounts: Map<string, number>
  categoryCounts: Map<string, number>
  typeCounts: Map<QuestionType, number>
  typeCaps: Map<QuestionType, number>
}

function canPick(state: SelectionState, candidate: SelectableQuestion, ignoreTypeCap: boolean) {
  if (state.pickedSlugs.has(candidate.slug)) {
    return false
  }

  if ((state.traitCounts.get(candidate.trait) ?? 0) >= MAX_PER_TRAIT) {
    return false
  }

  if ((state.categoryCounts.get(candidate.category) ?? 0) >= MAX_PER_CATEGORY) {
    return false
  }

  if (
    !ignoreTypeCap &&
    (state.typeCounts.get(candidate.type) ?? 0) >= (state.typeCaps.get(candidate.type) ?? Infinity)
  ) {
    return false
  }

  return true
}

function pick(state: SelectionState, candidate: SelectableQuestion) {
  state.picked.push(candidate)
  state.pickedSlugs.add(candidate.slug)
  state.traitCounts.set(candidate.trait, (state.traitCounts.get(candidate.trait) ?? 0) + 1)
  state.categoryCounts.set(
    candidate.category,
    (state.categoryCounts.get(candidate.category) ?? 0) + 1,
  )
  state.typeCounts.set(candidate.type, (state.typeCounts.get(candidate.type) ?? 0) + 1)
}

function takeFromBucket(
  state: SelectionState,
  bucket: SelectableQuestion[],
  needed: number,
  ignoreTypeCap: boolean,
) {
  let taken = 0

  for (const candidate of bucket) {
    if (taken >= needed) {
      break
    }

    if (canPick(state, candidate, ignoreTypeCap)) {
      pick(state, candidate)
      taken += 1
    }
  }

  return taken
}

function adjacentConflict(a: SelectableQuestion, b: SelectableQuestion) {
  return a.trait === b.trait || a.category === b.category
}

// Kuyrukta ihlalsiz aday kalmadığında, kalan soruyu dizinin daha önünde
// komşularıyla çakışmadığı ve tip tekrarı üretmediği bir boşluğa yerleştir.
function findInsertionIndex(
  sequence: SelectableQuestion[],
  candidate: SelectableQuestion,
  minIndex: number,
) {
  for (let index = minIndex; index < sequence.length; index += 1) {
    const prev = sequence[index - 1]
    const next = sequence[index]

    if (prev && adjacentConflict(prev, candidate)) {
      continue
    }

    if (adjacentConflict(candidate, next)) {
      continue
    }

    const prev2 = sequence[index - 2]
    const next2 = sequence[index + 1]
    const makesRun =
      (prev2 && prev && prev2.type === prev.type && prev.type === candidate.type) ||
      (prev && prev.type === candidate.type && candidate.type === next.type) ||
      (next2 && candidate.type === next.type && next.type === next2.type)

    if (makesRun) {
      continue
    }

    return index
  }

  return -1
}

function orderForSession(selected: SelectableQuestion[], random: () => number) {
  if (selected.length <= 3) {
    return [...selected]
  }

  const remaining = [...selected]
  const minLevel = Math.min(...remaining.map((question) => question.level))

  // Açılış: en hafif seviyeden, eğlenceli, tercihen ikilem (peak-end: hafif başla).
  // İkinci açılış birinciyle trait/kategori çakışmayacak şekilde seçilir;
  // çakışmasız aday yoksa hafiflik kuralı çakışmasızlıktan önce gelir.
  const openers: SelectableQuestion[] = []
  const openerPool = remaining
    .filter(
      (question) =>
        question.level === minLevel && question.intensity === 1 && question.funScore >= 4,
    )
    .sort((a, b) => {
      const aEither = a.type === 'either_or' ? 0 : 1
      const bEither = b.type === 'either_or' ? 0 : 1

      return aEither - bEither || random() - 0.5
    })

  for (const opener of openerPool) {
    if (openers.length >= 2) {
      break
    }

    if (openers.length === 1 && adjacentConflict(openers[0], opener)) {
      continue
    }

    openers.push(opener)
  }

  if (openers.length < 2) {
    for (const opener of openerPool) {
      if (openers.length >= 2) {
        break
      }

      if (!openers.includes(opener)) {
        openers.push(opener)
      }
    }
  }

  for (const opener of openers) {
    remaining.splice(remaining.indexOf(opener), 1)
  }

  // Kapanış: gülümseten, hafif; tercihen nostalji/hayal (peak-end: sıcak bitir).
  const closerPool = remaining
    .filter((question) => question.intensity === 1 && question.funScore >= 4)
    .sort((a, b) => {
      const aWarm = CLOSER_CATEGORIES.has(a.category) ? 0 : 1
      const bWarm = CLOSER_CATEGORIES.has(b.category) ? 0 : 1

      return aWarm - bWarm || random() - 0.5
    })
  const closer = closerPool[0] ?? null

  if (closer) {
    remaining.splice(remaining.indexOf(closer), 1)
  }

  // Orta blok: seviye ve yoğunluk kabaca artar, jitter mekanik hissi kırar.
  // Sıra açgözlü kurulur: eğri sırasındaki ilk ihlalsiz aday alınır
  // (aynı trait/kategori art arda gelmez, aynı tipten 3 soru üst üste olmaz);
  // ihlalsiz aday kalmadıysa eğri sırası kazanır — kural katılığı oturumun
  // kurulmasını asla engellemez.
  const curve = remaining
    .map((question) => ({
      question,
      key: question.level * 10 + question.intensity * 3 + random() * 4,
    }))
    .sort((a, b) => a.key - b.key)
    .map((entry) => entry.question)

  const sequence = [...openers]

  while (curve.length > 0) {
    const tail1 = sequence[sequence.length - 1]
    const tail2 = sequence[sequence.length - 2]
    let pickIndex = curve.findIndex((candidate) => {
      if (tail1 && adjacentConflict(tail1, candidate)) {
        return false
      }

      if (tail1 && tail2 && candidate.type === tail1.type && tail1.type === tail2.type) {
        return false
      }

      return true
    })

    if (pickIndex === -1) {
      // Kuyruğa ihlalsiz eklenemiyor: daha öndeki uygun bir boşluğa taşı;
      // o da yoksa ihlal kabul edilir — oturum her koşulda kurulur.
      const candidate = curve.shift()
      if (!candidate) {
        break
      }

      const insertAt = findInsertionIndex(sequence, candidate, openers.length || 1)

      if (insertAt >= 0) {
        sequence.splice(insertAt, 0, candidate)
      } else {
        sequence.push(candidate)
      }

      continue
    }

    sequence.push(curve.splice(pickIndex, 1)[0])
  }

  if (closer) {
    sequence.push(closer)
  }

  return sequence
}

export function selectSessionQuestions(input: SelectSessionInput): SelectableQuestion[] {
  const random = input.random ?? Math.random
  // Oda seviyesinin üzerindeki sorular hiçbir fazda oturuma giremez.
  const hardExcluded = new Set(input.hardExcludeSlugs ?? [])
  const allowedPool = input.pool.filter(
    (question) => question.level <= input.level && !hardExcluded.has(question.slug),
  )
  const count = Math.min(input.count, allowedPool.length)

  if (count <= 0) {
    return []
  }

  const excluded = new Set(input.excludeSlugs ?? [])
  const fresh = allowedPool.filter((question) => !excluded.has(question.slug))
  const seen = allowedPool.filter((question) => excluded.has(question.slug))

  const freshByLevel = new Map<QuestionLevel, SelectableQuestion[]>()
  const seenByLevel = new Map<QuestionLevel, SelectableQuestion[]>()

  for (const question of fresh) {
    const bucket = freshByLevel.get(question.level) ?? []
    bucket.push(question)
    freshByLevel.set(question.level, bucket)
  }

  for (const question of seen) {
    const bucket = seenByLevel.get(question.level) ?? []
    bucket.push(question)
    seenByLevel.set(question.level, bucket)
  }

  for (const bucket of freshByLevel.values()) {
    shuffleInPlace(bucket, random)
  }

  for (const bucket of seenByLevel.values()) {
    shuffleInPlace(bucket, random)
  }

  const state: SelectionState = {
    picked: [],
    pickedSlugs: new Set(),
    traitCounts: new Map(),
    categoryCounts: new Map(),
    typeCounts: new Map(),
    typeCaps: new Map(
      Object.entries(TYPE_TARGETS).map(([type, ratio]) => [
        type as QuestionType,
        Math.ceil(count * ratio) + 1,
      ]),
    ),
  }

  // Faz 2a: seviye kotalarını taze havuzdan doldur; eksik kalırsa
  // görülmüşlerden geri doldur (açlık koruması, tasarım Bölüm 8/Faz 1).
  const quotas = computeLevelQuotas(input.level, count)

  // Açılış garantisi: sıralama fazının "hafif ve eğlenceli başla" kuralı
  // ancak seçimde açılış adayı ayrıldıysa tutar. En düşük seviyeden,
  // tercihen ikilem olan 2 aday önceden rezerve edilir.
  const minMixLevel = Math.min(...quotas.keys()) as QuestionLevel
  const openerCandidates = [
    ...(freshByLevel.get(minMixLevel) ?? []),
    ...(seenByLevel.get(minMixLevel) ?? []),
  ]
    .filter((question) => question.intensity === 1 && question.funScore >= 4)
    .sort((a, b) => (a.type === 'either_or' ? 0 : 1) - (b.type === 'either_or' ? 0 : 1))

  let reservedOpeners = 0
  const maxReservedOpeners = Math.min(2, quotas.get(minMixLevel) ?? 0)

  for (const candidate of openerCandidates) {
    if (reservedOpeners >= maxReservedOpeners || state.picked.length >= count) {
      break
    }

    if (canPick(state, candidate, false)) {
      pick(state, candidate)
      reservedOpeners += 1
    }
  }

  quotas.set(minMixLevel, Math.max(0, (quotas.get(minMixLevel) ?? 0) - reservedOpeners))

  for (const [level, quota] of quotas) {
    let needed = quota
    needed -= takeFromBucket(state, freshByLevel.get(level) ?? [], needed, false)

    if (needed > 0) {
      needed -= takeFromBucket(state, seenByLevel.get(level) ?? [], needed, false)
    }
  }

  // Faz 2b: kota kaymalarını komşu seviyelerden kapat; önce tip tavanına
  // saygılı, sonra tavanları sırayla gevşeterek (oturum kurulamamasındansa
  // kural esnesin).
  const allFresh = shuffleInPlace([...fresh], random)
  const allSeen = shuffleInPlace([...seen], random)

  for (const ignoreTypeCap of [false, true]) {
    if (state.picked.length >= count) {
      break
    }

    takeFromBucket(state, allFresh, count - state.picked.length, ignoreTypeCap)
    takeFromBucket(state, allSeen, count - state.picked.length, ignoreTypeCap)
  }

  if (state.picked.length < count) {
    for (const candidate of [...allFresh, ...allSeen]) {
      if (state.picked.length >= count) {
        break
      }

      if (!state.pickedSlugs.has(candidate.slug)) {
        pick(state, candidate)
      }
    }
  }

  // Faz 3: ritim sıralaması.
  return orderForSession(state.picked, random)
}
