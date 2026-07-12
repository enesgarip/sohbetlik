// Cihaz bazlı oturum geçmişi — kullanıcının daha önce oynadığı odaları hatırlar.
// Sonuç ekranına dönebilmek ve sonraki seviyeye devam edebilmek için.

const STORAGE_KEY = 'sohbetlik:session-history:v1'
const MAX_SESSIONS = 20
const TTL_MS = 90 * 24 * 60 * 60 * 1000 // 90 gün

export type SessionRecord = {
  roomId: string
  participantId: string
  roomCode: string
  level: number
  questionCount: number
  answeredCount: number
  isComplete: boolean
  previousRoomId?: string | null
  nextRoomId?: string | null
  createdAt: string
  updatedAt: string
}

function getStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function loadRecords(): SessionRecord[] {
  const storage = getStorage()
  if (!storage) return []

  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r): r is SessionRecord =>
        typeof r === 'object' && r !== null && typeof (r as SessionRecord).roomId === 'string',
    )
  } catch {
    return []
  }
}

function saveRecords(records: SessionRecord[]) {
  try {
    const now = Date.now()
    const fresh = records
      .filter((r) => now - Date.parse(r.updatedAt) < TTL_MS)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, MAX_SESSIONS)
    getStorage()?.setItem(STORAGE_KEY, JSON.stringify(fresh))
  } catch {
    // Storage unavailable
  }
}

export function saveSession(record: SessionRecord) {
  const records = loadRecords()
  const existing = records.findIndex((r) => r.roomId === record.roomId)
  if (existing >= 0) {
    records[existing] = record
  } else {
    records.unshift(record)
  }
  saveRecords(records)
}

export function updateSessionNextRoom(roomId: string, nextRoomId: string) {
  const records = loadRecords()
  const record = records.find((r) => r.roomId === roomId)
  if (record) {
    record.nextRoomId = nextRoomId
    record.updatedAt = new Date().toISOString()
    saveRecords(records)
  }
}

export function getSessionHistory(): SessionRecord[] {
  const now = Date.now()
  return loadRecords().filter((r) => now - Date.parse(r.updatedAt) < TTL_MS)
}

export function getLatestSession(): SessionRecord | null {
  const sessions = getSessionHistory()
  return sessions[0] ?? null
}

/**
 * Finds the latest completed session that has no next room yet — 
 * meaning the user can still continue to the next level.
 */
export function getResumableSession(): SessionRecord | null {
  const sessions = getSessionHistory()
  return sessions.find((s) => s.isComplete && !s.nextRoomId && s.level < 4) ?? null
}
