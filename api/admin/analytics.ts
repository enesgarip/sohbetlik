import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const PAGE_SIZE = 1000

type RoomRow = {
  id: string
  status: string
  selected_level: number
  question_count: number
  created_at: string
}

type ParticipantRow = {
  id: string
  room_id: string
  joined_at: string
}

type AnswerRow = {
  id: string
  room_id: string
  participant_id: string
  answered_at: string
}

type RoomQuestionRow = {
  room_id: string
  question_id: string
}

type QuestionRow = {
  id: string
  level: number
}

type SupabaseQueryError = {
  message: string
}

type SupabaseQueryResult<T> = {
  data: T[] | null
  error: SupabaseQueryError | null
}

type SupabaseReader = {
  from: (table: string) => {
    select: (columns: string) => {
      range: (from: number, to: number) => PromiseLike<SupabaseQueryResult<unknown>>
    }
  }
}

async function fetchAllRows<T>(
  supabase: SupabaseReader,
  table: string,
  columns: string,
): Promise<T[]> {
  const rows: T[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      throw new Error(error.message)
    }

    const page = (data ?? []) as T[]
    rows.push(...page)

    if (page.length < PAGE_SIZE) {
      return rows
    }
  }
}

/**
 * Admin Analytics Dashboard API
 * 
 * GET /api/admin/analytics?key=ADMIN_SECRET
 * Returns room stats, completion rates, user activity.
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const adminKey = process.env.ADMIN_SECRET
  const providedKey = req.query.key as string

  if (!adminKey || providedKey !== adminKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Database not configured' })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parallel queries
    const [rooms, participants, answers, roomQuestions, questions] = await Promise.all([
      fetchAllRows<RoomRow>(supabase, 'rooms', 'id, status, selected_level, question_count, created_at'),
      fetchAllRows<ParticipantRow>(supabase, 'participants', 'id, room_id, joined_at'),
      fetchAllRows<AnswerRow>(supabase, 'answers', 'id, room_id, participant_id, answered_at'),
      fetchAllRows<RoomQuestionRow>(supabase, 'room_questions', 'room_id, question_id'),
      fetchAllRows<QuestionRow>(supabase, 'questions', 'id, level'),
    ])

    const participantsByRoom: Record<string, ParticipantRow[]> = {}
    for (const participant of participants) {
      participantsByRoom[participant.room_id] ??= []
      participantsByRoom[participant.room_id].push(participant)
    }

    const answerCountByRoom: Record<string, number> = {}
    const answerCountByParticipant: Record<string, number> = {}
    for (const answer of answers) {
      answerCountByRoom[answer.room_id] = (answerCountByRoom[answer.room_id] ?? 0) + 1
      const participantKey = `${answer.room_id}:${answer.participant_id}`
      answerCountByParticipant[participantKey] = (answerCountByParticipant[participantKey] ?? 0) + 1
    }

    const questionLevelById = new Map(questions.map((question) => [question.id, question.level]))
    const roomLevelByRoom: Record<string, number> = {}
    for (const roomQuestion of roomQuestions) {
      const level = questionLevelById.get(roomQuestion.question_id)
      if (!level) continue
      roomLevelByRoom[roomQuestion.room_id] = Math.max(roomLevelByRoom[roomQuestion.room_id] ?? 1, level)
    }

    const roomStats = rooms.map((room) => {
      const roomParticipants = participantsByRoom[room.id] ?? []
      const completedParticipantCount = roomParticipants.filter((participant) => {
        const participantKey = `${room.id}:${participant.id}`
        return (answerCountByParticipant[participantKey] ?? 0) >= room.question_count
      }).length
      const answerCount = answerCountByRoom[room.id] ?? 0
      const isCompleted = roomParticipants.length >= 2 && completedParticipantCount >= 2
      const isActive = !isCompleted && answerCount > 0 && completedParticipantCount === 0

      return {
        room,
        participantCount: roomParticipants.length,
        answerCount,
        completedParticipantCount,
        isCompleted,
        isActive,
        inferredLevel: roomLevelByRoom[room.id] ?? room.selected_level,
      }
    })

    // Basic counts
    const totalRooms = rooms.length
    const completedRooms = roomStats.filter((stats) => stats.isCompleted).length
    const activeRooms = roomStats.filter((stats) => stats.isActive).length
    const waitingRooms = totalRooms - completedRooms - activeRooms
    const totalParticipants = participants.length
    const totalAnswers = answers.length

    // Completion rate
    const completionRate = totalRooms > 0 ? Math.round((completedRooms / totalRooms) * 100) : 0

    // Level distribution
    const levelDist: Record<number, number> = {}
    for (const stats of roomStats) {
      levelDist[stats.inferredLevel] = (levelDist[stats.inferredLevel] || 0) + 1
    }

    // Rooms per day (last 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const dailyRooms: Record<string, number> = {}
    for (const { room } of roomStats) {
      const date = room.created_at?.slice(0, 10)
      if (date && new Date(date) >= thirtyDaysAgo) {
        dailyRooms[date] = (dailyRooms[date] || 0) + 1
      }
    }

    // Paired rooms (rooms with 2 participants)
    const pairedRooms = roomStats.filter((stats) => stats.participantCount >= 2).length
    const pairRate = totalRooms > 0 ? Math.round((pairedRooms / totalRooms) * 100) : 0

    // Average answers per room
    const avgAnswersPerRoom = totalRooms > 0
      ? Math.round(totalAnswers / totalRooms)
      : 0

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    return res.status(200).json({
      overview: {
        totalRooms,
        completedRooms,
        activeRooms,
        waitingRooms,
        completionRate,
        totalParticipants,
        pairedRooms,
        pairRate,
        totalAnswers,
        avgAnswersPerRoom,
      },
      levelDistribution: levelDist,
      dailyRooms: Object.entries(dailyRooms)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
