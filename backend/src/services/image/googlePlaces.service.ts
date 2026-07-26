import axios from 'axios'
import { RawImageCandidate } from '../../utils/imageScoring'
import {
  cacheGet,
  cacheSet,
  formatImageCacheKey,
  withInFlightDedupe,
  DEFAULT_TTL_SECONDS,
} from '../../cache/redis'
import { ImageCategory, googleIncludedTypeForCategory } from '../../utils/imageSearch'

/**
 * Google Places Photos provider
 *
 * Flow (Places API New — official docs):
 * 1. Resolve Place ID via Text Search (New)  POST /v1/places:searchText
 * 2. Fetch photo resource names via Place Details (New) GET /v1/places/{placeId}
 * 3. Resolve media via Place Photos (New) with skipHttpRedirect=true
 *    → returns photoUri without embedding the API key in client-facing URLs
 *
 * Docs:
 * - https://developers.google.com/maps/documentation/places/web-service/place-photos
 * - https://developers.google.com/maps/documentation/places/web-service/place-details
 * - https://developers.google.com/maps/documentation/places/web-service/text-search
 */

const PLACES_BASE = 'https://places.googleapis.com/v1'

// Max width per Places Photos (New): 1–4800
const MAX_WIDTH_HERO = 1920
const MAX_WIDTH_CARD = 800
const MAX_WIDTH_MOBILE = 640
const MAX_WIDTH_THUMB = 400
const MAX_WIDTH_BEST = 1600

interface GooglePhotoMeta {
  name: string
  widthPx: number
  heightPx: number
  authorAttributions?: Array<{ displayName?: string; uri?: string }>
}

interface PlaceIdCacheEntry {
  placeId: string
  displayName?: string
}

function getApiKey(): string | null {
  const key =
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_API_KEY
  if (!key || key === 'your_google_places_key' || key.trim().length === 0) {
    return null
  }
  return key.trim()
}

function authHeaders(apiKey: string, fieldMask?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
  }
  if (fieldMask) {
    headers['X-Goog-FieldMask'] = fieldMask
  }
  return headers
}

/**
 * Resolve a stable Place ID for a venue query and cache it.
 * Cache key: images:google:placeid:{query}
 */
async function resolvePlaceId(
  query: string,
  category: ImageCategory,
  apiKey: string,
  knownPlaceId?: string
): Promise<string | null> {
  if (knownPlaceId && knownPlaceId.trim().length > 0) {
    return knownPlaceId.trim()
  }

  const cacheKey = formatImageCacheKey('google', `placeid_${query}`)
  const cached = await cacheGet<PlaceIdCacheEntry>(cacheKey)
  if (cached?.placeId) return cached.placeId

  return withInFlightDedupe(`gp_placeid_${query}`, async () => {
    const again = await cacheGet<PlaceIdCacheEntry>(cacheKey)
    if (again?.placeId) return again.placeId

    const includedType = googleIncludedTypeForCategory(category)
    const body: Record<string, unknown> = {
      textQuery: query,
      pageSize: 3,
      languageCode: 'en',
    }
    if (includedType) {
      body.includedType = includedType
    }

    try {
      const res = await axios.post(`${PLACES_BASE}/places:searchText`, body, {
        headers: authHeaders(
          apiKey,
          'places.id,places.displayName,places.photos,places.types'
        ),
        timeout: 6000,
      })

      const places: any[] = res.data?.places || []
      if (places.length === 0) {
        console.warn(`[GooglePlacesImageService] No places found for "${query}"`)
        return null
      }

      // Prefer a result that actually has photos
      const withPhotos = places.find((p) => Array.isArray(p.photos) && p.photos.length > 0)
      const chosen = withPhotos || places[0]
      const placeId: string = chosen.id
      if (!placeId) return null

      const entry: PlaceIdCacheEntry = {
        placeId,
        displayName: chosen.displayName?.text,
      }
      // Place IDs are stable — cache 30 days
      await cacheSet(cacheKey, entry, 30 * 24 * 60 * 60)
      return placeId
    } catch (err: any) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message
      console.warn(`[GooglePlacesImageService] Text Search failed for "${query}": ${detail}`)
      return null
    }
  })
}

