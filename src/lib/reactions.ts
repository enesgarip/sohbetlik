const STORAGE_KEY = 'sohbetlik:reactions'

export type ReactionType = '😂' | '🤔' | '💯' | '❤️' | '😮'
export const REACTION_OPTIONS: ReactionType[] = ['😂', '🤔', '💯', '❤️', '😮']

type ReactionStore = Record<string, ReactionType[]>

function load(): ReactionStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function save(store: ReactionStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {}
}

export function getReactions(itemKey: string): ReactionType[] {
  return load()[itemKey] ?? []
}

export function toggleReaction(itemKey: string, reaction: ReactionType): ReactionType[] {
  const store = load()
  const current = store[itemKey] ?? []
  const idx = current.indexOf(reaction)

  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(reaction)
  }

  store[itemKey] = current
  save(store)
  return [...current]
}
