/**
 * Clerk Token Holder — module-level singleton for the current Clerk JWT.
 *
 * PROBLEM
 * -------
 * The axios/fetch interceptors in lib/api.ts, lib/apiClient.ts, and
 * lib/activitiesApi.ts need to attach `Authorization: Bearer <token>` to
 * every backend request. But they run outside the React render cycle, so
 * they cannot call Clerk's `getToken()` hook directly.
 *
 * The legacy code solved this by reading a fake token from
 * `localStorage['tripsage-auth']` (the Zustand authStore persist key).
 * That fake token is rejected by the backend's Clerk verification → 401.
 *
 * SOLUTION
 * --------
 * A React component (ClerkTokenSync) calls `useAuth().getToken()` on every
 * auth-state change and stores the real Clerk JWT in this module-level
 * holder. The API interceptors read from the holder — no localStorage, no
 * fake tokens. Clerk is the single source of truth.
 *
 * The holder is intentionally NOT persisted to localStorage. The token is
 * short-lived (60 s default) and must be refreshed by Clerk on each
 * getToken() call.
 */

let currentToken: string | null = null

/**
 * Called by ClerkTokenSync whenever Clerk issues or refreshes a session token.
 */
export function setClerkToken(token: string | null): void {
  currentToken = token
}

/**
 * Returns the current Clerk JWT, or null if the user is not authenticated.
 * Used by axios/fetch interceptors to attach the Bearer header.
 */
export function getClerkToken(): string | null {
  return currentToken
}

/**
 * Returns true if a Clerk token is currently available.
 */
export function hasClerkToken(): boolean {
  return currentToken !== null
}
