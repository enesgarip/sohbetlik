// Cihaz bazlı "görülen soru" geçmişi — yumuşak tekrarsızlık katmanı
// (tasarım: docs/product/QUESTION_SYSTEM_DESIGN.md, Bölüm 10, Katman 2).
// Sadece oda kuran cihazda çalışır; asıl garanti oda zinciridir.

const STORAGE_KEY = 'sohbetlik:seen-questions:v1'
const MAX_ENTRIES = 200
const TTL_MS = 90 * 24 * 60 * 60 * 1000

type SeenEntry = {
  slug: string
  lastSeenAt: string
}

function getStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function loadEntries(): SeenEntry[] {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  try {
    const raw = storage.getItem(STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as unknown

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (entry): entry is SeenEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as SeenEntry).slug === 'string' &&
        typeof (entry as SeenEntry).lastSeenAt === 'string',
    )
  } catch {
    return []
  }
}

function saveEntries(entries: SeenEntry[]) {
  try {
    getStorage()?.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Depolama dolu/erişilemez ise geçmiş tutulmaz; oturum yine kurulur.
  }
}

function isFresh(entry: SeenEntry, now: number) {
  const timestamp = Date.parse(entry.lastSeenAt)

  return Number.isFinite(timestamp) && now - timestamp < TTL_MS
}

export function getSeenQuestionSlugs(now = Date.now()): string[] {
  return loadEntries()
    .filter((entry) => isFresh(entry, now))
    .map((entry) => entry.slug)
}

export function recordSeenQuestions(slugs: readonly string[], now = Date.now()) {
  const seenAt = new Date(now).toISOString()
  const bySlug = new Map<string, SeenEntry>()

  for (const entry of loadEntries()) {
    if (isFresh(entry, now)) {
      bySlug.set(entry.slug, entry)
    }
  }

  for (const slug of slugs) {
    bySlug.set(slug, { slug, lastSeenAt: seenAt })
  }

  const entries = [...bySlug.values()]
    .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))
    .slice(0, MAX_ENTRIES)

  saveEntries(entries)
}
