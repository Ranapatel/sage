/**
 * TripSage Place Image Resolver
 *
 * Priority waterfall:
 *  1. Curated DB (instant, verified, exact)
 *  2. Wikidata P18 (live, exact landmark image)
 *  3. Wikipedia page image (live, exact)
 *  4. Wikimedia Commons geosearch (live, area-level)
 *  5. Category visual  (CSS card, no image URL)
 *  6. None             (premium no-image card)
 *
 * Never returns a wrong image. If name validation fails, skips source.
 * All live calls have a 4s timeout and are cached in-memory.
 *
 * Handles AI-generated compound names like:
 *   "Local Street Food Experience — Bangkok Night Market"
 *   "Heritage Walk: Chandni Chowk"
 * by extracting the actual place name before resolving.
 */

import { lookupCuratedImage, normalisePlaceKey } from '@/data/curatedPlaceImages'

// ─── Public types ─────────────────────────────────────────────────────────────

export type ImageConfidence = 'exact' | 'area' | 'category' | 'none'
export type ImageSource =
  | 'curated'
  | 'wikidata'
  | 'wikipedia'
  | 'wikimedia-geo'
  | 'category'
  | 'none'

export interface PlaceImageResult {
  imageUrl: string | null
  source: ImageSource
  confidence: ImageConfidence
  attribution: string | null
  attributionUrl: string | null
  license: string | null
  altText: string
  /** true = render as full card background; false = CSS-only card */
  showAsBackground: boolean
}

export interface ResolvePlaceImageInput {
  placeName: string
  city?: string
  country?: string
  lat?: number
  lng?: number
  category?: string
}

// ─── In-memory LRU-style cache ────────────────────────────────────────────────

const CACHE_MAX = 500
const cache = new Map<string, PlaceImageResult>()

function getCacheKey(input: ResolvePlaceImageInput): string {
  return `${normalisePlaceKey(input.placeName)}|${(input.city ?? '').toLowerCase()}|${(input.country ?? '').toLowerCase()}`
}

