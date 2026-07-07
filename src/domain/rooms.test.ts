import { describe, expect, it } from 'vitest'
import {
  createConversationRoom,
  getFirstUnansweredQuestionIndex,
  getParticipant,
  joinConversationRoom,
  saveParticipantAnswer,
} from './rooms'
import type { Question } from '../types/domain'

const questions: Question[] = [
  {
    id: 'morning-night',
    category: 'Ritim',
    level: 1,
    type: 'either_or',
    prompt: 'Enerjin daha çok ne zaman açılır?',
    options: [
      { id: 'morning', label: 'Sabah' },
      { id: 'night', label: 'Gece' },
    ],
  },
  {
    id: 'travel-mode',
    category: 'Seyahat',
    level: 2,
    type: 'choice',
    prompt: 'Bir seyahatte ideal modun hangisine yakın?',
    options: [
      { id: 'planned', label: 'Planlı' },
      { id: 'flow', label: 'Akışta' },
    ],
  },
]

describe('room domain', () => {
  it('creates a host room and lets one guest join', () => {
    const session = createConversationRoom(questions.map((question) => question.id))
    const joinedSession = joinConversationRoom(session.room)

    expect(session.room.code).toHaveLength(6)
    expect(session.room.participants).toHaveLength(1)
    expect(joinedSession.room.participants).toHaveLength(2)
    expect(joinedSession.participantId).toContain('guest_')
  })

  it('stores answers immutably and finds the next unanswered question', () => {
    const session = createConversationRoom(questions.map((question) => question.id))
    const nextRoom = saveParticipantAnswer(session.room, session.participantId, 'morning-night', 'night')
    const participant = getParticipant(nextRoom, session.participantId)

    expect(participant?.answers['morning-night']).toBe('night')
    expect(session.room.participants[0].answers['morning-night']).toBeUndefined()
    expect(participant ? getFirstUnansweredQuestionIndex(participant, questions) : -1).toBe(1)
  })
})
