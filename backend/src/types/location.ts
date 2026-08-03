export class GeocodingError extends Error {
  statusCode: number
  code: string

  constructor(message: string, statusCode: number, code: string) {
    super(message)
    this.name = 'GeocodingError'
    this.statusCode = statusCode
    this.code = code
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GeocodingError)
    }
  }
}

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

export interface Location {
  name: string
  formattedAddress: string
  latitude: number
  longitude: number
  city?: string
  country?: string
  countryCode?: string
  placeId?: string
  viewport?: {
    northeast: { lat: number; lng: number }
    southwest: { lat: number; lng: number }
  }
}

export interface GeoapifyApiResponse {
  results?: Array<{
    lat: number
    lon: number
    formatted: string
    city?: string
    country?: string
    country_code?: string
    place_id?: string
    bbox?: {
      lat1: number
      lon1: number
      lat2: number
      lon2: number
    }
  }>
  [key: string]: any
}

module.exports = { GeocodingError, GeocodingErrorCodes }
module.exports.GeocodingError = GeocodingError
module.exports.GeocodingErrorCodes = GeocodingErrorCodes