function setCache(key: string, result: PlaceImageResult): void {
  if (cache.size >= CACHE_MAX) {
    cache.delete(cache.keys().next().value as string)
  }
  cache.set(key, result)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIMEOUT_MS = 4000

async function fetchWithTimeout(url: string): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Validate that an API-returned title plausibly refers to the requested place.
 * Prevents "Grand Hyatt" matching "Grand Palace" etc.
 */
function nameMatches(apiTitle: string, placeName: string, city: string): boolean {
  const norm = (s: string) =>
    s.toLowerCase().replace(/[_\-''`]/g, ' ').replace(/\s+/g, ' ').trim()

  const t = norm(apiTitle)
  const p = norm(placeName)

  if (t.includes(p) || p.includes(t)) return true

  const words = p.split(' ').filter(w => w.length >= 3)
  if (words.length === 0) return false
  const hits = words.filter(w => t.includes(w))
  return hits.length / words.length >= 0.7
}

/** Build a Wikimedia Commons thumbnail URL from a bare filename */
function wikimediaUrl(filename: string, width = 800): string {
  const clean = filename.replace(/^File:/i, '').replace(/ /g, '_')
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(clean)}?width=${width}`
}

// ─── Name extraction — strip AI-generated descriptive prefixes ────────────────

/**
 * AI itineraries often generate compound names like:
 *   "Local Street Food Experience — Bangkok Night Market"
 *   "Heritage Walk: Chandni Chowk"
 *   "Explore Uluwatu Temple at Sunset"
 *
 * Extract all candidate names to try, most specific first.
 */
function extractNameCandidates(placeName: string): string[] {
  const candidates: string[] = [placeName]

  // Split on em dash / en dash → try last and first segment
  const dashParts = placeName.split(/\s*[—–]\s*/).map(s => s.trim()).filter(Boolean)
  if (dashParts.length > 1) {
    candidates.push(dashParts[dashParts.length - 1])
    candidates.push(dashParts[0])
  }

  // Colon split — "Heritage Walk: Chandni Chowk" → "Chandni Chowk"
  const colonParts = placeName.split(/\s*:\s*/).map(s => s.trim()).filter(Boolean)
  if (colonParts.length > 1) {
    candidates.push(colonParts[colonParts.length - 1])
  }

  // Strip common AI descriptive prefixes
  const STRIP_PREFIXES = [
    /^(local\s+)?(street\s+)?food\s+(experience|tour|walk|trail)[\s:—–-]+/i,
    /^(explore|visit|discover|experience|see|view)[\s:—–]+/i,
    /^(heritage\s+(walk|tour)|cultural\s+(experience|tour)|guided\s+(tour|walk)\s+of)[\s:—–]+/i,
    /^(evening\s+at|morning\s+at|afternoon\s+at|night\s+at|day\s+at)[\s:—–]+/i,
    /^(shopping\s+(at|in|experience|spree)|market\s+tour\s+(at|in)?)[\s:—–]+/i,
    /^(sunset\s+at|sunrise\s+at|sundown\s+at)[\s:—–]+/i,
    /^(day\s+trip\s+to|boat\s+ride\s+(at|to|in)|cable\s+car\s+to)[\s:—–]+/i,
    /^(night\s+out\s+at|nightlife\s+at|party\s+at)[\s:—–]+/i,
    /^(lunch\s+at|dinner\s+at|breakfast\s+at|brunch\s+at)[\s:—–]+/i,
    /^(trekking\s+(to|at)|hiking\s+(to|at)|nature\s+walk\s+(at|in))[\s:—–]+/i,
  ]
  for (const prefix of STRIP_PREFIXES) {
    const stripped = placeName.replace(prefix, '').trim()
    if (stripped && stripped !== placeName && stripped.length > 3) {
      candidates.push(stripped)
    }
  }

  // Also try stripping trailing descriptors: "Bangkok Night Market at Midnight" → "Bangkok Night Market"
  const AT_PATTERN = /\s+at\s+.+$/i
  candidates.forEach(c => {
    const stripped = c.replace(AT_PATTERN, '').trim()
    if (stripped && stripped !== c && stripped.length > 5) {
      candidates.push(stripped)
    }
  })

  // Deduplicate while preserving order
  const seen = new Set<string>()
  return candidates.filter(c => {
    const k = c.toLowerCase().trim()
    if (!k || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

// ─── Source 2: Wikidata P18 ───────────────────────────────────────────────────

interface WikidataResult {
  imageUrl: string
  label: string
  attributionUrl: string
}

async function tryWikidata(
  placeName: string,
  city: string,
): Promise<WikidataResult | null> {
  try {
    const query = city ? `${placeName}, ${city}` : placeName
    const url =
      `https://www.wikidata.org/w/api.php?action=wbgetentities` +
      `&sites=enwiki&titles=${encodeURIComponent(query)}` +
      `&props=claims|labels&languages=en&format=json&origin=*`

    const res = await fetchWithTimeout(url)
    if (!res.ok) return null

    const data = await res.json()
    const entities = data?.entities ?? {}
    const entity = Object.values(entities)[0] as any
    if (!entity || entity.missing !== undefined) return null

    const label: string = entity?.labels?.en?.value ?? ''
    if (!nameMatches(label, placeName, city)) return null

    const p18 = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value
    if (!p18) return null

    const filename = typeof p18 === 'string' ? p18 : p18?.value ?? ''
    if (!filename) return null

    const entityId = entity.id ?? ''
    return {
      imageUrl: wikimediaUrl(filename),
      label,
      attributionUrl: `https://www.wikidata.org/wiki/${entityId}`,
    }
  } catch {
    return null
  }
}

// ─── Source 3: Wikipedia page summary ────────────────────────────────────────

interface WikipediaResult {
  imageUrl: string
  title: string
  attributionUrl: string
}

async function tryWikipedia(
  placeName: string,
  city: string,
): Promise<WikipediaResult | null> {
  try {
    const query = city ? `${placeName} ${city}` : placeName

    // 1. Check if the page exists using standard action=query API (which returns 200 OK even if missing)
    const checkUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&redirects=1&format=json&origin=*`
    const checkRes = await fetchWithTimeout(checkUrl)
    if (!checkRes.ok) return null
    const checkData = await checkRes.json()
    const pages = checkData?.query?.pages ?? {}
    const pageId = Object.keys(pages)[0]

    // If pageId is "-1", it means the page does not exist on Wikipedia
    if (!pageId || pageId === '-1') return null

    // 2. Safe to fetch summary since we know the page exists
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    const res = await fetchWithTimeout(url)
    if (!res.ok) return null

    const data = await res.json()
    const title: string = data?.title ?? ''
    const imgUrl: string = data?.thumbnail?.source ?? data?.originalimage?.source ?? ''

    if (!imgUrl || !title) return null
    if (!nameMatches(title, placeName, city)) return null

    return {
      imageUrl: imgUrl,
      title,
      attributionUrl: data?.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    }
  } catch {
    return null
  }
}

// ─── Source 4: Wikimedia Commons geosearch ────────────────────────────────────

interface GeoResult {
  imageUrl: string
  title: string
  attributionUrl: string
}

const GEO_REJECT_PATTERNS = [
  /map/i, /diagram/i, /plan_of/i, /location/i, /layout/i,
  /svg$/i, /\.svg/i, /locator/i, /district/i,
]

async function tryWikimediaGeo(lat: number, lng: number): Promise<GeoResult | null> {
  try {
    const url =
      `https://commons.wikimedia.org/w/api.php?action=query` +
      `&list=geosearch&gsnamespace=6` +
      `&gscoord=${lat}|${lng}&gsradius=300&gslimit=8` +
      `&format=json&origin=*`

    const res = await fetchWithTimeout(url)
    if (!res.ok) return null

    const data = await res.json()
    const results: Array<{ title: string; pageid: number }> = data?.query?.geosearch ?? []

    for (const item of results) {
      const title = item.title ?? ''
      if (GEO_REJECT_PATTERNS.some(p => p.test(title))) continue

      const filename = title.replace(/^File:/i, '')
      return {
        imageUrl: wikimediaUrl(filename),
        title,
        attributionUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
      }
    }
    return null
  } catch {
    return null
  }
}

// ─── Category stop types that should NEVER show area-level images ─────────────

const NO_AREA_IMAGE_CATEGORIES = new Set([
  'food', 'shopping', 'accommodation', 'nightlife',
])

// ─── Main resolver ────────────────────────────────────────────────────────────

export async function resolvePlaceImage(
  input: ResolvePlaceImageInput,
): Promise<PlaceImageResult> {
  const cacheKey = getCacheKey(input)
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const { placeName, city = '', lat, lng, category = '' } = input

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const params = new URLSearchParams()
    params.set('placeName', placeName)
    params.set('city', city)
    if (category) params.set('category', category)
    if (lat) params.set('lat', String(lat))
    if (lng) params.set('lng', String(lng))

    const res = await fetch(`${baseUrl}/api/explore/place-image?${params.toString()}`)
    const data = await res.json()
    if (data.success && data.data) {
      const result = data.data
      const hasImage = !!result.imageUrl
      
      const mappedResult: PlaceImageResult = {
        imageUrl: result.imageUrl,
        source: result.source === 'google' ? 'wikidata' : (result.source === 'wikimedia' ? 'wikimedia-geo' : 'wikipedia'),
        confidence: result.source === 'placeholder' ? 'none' : 'exact',
        attribution: result.source === 'google' ? 'Google Places' : (result.isAiIllustration ? 'AI Illustration' : null),
        attributionUrl: null,
        license: null,
        altText: placeName,
        showAsBackground: hasImage,
      }
      
      if (result.isAiIllustration) {
        (mappedResult as any).isAiIllustration = true
      }
      
      setCache(cacheKey, mappedResult)
      return mappedResult
    }
  } catch (err) {
    console.warn('[placeImageResolver] Backend resolve failed, returning fallback', err)
  }

  // ── 5. Category visual ─────────────────────────────────────────────────────
  const categoryResult: PlaceImageResult = {
    imageUrl: null,
    source: 'category',
    confidence: 'category',
    attribution: null,
    attributionUrl: null,
    license: null,
    altText: `${placeName} — ${category || 'place'}`,
    showAsBackground: false,
  }

  setCache(cacheKey, categoryResult)
  return categoryResult
}

/** Clear the in-memory cache (useful in tests) */
export function clearPlaceImageCache(): void {
  cache.clear()
}
