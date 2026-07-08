/**
 * Retry Service — Exponential Backoff + Circuit Breaker
 *
 * Provides:
 *  - withRetry(fn, options)  — wraps an async fn with retry + exponential backoff
 *  - CircuitBreaker          — CLOSED / OPEN / HALF_OPEN state machine
 *
 * Usage:
 *   const { withRetry, CircuitBreaker } = require('./retryService')
 *   const cb = new CircuitBreaker('hotelbeds-activities', { failureThreshold: 5, timeout: 60000 })
 *   const result = await cb.fire(() => withRetry(() => axios.post(...), { maxAttempts: 3 }))
 */

/**
 * Wraps an async function with retry logic and exponential backoff.
 *
 * @param {() => Promise<any>} fn       — The async operation to retry
 * @param {object}             options
 * @param {number}  options.maxAttempts — Maximum attempts (default: 3)
 * @param {number}  options.baseDelayMs — Base delay in ms (default: 500)
 * @param {number}  options.maxDelayMs  — Cap for backoff delay (default: 10000)
 * @param {(err: Error, attempt: number) => boolean} options.shouldRetry — Custom retry predicate
 */
async function withRetry(fn, options = {}) {
  const {
    maxAttempts = 3,
    baseDelayMs = 500,
    maxDelayMs  = 10000,
    shouldRetry = (err) => {
      // Retry on network errors and 429/5xx
      if (!err.response) return true
      const status = err.response.status
      return status === 429 || status >= 500
    },
  } = options

  let lastError
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt === maxAttempts) break
      if (!shouldRetry(err, attempt)) break

      const jitter     = Math.random() * 200
      const delay      = Math.min(baseDelayMs * Math.pow(2, attempt - 1) + jitter, maxDelayMs)
      const retryAfter = err.response?.headers?.['retry-after']
      const waitMs     = retryAfter ? parseInt(retryAfter, 10) * 1000 : delay

      console.warn(
        `[Retry] Attempt ${attempt}/${maxAttempts} failed (${err.message}). ` +
        `Waiting ${Math.round(waitMs)}ms before retry...`
      )
      await sleep(waitMs)
    }
  }

  throw lastError
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ── Circuit Breaker ────────────────────────────────────────────────────────────

const STATE = Object.freeze({ CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' })

class CircuitBreaker {
  /**
   * @param {string} name               — Human-readable name for logging
   * @param {object} options
   * @param {number} options.failureThreshold — Consecutive failures before opening (default: 5)
   * @param {number} options.successThreshold — Successes in HALF_OPEN to re-close (default: 2)
   * @param {number} options.timeout          — ms to wait before trying HALF_OPEN (default: 60000)
   */
  constructor(name, options = {}) {
    this.name             = name
    this.failureThreshold = options.failureThreshold || 5
    this.successThreshold = options.successThreshold || 2
    this.timeout          = options.timeout          || 60000

    this._state          = STATE.CLOSED
    this._failureCount   = 0
    this._successCount   = 0
    this._lastFailureAt  = null
  }

  get state() { return this._state }

  /**
   * Executes `fn` through the circuit breaker.
   * Throws if the circuit is OPEN.
   */
  async fire(fn) {
    if (this._state === STATE.OPEN) {
      const elapsed = Date.now() - this._lastFailureAt
      if (elapsed >= this.timeout) {
        console.log(`[CircuitBreaker:${this.name}] Half-open — testing recovery...`)
        this._state = STATE.HALF_OPEN
      } else {
        const waitSec = Math.ceil((this.timeout - elapsed) / 1000)
        throw new Error(
          `[CircuitBreaker:${this.name}] Circuit OPEN. Retry in ~${waitSec}s.`
        )
      }
    }

    try {
      const result = await fn()
      this._onSuccess()
      return result
    } catch (err) {
      this._onFailure()
      throw err
    }
  }

  _onSuccess() {
    if (this._state === STATE.HALF_OPEN) {
      this._successCount++
      if (this._successCount >= this.successThreshold) {
        console.log(`[CircuitBreaker:${this.name}] Closed — service recovered.`)
        this._reset()
      }
    } else {
      this._failureCount = 0
    }
  }

  _onFailure() {
    this._failureCount++
    this._successCount = 0
    this._lastFailureAt = Date.now()

    if (this._failureCount >= this.failureThreshold || this._state === STATE.HALF_OPEN) {
      console.error(
        `[CircuitBreaker:${this.name}] OPENED after ${this._failureCount} failure(s). ` +
        `Will retry in ${this.timeout / 1000}s.`
      )
      this._state = STATE.OPEN
    }
  }

  _reset() {
    this._state        = STATE.CLOSED
    this._failureCount = 0
    this._successCount = 0
    this._lastFailureAt = null
  }

  toJSON() {
    return {
      name:         this.name,
      state:        this._state,
      failureCount: this._failureCount,
      lastFailure:  this._lastFailureAt,
    }
  }
}

module.exports = { withRetry, CircuitBreaker, STATE }
