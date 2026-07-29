/**
 * useMemory — favorites + notifications.
 *
 * Phase 6 will add async loading of favorite lists. For now the hook is
 * a write-only façade — call `toggleFavorite(...)` and rely on optimistic
 * updates in components.
 */

import { useCallback, useState } from 'react'
import { contextAPI } from '@/lib/api'
import { useContextStore } from './contextStore'

export function useMemory() {
  const unreadCount = useContextStore((s) => s.unreadCount)
  const setUnreadCount = useContextStore((s) => s.setUnreadCount)
  const [toggling, setToggling] = useState(false)

  const toggleFavorite = useCallback(
    async (params: {
      type: 'hotel' | 'activity'
      action: 'add' | 'remove'
      hotelId?: string
      hotelName?: string
      city?: string
      rating?: number
      activityId?: string
      name?: string
    }): Promise<boolean> => {
      setToggling(true)
      try {
        const res = await contextAPI.toggleFavorite(params)
        return !!res.success
      } finally {
        setToggling(false)
      }
    },
    []
  )

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await contextAPI.markNotificationRead(id)
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch {
      /* swallow */
    }
  }, [unreadCount, setUnreadCount])

  return {
    unreadCount,
    toggleFavorite,
    markNotificationRead,
    toggling,
  }
}

export default useMemory