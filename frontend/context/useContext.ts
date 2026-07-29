/**
 * useContext — returns the cached ContextObject plus a refresh() helper.
 */

import { useCallback } from 'react'
import { contextAPI } from '@/lib/api'
import { useContextStore } from './contextStore'
import type { ContextObject } from '@/lib/api'

export function useContext() {
  const ctx = useContextStore((s) => s.context)
  const isBuilding = useContextStore((s) => s.isBuilding)
  const lastError = useContextStore((s) => s.lastError)
  const setContext = useContextStore((s) => s.setContext)
  const setLastError = useContextStore((s) => s.setLastError)

  const refresh = useCallback(async (tripId?: string): Promise<ContextObject | null> => {
    try {
      const res = await contextAPI.build({ tripId, bypassCache: true })
      if (res.success) {
        setContext(res.context)
        return res.context
      }
      setLastError('Failed to refresh context.')
      return null
    } catch (err: any) {
      setLastError(err?.message || 'Failed to refresh context.')
      return null
    }
  }, [setContext, setLastError])

  return {
    context: ctx,
    isBuilding,
    lastError,
    refresh,
  }
}

export default useContext