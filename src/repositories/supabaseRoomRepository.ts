import type { SupabaseClient } from '@supabase/supabase-js'
import {
  generateRoomCode,
  type ConversationRoom,
  type RoomParticipant,
} from '../domain/rooms'
import { supabase } from '../lib/supabase'
import type { AnswerMap } from '../types/domain'
import type { Database } from '../types/supabase'
import type { RoomRepository } from './roomRepository'

type Client = SupabaseClient<Database>
type ParticipantRow = Database['public']['Tables']['participants']['Row']

const UNIQUE_VIOLATION = '23505'
const AUTH_RETRY_DELAYS_MS = [0, 300, 900]

function requireClient(): Client {
  if (!supabase) {
    throw new Error(
      'Supabase istemcisi yapılandırılmamış. VITE_SUPABASE_URL ve VITE_SUPABASE_PUBLISHABLE_KEY gerekli.',
    )
  }

  return supabase
}

async function ensureUserId(client: Client): Promise<string> {
  const { data } = await client.auth.getSession()

  if (data.session) {
    return data.session.user.id
  }

  let lastError: unknown = null

  for (const delayMs of AUTH_RETRY_DELAYS_MS) {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }

    const { data: signInData, error } = await client.auth.signInAnonymously()

    if (signInData.user) {
      return signInData.user.id
    }

    lastError = error
  }

  throw new Error(
    'Anonim oturum açılamadı. Supabase projesinde anonymous sign-ins aktif olmalı.',
    { cause: lastError },
  )
}

type QuestionMaps = {
  idBySlug: Map<string, string>
  slugById: Map<string, string>
}

let questionMapsPromise: Promise<QuestionMaps> | null = null

function getQuestionMaps(client: Client): Promise<QuestionMaps> {
  questionMapsPromise ??= (async () => {
    const { data, error } = await client.from('questions').select('id, slug')

    if (error || !data) {
      questionMapsPromise = null
      throw new Error(error?.message ?? 'Sorular yüklenemedi')
    }

    return {
      idBySlug: new Map(data.map((row) => [row.slug, row.id])),
      slugById: new Map(data.map((row) => [row.id, row.slug])),
    }
  })()

  return questionMapsPromise
}

function mapParticipant(
  row: ParticipantRow,
  answers: AnswerMap,
  currentUserId: string | null,
  answerTimestamps?: Record<string, string>,
): RoomParticipant {
  const isSelf = currentUserId !== null && row.user_id === currentUserId

  return {
    id: row.id,
    label: isSelf ? 'Sen' : row.is_host ? 'Ev sahibi' : 'Davetli',
    role: row.is_host ? 'host' : 'guest',
    joinedAt: row.joined_at,
    answers,
    answerTimestamps,
  }
}

async function getRoomSnapshot(
  client: Client,
  roomId: string,
  currentUserId: string | null,
): Promise<ConversationRoom | null> {
  const [roomRes, participantsRes, roomQuestionsRes, answersRes, maps] = await Promise.all([
    client.from('rooms').select('*').eq('id', roomId).maybeSingle(),
    client.from('participants').select('*').eq('room_id', roomId).order('seat', { ascending: true }),
    client
      .from('room_questions')
      .select('question_id, position')
      .eq('room_id', roomId)
      .order('position', { ascending: true }),
    client.from('answers').select('participant_id, question_id, answer_value, answered_at').eq('room_id', roomId),
    getQuestionMaps(client),
  ])

  const roomRow = roomRes.data

  if (roomRes.error || !roomRow) {
    return null
  }

  if (participantsRes.error || roomQuestionsRes.error || answersRes.error) {
    return null
  }

  const answersByParticipant = new Map<string, AnswerMap>()
  const timestampsByParticipant = new Map<string, Record<string, string>>()

  for (const answer of answersRes.data ?? []) {
    const slug = maps.slugById.get(answer.question_id)

    if (!slug) {
      continue
    }

    if (typeof answer.answer_value !== 'string' && typeof answer.answer_value !== 'number') {
      continue
    }

    const target = answersByParticipant.get(answer.participant_id) ?? {}
    target[slug] = answer.answer_value
    answersByParticipant.set(answer.participant_id, target)

    if (answer.answered_at) {
      const ts = timestampsByParticipant.get(answer.participant_id) ?? {}
      ts[slug] = answer.answered_at as string
      timestampsByParticipant.set(answer.participant_id, ts)
    }
  }

  return {
    id: roomRow.id,
    code: roomRow.invite_code,
    createdAt: roomRow.created_at,
    previousRoomId: roomRow.previous_room_id,
    questionIds: (roomQuestionsRes.data ?? []).flatMap((row) => {
      const slug = maps.slugById.get(row.question_id)

      return slug ? [slug] : []
    }),
    participants: (participantsRes.data ?? []).map((row) =>
      mapParticipant(row, answersByParticipant.get(row.id) ?? {}, currentUserId, timestampsByParticipant.get(row.id)),
    ),
  }
}

