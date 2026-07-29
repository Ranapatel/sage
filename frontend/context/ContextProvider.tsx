'use client'

/**
 * ContextProvider — mounts inside ClerkProvider in app/layout.tsx.
 *
 * Triggers /api/context/build when the user signs in or when the active
 * trip changes. Pushes the resulting ContextObject into the Zustand store
 * so any component can subscribe via the typed hooks.
 *
 * Also fetches the latest BudgetPlan recommendation for the active trip
 * (Phase 4 first fully-wired module).
 */

import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { contextAPI } from '@/lib/api'
import { useContextStore } from './contextStore'

interface ContextProviderProps {
  children: React.ReactNode
  /** Active trip id — passed by callers when a trip is in scope. */
  tripId?: string | null
}

export function ContextProvider({ children, tripId }: ContextProviderProps) {
  const { isSignedIn, isLoaded } = useUser()
  const lastTripIdRef = useRef<string | null>(null)
  const lastAuthRef = useRef<boolean | null>(null)

  const setContext = useContextStore((s) => s.setContext)
  const setBudgetPlan = useContextStore((s) => s.setBudgetPlan)
  const setUnreadCount = useContextStore((s) => s.setUnreadCount)
  const setIsBuilding = useContextStore((s) => s.setIsBuilding)
  const setLastError = useContextStore((s) => s.setLastError)
  const reset = useContextStore((s) => s.reset)

  useEffect(() => {
    // Wait for Clerk to finish hydrating before deciding whether to build.
    if (!isLoaded) return

    // Signed out → drop everything we had cached.
    if (!isSignedIn) {
      if (lastAuthRef.current !== false) {
        reset()
        lastAuthRef.current = false
      }
      return
    }
    lastAuthRef.current = true

    // Auth changed or trip id changed → rebuild.
    const tripChanged = (tripId ?? null) !== lastTripIdRef.current
    if (!tripChanged && useContextStore.getState().context !== null) {
      return
    }
    lastTripIdRef.current = tripId ?? null

    let cancelled = false
    setIsBuilding(true)

    ;(async () => {
      try {
        // Build context.
        const buildRes = await contextAPI.build({ tripId: tripId ?? undefined })
        if (cancelled) return
        if (buildRes?.success) {
          setContext(buildRes.context)
        } else {
          setLastError('Failed to build context.')
        }

        // Fetch budget plan in the background — non-blocking.
        try {
          const bp = await contextAPI.recommend<any>({
            module: 'budget',
            tripId: tripId ?? undefined,
            input: {},
          })
          if (cancelled) return
          if (bp?.success && bp.recommendations?.length > 0) {
            setBudgetPlan(bp.recommendations[0])
          }
        } catch {
          /* swallow — budgetPlan is non-critical */
        }

        // Fetch unread count in the background.
        try {
          const notif = await contextAPI.listNotifications({ onlyUnread: true, limit: 1 })
          if (cancelled) return
          if (notif?.success) {
            setUnreadCount(notif.notifications?.length ?? 0)
          }
        } catch {
          /* swallow */
        }
      } catch (err: any) {
        if (!cancelled) {
          setLastError(err?.message || 'Failed to load context.')
        }
      } finally {
        if (!cancelled) setIsBuilding(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, tripId, setContext, setBudgetPlan, setUnreadCount, setIsBuilding, setLastError, reset])

  return <>{children}</>
}

export default ContextProvider