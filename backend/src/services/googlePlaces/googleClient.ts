/**
 * Google Places API (New) — Centralized HTTP Client
 *
 * All Google API calls in this module MUST go through `googleRequest()`.
 * Provides: API key injection, retry with backoff, circuit breaker, field masks.
 */

import axios, { AxiosRequestConfig } from 'axios'

// ponytail: reuse the project's existing retry + circuit breaker instead of inventing new ones
const { withRetry, CircuitBreaker } = require('../retryService')
const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')

const BASE_URL = 'https://places.googleapis.com/v1'

const API_KEY = () => {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key || key === 'your_google_places_key') {
    throw new Error('[GooglePlaces] GOOGLE_PLACES_API_KEY not configured')
  }
  return key
}

// One circuit breaker for the entire Google Places integration
const breaker = new CircuitBreaker('google-places', {
  failureThreshold: 5,
  timeout: 60_000,
})

// ── Core request function ───────────────────────────────────────────────────

interface GoogleRequestOptions {
  /** HTTP method (default POST for Places New API) */
  method?: 'GET' | 'POST'
  /** URL path after BASE_URL, e.g. '/places:searchText' */
  path: string
  /** POST body (JSON) */
  body?: Record<string, unknown>
  /** FieldMask header — controls which fields Google returns (and bills for) */
  fieldMask: string
  /** Cache TTL in seconds. 0 = no cache. Default 3600 (1h). */
  cacheTtl?: number
  /** Custom cache key prefix */
  cachePrefix?: string
}

export async function googleRequest<T>(opts: GoogleRequestOptions): Promise<T> {
  const {
    method = 'POST',
    path,
    body,
    fieldMask,
    cacheTtl = 3600,
    cachePrefix = 'gp',
  } = opts

  // ── Cache check ───────────────────────────────────────────────────────────
  const cacheKey = generateCacheKey(cachePrefix, { path, body, fieldMask })
  if (cacheTtl > 0) {
    try {
      const cached = await cacheGet(cacheKey)
      if (cached) return cached as T
    } catch { /* Redis down = proceed without cache */ }
  }

  // ── API call with retry + circuit breaker ─────────────────────────────────
  const config: AxiosRequestConfig = {
    method,
    url: `${BASE_URL}${path}`,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY(),
      'X-Goog-FieldMask': fieldMask,
      'Referer': process.env.CORS_ORIGIN || 'http://localhost:3000',
    },
    data: body,
    timeout: 8000,
  }

  const result = await breaker.fire(() =>
    withRetry(() => axios(config).then((r: any) => r.data).catch((err: any) => {
      if (err.response) {
        console.error('[GooglePlaces/Request] Error response from Google:', JSON.stringify(err.response.data))
      }
      throw err
    }), {
      maxAttempts: 3,
      baseDelayMs: 500,
    })
  )

  // ── Cache result ──────────────────────────────────────────────────────────
  if (cacheTtl > 0) {
    try {
      await cacheSet(cacheKey, result, cacheTtl)
    } catch { /* silent */ }
  }

  return result as T
}

// ── Photo URL helper ────────────────────────────────────────────────────────
// Google Places (New) returns photo references as `places/{id}/photos/{ref}`.
// Actual image URL needs a separate GET.

export function buildPhotoUrl(photoName: string, maxWidthPx = 800): string {
  return `${BASE_URL}/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${API_KEY()}`
}

