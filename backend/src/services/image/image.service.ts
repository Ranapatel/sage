import {
  buildContextualSearchQuery,
  buildStockPhotoQuery,
  ImageCategory,
  PROVIDER_PRIORITY,
} from '../../utils/imageSearch'
import { RawImageCandidate, ScoredImageCandidate } from '../../utils/imageScoring'
import { GooglePlacesImageService } from './googlePlaces.service'
import { PexelsImageService } from './pexels.service'
import { UnsplashImageService } from './unsplash.service'
import { ImageRankingService } from './imageRanking.service'
import { ImageCacheService } from './cache.service'

export interface ImageResolveOptions {
  /** Official Hotelbeds photo URL (hotels only, highest priority) */
  hotelbedsPhotoUrl?: string
  /** Known Google Place ID — skips Text Search */
  placeId?: string
  /** How many ranked images to return for search/gallery */
  count?: number
  /** City context for place queries */
  city?: string
  /** Country context */
  country?: string
}

export interface ImageResolveResult {
  url: string
  provider: string
  score: number
  category: ImageCategory
  query: string
  normalizedQuery: string
  placeId?: string
  photographer?: string
  photographerUrl?: string
  attribution?: string
  variants: {
    hero: string
    card: string
    mobile: string
    thumb: string
  }
}

export class ImageService {
  /**
   * Resolve the highest-quality image for a query using category-specific
   * provider priority + intelligent scoring.
   *
   * Priority matrix (from product requirements):
   * - Hotels:       Hotelbeds → Google → Pexels → Unsplash → TripSage Placeholder
   * - Restaurants:  Google → Pexels → Unsplash → Placeholder
   * - Attractions:  Google → Pexels → Unsplash → Placeholder
   * - Destinations: Pexels → Unsplash → Google → Placeholder
   * - Hero:         Pexels → Unsplash → Google
   * - Activities:   Google → Pexels → Unsplash
   * - Rental Cars:  Pexels → Unsplash → Placeholder (No Google Places)
   */
  public static async resolveImage(
    rawQuery: string,
    category: ImageCategory = 'destinations',
    options?: ImageResolveOptions
  ): Promise<ImageResolveResult> {
    const normalizedQuery = buildContextualSearchQuery(category, this.composeQuery(rawQuery, options))
    const stockQuery = buildStockPhotoQuery(category, this.composeQuery(rawQuery, options))
    const cacheKey = `resolved_${category}_${normalizedQuery}_${options?.placeId || ''}`

    const cachedResult = await ImageCacheService.get<ImageResolveResult>('orchestrator', cacheKey)
    if (cachedResult?.url) {
      return cachedResult
    }

    const candidates = await this.collectCandidates(normalizedQuery, stockQuery, category, options)
    const selected: ScoredImageCandidate = ImageRankingService.selectBestImage(candidates, category)

    const result = this.toResolveResult(selected, category, rawQuery, normalizedQuery)

    // Always cache successful resolution (including placeholder) for 7 days
    // so we never re-hammer providers for the same miss
    await ImageCacheService.set('orchestrator', cacheKey, result)

    return result
  }

  /**
   * Search / gallery: return multiple ranked images across the priority chain.
   */
  public static async searchImages(
    rawQuery: string,
    category: ImageCategory = 'destinations',
    options?: ImageResolveOptions
  ): Promise<ImageResolveResult[]> {
    const count = Math.min(Math.max(options?.count ?? 5, 1), 12)
    const normalizedQuery = buildContextualSearchQuery(category, this.composeQuery(rawQuery, options))
    const stockQuery = buildStockPhotoQuery(category, this.composeQuery(rawQuery, options))
    const cacheKey = `search_${category}_${normalizedQuery}_${count}_${options?.placeId || ''}`

    const cached = await ImageCacheService.get<ImageResolveResult[]>('orchestrator', cacheKey)
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached
    }

    // For galleries, gather from all providers in priority (not stop-on-first)
    const candidates = await this.collectCandidates(
      normalizedQuery,
      stockQuery,
      category,
      options,
      true // gatherAll
    )