/**
 * Fetch photo resource metadata for a Place ID (Place Details photos field).
 * Caches photo metadata (not ephemeral photo names alone for long-lived use —
 * we immediately resolve to photoUri below).
 */
async function fetchPhotoMetadata(
  placeId: string,
  apiKey: string
): Promise<GooglePhotoMeta[]> {
  const cacheKey = formatImageCacheKey('google', `photos_meta_${placeId}`)
  const cached = await cacheGet<GooglePhotoMeta[]>(cacheKey)
  if (cached && cached.length > 0) return cached

  try {
    const res = await axios.get(`${PLACES_BASE}/places/${encodeURIComponent(placeId)}`, {
      headers: authHeaders(apiKey, 'id,displayName,photos'),
      timeout: 6000,
    })

    const photos: GooglePhotoMeta[] = (res.data?.photos || [])
      .filter((p: any) => p?.name)
      .map((p: any) => ({
        name: p.name as string,
        widthPx: p.widthPx || 0,
        heightPx: p.heightPx || 0,
        authorAttributions: p.authorAttributions || [],
      }))
      // Prefer highest resolution first
      .sort(
        (a: GooglePhotoMeta, b: GooglePhotoMeta) =>
          b.widthPx * b.heightPx - a.widthPx * a.heightPx
      )

    if (photos.length > 0) {
      // Cache metadata briefly; photo names can expire per Google ToS
      await cacheSet(cacheKey, photos, 24 * 60 * 60)
    }
    return photos
  } catch (err: any) {
    const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message
    console.warn(
      `[GooglePlacesImageService] Place Details photos failed for ${placeId}: ${detail}`
    )
    return []
  }
}

/**
 * Resolve a photo resource name to a hotlinkable photoUri via Place Photos (New).
 * Uses skipHttpRedirect=true so the API key never appears in the returned URL.
 *
 * GET https://places.googleapis.com/v1/{NAME}/media?maxWidthPx=…&skipHttpRedirect=true
 */
async function resolvePhotoUri(
  photoName: string,
  maxWidthPx: number,
  apiKey: string
): Promise<string | null> {
  try {
    const url = `${PLACES_BASE}/${photoName}/media`
    const res = await axios.get(url, {
      params: {
        maxWidthPx,
        maxHeightPx: maxWidthPx,
        skipHttpRedirect: true,
      },
      headers: {
        'X-Goog-Api-Key': apiKey,
      },
      timeout: 6000,
    })

    const photoUri: string | undefined = res.data?.photoUri
    if (photoUri && photoUri.startsWith('http')) {
      return photoUri
    }
    return null
  } catch (err: any) {
    // Fallback: legacy-style media URL still works server-side for scoring,
    // but we prefer not to expose it. Return null so ranking can skip.
    console.warn(
      `[GooglePlacesImageService] Photo media resolve failed: ${err.response?.status || err.message}`
    )
    return null
  }
}

/**
 * Build size variants from a base photoUri when Google returns one URI.
 * Googleusercontent URLs often accept size params; if not, reuse the same URI.
 */
function buildVariantsFromUri(photoUri: string): RawImageCandidate['variants'] {
  // Many lh3.googleusercontent.com URLs embed size; use same URI for all variants
  // to avoid broken transforms. Clients can still lazy-load.
  return {
    hero: photoUri,
    card: photoUri,
    mobile: photoUri,
    thumb: photoUri,
  }
}

