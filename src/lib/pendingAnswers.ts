import type { ConversationRoom } from '../domain/rooms'
import type { AnswerValue } from '../types/domain'

// İyimser cevap defteri: yazımı henüz sunucuda tamamlanmamış cevaplar.
// Ağdan gelen her oda anlık görüntüsü (saveAnswer dönüşü, polling, Realtime
// yenilemesi) bu defterin üzerine bindirilir; böylece eski bir snapshot
// kullanıcının az önce verdiği cevabı bir anlığına "silemez".
// (Bilinen açık: optimistic write / polling yarışı — PROJECT_STATE.)

type PendingEntry = {
  value: AnswerValue
  trackedAt: number
}

// Yazma hiç sonuçlanmazsa girdi sonsuza dek sunucu gerçeğini maskelememeli.
const PENDING_TTL_MS = 15_000

const pending = new Map<string, PendingEntry>()

function keyFor(participantId: string, questionId: string) {
  return `${participantId}:${questionId}`
}

export function trackPendingAnswer(participantId: string, questionId: string, value: AnswerValue) {
  pending.set(keyFor(participantId, questionId), { value, trackedAt: Date.now() })
}

// Yazma başarıyla dönünce çağrılır. Değer eşleşmesi aranır: kullanıcı bu
// arada aynı soruya daha yeni bir değer verdiyse o girdi defterde kalır.
export function resolvePendingAnswer(
  participantId: string,
  questionId: string,
  value: AnswerValue,
) {
  const key = keyFor(participantId, questionId)

  if (pending.get(key)?.value === value) {
    pending.delete(key)
  }
}

export function applyPendingAnswers(room: ConversationRoom | null): ConversationRoom | null {
  if (!room || pending.size === 0) {
    return room
  }

  const now = Date.now()

  for (const [key, entry] of pending) {
    if (now - entry.trackedAt > PENDING_TTL_MS) {
      pending.delete(key)
    }
  }

  if (pending.size === 0) {
    return room
  }

  let changed = false
  const participants = room.participants.map((participant) => {
    let nextAnswers = participant.answers

    for (const [key, entry] of pending) {
      const [participantId, questionId] = key.split(':', 2)

      if (participantId !== participant.id) {
        continue
      }

      if (nextAnswers[questionId] !== entry.value) {
        nextAnswers = { ...nextAnswers, [questionId]: entry.value }
      }
    }

    if (nextAnswers === participant.answers) {
      return participant
    }

    changed = true

    return { ...participant, answers: nextAnswers }
  })

  return changed ? { ...room, participants } : room
}
