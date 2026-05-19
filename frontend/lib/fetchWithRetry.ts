/**
 * Fetch utility with configurable timeout and retry logic.
 *
 * - Wraps any async call with an AbortController-based timeout.
 * - On failure, retries up to `maxRetries` times with exponential back-off.
 * - Rejects with the last encountered error after all retries are exhausted.
 */

export interface FetchWithRetryOptions {
  /** Timeout per attempt in milliseconds (default: 10 000) */
  timeout?: number
  /** Number of retry attempts after the first failure (default: 2) */
  maxRetries?: number
  /** Label for console logs (optional) */
  label?: string
}

const DEFAULT_TIMEOUT = 10_000   // 10 seconds
const DEFAULT_RETRIES = 2        // 2 retries (3 total attempts)

/**
 * Execute an async function with timeout and retry.
 *
 * @example
 * const data = await fetchWithRetry(() => tripAPI.search(params), { label: 'Search' })
 */
export async function fetchWithRetry<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  options: FetchWithRetryOptions = {},
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, maxRetries = DEFAULT_RETRIES, label = 'API' } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const result = await fn(controller.signal)
      clearTimeout(timer)
      return result
    } catch (err: any) {
      clearTimeout(timer)
      lastError = err

      const isTimeout = err?.name === 'AbortError' || err?.code === 'ECONNABORTED'
      const tag = isTimeout ? 'timeout' : 'error'

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * 2 ** attempt, 4000) // 1s → 2s → 4s
        console.warn(`[${label}] ${tag} on attempt ${attempt + 1}/${maxRetries + 1} — retrying in ${delay}ms`)
        await new Promise(r => setTimeout(r, delay))
      } else {
        console.error(`[${label}] All ${maxRetries + 1} attempts failed`)
      }
    }
  }

  throw lastError ?? new Error(`[${label}] All retry attempts failed`)
}