export class GooglePlacesImageService {
  /**
   * Fetch ranked photo candidates for a venue query via Google Places Photos.
   * Only intended for hotels, restaurants, cafés, attractions, museums, parks, landmarks.
   */
  public static async fetchPhotos(
    query: string,
    options?: {
      category?: ImageCategory
      placeId?: string
      maxPhotos?: number
    }
  ): Promise<RawImageCandidate[]> {
    const category = options?.category || 'attractions'
    const maxPhotos = options?.maxPhotos ?? 5
    const apiKey = getApiKey()

    if (!apiKey) {
      console.warn('[GooglePlacesImageService] GOOGLE_PLACES_API_KEY not configured')
      return []
    }

    // Cache successful resolved candidates by placeId or query
    const resultCacheKey = formatImageCacheKey(
      'google',
      options?.placeId ? `place_${options.placeId}` : query
    )
    const cached = await cacheGet<RawImageCandidate[]>(resultCacheKey)
    if (cached && cached.length > 0) return cached

    return withInFlightDedupe(`gp_fetch_${resultCacheKey}`, async () => {
      const again = await cacheGet<RawImageCandidate[]>(resultCacheKey)
      if (again && again.length > 0) return again

      try {
        const placeId = await resolvePlaceId(query, category, apiKey, options?.placeId)
        if (!placeId) return []

        // Also cache under placeId key as required: images:google:{placeId}
        const placeIdCacheKey = formatImageCacheKey('google', placeId)
        const byPlace = await cacheGet<RawImageCandidate[]>(placeIdCacheKey)
        if (byPlace && byPlace.length > 0) {
          await cacheSet(resultCacheKey, byPlace, DEFAULT_TTL_SECONDS)
          return byPlace
        }

        let photos = await fetchPhotoMetadata(placeId, apiKey)

        // If Text Search already returned photos on the place object path failed,
        // try once more via details — already done above.
        if (photos.length === 0) {
          console.warn(
            `[GooglePlacesImageService] No photos for placeId=${placeId} query="${query}"`
          )
          return []
        }

        // Take top-N by resolution
        photos = photos.slice(0, maxPhotos)

        const candidates: RawImageCandidate[] = []

        // Resolve best-quality media first (highest width), then smaller set
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i]
          // Request near max available (capped at 1600 for performance)
          const targetWidth = Math.min(
            Math.max(photo.widthPx || MAX_WIDTH_BEST, 800),
            MAX_WIDTH_BEST
          )

          const photoUri = await resolvePhotoUri(photo.name, targetWidth, apiKey)
          if (!photoUri) continue

          // Optionally resolve a few size variants in parallel for the top photo only
          let variants = buildVariantsFromUri(photoUri)
          if (i === 0) {
            const [hero, card, mobile, thumb] = await Promise.all([
              resolvePhotoUri(photo.name, MAX_WIDTH_HERO, apiKey),
              resolvePhotoUri(photo.name, MAX_WIDTH_CARD, apiKey),
              resolvePhotoUri(photo.name, MAX_WIDTH_MOBILE, apiKey),
              resolvePhotoUri(photo.name, MAX_WIDTH_THUMB, apiKey),
            ])
            variants = {
              hero: hero || photoUri,
              card: card || photoUri,
              mobile: mobile || photoUri,
              thumb: thumb || photoUri,
            }
          }

          const attribution =
            photo.authorAttributions
              ?.map((a) => a.displayName)
              .filter(Boolean)
              .join(', ') || undefined

          candidates.push({
            url: photoUri,
            width: photo.widthPx || targetWidth,
            height: photo.heightPx || Math.round(targetWidth * 0.66),
            title: query,
            provider: 'google',
            placeId,
            attribution,
            qualityHint: Math.min(8, Math.floor((photo.widthPx || 0) / 800)),
            variants,
          })
        }

        if (candidates.length > 0) {
          await cacheSet(resultCacheKey, candidates, DEFAULT_TTL_SECONDS)
          await cacheSet(placeIdCacheKey, candidates, DEFAULT_TTL_SECONDS)
        }

        return candidates
      } catch (err: any) {
        console.warn(
          `[GooglePlacesImageService] Error fetching photos for "${query}": ${err.message}`
        )
        return []
      }
    })
  }
}
