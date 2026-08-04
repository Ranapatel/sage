/**
 * Destination Resolver Service — Single Source of Truth
 *
 * All downstream modules MUST consume the canonical `CanonicalDestinationContext`
 * object produced by this service. No service may perform independent destination lookups
 * or rely on unvalidated city strings or default fallback cities (e.g. Delhi / Goa).
 */

import { GeocodingService } from './geocoding.service'

export interface CanonicalDestinationContext {
  city: string
  state: string
  country: string
  normalizedName: string
  latitude: number
  longitude: number
  placeId?: string
  timezone: string
  radiusKm: number
  keywords: string[]
}

const { cacheGet, cacheSet, generateCacheKey } = require('../config/redis')

// Memory cache fast path
const memoryContextCache = new Map<string, CanonicalDestinationContext>()

export class DestinationResolverService {
  /**
   * Resolve raw user destination string into a normalized, canonical destination context.
   */
  static async resolve(rawDestination: string): Promise<CanonicalDestinationContext> {
    const trimmed = (rawDestination || '').trim()
    if (!trimmed) {
      throw new Error('Destination string is required.')
    }

    const cacheKey = generateCacheKey('canonical_dest', { input: trimmed.toLowerCase() })

    // 1. Check Memory Cache
    if (memoryContextCache.has(cacheKey)) {
      const cached = memoryContextCache.get(cacheKey)!
      console.log(`[DestinationResolver] ✅ Memory cache HIT for "${trimmed}" → ${cached.normalizedName}`)
      return cached
    }

    // 2. Check Redis Cache
    try {
      const redisCached = await cacheGet(cacheKey)
      if (redisCached) {
        memoryContextCache.set(cacheKey, redisCached)
        console.log(`[DestinationResolver] ✅ Redis cache HIT for "${trimmed}" → ${redisCached.normalizedName}`)
        return redisCached
      }
    } catch {
      /* proceed */
    }

    console.log(`[DestinationResolver] 🔍 Resolving canonical destination for "${trimmed}"...`)

    // 3. Perform Authoritative Geocoding via GeocodingService
    let geoResult: any = null
    try {
      geoResult = await GeocodingService.geocodeDestination(trimmed)
    } catch (err: any) {
      console.warn(`[DestinationResolver] GeocodingService warning for "${trimmed}": ${err.message}`)
    }

    let city = ''
    let state = ''
    let country = 'India'
    let latitude = 0
    let longitude = 0
    let placeId = ''
    let formattedAddress = ''

    if (geoResult && geoResult.latitude && geoResult.longitude) {
      city = geoResult.city || geoResult.name || trimmed.split(',')[0].trim()
      state = geoResult.state || ''
      country = geoResult.country || 'India'
      latitude = geoResult.latitude
      longitude = geoResult.longitude
      placeId = geoResult.placeId || ''
      formattedAddress = geoResult.formattedAddress || `${city}, ${country}`
    } else {
      // Hard failure: No geocoded location found for input destination.
      // We NEVER fall back to Delhi, Goa, or hardcoded cities.
      throw new Error(`DESTINATION_NOT_FOUND: Could not resolve geographical coordinates for "${trimmed}".`)
    }

    // Standardize city name capitalization
    city = city.charAt(0).toUpperCase() + city.slice(1)

    // Keywords array for location matching
    const keywordsSet = new Set<string>()
    keywordsSet.add(city.toLowerCase())
    if (state) keywordsSet.add(state.toLowerCase())
    if (country) keywordsSet.add(country.toLowerCase())

    // Known alias mappings (e.g. Cochin -> Kochi, Bangalore -> Bengaluru)
    const lowerCity = city.toLowerCase()
    if (lowerCity === 'cochin' || lowerCity === 'ernakulam' || lowerCity === 'kochi') {
      city = 'Kochi'
      keywordsSet.add('kochi')
      keywordsSet.add('cochin')
      keywordsSet.add('ernakulam')
      keywordsSet.add('kerala')
      state = 'Kerala'
    } else if (lowerCity === 'bangalore' || lowerCity === 'bengaluru') {
      city = 'Bengaluru'
      keywordsSet.add('bengaluru')
      keywordsSet.add('bangalore')
      keywordsSet.add('karnataka')
      state = 'Karnataka'
    } else if (lowerCity === 'madras' || lowerCity === 'chennai') {
      city = 'Chennai'
      keywordsSet.add('chennai')
      keywordsSet.add('madras')
      keywordsSet.add('tamil nadu')
      state = 'Tamil Nadu'
    } else if (lowerCity === 'calcutta' || lowerCity === 'kolkata') {
      city = 'Kolkata'
      keywordsSet.add('kolkata')
      keywordsSet.add('calcutta')
      keywordsSet.add('west bengal')
      state = 'West Bengal'
    } else if (lowerCity === 'goa' || lowerCity === 'panaji' || lowerCity === 'madgaon') {
      city = 'Goa'
      keywordsSet.add('goa')
      keywordsSet.add('panaji')
      keywordsSet.add('madgaon')
      state = 'Goa'
    } else if (lowerCity === 'manali') {
      city = 'Manali'
      keywordsSet.add('manali')
      keywordsSet.add('kullu')
      keywordsSet.add('himachal pradesh')
      state = 'Himachal Pradesh'
    } else if (lowerCity === 'ooty' || lowerCity === 'udhagamandalam') {
      city = 'Ooty'
      keywordsSet.add('ooty')
      keywordsSet.add('nilgiris')
      keywordsSet.add('tamil nadu')
      state = 'Tamil Nadu'
    } else if (lowerCity === 'munnar') {
      city = 'Munnar'
      keywordsSet.add('munnar')
      keywordsSet.add('idukki')
      keywordsSet.add('kerala')
      state = 'Kerala'
    } else if (lowerCity === 'jaipur') {
      city = 'Jaipur'
      keywordsSet.add('jaipur')
      keywordsSet.add('rajasthan')
      state = 'Rajasthan'
    }

    const canonical: CanonicalDestinationContext = {
      city,
      state: state || city,
      country,
      normalizedName: `${city}, ${state ? state + ', ' : ''}${country}`,
      latitude,
      longitude,
      placeId,
      timezone: 'Asia/Kolkata', // default timezone for Indian subcontinent
      radiusKm: 35, // 35km bounding radius
      keywords: Array.from(keywordsSet),
    }

    // Cache the resolved canonical context
    memoryContextCache.set(cacheKey, canonical)
    try {
      await cacheSet(cacheKey, canonical, 86400) // 24 hours
    } catch {
      /* silent */
    }

    console.log(`[DestinationResolver] 🎯 Resolved Canonical Destination:`, {
      city: canonical.city,
      state: canonical.state,
      country: canonical.country,
      lat: canonical.latitude,
      lng: canonical.longitude,
    })

    return canonical
  }
}
