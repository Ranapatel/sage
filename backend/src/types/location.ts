/**
 * TripSage — Location Types
 *
 * Shared interfaces for the centralized Geocoding Service.
 * Used by: geocoding.service.ts, location.controller.ts, locationNormalizer.ts
 * Future consumers: Hotels, Activities, Maps, Routing, Weather, AI itinerary
 */

// ── Normalized Internal Location ─────────────────────────────────────────────

export interface Location {
  /** Display name (e.g. "Paris", "Tokyo") */
  name: string
  /** City name (may equal name for city-level queries) */
  city: string
  /** State / province / region (may be empty for some countries) */
  state: string
  /** Full country name */
  country: string
  /** ISO 3166-1 alpha-2 country code (e.g. "FR", "JP") */
  countryCode: string
  /** Latitude in decimal degrees */
  latitude: number
  /** Longitude in decimal degrees */
  longitude: number
  /** Full formatted address string */
  formattedAddress: string
  /** Geoapify place ID for future reference */
  placeId: string
}

// ── API Response Wrapper ─────────────────────────────────────────────────────

export interface GeocodingResponse {
  success: boolean
  location?: Location
  error?: string
}

// ── Geoapify Raw Response Types ──────────────────────────────────────────────

export interface GeoapifyFeatureProperties {
  name?: string
  city?: string
  state?: string
  country?: string
  country_code?: string
  formatted?: string
  place_id?: string
  lat?: number
  lon?: number
  /** Result type: "city", "country", "amenity", etc. */
  result_type?: string
  /** Confidence rank (lower = better) */
  rank?: {
    confidence?: number
    match_type?: string
  }
  /** Address components */
  county?: string
  municipality?: string
  suburb?: string
  postcode?: string
  district?: string
  address_line1?: string
  address_line2?: string
}

export interface GeoapifyFeature {
  type: 'Feature'
  properties: GeoapifyFeatureProperties
  geometry: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  bbox?: [number, number, number, number]
}

export interface GeoapifyApiResponse {
  type: 'FeatureCollection'
  features: GeoapifyFeature[]
  query?: {
    text?: string
    parsed?: Record<string, string>
  }
}

// ── Custom Error ─────────────────────────────────────────────────────────────

export class GeocodingError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(message: string, statusCode: number, code: string) {
    super(message)
    this.name = 'GeocodingError'
    this.statusCode = statusCode
    this.code = code
    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GeocodingError)
    }
  }
}

// ── Error Codes ──────────────────────────────────────────────────────────────

export const GeocodingErrorCodes = {
  EMPTY_DESTINATION: 'EMPTY_DESTINATION',
  INVALID_DESTINATION: 'INVALID_DESTINATION',
  DESTINATION_NOT_FOUND: 'DESTINATION_NOT_FOUND',
  API_TIMEOUT: 'API_TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_API_KEY: 'INVALID_API_KEY',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  MISSING_CONFIG: 'MISSING_CONFIG',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type GeocodingErrorCode = typeof GeocodingErrorCodes[keyof typeof GeocodingErrorCodes]
