import axios from 'axios'
import { RawImageCandidate } from '../../utils/imageScoring'
import {
  cacheGet,
  cacheSet,
  formatImageCacheKey,
  withInFlightDedupe,
  DEFAULT_TTL_SECONDS,
} from '../../cache/redis'

/**
 * Unsplash Image Provider
 *
 * Official docs: https://unsplash.com/documentation#search-photos
 *
 * - Auth: Authorization: Client-ID {ACCESS_KEY}
 * - Accept-Version: v1
 * - Hotlink dynamic image URLs (urls.raw + w/q/auto params) — required by Unsplash guidelines
 * - content_filter=high for travel product safety
 * - orientation=landscape for hero/destination surfaces
 *
 * Use ONLY for destination / travel inspiration imagery
 * (cities, countries, beaches, mountains, islands, nature, hero banners).
 * Do not prefer Unsplash for hotel/restaurant-specific photos.
 */

function getAccessKey(): string | null {
  const key = process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_API_KEY
  if (!key || key.trim().length === 0) return null
  return key.trim()
}

function buildDynamicUrl(rawUrl: string | undefined, width: number, quality = 80): string | undefined {
  if (!rawUrl) return undefined
  const sep = rawUrl.includes('?') ? '&' : '?'
  return `${rawUrl}${sep}w=${width}&q=${quality}&auto=format&fit=crop`
}

export class UnsplashImageService {
  /**
   * Search photos via GET https://api.unsplash.com/search/photos
   */
  public static async fetchPhotos(
    query: string,
    options?: { perPage?: number; orientation?: 'landscape' | 'portrait' | 'squarish' }
  ): Promise<RawImageCandidate[]> {
    const perPage = Math.min(options?.perPage ?? 8, 30)
    const orientation = options?.orientation ?? 'landscape'
    const cacheKey = formatImageCacheKey('unsplash', `${query}_${orientation}`)

    const cached = await cacheGet<RawImageCandidate[]>(cacheKey)
    if (cached && cached.length > 0) return cached

    const accessKey = getAccessKey()
    if (!accessKey) {
      console.warn('[UnsplashImageService] UNSPLASH_ACCESS_KEY not configured')
      return []
    }

    return withInFlightDedupe(`unsplash_${cacheKey}`, async () => {
      const again = await cacheGet<RawImageCandidate[]>(cacheKey)
      if (again && again.length > 0) return again

      const candidates: RawImageCandidate[] = []

      try {
        const res = await axios.get('https://api.unsplash.com/search/photos', {
          params: {
            query,
            orientation,
            per_page: perPage,
            content_filter: 'high',
          },
          headers: {
            Authorization: `Client-ID ${accessKey}`,
            'Accept-Version': 'v1',
          },
          timeout: 5000,
        })

        // Rate-limit observability (docs: X-Ratelimit-Remaining)
        const remaining = res.headers?.['x-ratelimit-remaining']
        if (remaining !== undefined && Number(remaining) < 10) {
          console.warn(
            `[UnsplashImageService] Rate limit low: ${remaining} remaining`
          )
        }

        const results: any[] = res.data?.results || []
        for (const photo of results) {
          const raw = photo.urls?.raw as string | undefined
          const regular = photo.urls?.regular as string | undefined
          const full = photo.urls?.full as string | undefined
          const small = photo.urls?.small as string | undefined
          const thumb = photo.urls?.thumb as string | undefined

          // Prefer hotlinked dynamic URLs from raw (keeps ixid for view tracking)
          const primary =
            buildDynamicUrl(raw, 1600, 85) ||
            regular ||
            full ||
            buildDynamicUrl(raw, 1080, 80)

          if (!primary) continue

          const width = photo.width || 1920
          const height = photo.height || 1080
          // Skip very small originals
          if (width < 400 || height < 300) continue

          candidates.push({
            url: primary,
            width,
            height,
            title: photo.alt_description || photo.description || query,
            description: photo.description || photo.alt_description || undefined,
            provider: 'unsplash',
            photographer: photo.user?.name,
            photographerUrl: photo.user?.links?.html
              ? `${photo.user.links.html}?utm_source=tripsage&utm_medium=referral`
              : undefined,
            qualityHint: Math.min(8, Math.floor(width / 1000)),
            variants: {
              hero: buildDynamicUrl(raw, 1920, 85) || full || primary,
              card: buildDynamicUrl(raw, 800, 80) || regular || primary,
              mobile: buildDynamicUrl(raw, 640, 80) || small || primary,
              thumb: buildDynamicUrl(raw, 400, 75) || thumb || primary,
            },
          })
        }

        if (candidates.length > 0) {
          await cacheSet(cacheKey, candidates, DEFAULT_TTL_SECONDS)
        } else {
          console.warn(
            `[UnsplashImageService] 0 results for query="${query}"`
          )
        }
      } catch (err: any) {
        const status = err.response?.status
        const detail =
          err.response?.data?.errors?.join?.(', ') ||
          err.response?.data?.message ||
          err.message
        console.warn(
          `[UnsplashImageService] API error for "${query}" (status=${status}): ${detail}`
        )
      }

      return candidates
    })
  }
}
