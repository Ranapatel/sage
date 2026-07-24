import axios from 'axios'
import { googleRequest, buildPhotoUrl } from './googlePlaces/googleClient'
const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY
const GOOGLE_API_KEY_CONFIGURED = () => {
  const key = process.env.GOOGLE_PLACES_API_KEY
  return key && key !== 'your_google_places_key'
}

// ── Curated fallback travel images (as final fallback pool if even AI generation fails)
const FALLBACK_HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
  'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800&q=80',
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
]

const FALLBACK_FLIGHT_IMAGES = [
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  'https://images.unsplash.com/photo-1519074069444-1ba4effe602a?w=800&q=80',
  'https://images.unsplash.com/photo-1508672019048-805479767c29?w=800&q=80',
  'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&q=80',
]

export interface ImageResolveInput {
  placeName: string
  city: string
  country?: string
  category?: string
  placeId?: string | null
  lat?: number
  lng?: number
  ignoreUrls?: string[] | Set<string>
}

export interface ImageResolveResult {
  imageUrl: string
  gallery: string[]
  source: 'google' | 'unsplash' | 'wikimedia' | 'wikipedia' | 'ai_fallback' | 'placeholder'
  isAiIllustration?: boolean
}

// ── Helpers for Validation ──────────────────────────────────────────────────