    const ranked = ImageRankingService.rankCandidates(candidates, category, count)
    const results = ranked.map((s) =>
      this.toResolveResult(s, category, rawQuery, normalizedQuery)
    )

    await ImageCacheService.set('orchestrator', cacheKey, results)
    return results
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  private static composeQuery(rawQuery: string, options?: ImageResolveOptions): string {
    const parts = [rawQuery, options?.city, options?.country].filter(
      (p) => p && String(p).trim().length > 0
    )
    return parts.join(' ').trim()
  }

  /**
   * Walk the provider priority chain.
   * - Default (resolve): stop when a provider returns candidates (minimize API usage).
   * - gatherAll (search): collect from all providers for richer galleries.
   */
  private static async collectCandidates(
    placeQuery: string,
    stockQuery: string,
    category: ImageCategory,
    options?: ImageResolveOptions,
    gatherAll = false
  ): Promise<RawImageCandidate[]> {
    const candidates: RawImageCandidate[] = []

    // Hotels: Hotelbeds first when provided
    if (category === 'hotels' && options?.hotelbedsPhotoUrl) {
      const hbUrl = options.hotelbedsPhotoUrl
      if (hbUrl.startsWith('http')) {
        candidates.push({
          url: hbUrl,
          width: 1600,
          height: 1066,
          title: placeQuery,
          provider: 'hotelbeds',
          qualityHint: 8,
          variants: {
            hero: hbUrl,
            card: hbUrl,
            mobile: hbUrl,
            thumb: hbUrl,
          },
        })
        if (!gatherAll) {
          return candidates
        }
      }
    }

    const chain = PROVIDER_PRIORITY[category] || PROVIDER_PRIORITY.destinations

    for (const provider of chain) {
      try {
        let batch: RawImageCandidate[] = []

        if (provider === 'google') {
          // Skip Google for pure hero banners (no place entity)
          if (category === 'hero') continue
          // Skip Google for rental cars
          if (category === 'cars') continue

          batch = await GooglePlacesImageService.fetchPhotos(placeQuery, {
            category,
            placeId: options?.placeId,
            maxPhotos: gatherAll ? 5 : 3,
          })
        } else if (provider === 'unsplash') {
          // Unsplash is for destination / inspiration imagery.
          // Allowed as fallback for other categories, but use stock-oriented query.
          batch = await UnsplashImageService.fetchPhotos(stockQuery, {
            perPage: gatherAll ? 8 : 5,
            orientation: 'landscape',
          })
        } else if (provider === 'pexels') {
          batch = await PexelsImageService.fetchPhotos(stockQuery, {
            perPage: gatherAll ? 8 : 5,
            orientation: 'landscape',
          })
        }

        if (batch.length > 0) {
          candidates.push(...batch)
          if (!gatherAll) {
            // First successful provider in priority order wins for single resolve
            break
          }
        }
      } catch (err: any) {
        console.warn(
          `[ImageService] Provider "${provider}" failed for "${placeQuery}": ${err.message}`
        )
        // Continue to next provider
      }
    }

    return candidates
  }

  private static toResolveResult(
    selected: ScoredImageCandidate,
    category: ImageCategory,
    rawQuery: string,
    normalizedQuery: string
  ): ImageResolveResult {
    const hero = selected.variants?.hero || selected.url
    const card = selected.variants?.card || selected.url
    const mobile = selected.variants?.mobile || selected.url
    const thumb = selected.variants?.thumb || selected.url

    // Never return empty URL
    const safeUrl = selected.url || hero || ImageRankingService.getFallbackPlaceholder(category).url

    return {
      url: safeUrl,
      provider: selected.provider,
      score: selected.score,
      category,
      query: rawQuery,
      normalizedQuery,
      placeId: selected.placeId,
      photographer: selected.photographer,
      photographerUrl: selected.photographerUrl,
      attribution: selected.attribution,
      variants: {
        hero: hero || safeUrl,
        card: card || safeUrl,
        mobile: mobile || safeUrl,
        thumb: thumb || safeUrl,
      },
    }
  }
}
