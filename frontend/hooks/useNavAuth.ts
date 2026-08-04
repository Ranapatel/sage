'use client'

import { useUser } from '@clerk/nextjs'
import { useAuthStore } from '@/store/authStore'

/**
 * Single source of truth for navbar auth state.
 * Handles Clerk + fallback store auth in one place.
 * Components consume this — never compute auth state independently.
 */
export function useNavAuth() {
  const { user: clerkUser, isSignedIn: isClerkSignedIn, isLoaded } = useUser()
  const { user: storeUser, isLoggedIn: isStoreLoggedIn } = useAuthStore()

  // isLoaded = Clerk has finished its network check (not a guess)
  // Until isLoaded, we show a skeleton — never flash wrong UI
  const isSignedIn = isLoaded ? (isClerkSignedIn || isStoreLoggedIn) : null // null = still loading

  const user = isClerkSignedIn && clerkUser
    ? {
        name: clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress || 'Traveler',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        imageUrl: clerkUser.imageUrl || null,
        // Priority: firstName → fullName → email (always available at login)
        initial: (
          clerkUser.firstName ||
          clerkUser.fullName ||
          clerkUser.primaryEmailAddress?.emailAddress ||
          '?'
        ).charAt(0).toUpperCase(),
        verified: true,
      }
    : isStoreLoggedIn && storeUser
      ? {
          name: storeUser.name,
          email: storeUser.email,
          imageUrl: null,
          initial: storeUser.name.charAt(0).toUpperCase(),
          verified: false,
        }
      : null

  return {
    isLoaded,          // false while Clerk is fetching — show skeleton
    isSignedIn,        // null=loading, true=signed in, false=signed out
    user,              // null when not signed in or loading
  }
}
