'use client'

/**
 * ClerkTokenSync — bridges Clerk's React auth context to the module-level
 * token holder used by non-React API interceptors.
 *
 * Mounted once inside <ClerkProvider> in app/layout.tsx. On every auth-state
 * change (sign-in, sign-out, token refresh) it calls getToken() and pushes
 * the real Clerk JWT into lib/clerkToken.ts. The axios/fetch interceptors
 * then read from that holder instead of the legacy localStorage fake token.
 *
 * Clerk remains the single source of truth — no alternative auth system.
 */

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { setClerkToken } from '@/lib/clerkToken'

export default function ClerkTokenSync() {
  const { isLoaded, isSignedIn, getToken } = useAuth()

  useEffect(() => {
    if (!isLoaded) return

    // Signed out → clear the holder so interceptors stop attaching stale tokens.
    if (!isSignedIn) {
      setClerkToken(null)
      return
    }

    // Signed in → fetch a fresh JWT and store it. getToken() automatically
    // refreshes if the token is near expiry.
    let cancelled = false
    const syncToken = async () => {
      try {
        const token = await getToken()
        if (!cancelled) {
          setClerkToken(token)
        }
      } catch (err) {
        console.warn('[ClerkTokenSync] Failed to get token:', err)
        if (!cancelled) {
          setClerkToken(null)
        }
      }
    }

    syncToken()

    // Refresh token every 50 seconds to prevent expiration
    const interval = setInterval(syncToken, 50000)

    // Refresh when user returns to tab
    const onFocus = () => syncToken()
    window.addEventListener('focus', onFocus)

    return () => {
      cancelled = true
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [isLoaded, isSignedIn, getToken])

  return null
}
