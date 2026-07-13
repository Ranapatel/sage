/**
 * Search Places — Text Search via Google Places API (New)
 *
 * Accepts a destination + category, returns normalized TripSage Place objects.
 * Uses textSearch endpoint (NOT autocomplete — TripSage has its own).
 */

import { googleRequest, buildPhotoUrl } from './googleClient'
import {
  TripSagePlace, SearchPlacesParams, PlaceCategory,
  CATEGORY_TO_GOOGLE_TYPES,
} from './types'

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.types',
  'places.photos',
  'places.currentOpeningHours',
  'places.googleMapsUri',
].join(',')

export async function searchPlaces(params: SearchPlacesParams): Promise<TripSagePlace[]> {
  const { destination, category, maxResults = 10 } = params
  const includedTypes = CATEGORY_TO_GOOGLE_TYPES[category] || CATEGORY_TO_GOOGLE_TYPES.general

  // ponytail: beaches have no dedicated Google type — use textQuery for better results
  const textQuery = category === 'beaches'
    ? `beaches in ${destination}`
    : `${category} in ${destination}`

  const data = await googleRequest<any>({
    path: '/places:searchText',
    body: {
      textQuery,
      includedType: (category !== 'beaches' && includedTypes.length > 0) ? includedTypes[0] : undefined,
      maxResultCount: Math.min(maxResults, 20),
      languageCode: 'en',
    },
    fieldMask: FIELD_MASK,
    cachePrefix: 'gp_search',
    cacheTtl: 3600, // 1 hour
  })

  return normalizeResults(data?.places || [], category)
}

// ── Normalize Google → TripSage ─────────────────────────────────────────────

function normalizeResults(places: any[], category: PlaceCategory): TripSagePlace[] {
  return places.map((p: any) => ({
    id: p.id || '',
    name: p.displayName?.text || '',
    address: p.formattedAddress || '',
    latitude: p.location?.latitude ?? 0,
    longitude: p.location?.longitude ?? 0,
    rating: p.rating ?? null,
    userRatingsTotal: p.userRatingCount ?? null,
    priceLevel: parsePriceLevel(p.priceLevel),
    category,
    types: p.types || [],
    photoUrl: p.photos?.[0]?.name ? buildPhotoUrl(p.photos[0].name) : null,
    googleMapsUrl: p.googleMapsUri || '',
    isOpenNow: p.currentOpeningHours?.openNow ?? null,
    source: 'google_places' as const,
  }))
}

function parsePriceLevel(level: string | undefined): number | null {
  if (!level) return null
  const map: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  }
  return map[level] ?? null
}
