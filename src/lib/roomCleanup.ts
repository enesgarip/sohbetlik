import { supabase } from './supabase'

const STORAGE_KEY = 'sohbetlik:last-cleanup'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

export function maybeCleanupStaleRooms() {
  if (!supabase) {
    return
  }

  try {
    const last = Number(localStorage.getItem(STORAGE_KEY) ?? '0')

    if (Date.now() - last < ONE_DAY_MS) {
      return
    }
  } catch {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    // localStorage unavailable
  }

  void supabase.rpc('cleanup_stale_rooms')
}
