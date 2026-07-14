import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { randomInt, randomUUID } from 'node:crypto'

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const UNIQUE_VIOLATION = '23505'

type RequestBody = {
  key?: string
  questionIds?: string[]
}

type QuestionRow = {
  id: string
  slug: string
  type: string
  options: Array<{ id: string }>
}

type AnswerValue = string | number

function randomRoomCode() {
  return Array.from(
    { length: 6 },
    () => ROOM_CODE_ALPHABET[randomInt(ROOM_CODE_ALPHABET.length)],
  ).join('')
}

function randomAnswer(question: QuestionRow): AnswerValue {
  if (question.type === 'slider') {
    return randomInt(1, 6)
  }

  if (question.options.length === 0) {
    return ''
  }

  return question.options[randomInt(question.options.length)].id
}

function fail(res: VercelResponse, status: number, message: string, err?: unknown) {
  if (err) {
    console.error('[admin/demo-room]', message, err)
  }

  return res.status(status).json({ error: message })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return fail(res, 405, 'Method not allowed')
  }

  const adminKey = process.env.ADMIN_SECRET
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const body = req.body as RequestBody | undefined

  if (!adminKey || body?.key !== adminKey) {
    return fail(res, 401, 'Unauthorized')
  }

  if (!supabaseUrl || !supabaseKey) {
    return fail(res, 500, 'Demo oda servisi yapılandırılmamış.')
  }

  const questionIds = body?.questionIds?.filter(Boolean) ?? []

  if (questionIds.length === 0) {
    return fail(res, 400, 'Demo oda için soru bulunamadı.')
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  let roomId: string | null = null

  try {
    const { data: questionRows, error: questionError } = await supabase
      .from('questions')
      .select('id, slug, type, options')
      .in('slug', questionIds)

    if (questionError || !questionRows) {
      return fail(res, 500, 'Demo oda soruları yüklenemedi.', questionError)
    }

    const questionBySlug = new Map(
      (questionRows as QuestionRow[]).map((question) => [question.slug, question]),
    )
    const orderedQuestions = questionIds.flatMap((slug) => {
      const question = questionBySlug.get(slug)

      return question ? [question] : []
    })

    if (orderedQuestions.length !== questionIds.length) {
      return fail(res, 500, 'Demo oda soru seti eksik.')
    }

    const hostUserId = randomUUID()
    const guestUserId = randomUUID()

    for (let attempt = 0; attempt < 3 && !roomId; attempt += 1) {
      const { data: roomRow, error: roomError } = await supabase
        .from('rooms')
        .insert({
          invite_code: randomRoomCode(),
          question_count: questionIds.length,
          created_by: hostUserId,
        })
        .select('id')
        .single()

      if (roomRow) {
        roomId = roomRow.id
      } else if (roomError?.code !== UNIQUE_VIOLATION) {
        return fail(res, 500, 'Demo oda oluşturulamadı.', roomError)
      }
    }

    if (!roomId) {
      return fail(res, 500, 'Demo oda kodu üretilemedi.')
    }

    const createdRoomId = roomId

    const { data: participants, error: participantError } = await supabase
      .from('participants')
      .insert([
        {
          room_id: createdRoomId,
          user_id: hostUserId,
          display_name: 'Demo Ev Sahibi',
          seat: 1,
          is_host: true,
        },
        {
          room_id: createdRoomId,
          user_id: guestUserId,
          display_name: 'Demo Partner',
          seat: 2,
          is_host: false,
        },
      ])
      .select('id, seat')

    if (participantError || !participants) {
      throw participantError ?? new Error('Demo participants could not be created')
    }

    const host = participants.find((participant) => participant.seat === 1)
    const guest = participants.find((participant) => participant.seat === 2)

    if (!host || !guest) {
      throw new Error('Demo participants were not returned')
    }

    const roomQuestionRows = orderedQuestions.map((question, index) => ({
      room_id: createdRoomId,
      question_id: question.id,
      position: index + 1,
    }))

    const { error: roomQuestionsError } = await supabase
      .from('room_questions')
      .insert(roomQuestionRows)

    if (roomQuestionsError) {
      throw roomQuestionsError
    }

    const answerRows = orderedQuestions.flatMap((question) => {
      const hostValue = randomAnswer(question)
      const guestValue = Math.random() > 0.35 ? hostValue : randomAnswer(question)

      return [
        {
          room_id: createdRoomId,
          participant_id: host.id,
          question_id: question.id,
          answer_value: hostValue,
        },
        {
          room_id: createdRoomId,
          participant_id: guest.id,
          question_id: question.id,
          answer_value: guestValue,
        },
      ]
    })

    const { error: answersError } = await supabase.from('answers').insert(answerRows)

    if (answersError) {
      throw answersError
    }

    return res.status(200).json({
      roomId,
      participantId: host.id,
    })
  } catch (err) {
    if (roomId) {
      await supabase.from('rooms').delete().eq('id', roomId)
    }

    return fail(res, 500, 'Demo oda oluşturulamadı.', err)
  }
}
