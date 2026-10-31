/**
 * Client budget for POST /api/itinerary/generate.
 *
 * The shared Axios instance times out at 60s. Generation on the live API
 * has been observed around 80–100s, so this call must override that timeout.
 * Retries stay at 0: a timed-out attempt is usually still running on the
 * server, and another attempt starts a second generation.
 */
export const ITINERARY_GENERATE_TIMEOUT_MS = 150_000

export const ITINERARY_GENERATE_MAX_RETRIES = 0

export const ITINERARY_PROGRESS_MESSAGE =
  'Building your day-by-day plan… this can take up to 2 minutes'

export function itineraryRequestConfig(signal?: AbortSignal): {
  signal?: AbortSignal
  timeout: number
} {
  return { signal, timeout: ITINERARY_GENERATE_TIMEOUT_MS }
}

/** Abort when either the per-attempt timer or the page-level search abort fires. */
export function combineAbortSignals(
  ...signals: Array<AbortSignal | undefined>
): AbortSignal | undefined {
  const active = signals.filter((signal): signal is AbortSignal => Boolean(signal))
  if (active.length === 0) return undefined
  if (active.length === 1) return active[0]
  if (typeof AbortSignal.any === 'function') return AbortSignal.any(active)

  const controller = new AbortController()
  for (const signal of active) {
    if (signal.aborted) {
      controller.abort()
      return controller.signal
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true })
  }
  return controller.signal
}

/** Non-empty itinerary payload from the generate endpoint. Otherwise the UI uses its local fallback. */
export function liveItineraryDays<T>(
  result: { data?: { itinerary?: T[] | null } } | null | undefined,
): T[] | null {
  const days = result?.data?.itinerary
  if (Array.isArray(days) && days.length > 0) return days
  return null
}
