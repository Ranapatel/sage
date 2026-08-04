/**
 * Backend Production-Grade Reliable Fetch Utility.
 *
 * Rules:
 * 1. NEVER retries 4xx client errors (400, 401, 403, 404, 422). Fail fast immediately.
 * 2. ONLY retries 429 Rate Limit, 503 Service Unavailable, 504 Gateway Timeout, and network drops.
 * 3. Exponential Backoff with Full Random Jitter.
 * 4. Outputs structured JSON logs.
 */

function isRetryableBackendError(err) {
  const status = err?.status || err?.statusCode || err?.response?.status

  if (status && status >= 400 && status < 500 && status !== 429) {
    return { retryable: false, reason: `NON_RETRYABLE_CLIENT_ERROR_${status}` }
  }

  if (status === 429) return { retryable: true, reason: 'HTTP_429_RATE_LIMIT' }
  if (status === 503) return { retryable: true, reason: 'HTTP_503_SERVICE_UNAVAILABLE' }
  if (status === 504) return { retryable: true, reason: 'HTTP_504_GATEWAY_TIMEOUT' }

  const isTimeout = err?.code === 'ECONNABORTED' || (err?.message && err.message.toLowerCase().includes('timeout'))
  if (isTimeout) return { retryable: true, reason: 'REQUEST_TIMEOUT' }

  const isNetwork = err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT' || err?.code === 'ENOTFOUND'
  if (isNetwork) return { retryable: true, reason: 'NETWORK_DISCONNECT' }

  if (status && status >= 500) return { retryable: true, reason: `HTTP_${status}_SERVER_ERROR` }

  return { retryable: false, reason: 'UNKNOWN_NON_RETRYABLE_ERROR' }
}

async function fetchWithRetry(fn, { timeout = 10000, maxRetries = 2, label = 'API' } = {}) {
  let lastError = null
  const requestId = `req_${Math.random().toString(36).substring(2, 10)}`

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const startTime = Date.now()
    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) =>
          setTimeout(() => {
            const err = new Error(`[${label}] Timeout after ${timeout}ms`)
            err.code = 'ECONNABORTED'
            reject(err)
          }, timeout)
        ),
      ])
      return result
    } catch (err) {
      lastError = err
      const responseTimeMs = Date.now() - startTime
      const { retryable, reason } = isRetryableBackendError(err)

      if (!retryable) {
        console.warn(JSON.stringify({
          event: 'BACKEND_API_FAIL_FAST',
          requestId,
          label,
          statusCode: err?.response?.status || err?.status || 400,
          responseTimeMs,
          reason,
          message: err?.message || 'Non-retryable client error',
          attempt: attempt + 1,
        }))
        throw err
      }

      if (attempt < maxRetries) {
        const baseDelay = 1000 * Math.pow(2, attempt)
        const jitter = Math.floor(Math.random() * 300)
        const delay = Math.min(4000, baseDelay + jitter)

        console.warn(JSON.stringify({
          event: 'BACKEND_API_RETRYING',
          requestId,
          label,
          statusCode: err?.response?.status || err?.status || 500,
          responseTimeMs,
          retryReason: reason,
          attempt: attempt + 1,
          maxRetries: maxRetries + 1,
          retryInMs: delay,
        }))

        await new Promise(r => setTimeout(r, delay))
      } else {
        console.error(JSON.stringify({
          event: 'BACKEND_API_EXHAUSTED',
          requestId,
          label,
          statusCode: err?.response?.status || err?.status || 500,
          responseTimeMs,
          reason,
          message: err?.message || 'All backend retries failed',
          attemptsTotal: maxRetries + 1,
        }))
      }
    }
  }

  throw lastError || new Error(`[${label}] All retry attempts failed`)
}

module.exports = { fetchWithRetry }
