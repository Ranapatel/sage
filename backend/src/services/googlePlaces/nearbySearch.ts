/**
 * Nearby Search — Search around itinerary locations
 *
 * Uses Google Places API (New) nearbySearch endpoint.
 * Supports: restaurants, cafes, hospitals, pharmacies, bus_stops,
 *           metro_stations, parking, fuel_stations, shopping.
 */

import { googleRequest, buildPhotoUrl } from './googleClient'
import {
  TripSagePlace, NearbySearchParams, PlaceCategory,
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

export async function nearbySearch(params: NearbySearchParams): Promise<TripSagePlace[]> {
  const {
    latitude,
    longitude,
    category,
    radiusMeters = 1500,
    maxResults = 10,
  } = params

  const includedTypes = CATEGORY_TO_GOOGLE_TYPES[category] || CATEGORY_TO_GOOGLE_TYPES.general

  const data = await googleRequest<any>({
    path: '/places:searchNearby',
    body: {
      includedTypes,
      maxResultCount: Math.min(maxResults, 20),
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: Math.min(radiusMeters, 50000), // Google max is 50km
        },
      },
      languageCode: 'en',
    },
    fieldMask: FIELD_MASK,
    cachePrefix: 'gp_nearby',
    cacheTtl: 1800, // 30 min — nearby results are more time-sensitive
  })

  return (data?.places || []).map((p: any) => normalize(p, category))
}

function normalize(p: any, category: PlaceCategory): TripSagePlace {
  const parsePriceLevel = (level: string | undefined): number | null => {
    if (!level) return null
    const map: Record<string, number> = {
      PRICE_LEVEL_FREE: 0, PRICE_LEVEL_INEXPENSIVE: 1,
      PRICE_LEVEL_MODERATE: 2, PRICE_LEVEL_EXPENSIVE: 3,
      PRICE_LEVEL_VERY_EXPENSIVE: 4,
    }
    return map[level] ?? null
  }

  return {
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
    source: 'google_places',
  }
}