function normalizeString(s: string): string {
  return (s || '').toLowerCase().replace(/[_\-''`,]/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Check if the image description/tags match the place name query */
function nameMatchesImage(placeName: string, text: string): boolean {
  if (!text) return false
  const normPlace = normalizeString(placeName)
  const normText = normalizeString(text)

  if (normText.includes(normPlace) || normPlace.includes(normText)) return true

  const placeWords = normPlace.split(' ').filter(w => w.length >= 3)
  if (placeWords.length === 0) return false
  const matches = placeWords.filter(w => normText.includes(w))
  return matches.length / placeWords.length >= 0.5 // 50% matching words
}

/** Check if the image belongs to a different country or city than our target */
function isGeographicallyUnrelated(city: string, country: string | undefined, text: string): boolean {
  if (!text) return false
  const normText = normalizeString(text)
  
  // A list of common world travel destination keywords to check against
  const otherPlaces = ['bali', 'bangkok', 'phuket', 'tokyo', 'paris', 'london', 'new york', 'miami', 'maldives', 'hawaii', 'california', 'sydney', 'rome', 'barcelona']
  const cleanCity = normalizeString(city)
  
  for (const place of otherPlaces) {
    if (place !== cleanCity && normText.includes(place)) {
      // If it mentions another major tourist city/island, reject it
      return true
    }
  }

  // Reject if it mentions India for a Thailand query, or vice-versa
  if (country) {
    const cleanCountry = normalizeString(country)
    if (cleanCountry === 'thailand' && (normText.includes('india') || normText.includes('goa') || normText.includes('delhi'))) return true
    if (cleanCountry === 'india' && (normText.includes('thailand') || normText.includes('bangkok') || normText.includes('phuket'))) return true
  }

  return false
}

/** Reject generic beaches for restaurant category */
function isGenericBeachForRestaurant(category: string | undefined, text: string): boolean {
  if (!category) return false
  const cat = category.toLowerCase()
  if (cat !== 'dining' && cat !== 'restaurants' && cat !== 'food') return false

  const normText = normalizeString(text)
  const hasBeachTerms = ['beach', 'sand', 'ocean', 'sea', 'coast', 'waves'].some(t => normText.includes(t))
  const hasFoodTerms = ['food', 'restaurant', 'dining', 'dish', 'meal', 'cafe', 'table', 'bar', 'drink', 'eat', 'chef', 'bistro', 'bites'].some(t => normText.includes(t))

  return hasBeachTerms && !hasFoodTerms
}

/** Validate category alignment */
function isCategoryMismatched(category: string | undefined, text: string): boolean {
  if (!category || !text) return false
  const cat = category.toLowerCase()
  const normText = normalizeString(text)

  if (cat === 'dining' || cat === 'restaurants' || cat === 'food' || cat === 'cafes') {
    // Should be related to food/dining/interior
    const terms = ['food', 'restaurant', 'dining', 'dish', 'meal', 'cafe', 'table', 'cook', 'kitchen', 'interior', 'bar', 'drink', 'bistro', 'coffee', 'bakery', 'tea', 'cup', 'plate', 'buffet']
    return !terms.some(t => normText.includes(t))
  }

  if (cat === 'accommodation' || cat === 'hotels') {
    const terms = ['hotel', 'room', 'bed', 'resort', 'lobby', 'suite', 'lounge', 'accommodation', 'villa', 'spa', 'pool']
    return !terms.some(t => normText.includes(t))
  }

  if (cat === 'beaches') {
    const terms = ['beach', 'sea', 'ocean', 'sand', 'coast', 'shore', 'waves', 'water', 'sunset']
    return !terms.some(t => normText.includes(t))
  }

  if (cat === 'museums') {
    const terms = ['museum', 'gallery', 'exhibit', 'art', 'sculpture', 'painting', 'exhibition', 'history', 'relic', 'statue']
    return !terms.some(t => normText.includes(t))
  }

  return false
}

// ── Core Image Service Implementation ───────────────────────────────────────

export class ImageService {
  /**
   * Automatically validates that a URL is not already claimed by a different Place ID.
   * If not claimed, claims it for the current Place ID.
   */
  private static async checkAndClaimUrl(url: string, placeId: string | null | undefined): Promise<boolean> {
    const cleanUrl = url.split('?')[0] // normalize URL to ignore resizing parameters
    const ownerKey = generateCacheKey('img_owner_v1', { url: cleanUrl })
    
    try {
      const ownerPlaceId = await cacheGet(ownerKey)
      if (ownerPlaceId) {
        // If the URL has an owner, check if the current placeId matches it
        if (placeId && ownerPlaceId === placeId) {
          return true // identical place ID is allowed to reuse its own image
        }
        // Different place ID -> duplicate detected and rejected!
        return false
      }
      
      // No owner yet. Claim it!
      const claimId = placeId || `anon_${Math.random().toString(36).substring(2, 9)}`
      await cacheSet(ownerKey, claimId, 86400 * 7) // 7 days claim
      return true
    } catch (err: any) {
      console.warn(`[ImageService] checkAndClaimUrl error:`, err.message)
      return true // fail open in case of Redis errors
    }
  }

  private static async filterDuplicateUrls(urls: string[], placeId: string | null | undefined): Promise<string[]> {
    const valid: string[] = []
    for (const url of urls) {
      const allowed = await this.checkAndClaimUrl(url, placeId)
      if (allowed) {
        valid.push(url)
      } else {
        console.log(`[ImageService] Rejecting duplicate URL for a different place: ${url.substring(0, 80)}`)
      }
    }
    return valid
  }

  /**
   * Main entry point to resolve the best images for a place with caching and multi-provider fallbacks.
   */
  static async resolvePlaceImages(input: ImageResolveInput): Promise<ImageResolveResult> {
    const { placeName, city, country = '', category = '', placeId, lat, lng, ignoreUrls } = input
    
    // Cache photos using the Place ID, not the category or destination
    const cacheKey = placeId 
      ? generateCacheKey('img_place_v3', { placeId })
      : generateCacheKey('img_resolve_v3', { placeName, city, category })
    
    console.log(`[ImageService] Resolving images for name="${placeName}" | city="${city}" | placeId="${placeId || 'none'}" | category="${category || 'none'}"`)

    // 1. Check Redis Cache
    try {
      const cached = await cacheGet(cacheKey)
      if (cached) {
        console.log(`[ImageService] Cache hit for name="${placeName}" | placeId="${placeId || 'none'}"`)
        const ignoreSet = ignoreUrls ? new Set(ignoreUrls) : new Set<string>()
        if (ignoreSet.size > 0 && cached.gallery) {
          const filteredGallery = cached.gallery.filter((u: string) => !ignoreSet.has(u))
          if (filteredGallery.length > 0) {
            return {
              ...cached,
              imageUrl: filteredGallery[0],
              gallery: filteredGallery
            }
          }
        } else {
          return cached as ImageResolveResult
        }
      }
    } catch {}

    const ignoreSet = ignoreUrls ? new Set(ignoreUrls) : new Set<string>()
    let result: ImageResolveResult | null = null

    // ── Priority 1: Google Places Photos API ──
    if (GOOGLE_API_KEY_CONFIGURED()) {
      let activePlaceId = placeId
      
      // If we don't have placeId, resolve it via Text Search first
      if (!activePlaceId) {
        console.log(`[ImageService] Place ID is missing for "${placeName}". Attempting lookup...`)
        try {
          activePlaceId = await this.resolvePlaceId(placeName, city)
          if (!activePlaceId) {
            console.log(`[ImageService] [Fallback Reason] Could not resolve Google Place ID for "${placeName}". Falling back to Unsplash.`)
          }
        } catch (err: any) {
          console.warn(`[ImageService] Google Places ID resolution failed for "${placeName}":`, err.message)
        }
      }

      if (activePlaceId) {
        try {
          const googlePhotos = await this.fetchGooglePhotos(activePlaceId)
          const withoutIgnores = googlePhotos.filter(u => !ignoreSet.has(u))
          const filtered = await this.filterDuplicateUrls(withoutIgnores, activePlaceId)
          if (filtered.length > 0) {
            result = {
              imageUrl: filtered[0],
              gallery: filtered.slice(0, 5),
              source: 'google'
            }
          } else {
            console.log(`[ImageService] [Fallback Reason] Google Places Photos for "${placeName}" (Place ID: ${activePlaceId}) has no photos or all photos are duplicates. Falling back to Unsplash.`)
          }
        } catch (err: any) {
          console.warn(`[ImageService] [Fallback Reason] Google Places Photos API failed for Place ID "${activePlaceId}": ${err.message}. Falling back to Unsplash.`)
        }
      }
    } else {
      console.log(`[ImageService] [Fallback Reason] Google Places API Key is not configured. Falling back to Unsplash.`)
    }

    // ── Priority 2: Unsplash API ──
    if (!result) {
      try {
        const { ImageService: NewImageService } = require('./image.service')
        const entType = (category || 'general').toLowerCase() as any
        const searchRes = await NewImageService.searchImages({
          entityName: placeName,
          entityType: entType,
          city,
          country,
          count: 5,
        })

        if (searchRes && searchRes.images && searchRes.images.length > 0 && searchRes.source !== 'placeholder') {
          const gallery = searchRes.images.map((img: any) => img.regular)
          const withoutIgnores = gallery.filter((u: string) => !ignoreSet.has(u))
          const filtered = await this.filterDuplicateUrls(withoutIgnores, placeId)
          if (filtered.length > 0) {
            result = {
              imageUrl: filtered[0],
              gallery: filtered.slice(0, 5),
              source: 'unsplash'
            }
          }
        }
      } catch (err: any) {
        console.warn(`[ImageService] Unsplash search failed for "${placeName}": ${err.message}`)
      }
    }

    // ── Priority 3: Wikimedia Commons / Wikipedia ──
    if (!result) {
      try {
        const wikiPhotos = await this.fetchWikimediaPhotos({ placeName, city, lat, lng, category })
        const withoutIgnores = wikiPhotos.filter(u => !ignoreSet.has(u))
        const filtered = await this.filterDuplicateUrls(withoutIgnores, placeId)
        if (filtered.length > 0) {
          result = {
            imageUrl: filtered[0],
            gallery: filtered.slice(0, 5),
            source: 'wikimedia'
          }
        } else {
          console.log(`[ImageService] [Fallback Reason] Wikimedia/Wikipedia returned 0 results or all results are duplicates for "${placeName}". Falling back to AI Fallback.`)
        }
      } catch (err: any) {
        console.warn(`[ImageService] [Fallback Reason] Wikimedia/Wikipedia failed for "${placeName}": ${err.message}. Falling back to AI Fallback.`)
      }
    }

    // ── Priority 4: AI Fallback (Pollinations.ai) ──
    if (!result) {
      console.log(`[ImageService] [Fallback Reason] All authority and search providers failed for "${placeName}". Using AI illustration fallback.`)
      try {
        const aiUrl = this.generateAiIllustrationUrl(placeName, city, category)
        result = {
          imageUrl: aiUrl,
          gallery: [aiUrl],
          source: 'ai_fallback',
          isAiIllustration: true
        }
      } catch (err: any) {
        console.warn(`[ImageService] AI Fallback failed for "${placeName}":`, err.message)
      }
    }

    // Final fallback (curated static images)
    if (!result) {
      console.log(`[ImageService] [Fallback Reason] AI generator failed for "${placeName}". Using default curated placeholder.`)
      const fallbackList = FALLBACK_HOTEL_IMAGES
      result = {
        imageUrl: fallbackList[0],
        gallery: fallbackList,
        source: 'placeholder'
      }
    }

    // Cache the resolved result (7-day TTL)
    try {
      await cacheSet(cacheKey, result, 86400 * 7)
    } catch {}

    return result
  }

  /** Resolve Place ID via Text Search */
  private static async resolvePlaceId(placeName: string, city: string): Promise<string | null> {
    const textQuery = `${placeName} in ${city}`
    const data = await googleRequest<any>({
      path: '/places:searchText',
      body: {
        textQuery,
        maxResultCount: 3,
        languageCode: 'en',
      },
      fieldMask: 'places.id,places.displayName',
      cachePrefix: 'gp_id_resolver',
      cacheTtl: 86400 * 30, // 30 days
    })

    const places = data?.places || []
    if (places.length === 0) return null

    // Confirm name match to avoid wrong places
    for (const p of places) {
      const displayName = p.displayName?.text || ''
      if (nameMatchesImage(placeName, displayName)) {
        return p.id
      }
    }

    return places[0].id // Fallback to first result if no exact match
  }

  /** Fetch official photo URLs from Google Places */
  private static async fetchGooglePhotos(placeId: string): Promise<string[]> {
    const data = await googleRequest<any>({
      method: 'GET',
      path: `/places/${placeId}`,
      fieldMask: 'photos',
      cachePrefix: 'gp_photos',
      cacheTtl: 86400 * 7,
    })

    const photos = data?.photos || []
    return photos
      .filter((p: any) => p.widthPx >= 300 && p.heightPx >= 200) // Quality score check
      .map((p: any) => buildPhotoUrl(p.name, 1200))
  }

  /** Fetch and validate photos from Unsplash */
  private static async fetchUnsplashPhotos(params: {
    placeName: string
    city: string
    country: string
    category: string
  }): Promise<string[]> {
    const { placeName, city, country, category } = params
    
    // Construct query strictly based on category
    let query = `${placeName} ${city}`.trim()
    const cat = category.toLowerCase()
    if (cat === 'dining' || cat === 'restaurants' || cat === 'food') {
      query = `${placeName} ${city}`
    } else if (cat === 'attractions' || cat === 'landmarks' || cat === 'culture') {
      query = `${placeName} ${country || city}`
    }

    const res = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query,
        per_page: 15,
        orientation: 'landscape',
        content_filter: 'high'
      },
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
      timeout: 4000
    })

    const results = res.data?.results || []
    const validUrls: string[] = []

    for (const item of results) {
      const width = item.width || 0
      const height = item.height || 0
      if (width < 300 || height < 200) continue // Low quality

      const description = item.description || ''
      const altDescription = item.alt_description || ''
      const tags = (item.tags || []).map((t: any) => t.title || '').join(' ')
      const allText = `${description} ${altDescription} ${tags}`

      // Geographical and categorical validation
      if (isGeographicallyUnrelated(city, country, allText)) continue
      if (isGenericBeachForRestaurant(category, allText)) continue
      if (isCategoryMismatched(category, allText)) continue

      // Verify name keywords matches
      if (!nameMatchesImage(placeName, allText) && results.length > 5) {
        // If we have many results, apply strict name matching
        continue
      }

      validUrls.push(`${item.urls.raw}&w=800&q=80&auto=format&fit=crop`)
    }

    return validUrls
  }

  /** Fetch photos from Wikipedia summaries / Wikidata claims / Wikimedia geosearch */
  private static async fetchWikimediaPhotos(params: {
    placeName: string
    city: string
    lat?: number
    lng?: number
    category: string
  }): Promise<string[]> {
    const { placeName, city, lat, lng, category } = params
    const query = `${placeName} ${city}`.trim()
    const urls: string[] = []

    // ── 1. Wikipedia Summary ──
    try {
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
      const res = await axios.get(summaryUrl, { timeout: 3000 })
      const imgUrl = res.data?.thumbnail?.source || res.data?.originalimage?.source
      const title = res.data?.title || ''
      if (imgUrl && nameMatchesImage(placeName, title)) {
        urls.push(imgUrl)
      }
    } catch {}

    // ── 2. Wikidata P18 ──
    if (urls.length === 0) {
      try {
        const wikidataUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=${encodeURIComponent(query)}&props=claims|labels&languages=en&format=json&origin=*`
        const res = await axios.get(wikidataUrl, { timeout: 3000 })
        const entities = res.data?.entities ?? {}
        const entity = Object.values(entities)[0] as any
        if (entity && entity.missing === undefined) {
          const label = entity?.labels?.en?.value || ''
          const p18 = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value
          const filename = typeof p18 === 'string' ? p18 : p18?.value ?? ''
          if (filename && nameMatchesImage(placeName, label)) {
            const cleanFile = filename.replace(/^File:/i, '').replace(/ /g, '_')
            urls.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(cleanFile)}?width=800`)
          }
        }
      } catch {}
    }

    // ── 3. Wikimedia Commons Geosearch ──
    const noAreaCats = ['food', 'restaurants', 'shopping', 'accommodation', 'hotels', 'nightlife']
    const catLower = category.toLowerCase()
    
    if (urls.length === 0 && lat && lng && !noAreaCats.includes(catLower)) {
      try {
        const geoUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=geosearch&gsnamespace=6&gscoord=${lat}|${lng}&gsradius=300&gslimit=5&format=json&origin=*`
        const res = await axios.get(geoUrl, { timeout: 3000 })
        const results = res.data?.query?.geosearch || []
        const rejectPatterns = [/map/i, /diagram/i, /plan_of/i, /location/i, /layout/i, /svg$/i, /\.svg/i, /locator/i]
        
        for (const item of results) {
          const title = item.title || ''
          if (rejectPatterns.some(p => p.test(title))) continue
          const filename = title.replace(/^File:/i, '')
          urls.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=800`)
          break // Take first valid geo image
        }
      } catch {}
    }

    return urls
  }

  /** Generate AI prompt and point to Pollinations.ai */
  private static generateAiIllustrationUrl(placeName: string, city: string, category: string): string {
    const cat = category.toLowerCase()
    let prompt = `Beautiful scenic view of ${placeName} in ${city}, landscape travel photography`
    
    if (cat === 'dining' || cat === 'restaurants' || cat === 'food') {
      prompt = `Cozy restaurant interior of ${placeName} in ${city}, warm ambient light, gourmet food on table, professional food photography`
    } else if (cat === 'beaches') {
      prompt = `Stunning view of ${placeName} beach in ${city}, golden sand, clear turquoise water, palm trees, sunny landscape photography`
    } else if (cat === 'landmarks' || cat === 'historic' || cat === 'culture') {
      prompt = `Majestic historic architecture of ${placeName} landmark in ${city}, beautiful lighting, detailed architectural photography`
    } else if (cat === 'accommodation' || cat === 'hotels') {
      prompt = `Luxury hotel lobby or room at ${placeName} resort in ${city}, modern interior design, high-end travel photography`
    } else if (cat === 'museums') {
      prompt = `Inside of ${placeName} museum in ${city}, elegant exhibition gallery, soft track lighting, fine art photography`
    }

    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true`
  }
}

// ── Legacy Compatibility Layer ─────────────────────────────────────────────

export async function fetchUnsplashImage(query: string, orientation: 'landscape' | 'portrait' = 'landscape'): Promise<string | null> {
  try {
    const { ImageService: NewImageService } = require('./image.service')
    const res = await NewImageService.searchImages({
      entityName: query,
      entityType: 'general',
      city: query,
      count: 3,
    })

    if (res && res.images && res.images.length > 0) {
      return res.images[0].regular
    }
    return null
  } catch (err: any) {
    console.warn(`[Legacy/Unsplash] fetch failed for "${query}":`, err.message)
    return null
  }
}

export async function getDestinationImage(destination: string, type: 'hotel' | 'flight' = 'hotel', index = 0): Promise<string> {
  const query = type === 'hotel' ? `${destination} luxury hotel` : `${destination} airport travel`
  const real = await fetchUnsplashImage(query)
  if (real) return real

  const fallbacks = type === 'hotel' ? FALLBACK_HOTEL_IMAGES : FALLBACK_FLIGHT_IMAGES
  return fallbacks[index % fallbacks.length]
}

function getHotelbedsFallbackImage(identifier: string, idx = 0) {
  const distinctImg = FALLBACK_HOTEL_IMAGES[idx % FALLBACK_HOTEL_IMAGES.length]
  return {
    image: distinctImg,
    image_path: distinctImg,
    gallery_paths: [distinctImg],
    images: [distinctImg]
  }
}

export async function enrichHotelsWithImages(hotels: any[], destination: string): Promise<any[]> {
  const claimedUrls = new Set<string>()

  const promises = hotels.map(async (hotel, idx) => {
    let img = hotel.image
    
    // Detect generic, mock, or duplicate room photos
    const isMockOrDuplicate = !img ||
      img.includes('004200a_hb_ro') ||
      img.includes('004200') ||
      claimedUrls.has(img)

    if (isMockOrDuplicate) {
      try {
        // Query Google Places / ImageService using exact hotel name & city
        const resolved = await ImageService.resolvePlaceImages({
          placeName: hotel.name,
          city: destination,
          category: 'hotels'
        })
        if (resolved && resolved.imageUrl && !claimedUrls.has(resolved.imageUrl)) {
          claimedUrls.add(resolved.imageUrl)
          return {
            ...hotel,
            image: resolved.imageUrl,
            image_path: resolved.imageUrl,
            gallery_paths: resolved.gallery,
            images: resolved.gallery
          }
        }
      } catch (err: any) {
        console.warn(`[enrichHotelsWithImages] Google Places resolution error for "${hotel.name}":`, err.message)
      }

      // If Google Places / Unsplash has no unique image, assign a distinct fallback from our rich pool
      const distinctFallback = FALLBACK_HOTEL_IMAGES[idx % FALLBACK_HOTEL_IMAGES.length]
      claimedUrls.add(distinctFallback)
      const gallery = [
        distinctFallback,
        FALLBACK_HOTEL_IMAGES[(idx + 1) % FALLBACK_HOTEL_IMAGES.length],
        FALLBACK_HOTEL_IMAGES[(idx + 2) % FALLBACK_HOTEL_IMAGES.length]
      ]

      return {
        ...hotel,
        image: distinctFallback,
        image_path: distinctFallback,
        gallery_paths: gallery,
        images: gallery
      }
    } else {
      claimedUrls.add(img)
    }

    return hotel
  })

  return Promise.all(promises)
}
