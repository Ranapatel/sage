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
 * Pexels Image Provider
 *
 * Official docs: https://www.pexels.com/api/documentation/#photos-search
 *
 * - Auth: Authorization: {API_KEY}
 * - GET https://api.pexels.com/v1/search?query=&orientation=landscape&per_page=
 * - Use src.original / large2x / large / medium / small / tiny / landscape
 *
 * Best for: destinations, activities, road trips, beaches, adventure,
 * nature, rental cars, airports, generic travel imagery.
 */

function getApiKey(): string | null {
  const key = process.env.PEXELS_API_KEY
  if (!key || key.trim().length === 0) return null
  return key.trim()
}

export class PexelsImageService {
  /**
   * Search photos via GET https://api.pexels.com/v1/search
   */
  public static async fetchPhotos(
    query: string,
    options?: { perPage?: number; orientation?: 'landscape' | 'portrait' | 'square' }
  ): Promise<RawImageCandidate[]> {
    const perPage = Math.min(options?.perPage ?? 8, 80)
    const orientation = options?.orientation ?? 'landscape'
    const cacheKey = formatImageCacheKey('pexels', `${query}_${orientation}`)

    const cached = await cacheGet<RawImageCandidate[]>(cacheKey)
    if (cached && cached.length > 0) return cached

    const apiKey = getApiKey()
    if (!apiKey) {
      console.warn('[PexelsImageService] PEXELS_API_KEY not configured')
      return []
    }

    return withInFlightDedupe(`pexels_${cacheKey}`, async () => {
      const again = await cacheGet<RawImageCandidate[]>(cacheKey)
      if (again && again.length > 0) return again

      const candidates: RawImageCandidate[] = []

      try {
        const res = await axios.get('https://api.pexels.com/v1/search', {
          params: {
            query,
            orientation,
            per_page: perPage,
            size: 'large',
          },
          headers: {
            Authorization: apiKey,
          },
          timeout: 5000,
        })

        const photos: any[] = res.data?.photos || []
        for (const photo of photos) {
          const src = photo.src || {}
          const primary =
            src.landscape || src.large2x || src.large || src.original || src.medium

          if (!primary || !String(primary).startsWith('http')) continue

          const width = photo.width || 1920
          const height = photo.height || 1080
          if (width < 400 || height < 300) continue

          candidates.push({
            url: primary,
            width,
            height,
            title: photo.alt || query,
            description: photo.alt || undefined,
            provider: 'pexels',
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
            qualityHint: Math.min(8, Math.floor(width / 1000)),
            variants: {
              hero: src.large2x || src.original || src.landscape || primary,
              card: src.large || src.medium || primary,
              mobile: src.medium || src.small || primary,
              thumb: src.tiny || src.small || primary,
            },
          })
        }

        if (candidates.length > 0) {
          await cacheSet(cacheKey, candidates, DEFAULT_TTL_SECONDS)
        } else {
          console.warn(`[PexelsImageService] 0 results for query="${query}"`)
        }
      } catch (err: any) {
        const status = err.response?.status
        console.warn(
          `[PexelsImageService] API error for "${query}" (status=${status}): ${err.message}`
        )
      }

      return candidates
    })
  }
}
