const STORAGE_KEY = 'sohbetlik:ab-variant'

export type ABVariant = 'A' | 'B'

export function getVariant(): ABVariant {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'A' || stored === 'B') return stored
  } catch {
    // Ignore
  }

  const variant: ABVariant = Math.random() < 0.5 ? 'A' : 'B'

  try {
    localStorage.setItem(STORAGE_KEY, variant)
  } catch {
    // Ignore
  }

  return variant
}

export function trackEvent(event: string, variant: ABVariant) {
  try {
    const key = `sohbetlik:ab-events`
    const raw = localStorage.getItem(key)
    const events: Array<{ event: string; variant: ABVariant; ts: number }> = raw ? JSON.parse(raw) : []
    events.push({ event, variant, ts: Date.now() })
    // Keep last 100 events
    localStorage.setItem(key, JSON.stringify(events.slice(-100)))
  } catch {
    // Ignore
  }
}
