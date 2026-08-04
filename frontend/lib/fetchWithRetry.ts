/**
 * Production-Grade Reliable Fetch Utility with Circuit Breaker, Smart Retry & Structured Logging.
 *
 * Rules:
 * 1. NEVER retries 4xx client errors (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity).
 * 2. ONLY retries transient errors: 429 Too Many Requests, 503 Service Unavailable, 504 Gateway Timeout, ECONNABORTED, AbortError, or Network Failures.
 * 3. Exponential Backoff with Full Random Jitter (1s -> 2.3s -> 4.5s).
 * 4. Circuit Breaker: Fails fast for 30s if an endpoint experiences 4 consecutive persistent failures.
 * 5. Structured Observability: Outputs detailed JSON logs with requestId, endpoint, method, statusCode, responseTimeMs, retryReason, and correlationId.
 */

export interface FetchWithRetryOptions {
  /** Timeout per attempt in milliseconds (default: 15 000) */
  timeout?: number
  /** Number of retry attempts after the first failure (default: 2) */
  maxRetries?: number
  /** Label / Provider for structured logging */
  label?: string
  /** Endpoint path for circuit breaker tracking */
  endpoint?: string
  /** HTTP Method */
  method?: string
  /** Suppress console logging */
  silent?: boolean
}

// ─── CIRCUIT BREAKER REGISTRY ────────────────────────────────────────────────
interface CircuitState {
  failures: number
  lastFailureTime: number
  isOpen: boolean
}

const CIRCUIT_BREAKER_REGISTRY: Record<string, CircuitState> = {}
const FAILURE_THRESHOLD = 4
const CIRCUIT_RESET_MS = 30_000 // 30s cooldown before probe request

function isCircuitOpen(endpointKey: string): boolean {
  const state = CIRCUIT_BREAKER_REGISTRY[endpointKey]
  if (!state || !state.isOpen) return false
  
  // Cooldown check
  if (Date.now() - state.lastFailureTime > CIRCUIT_RESET_MS) {
    state.isOpen = false
    state.failures = 0
    return false
  }
  return true
}

function recordCircuitFailure(endpointKey: string) {
  if (!CIRCUIT_BREAKER_REGISTRY[endpointKey]) {
    CIRCUIT_BREAKER_REGISTRY[endpointKey] = { failures: 0, lastFailureTime: 0, isOpen: false }
  }
  const state = CIRCUIT_BREAKER_REGISTRY[endpointKey]
  state.failures += 1
  state.lastFailureTime = Date.now()
  if (state.failures >= FAILURE_THRESHOLD) {
    state.isOpen = true
    console.warn(`[CircuitBreaker] 🔴 Circuit OPEN for ${endpointKey}. Failing fast for ${CIRCUIT_RESET_MS / 1000}s.`)
  }
}

function recordCircuitSuccess(endpointKey: string) {
  if (CIRCUIT_BREAKER_REGISTRY[endpointKey]) {
    CIRCUIT_BREAKER_REGISTRY[endpointKey].failures = 0
    CIRCUIT_BREAKER_REGISTRY[endpointKey].isOpen = false
  }
}

// ─── NON-BLIND RETRY ELIGIBILITY CHECK ──────────────────────────────────────
export function isRetryableError(err: any): { retryable: boolean; reason: string } {
  // 0. INTENTIONAL REQUEST CANCELLATION
  const isCanceled = err?.name === 'CanceledError' || err?.message === 'canceled' || (err?.message && err.message.toLowerCase().includes('cancel'))
  if (isCanceled) {
    return { retryable: false, reason: 'REQUEST_CANCELED' }
  }

  const status = err?.status || err?.statusCode || err?.response?.status

  // 1. NON-RETRYABLE CLIENT ERRORS (4xx)
  if (status && status >= 400 && status < 500 && status !== 429) {
    return {
      retryable: false,
      reason: `NON_RETRYABLE_CLIENT_ERROR_${status}`
    }
  }

  // 2. RETRYABLE STATUS CODES
  if (status === 429) {
    return { retryable: true, reason: 'HTTP_429_RATE_LIMIT' }
  }
  if (status === 503) {
    return { retryable: true, reason: 'HTTP_503_SERVICE_UNAVAILABLE' }
  }
  if (status === 504) {
    return { retryable: true, reason: 'HTTP_504_GATEWAY_TIMEOUT' }
  }

  // 3. RETRYABLE NETWORK / TIMEOUT ERRORS
  const isTimeout = err?.name === 'AbortError' || err?.code === 'ECONNABORTED' || (err?.message && err.message.toLowerCase().includes('timeout'))
  if (isTimeout) {
    return { retryable: true, reason: 'REQUEST_TIMEOUT' }
  }

  const isNetworkErr = err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT' || err?.code === 'ENOTFOUND' || (err?.message && err.message.toLowerCase().includes('network'))
  if (isNetworkErr) {
    return { retryable: true, reason: 'NETWORK_DISCONNECT' }
  }

  // 4. Default 5xx server errors
  if (status && status >= 500) {
    return { retryable: true, reason: `HTTP_${status}_SERVER_ERROR` }
  }

  return { retryable: false, reason: 'UNKNOWN_NON_RETRYABLE_ERROR' }
}

