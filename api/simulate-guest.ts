import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

type RequestBody = {
  roomCode: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase is not configured' })
  }

  const body = req.body as RequestBody | undefined

  if (!body?.roomCode) {
    return res.status(400).json({ error: 'Missing roomCode' })
  }

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  const { error: authError } = await client.auth.signInAnonymously()

  if (authError) {
    return res.status(500).json({ error: 'Failed to create anonymous session' })
  }

  const { data: roomRow } = await client
    .from('rooms')
    .select('id')
    .eq('invite_code', body.roomCode.trim().toUpperCase())
    .maybeSingle()

  if (!roomRow) {
    return res.status(404).json({ error: 'Room not found' })
  }

  const { data: existingGuest } = await client
    .from('participants')
    .select('id')
    .eq('room_id', roomRow.id)
    .eq('is_host', false)
    .maybeSingle()

  let guestId: string

  if (existingGuest) {
    guestId = existingGuest.id
  } else {
    const { data: inserted, error: insertError } = await client
      .from('participants')
      .insert({
        room_id: roomRow.id,
        display_name: 'Simüle Davetli',
        seat: 2,
        is_host: false,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      return res.status(500).json({ error: 'Failed to create guest participant' })
    }

    guestId = inserted.id
  }

  const { data: roomQuestions } = await client
    .from('room_questions')
    .select('question_id')
    .eq('room_id', roomRow.id)
    .order('position', { ascending: true })

  if (!roomQuestions || roomQuestions.length === 0) {
    return res.status(500).json({ error: 'No questions found for room' })
  }

  const { data: questionDetails } = await client
    .from('questions')
    .select('id, type, options')
    .in(
      'id',
      roomQuestions.map((rq) => rq.question_id),
    )

  if (!questionDetails) {
    return res.status(500).json({ error: 'Failed to load question details' })
  }

  const questionsById = new Map(questionDetails.map((q) => [q.id, q]))

  const answerRows = roomQuestions.map((rq) => {
    const question = questionsById.get(rq.question_id)
    let answerValue: string | number = ''

    if (question?.type === 'slider') {
      answerValue = Math.floor(Math.random() * 5) + 1
    } else {
      const options = question?.options as Array<{ id: string }> | null

      if (options && options.length > 0) {
        answerValue = options[Math.floor(Math.random() * options.length)].id
      }
    }

    return {
      room_id: roomRow.id,
      participant_id: guestId,
      question_id: rq.question_id,
      answer_value: answerValue,
    }
  })

  const { error: answerError } = await client.from('answers').upsert(answerRows, {
    onConflict: 'participant_id,question_id',
  })

  if (answerError) {
    return res.status(500).json({ error: 'Failed to save answers' })
  }

  return res.status(200).json({ ok: true, guestId })
}
