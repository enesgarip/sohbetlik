import { useCallback, useEffect, useState } from 'react'
import type { ConversationRoom } from '../domain/rooms'
import { applyPendingAnswers } from '../lib/pendingAnswers'
import { roomRepository } from '../repositories/activeRoomRepository'

const POLL_INTERVAL_MS = 3000

export type UseRoomOptions = {
  sync?: boolean
}

export function useRoom(roomId: string | undefined, { sync = true }: UseRoomOptions = {}) {
  const [room, setRoom] = useState<ConversationRoom | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(roomId))

  const refresh = useCallback(async () => {
    if (!roomId) {
      return
    }

    try {
      const next = await roomRepository.getRoomById(roomId)
      // Yazımı süren iyimser cevaplar eski snapshot'larca ezilmesin.
      setRoom(applyPendingAnswers(next))
    } catch {
      // Keep the last known snapshot; polling will retry.
    }
  }, [roomId])

  useEffect(() => {
    if (!roomId) {
      setRoom(null)
      setIsLoading(false)
      return
    }

    let active = true
    setIsLoading(true)

    roomRepository
      .getRoomById(roomId)
      .then((next) => {
        if (active) {
          setRoom(applyPendingAnswers(next))
        }
      })
      .catch(() => {
        if (active) {
          setRoom(null)
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    if (!sync) {
      return () => {
        active = false
      }
    }

    const unsubscribe = roomRepository.subscribeToRoom(roomId, () => {
      void refresh()
    })
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refresh()
      }
    }, POLL_INTERVAL_MS)

    return () => {
      active = false
      unsubscribe()
      window.clearInterval(timer)
    }
  }, [roomId, sync, refresh])

  return { room, setRoom, isLoading, refresh }
}
