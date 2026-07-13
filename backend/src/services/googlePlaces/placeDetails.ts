/**
 * Place Details — Fetch detailed info for a single Place ID
 *
 * Returns rating, reviews, opening hours, phone, website, coordinates,
 * editorial summary, photos, and Google Maps URL.
 */

import { googleRequest, buildPhotoUrl } from './googleClient'
import {
  TripSagePlaceDetails, TripSagePlaceReview, TripSagePlacePhoto,
} from './types'

const DETAIL_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'rating',
  'userRatingCount',
  'priceLevel',
  'types',
  'nationalPhoneNumber',
  'websiteUri',
  'editorialSummary',
  'currentOpeningHours',
  'reviews',
  'photos',
  'googleMapsUri',
].join(',')

export async function getPlaceDetails(placeId: string): Promise<TripSagePlaceDetails> {
  const data = await googleRequest<any>({
    method: 'GET',
    path: `/places/${placeId}`,
    fieldMask: DETAIL_FIELD_MASK,
    cachePrefix: 'gp_detail',
    cacheTtl: 86400, // 24 hours — details don't change often
  })

  return normalizeDetails(data)
}

// ── Normalize ───────────────────────────────────────────────────────────────

function normalizeDetails(p: any): TripSagePlaceDetails {
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
    category: 'general',
    types: p.types || [],
    photoUrl: p.photos?.[0]?.name ? buildPhotoUrl(p.photos[0].name) : null,
    googleMapsUrl: p.googleMapsUri || '',
    isOpenNow: p.currentOpeningHours?.openNow ?? null,
    source: 'google_places',

    // Extended fields
    phone: p.nationalPhoneNumber || null,
    website: p.websiteUri || null,
    editorialSummary: p.editorialSummary?.text || null,
    openingHours: p.currentOpeningHours?.weekdayDescriptions || null,
    reviews: (p.reviews || []).slice(0, 5).map(normalizeReview),
    photos: (p.photos || []).slice(0, 10).map(normalizePhoto),
  }
}

function normalizeReview(r: any): TripSagePlaceReview {
  return {
    author: r.authorAttribution?.displayName || 'Anonymous',
    rating: r.rating ?? 0,
    text: r.text?.text || '',
    relativeTime: r.relativePublishTimeDescription || '',
    profilePhotoUrl: r.authorAttribution?.photoUri || null,
  }
}

function normalizePhoto(p: any): TripSagePlacePhoto {
  return {
    url: p.name ? buildPhotoUrl(p.name) : '',
    width: p.widthPx || 0,
    height: p.heightPx || 0,
    attributions: (p.authorAttributions || []).map((a: any) => a.displayName || ''),
  }
}
