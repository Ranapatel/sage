/**
 * Wraps any async function with a timeout and retry mechanism.
 *
 * @param {Function} fn       - Async function to execute
 * @param {Object}   options  - Configuration
 * @param {number}   options.timeout    - Timeout per attempt in ms (default: 10000)
 * @param {number}   options.maxRetries - Number of retries after first failure (default: 2)
 * @param {string}   options.label      - Label for console logging (default: 'API')
 * @returns {Promise<any>}
 */
async function fetchWithRetry(fn, { timeout = 10000, maxRetries = 2, label = 'API' } = {}) {
  let lastError = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`[${label}] Timeout after ${timeout}ms`)), timeout)
        ),
      ])
      return result
    } catch (err) {
      lastError = err

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 4000) // 1s → 2s → 4s
        console.warn(`[${label}] Attempt ${attempt + 1}/${maxRetries + 1} failed — retrying in ${delay}ms: ${err.message}`)
        await new Promise(r => setTimeout(r, delay))
      } else {
        console.error(`[${label}] All ${maxRetries + 1} attempts failed: ${err.message}`)
      }
    }
  }

  throw lastError || new Error(`[${label}] All retry attempts failed`)
}

module.exports = { fetchWithRetry }