export const supabaseRoomRepository: RoomRepository = {
  async createRoom(questionIds, options = {}) {
    const client = requireClient()
    const userId = await ensureUserId(client)
    const maps = await getQuestionMaps(client)

    const questionRows = questionIds.map((slug, index) => {
      const questionId = maps.idBySlug.get(slug)

      if (!questionId) {
        throw new Error(`Soru veritabanında bulunamadı: ${slug}`)
      }

      return { question_id: questionId, position: index + 1 }
    })

    let createdRoom: Database['public']['Tables']['rooms']['Row'] | null = null

    for (let attempt = 0; attempt < 3 && !createdRoom; attempt += 1) {
      const { data, error } = await client
        .from('rooms')
        .insert({
          invite_code: generateRoomCode(),
          question_count: questionIds.length,
          previous_room_id: options.previousRoomId ?? null,
        })
        .select()
        .single()

      if (data) {
        createdRoom = data
      } else if (error && error.code !== UNIQUE_VIOLATION) {
        throw new Error(error.message)
      }
    }

    if (!createdRoom) {
      throw new Error('Benzersiz oda kodu üretilemedi.')
    }

    const roomRow = createdRoom

    const { data: participantRow, error: participantError } = await client
      .from('participants')
      .insert({ room_id: roomRow.id, display_name: 'Ev sahibi', seat: 1, is_host: true })
      .select()
      .single()

    if (participantError || !participantRow) {
      throw new Error(participantError?.message ?? 'Katılımcı kaydı oluşturulamadı.')
    }

    const { error: questionsError } = await client
      .from('room_questions')
      .insert(questionRows.map((row) => ({ ...row, room_id: roomRow.id })))

    if (questionsError) {
      throw new Error(questionsError.message)
    }

    return {
      room: {
        id: roomRow.id,
        code: roomRow.invite_code,
        createdAt: roomRow.created_at,
        previousRoomId: roomRow.previous_room_id,
        questionIds,
        participants: [mapParticipant(participantRow, {}, userId)],
      },
      participantId: participantRow.id,
    }
  },

  async getRoomById(roomId) {
    const client = requireClient()
    const userId = await ensureUserId(client)

    return getRoomSnapshot(client, roomId, userId)
  },

  async getRoomByCode(roomCode) {
    const client = requireClient()
    const userId = await ensureUserId(client)
    const { data } = await client
      .from('rooms')
      .select('id')
      .eq('invite_code', roomCode.trim().toUpperCase())
      .maybeSingle()

    if (!data) {
      return null
    }

    return getRoomSnapshot(client, data.id, userId)
  },

  async joinRoomByCode(roomCode) {
    const client = requireClient()
    const userId = await ensureUserId(client)

    const { data: roomRow, error: roomError } = await client
      .from('rooms')
      .select('id')
      .eq('invite_code', roomCode.trim().toUpperCase())
      .maybeSingle()

    if (roomError || !roomRow) {
      return null
    }

    const { data: existing } = await client
      .from('participants')
      .select('id')
      .eq('room_id', roomRow.id)
      .eq('user_id', userId)
      .maybeSingle()

    let participantId = existing?.id ?? null

    if (!participantId) {
      const { data: inserted, error: insertError } = await client
        .from('participants')
        .insert({ room_id: roomRow.id, display_name: 'Davetli', seat: 2, is_host: false })
        .select('id')
        .single()

      if (insertError || !inserted) {
        // Seat 2 is already taken by someone else or the room is closed.
        return null
      }

      participantId = inserted.id
    }

    const room = await getRoomSnapshot(client, roomRow.id, userId)

    return room ? { room, participantId } : null
  },

  async saveAnswer({ roomId, participantId, questionId, value }) {
    const client = requireClient()
    const userId = await ensureUserId(client)
    const maps = await getQuestionMaps(client)
    const questionUuid = maps.idBySlug.get(questionId)

    if (!questionUuid) {
      return null
    }

    const { error } = await client.from('answers').upsert(
      {
        room_id: roomId,
        participant_id: participantId,
        question_id: questionUuid,
        answer_value: value,
      },
      { onConflict: 'participant_id,question_id' },
    )

    if (error) {
      return null
    }

    return getRoomSnapshot(client, roomId, userId)
  },

  async deleteRoom(roomId) {
    const client = requireClient()
    await ensureUserId(client)
    // RLS only lets the creator delete; for guests this is a silent no-op.
    await client.from('rooms').delete().eq('id', roomId)
  },

  subscribeToRoom(roomId, onChange) {
    if (!supabase) {
      return () => {}
    }

    const client = supabase
    const channel = client
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        onChange,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants', filter: `room_id=eq.${roomId}` },
        onChange,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'answers', filter: `room_id=eq.${roomId}` },
        onChange,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'result_summaries', filter: `room_id=eq.${roomId}` },
        onChange,
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  },
}
