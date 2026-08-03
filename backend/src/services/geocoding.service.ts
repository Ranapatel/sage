/**
 * TripSage — Geocoding Service
 *
 * Centralized service for forward geocoding via Geoapify API.
 * This is the single source of truth for all location data.
 *
 * Future consumers: Hotels, Activities, Maps, Routing, Weather, AI itinerary
 *
 * Features:
 * - Forward geocoding via Geoapify
 * - Two-tier cache: in-memory (fast path) + Upstash Redis (persistent, 30-day TTL)
 * - Comprehensive error handling with typed errors
 * - Request logging with timing (never logs API keys)
 * - Graceful degradation when cache is unavailable
 */

import axios, { AxiosError } from 'axios'
import {
  Location,
  GeoapifyApiResponse,
  GeocodingError,
  GeocodingErrorCodes,
} from '../types/location'
import { normalizeGeoapifyFeature } from '../utils/locationNormalizer'

// Redis cache helpers — CommonJS module, imported dynamically
const { cacheGet, cacheSet } = require('../config/redis')

// ── Constants ────────────────────────────────────────────────────────────────

const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1/geocode/search'
const REQUEST_TIMEOUT_MS = 8000
const CACHE_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days
const MAX_DESTINATION_LENGTH = 500

// ── In-memory cache (fast path, resets on restart) ───────────────────────────
const memoryCache = new Map<string, Location>()

// ── Service ──────────────────────────────────────────────────────────────────

export class GeocodingService {
  /**
   * Validate that the GEOAPIFY_API_KEY environment variable is set.
   * Call during application startup.
   *
   * @throws {GeocodingError} if the key is missing or empty
   */
  static validateConfig(): void {
    const apiKey = process.env.GEOAPIFY_API_KEY
    if (!apiKey || apiKey.trim() === '') {
      throw new GeocodingError(
        'GEOAPIFY_API_KEY is not configured. Set it in your .env file. ' +
        'Get a free key at https://myprojects.geoapify.com/',
        500,
        GeocodingErrorCodes.MISSING_CONFIG
      )
    }
  }

