import { useAuth } from '@clerk/nextjs'
import { useAuthGuardStore } from '@/store/authGuardStore'

export function useRequireAuth() {
  const { isSignedIn, isLoaded } = useAuth()
  const { openAuthModal } = useAuthGuardStore()

  const requireAuth = <T extends any[]>(action: (...args: T) => void) => {
    return (...args: T) => {
      if (!isLoaded) return

      if (isSignedIn) {
        action(...args)
      } else {
        openAuthModal(() => action(...args))
      }
    }
  }

  return { requireAuth, isSignedIn, isLoaded }
}
