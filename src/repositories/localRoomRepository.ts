import {
  createConversationRoom,
  joinConversationRoom,
  saveParticipantAnswer,
  type ConversationRoom,
  type RoomSession,
} from '../domain/rooms'
import type { AnswerValue } from '../types/domain'

type RoomStore = {
  rooms: ConversationRoom[]
}

export type RoomRepository = {
  createRoom: (questionIds: string[]) => RoomSession
  getRoomById: (roomId: string) => ConversationRoom | null
  getRoomByCode: (roomCode: string) => ConversationRoom | null
  joinRoomByCode: (roomCode: string) => RoomSession | null
  saveAnswer: (input: {
    roomId: string
    participantId: string
    questionId: string
    value: AnswerValue
  }) => ConversationRoom | null
  deleteRoom: (roomId: string) => void
}

const STORAGE_KEY = 'sohbetlik:rooms:v1'
const emptyStore: RoomStore = { rooms: [] }
let fallbackStore: RoomStore = emptyStore

function normalizeRoomCode(roomCode: string) {
  return roomCode.trim().toUpperCase()
}

function isRoom(value: unknown): value is ConversationRoom {
  if (!value || typeof value !== 'object') {
    return false
  }

  const room = value as Partial<ConversationRoom>

  return (
    typeof room.id === 'string' &&
    typeof room.code === 'string' &&
    typeof room.createdAt === 'string' &&
    Array.isArray(room.questionIds) &&
    Array.isArray(room.participants)
  )
}

function getStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function loadStore(): RoomStore {
  const storage = getStorage()

  if (!storage) {
    return fallbackStore
  }

  try {
    const rawStore = storage.getItem(STORAGE_KEY)

    if (!rawStore) {
      return emptyStore
    }

    const parsed = JSON.parse(rawStore) as Partial<RoomStore>

    return {
      rooms: Array.isArray(parsed.rooms) ? parsed.rooms.filter(isRoom) : [],
    }
  } catch {
    return emptyStore
  }
}

function saveStore(store: RoomStore) {
  fallbackStore = store

  try {
    getStorage()?.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    fallbackStore = store
  }
}

function updateRoom(store: RoomStore, nextRoom: ConversationRoom) {
  return {
    rooms: store.rooms.map((room) => (room.id === nextRoom.id ? nextRoom : room)),
  }
}

export const localRoomRepository: RoomRepository = {
  createRoom(questionIds) {
    const store = loadStore()
    const existingCodes = new Set(store.rooms.map((room) => room.code))
    const session = createConversationRoom(questionIds, existingCodes)

    saveStore({
      rooms: [session.room, ...store.rooms].slice(0, 12),
    })

    return session
  },

  getRoomById(roomId) {
    return loadStore().rooms.find((room) => room.id === roomId) ?? null
  },

  getRoomByCode(roomCode) {
    const normalizedCode = normalizeRoomCode(roomCode)

    return loadStore().rooms.find((room) => room.code === normalizedCode) ?? null
  },

  joinRoomByCode(roomCode) {
    const store = loadStore()
    const normalizedCode = normalizeRoomCode(roomCode)
    const room = store.rooms.find((candidate) => candidate.code === normalizedCode)

    if (!room) {
      return null
    }

    const session = joinConversationRoom(room)
    saveStore(updateRoom(store, session.room))

    return session
  },

  saveAnswer({ roomId, participantId, questionId, value }) {
    const store = loadStore()
    const room = store.rooms.find((candidate) => candidate.id === roomId)

    if (!room) {
      return null
    }

    const nextRoom = saveParticipantAnswer(room, participantId, questionId, value)
    saveStore(updateRoom(store, nextRoom))

    return nextRoom
  },

  deleteRoom(roomId) {
    const store = loadStore()

    saveStore({
      rooms: store.rooms.filter((room) => room.id !== roomId),
    })
  },
}