  /**
   * Forward geocode a destination string into a normalized Location object.
   *
   * @param destination - The user-entered destination (e.g. "Paris", "Tokyo, Japan")
   * @returns A normalized Location object
   * @throws {GeocodingError} on validation failure, API errors, or empty results
   */
  static async geocodeDestination(destination: string): Promise<Location> {
    // ── Input validation ─────────────────────────────────────────────────
    const trimmed = (destination || '').trim()

    if (!trimmed) {
      throw new GeocodingError(
        'Destination is required and cannot be empty.',
        400,
        GeocodingErrorCodes.EMPTY_DESTINATION
      )
    }

    if (trimmed.length > MAX_DESTINATION_LENGTH) {
      throw new GeocodingError(
        `Destination exceeds maximum length of ${MAX_DESTINATION_LENGTH} characters.`,
        400,
        GeocodingErrorCodes.INVALID_DESTINATION
      )
    }

    // ── Normalize cache key ──────────────────────────────────────────────
    const cacheKey = GeocodingService.buildCacheKey(trimmed)
    const startTime = Date.now()

    // ── Check in-memory cache ────────────────────────────────────────────
    const memCached = memoryCache.get(cacheKey)
    if (memCached) {
      const elapsed = Date.now() - startTime
      console.log(`[Geocoding] ✅ Memory cache HIT for "${trimmed}" (${elapsed}ms)`)
      return memCached
    }

    // ── Check Redis cache ────────────────────────────────────────────────
    try {
      const redisCached = await cacheGet(cacheKey)
      if (redisCached) {
        const elapsed = Date.now() - startTime
        console.log(`[Geocoding] ✅ Redis cache HIT for "${trimmed}" (${elapsed}ms)`)
        // Promote to memory cache
        memoryCache.set(cacheKey, redisCached as Location)
        return redisCached as Location
      }
    } catch {
      // Redis unavailable — continue without cache
    }

    console.log(`[Geocoding] 🔍 Cache MISS for "${trimmed}" — calling Geoapify API...`)

    // ── Call Geoapify API ────────────────────────────────────────────────
    const location = await GeocodingService.callGeoapifyApi(trimmed)

    // ── Cache the result ─────────────────────────────────────────────────
    memoryCache.set(cacheKey, location)

    try {
      await cacheSet(cacheKey, location, CACHE_TTL_SECONDS)
    } catch {
      // Redis unavailable — continue without cache persistence
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Geocoding] ⚠️  Failed to write to Redis cache — continuing without persistence')
      }
    }

    const elapsed = Date.now() - startTime
    console.log(`[Geocoding] ✅ Geocoded "${trimmed}" → ${location.formattedAddress} (${elapsed}ms)`)

    return location
  }

  /**
   * Call the Geoapify Forward Geocoding API.
   *
   * @param query - The search query string
   * @returns A normalized Location object from the top result
   * @throws {GeocodingError} on API errors, empty results, or invalid responses
   */
  private static async callGeoapifyApi(query: string): Promise<Location> {
    const apiKey = process.env.GEOAPIFY_API_KEY

    if (!apiKey) {
      throw new GeocodingError(
        'GEOAPIFY_API_KEY is not configured.',
        500,
        GeocodingErrorCodes.MISSING_CONFIG
      )
    }

    try {
      const response = await axios.get<GeoapifyApiResponse>(GEOAPIFY_BASE_URL, {
        params: {
          text: query,
          apiKey,
          format: 'geojson',
          limit: 1,
        },
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          'User-Agent': 'TripSage-AI-Travel-OS/2.0',
        },
      })

      // ── Validate response structure ──────────────────────────────────
      const data = response.data
      if (!data || !data.features || !Array.isArray(data.features)) {
        throw new GeocodingError(
          'Geoapify returned an unexpected response format.',
          502,
          GeocodingErrorCodes.INVALID_RESPONSE
        )
      }

      if (data.features.length === 0) {
        throw new GeocodingError(
          `No results found for "${query}". Try a more specific destination.`,
          404,
          GeocodingErrorCodes.DESTINATION_NOT_FOUND
        )
      }

      // ── Normalize the top result ─────────────────────────────────────
      const topFeature = data.features[0]

      if (!topFeature.properties || !topFeature.geometry) {
        throw new GeocodingError(
          'Geoapify returned a result with missing properties or geometry.',
          502,
          GeocodingErrorCodes.INVALID_RESPONSE
        )
      }

      return normalizeGeoapifyFeature(topFeature, query)

    } catch (error) {
      // Re-throw our own errors
      if (error instanceof GeocodingError) {
        throw error
      }

      // ── Handle Axios errors ──────────────────────────────────────────
      if (axios.isAxiosError(error)) {
        const axiosErr = error as AxiosError

        // Timeout
        if (axiosErr.code === 'ECONNABORTED' || axiosErr.code === 'ETIMEDOUT') {
          throw new GeocodingError(
            'Geoapify API request timed out. Please try again.',
            504,
            GeocodingErrorCodes.API_TIMEOUT
          )
        }

        // Network error (no response received)
        if (!axiosErr.response) {
          throw new GeocodingError(
            'Unable to reach Geoapify API. Check your network connection.',
            503,
            GeocodingErrorCodes.NETWORK_ERROR
          )
        }

        const status = axiosErr.response.status

        // Invalid API key
        if (status === 401 || status === 403) {
          throw new GeocodingError(
            'Invalid Geoapify API key. Check your GEOAPIFY_API_KEY configuration.',
            401,
            GeocodingErrorCodes.INVALID_API_KEY
          )
        }

        // Rate limited
        if (status === 429) {
          throw new GeocodingError(
            'Geoapify API rate limit exceeded. Please try again later.',
            429,
            GeocodingErrorCodes.RATE_LIMITED
          )
        }

        // Other HTTP errors
        throw new GeocodingError(
          `Geoapify API returned HTTP ${status}.`,
          502,
          GeocodingErrorCodes.INVALID_RESPONSE
        )
      }

      // ── Unknown errors ───────────────────────────────────────────────
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Geocoding] 💥 Unexpected error:', message)
      throw new GeocodingError(
        'An unexpected error occurred during geocoding.',
        500,
        GeocodingErrorCodes.INTERNAL_ERROR
      )
    }
  }

  /**
   * Build a normalized cache key for a destination string.
   * Lowercased, trimmed, whitespace-collapsed.
   *
   * @example buildCacheKey("  Tokyo  ") → "geo:tokyo"
   * @example buildCacheKey("New York City") → "geo:new york city"
   */
  static buildCacheKey(destination: string): string {
    const normalized = destination
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
    return `geo:${normalized}`
  }
}

