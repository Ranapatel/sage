import assert from 'node:assert/strict'
import test from 'node:test'
import { fetchWithRetry } from '../lib/fetchWithRetry.ts'
import {
  ITINERARY_GENERATE_MAX_RETRIES,
  ITINERARY_GENERATE_TIMEOUT_MS,
  ITINERARY_PROGRESS_MESSAGE,
  combineAbortSignals,
  itineraryRequestConfig,
  liveItineraryDays,
} from '../lib/itineraryGenerate.ts'

const AXIOS_INSTANCE_TIMEOUT_MS = 60_000
const PREVIOUS_ATTEMPT_TIMEOUT_MS = 45_000

test('itinerary client waits long enough for a ~100s generation and does not retry', () => {
  assert.equal(ITINERARY_GENERATE_MAX_RETRIES, 0)
  assert.ok(ITINERARY_GENERATE_TIMEOUT_MS >= 150_000)
  assert.ok(ITINERARY_GENERATE_TIMEOUT_MS > AXIOS_INSTANCE_TIMEOUT_MS)
  assert.ok(ITINERARY_GENERATE_TIMEOUT_MS > PREVIOUS_ATTEMPT_TIMEOUT_MS)
  assert.equal(
    ITINERARY_PROGRESS_MESSAGE,
    'Building your day-by-day plan… this can take up to 2 minutes',
  )

  const config = itineraryRequestConfig(undefined)
  assert.equal(config.timeout, ITINERARY_GENERATE_TIMEOUT_MS)
  assert.equal(config.signal, undefined)
})

test('a slow success within the attempt budget is returned once', async () => {
  let calls = 0
  const result = await fetchWithRetry(
    async () => {
      calls += 1
      await new Promise((resolve) => setTimeout(resolve, 40))
      return { data: { itinerary: [{ day: 1, date: '2026-11-06' }] } }
    },
    { timeout: 300, maxRetries: ITINERARY_GENERATE_MAX_RETRIES, silent: true, endpoint: 'itinerary-slow-ok' },
  )
  assert.equal(calls, 1)
  assert.equal(liveItineraryDays(result)?.length, 1)
})

test('abort and axios timeout failures are not sent again when retries are off', async () => {
  for (const [name, error] of [
    ['canceled', Object.assign(new Error('canceled'), { code: 'ERR_CANCELED' })],
    ['node-abort', Object.assign(new Error('This operation was aborted'), { code: 'ERR_CANCELED' })],
    ['xhr-abort', Object.assign(new Error('Request aborted'), { code: 'ECONNABORTED' })],
    ['axios-timeout', Object.assign(new Error('timeout of 60000ms exceeded'), { code: 'ECONNABORTED' })],
  ] as const) {
    let calls = 0
    await assert.rejects(
      () => fetchWithRetry(
        () => {
          calls += 1
          return Promise.reject(error)
        },
        {
          timeout: 1_000,
          maxRetries: ITINERARY_GENERATE_MAX_RETRIES,
          silent: true,
          endpoint: `itinerary-no-retry-${name}`,
        },
      ),
    )
    assert.equal(calls, 1, name)
  }
})

test('an axios timeout is retryable, so leaving maxRetries at 2 would start three generations', async () => {
  let calls = 0
  await assert.rejects(
    () => fetchWithRetry(
      () => {
        calls += 1
        return Promise.reject(Object.assign(new Error('timeout of 60000ms exceeded'), { code: 'ECONNABORTED' }))
      },
      { timeout: 1_000, maxRetries: 2, silent: true, endpoint: 'itinerary-timeout-would-retry' },
    ),
  )
  assert.equal(calls, 3)
})

test('a browser cancel is not retried even when maxRetries is 2', async () => {
  let calls = 0
  await assert.rejects(
    () => fetchWithRetry(
      () => {
        calls += 1
        return Promise.reject(Object.assign(new Error('canceled'), { code: 'ERR_CANCELED' }))
      },
      { timeout: 1_000, maxRetries: 2, silent: true, endpoint: 'itinerary-cancel-no-retry' },
    ),
  )
  assert.equal(calls, 1)
})

test('missing or empty itinerary payload selects the fallback', () => {
  assert.equal(liveItineraryDays(null), null)
  assert.equal(liveItineraryDays({ data: { itinerary: [] } }), null)
  assert.deepEqual(liveItineraryDays({ data: { itinerary: [{ day: 3 }] } }), [{ day: 3 }])
})

test('page navigation abort and the attempt abort share one signal', () => {
  const page = new AbortController()
  const attempt = new AbortController()
  const combined = combineAbortSignals(attempt.signal, page.signal)
  assert.ok(combined)
  assert.equal(combined?.aborted, false)
  page.abort()
  assert.equal(combined?.aborted, true)
})
