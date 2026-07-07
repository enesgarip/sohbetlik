import type { RoomSession, ConversationRoom } from '../domain/rooms'
import type { AnswerValue } from '../types/domain'

export type SaveRoomAnswerInput = {
  roomId: string
  participantId: string
  questionId: string
  value: AnswerValue
}

export type RoomRepository = {
  createRoom: (questionIds: string[]) => RoomSession
  getRoomById: (roomId: string) => ConversationRoom | null
  getRoomByCode: (roomCode: string) => ConversationRoom | null
  joinRoomByCode: (roomCode: string) => RoomSession | null
  saveAnswer: (input: SaveRoomAnswerInput) => ConversationRoom | null
  deleteRoom: (roomId: string) => void
}
