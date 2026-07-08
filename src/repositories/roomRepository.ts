import type { RoomSession, ConversationRoom } from '../domain/rooms'
import type { AnswerValue } from '../types/domain'

export type SaveRoomAnswerInput = {
  roomId: string
  participantId: string
  questionId: string
  value: AnswerValue
}

export type RoomChangeHandler = () => void

export type RoomUnsubscribe = () => void

export type CreateRoomOptions = {
  previousRoomId?: string | null
}

export type RoomRepository = {
  createRoom: (questionIds: string[], options?: CreateRoomOptions) => Promise<RoomSession>
  getRoomById: (roomId: string) => Promise<ConversationRoom | null>
  getRoomByCode: (roomCode: string) => Promise<ConversationRoom | null>
  joinRoomByCode: (roomCode: string) => Promise<RoomSession | null>
  saveAnswer: (input: SaveRoomAnswerInput) => Promise<ConversationRoom | null>
  deleteRoom: (roomId: string) => Promise<void>
  subscribeToRoom: (roomId: string, onChange: RoomChangeHandler) => RoomUnsubscribe
}
