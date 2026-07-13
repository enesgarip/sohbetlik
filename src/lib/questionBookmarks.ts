const STORAGE_KEY = 'sohbetlik:bookmarks'

export type BookmarkStatus = 'favorite' | 'discussed' | null

type BookmarkStore = Record<string, BookmarkStatus>

function load(): BookmarkStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function save(store: BookmarkStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {}
}

function makeKey(roomId: string, questionId: string) {
  return `${roomId}:${questionId}`
}

export function getBookmark(roomId: string, questionId: string): BookmarkStatus {
  return load()[makeKey(roomId, questionId)] ?? null
}

export function setBookmark(roomId: string, questionId: string, status: BookmarkStatus) {
  const store = load()
  const key = makeKey(roomId, questionId)
  if (status) {
    store[key] = status
  } else {
    delete store[key]
  }
  save(store)
}

export function cycleBookmark(roomId: string, questionId: string): BookmarkStatus {
  const current = getBookmark(roomId, questionId)
  const next: BookmarkStatus = current === null ? 'favorite' : current === 'favorite' ? 'discussed' : null
  setBookmark(roomId, questionId, next)
  return next
}
