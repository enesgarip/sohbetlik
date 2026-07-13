import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

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
    const [roomsRes, participantsRes, answersRes] = await Promise.all([
      supabase.from('rooms').select('id, status, selected_level, question_count, created_at'),
      supabase.from('participants').select('id, room_id, joined_at'),
      supabase.from('answers').select('id, room_id, answered_at').limit(10000),
    ])

    const rooms = roomsRes.data ?? []
    const participants = participantsRes.data ?? []
    const answers = answersRes.data ?? []

    // Basic counts
    const totalRooms = rooms.length
    const completedRooms = rooms.filter((r) => r.status === 'completed').length
    const activeRooms = rooms.filter((r) => r.status === 'answering').length
    const waitingRooms = rooms.filter((r) => r.status === 'waiting').length
    const totalParticipants = participants.length
    const totalAnswers = answers.length

    // Completion rate
    const completionRate = totalRooms > 0 ? Math.round((completedRooms / totalRooms) * 100) : 0

    // Level distribution
    const levelDist: Record<number, number> = {}
    for (const r of rooms) {
      levelDist[r.selected_level] = (levelDist[r.selected_level] || 0) + 1
    }

    // Rooms per day (last 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const dailyRooms: Record<string, number> = {}
    for (const r of rooms) {
      const date = r.created_at?.slice(0, 10)
      if (date && new Date(date) >= thirtyDaysAgo) {
        dailyRooms[date] = (dailyRooms[date] || 0) + 1
      }
    }

    // Paired rooms (rooms with 2 participants)
    const roomParticipantCount: Record<string, number> = {}
    for (const p of participants) {
      roomParticipantCount[p.room_id] = (roomParticipantCount[p.room_id] || 0) + 1
    }
    const pairedRooms = Object.values(roomParticipantCount).filter((c) => c >= 2).length
    const pairRate = totalRooms > 0 ? Math.round((pairedRooms / totalRooms) * 100) : 0

    // Average answers per room
    const roomAnswerCount: Record<string, number> = {}
    for (const a of answers) {
      roomAnswerCount[a.room_id] = (roomAnswerCount[a.room_id] || 0) + 1
    }
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