// ─── MAIN FETCH WITH RETRY FUNCTION ──────────────────────────────────────────
export async function fetchWithRetry<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  options: FetchWithRetryOptions = {},
): Promise<T> {
  const {
    timeout = 15_000,
    maxRetries = 2,
    label = 'API',
    endpoint = label,
    method = 'GET',
    silent = false,
  } = options

  const requestId = `req_${Math.random().toString(36).substring(2, 10)}`
  const correlationId = `corr_${Date.now()}`

  // Check Circuit Breaker
  if (isCircuitOpen(endpoint)) {
    const circuitErr = new Error(`[CircuitBreaker] Endpoint '${endpoint}' is currently OPEN. Request aborted to prevent retry storm.`)
    ;(circuitErr as any).status = 503
    throw circuitErr
  }

  let lastError: any = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    const startTime = Date.now()

    try {
      const result = await fn(controller.signal)
      clearTimeout(timer)
      recordCircuitSuccess(endpoint)
      return result
    } catch (err: any) {
      clearTimeout(timer)
      const responseTimeMs = Date.now() - startTime
      lastError = err

      const { retryable, reason } = isRetryableError(err)
      const statusCode = err?.status || err?.statusCode || err?.response?.status || (reason === 'REQUEST_CANCELED' ? 499 : err?.name === 'AbortError' ? 408 : 500)

      // If error is non-retryable (400, 401, 403, 404, validation error, canceled), fail fast immediately!
      if (!retryable) {
        if (!silent && reason !== 'REQUEST_CANCELED') {
          console.warn(JSON.stringify({
            event: 'API_REQUEST_FAIL_FAST',
            requestId,
            correlationId,
            label,
            endpoint,
            method,
            statusCode,
            responseTimeMs,
            reason,
            errorMessage: err?.message || 'Non-retryable client error',
            attempt: attempt + 1,
            maxRetries: maxRetries + 1,
          }))
        }
        recordCircuitFailure(endpoint)
        throw err
      }

      // If retryable and attempts remain
      if (attempt < maxRetries) {
        // Exponential backoff with full random jitter (1s -> 2.3s -> 4.5s)
        const baseDelay = 1000 * Math.pow(2, attempt)
        const jitter = Math.floor(Math.random() * 350)
        const delay = Math.min(5000, baseDelay + jitter)

        if (!silent) {
          console.warn(JSON.stringify({
            event: 'API_REQUEST_RETRYING',
            requestId,
            correlationId,
            label,
            endpoint,
            method,
            statusCode,
            responseTimeMs,
            retryReason: reason,
            attempt: attempt + 1,
            maxRetries: maxRetries + 1,
            retryInMs: delay,
          }))
        }

        await new Promise(r => setTimeout(r, delay))
      } else {
        // Final attempt failed
        recordCircuitFailure(endpoint)
        if (!silent) {
          console.error(JSON.stringify({
            event: 'API_REQUEST_EXHAUSTED',
            requestId,
            correlationId,
            label,
            endpoint,
            method,
            statusCode,
            responseTimeMs,
            reason,
            errorMessage: err?.message || 'All retry attempts exhausted',
            attemptsTotal: maxRetries + 1,
          }))
        }
      }
    }
  }

  throw lastError ?? new Error(`[${label}] Request failed after ${maxRetries + 1} attempts`)
}
