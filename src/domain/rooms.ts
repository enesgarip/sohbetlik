import type { AnswerMap, AnswerValue, Question } from '../types/domain'

export type ParticipantRole = 'host' | 'guest'

export type AnswerTimestamps = Record<string, string>

export type RoomParticipant = {
  id: string
  label: string
  role: ParticipantRole
  joinedAt: string
  answers: AnswerMap
  answerTimestamps?: AnswerTimestamps
}

export type ConversationRoom = {
  id: string
  code: string
  createdAt: string
  previousRoomId?: string | null
  questionIds: string[]
  participants: RoomParticipant[]
}

export type RoomSession = {
  room: ConversationRoom
  participantId: string
}

export type ParticipantProgress = {
  participantId: string
  label: string
  answeredCount: number
  totalCount: number
  isComplete: boolean
}

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function timestamp() {
  return new Date().toISOString()
}

function randomIndex(max: number) {
  const cryptoApi = globalThis.crypto

  if (cryptoApi?.getRandomValues) {
    const values = new Uint32Array(1)
    cryptoApi.getRandomValues(values)

    return values[0] % max
  }

  return Math.floor(Math.random() * max)
}

function randomToken(length: number, alphabet: string) {
  return Array.from({ length }, () => alphabet[randomIndex(alphabet.length)]).join('')
}

function makeId(prefix: string) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}_${globalThis.crypto.randomUUID()}`
  }

  return `${prefix}_${randomToken(12, ROOM_CODE_ALPHABET.toLowerCase())}`
}

export function generateRoomCode(existingCodes?: ReadonlySet<string>) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = randomToken(6, ROOM_CODE_ALPHABET)

    if (!existingCodes?.has(code)) {
      return code
    }
  }

  return randomToken(8, ROOM_CODE_ALPHABET)
}

export function createConversationRoom(
  questionIds: string[],
  existingCodes?: ReadonlySet<string>,
  previousRoomId?: string | null,
): RoomSession {
  const participantId = makeId('host')
  const createdAt = timestamp()
  const room: ConversationRoom = {
    id: makeId('room'),
    code: generateRoomCode(existingCodes),
    createdAt,
    previousRoomId: previousRoomId ?? null,
    questionIds,
    participants: [
      {
        id: participantId,
        label: 'Sen',
        role: 'host',
        joinedAt: createdAt,
        answers: {},
      },
    ],
  }

  return { room, participantId }
}

export function joinConversationRoom(room: ConversationRoom): RoomSession {
  const existingGuest = room.participants.find((participant) => participant.role === 'guest')

  if (existingGuest) {
    return { room, participantId: existingGuest.id }
  }

  const participantId = makeId('guest')
  const nextRoom: ConversationRoom = {
    ...room,
    participants: [
      ...room.participants,
      {
        id: participantId,
        label: 'Davetli',
        role: 'guest',
        joinedAt: timestamp(),
        answers: {},
      },
    ],
  }

  return { room: nextRoom, participantId }
}

export function getParticipant(room: ConversationRoom, participantId: string) {
  return room.participants.find((participant) => participant.id === participantId) ?? null
}

export function getViewerParticipant(room: ConversationRoom) {
  return room.participants.find((participant) => participant.label === 'Sen') ?? null
}

export function saveParticipantAnswer(
  room: ConversationRoom,
  participantId: string,
  questionId: string,
  value: AnswerValue,
) {
  return {
    ...room,
    participants: room.participants.map((participant) => {
      if (participant.id !== participantId) {
        return participant
      }

      return {
        ...participant,
        answers: {
          ...participant.answers,
          [questionId]: value,
        },
      }
    }),
  }
}

export function getFirstUnansweredQuestionIndex(participant: RoomParticipant, questions: Question[]) {
  const firstUnansweredIndex = questions.findIndex((question) => participant.answers[question.id] === undefined)

  if (firstUnansweredIndex >= 0) {
    return firstUnansweredIndex
  }

  return Math.max(questions.length - 1, 0)
}

export function getParticipantProgress(
  room: ConversationRoom,
  totalCount: number,
): ParticipantProgress[] {
  return room.participants.map((participant) => {
    const answeredCount = Object.keys(participant.answers).length

    return {
      participantId: participant.id,
      label: participant.label,
      answeredCount,
      totalCount,
      isComplete: answeredCount >= totalCount,
    }
  })
}
