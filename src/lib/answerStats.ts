import type { Question } from '../types/domain'
import type { AnswerTimestamps } from '../domain/rooms'

export type AnswerTimeStat = {
  questionId: string
  prompt: string
  durationMs: number
}

export type TimeStats = {
  totalSeconds: number
  avgSeconds: number
  fastest: AnswerTimeStat | null
  slowest: AnswerTimeStat | null
}

export function calculateTimeStats(
  questions: Question[],
  timestamps: AnswerTimestamps | undefined,
): TimeStats | null {
  if (!timestamps) return null

  const sorted = questions
    .filter((q) => timestamps[q.id])
    .map((q) => ({ id: q.id, prompt: q.prompt, ts: new Date(timestamps[q.id]).getTime() }))
    .sort((a, b) => a.ts - b.ts)

  if (sorted.length < 2) return null

  const durations: AnswerTimeStat[] = []
  for (let i = 1; i < sorted.length; i++) {
    durations.push({
      questionId: sorted[i].id,
      prompt: sorted[i].prompt,
      durationMs: sorted[i].ts - sorted[i - 1].ts,
    })
  }

  const totalMs = sorted[sorted.length - 1].ts - sorted[0].ts
  const avgMs = totalMs / (sorted.length - 1)

  const fastest = durations.reduce((min, d) => (d.durationMs < min.durationMs ? d : min), durations[0])
  const slowest = durations.reduce((max, d) => (d.durationMs > max.durationMs ? d : max), durations[0])

  return {
    totalSeconds: Math.round(totalMs / 1000),
    avgSeconds: Math.round(avgMs / 1000),
    fastest,
    slowest,
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} sn`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs > 0 ? `${mins} dk ${secs} sn` : `${mins} dk`
}
