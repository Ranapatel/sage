/**
 * placeImageService.js — TripSage Backend Place Image Resolver
 *
 * Multi-source waterfall (all free, no watermarks):
 *  1. Wikipedia Opensearch + pageimages  (no key, exact landmark photos)
 *  2. Flickr geotagged search by lat/lng (free key, CC licensed, local hidden spots)
 *  3. Wikimedia Commons geosearch        (no key, area-level by coordinates)
 *  4. null                               (frontend shows premium category card)
 *
 * Runs server-side: no CORS issues, proper User-Agent headers, cached in-memory.
 */

const axios = require('axios')

const FLICKR_KEY = process.env.FLICKR_API_KEY

// ── In-memory image cache (per process lifetime) ─────────────────────────────
const imageCache = new Map()
const CACHE_MAX = 1000

function cacheSet(key, value) {
  if (imageCache.size >= CACHE_MAX) {
    imageCache.delete(imageCache.keys().next().value)
  }
  imageCache.set(key, value)
}

function cacheGet(key) {
  return imageCache.get(key) || null
}

// ── Shared HTTP helper with timeout ──────────────────────────────────────────
async function fetchJSON(url, headers = {}, timeoutMs = 5000) {
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'TripSage-AI-Travel-App/2.0 (https://tripsage.ai)',
      ...headers,
    },
    timeout: timeoutMs,
  })
  return res.data
}

// ── Name cleaning: strip AI-generated descriptive prefixes ───────────────────
function extractCleanNames(placeName) {
  const candidates = [placeName]

  // Split on em/en dash: "Sunset at Baga Beach — North Goa" → "North Goa", "Baga Beach"
  const dashParts = placeName.split(/\s*[—–]\s*/).map(s => s.trim()).filter(Boolean)
  if (dashParts.length > 1) {
    candidates.push(dashParts[dashParts.length - 1])
    candidates.push(dashParts[0])
  }

  // Split on colon: "Heritage Walk: Chandni Chowk" → "Chandni Chowk"
  const colonParts = placeName.split(/\s*:\s*/).map(s => s.trim()).filter(Boolean)
  if (colonParts.length > 1) {
    candidates.push(colonParts[colonParts.length - 1])
  }

  // Strip common AI prefixes
  const PREFIXES = [
    /^(explore|visit|discover|experience|see|enjoy|watch|witness)\s+/i,
    /^(morning at|evening at|sunset at|sunrise at|night at|lunch at|dinner at|breakfast at)\s+/i,
    /^(local\s+)?(street\s+)?food\s+(experience|tour|walk)[\s:—–-]+/i,
    /^(heritage|cultural|guided)\s+(walk|tour|experience)[\s:—–]+/i,
    /^(day trip to|boat ride at|cable car to|trek to|hike to)\s+/i,
  ]
  for (const prefix of PREFIXES) {
    const stripped = placeName.replace(prefix, '').trim()
    if (stripped && stripped !== placeName && stripped.length > 3) {
      candidates.push(stripped)
    }
  }

  // Deduplicate
  const seen = new Set()
  return candidates.filter(c => {
    const k = c.toLowerCase().trim()
    if (!k || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

// ── Source 1: Wikipedia Opensearch + pageimages ───────────────────────────────
// Step A: Fuzzy search → find exact article title
// Step B: Fetch official page image for that title
// 100% free, no API key, server-side (no CORS issues)
async function tryWikipedia(placeName, city) {
  try {
    const query = city ? `${placeName} ${city}` : placeName

    // Step A: Opensearch for fuzzy title resolution
    const searchData = await fetchJSON(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json`
    )

    const suggestions = searchData?.[1] ?? []
    if (suggestions.length === 0) return null
    const bestTitle = suggestions[0]

    // Step B: Fetch page image for the resolved title
    const imgData = await fetchJSON(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(bestTitle)}&prop=pageimages&piprop=original|thumbnail&pithumbsize=800&redirects=1&format=json`
    )

    const pages = imgData?.query?.pages ?? {}
    const pageId = Object.keys(pages)[0]
    if (!pageId || pageId === '-1') return null

    const page = pages[pageId]
    const imgUrl = page.original?.source ?? page.thumbnail?.source ?? ''
    if (!imgUrl) return null

    return {
      imageUrl: imgUrl,
      source: 'wikipedia',
      attribution: '© Wikipedia / Wikimedia Commons',
      license: 'CC BY-SA',
    }
  } catch {
    return null
  }
}

// ── Source 2: Flickr geotagged search by coordinates ─────────────────────────
// Searches for Creative Commons licensed photos taken within 0.1 km of the place.
// Filters out maps, diagrams, and promotional content.
// Free tier: 3,600 requests/hour
const FLICKR_REJECT_PATTERNS = [
  /map/i, /diagram/i, /plan_of/i, /logo/i, /icon/i, /banner/i,
  /illustration/i, /sketch/i, /render/i, /model/i,
]

async function tryFlickr(lat, lng, placeName) {
  if (!FLICKR_KEY || !lat || !lng) return null

  try {
    // CC BY (4), CC BY-SA (5), No known copyright (7), CC0 (9), Public Domain (10)
    const data = await fetchJSON(
      `https://api.flickr.com/services/rest/` +
      `?method=flickr.photos.search` +
      `&api_key=${FLICKR_KEY}` +
      `&lat=${lat}&lon=${lng}` +
      `&radius=0.1` +            // 100 meter radius — exact location
      `&radius_units=km` +
      `&has_geo=1` +
      `&license=4,5,7,9,10` +   // CC licensed only — no watermarks
      `&content_type=1` +        // Photos only (no illustrations)
      `&sort=relevance` +
      `&per_page=5` +
      `&extras=url_l,url_m,title` +
      `&format=json&nojsoncallback=1`
    )

    const photos = data?.photos?.photo ?? []
    if (photos.length === 0) return null

    // Pick the best photo — skip maps/diagrams/logos
    for (const photo of photos) {
      const title = photo.title || ''
      if (FLICKR_REJECT_PATTERNS.some(p => p.test(title))) continue

      const imgUrl = photo.url_l || photo.url_m || null
      if (!imgUrl) continue

      return {
        imageUrl: imgUrl,
        source: 'flickr',
        attribution: `© Flickr / ${photo.ownername || 'Photographer'}`,
        license: 'CC',
      }
    }
    return null
  } catch {
    return null
  }
}

// ── Source 3: Wikimedia Commons geosearch by coordinates ─────────────────────
// Finds the nearest public-domain or CC image to the coordinates.
const WIKIMEDIA_REJECT = [
  /map/i, /diagram/i, /plan_of/i, /location/i, /layout/i, /\.svg/i, /locator/i,
]

async function tryWikimediaGeo(lat, lng) {
  if (!lat || !lng) return null
  try {
    const data = await fetchJSON(
      `https://commons.wikimedia.org/w/api.php?action=query` +
      `&list=geosearch&gsnamespace=6` +
      `&gscoord=${lat}|${lng}&gsradius=300&gslimit=8` +
      `&format=json`
    )

    const results = data?.query?.geosearch ?? []
    for (const item of results) {
      const title = item.title ?? ''
      if (WIKIMEDIA_REJECT.some(p => p.test(title))) continue

      const clean = title.replace(/^File:/i, '').replace(/ /g, '_')
      const imgUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(clean)}?width=800`

      return {
        imageUrl: imgUrl,
        source: 'wikimedia-geo',
        attribution: '© Wikimedia Commons',
        license: 'CC',
      }
    }
    return null
  } catch {
    return null
  }
}

// ── Main resolver ─────────────────────────────────────────────────────────────
/**
 * Resolves a real photo URL for a place using a multi-source waterfall.
 * All sources are free and return CC-licensed (no-watermark) images.
 *
 * @param {string} placeName - The place name (AI-generated, may have descriptive prefix)
 * @param {string} city - The city/destination context (e.g. "Goa")
 * @param {number|null} lat - Latitude from geocoding
 * @param {number|null} lng - Longitude from geocoding
 * @returns {Promise<string|null>} - Image URL or null (frontend shows category card)
 */
async function resolvePlaceImage(placeName, city = '', lat = null, lng = null) {
  const cacheKey = `${placeName.toLowerCase()}|${city.toLowerCase()}|${lat}|${lng}`
  const cached = cacheGet(cacheKey)
  if (cached !== undefined && cached !== null) return cached
  if (imageCache.has(cacheKey)) return null // Explicit null cached

  const cleanNames = extractCleanNames(placeName)

  // ── 1. Wikipedia Opensearch (most accurate for named landmarks) ───────────
  for (const name of cleanNames) {
    const result = await tryWikipedia(name, city)
    if (result) {
      console.log(`[PlaceImage] ✅ Wikipedia: "${name}" → ${result.imageUrl.slice(0, 60)}...`)
      cacheSet(cacheKey, result.imageUrl)
      return result.imageUrl
    }
  }

  // ── 2. Flickr geotagged (excellent for local/hidden spots) ────────────────
  const flickrResult = await tryFlickr(lat, lng, placeName)
  if (flickrResult) {
    console.log(`[PlaceImage] ✅ Flickr geo: "${placeName}" @ ${lat},${lng} → ${flickrResult.imageUrl.slice(0, 60)}...`)
    cacheSet(cacheKey, flickrResult.imageUrl)
    return flickrResult.imageUrl
  }

  // ── 3. Wikimedia Commons geosearch (area-level fallback) ──────────────────
  const geoResult = await tryWikimediaGeo(lat, lng)
  if (geoResult) {
    console.log(`[PlaceImage] ✅ Wikimedia geo: "${placeName}" → area photo`)
    cacheSet(cacheKey, geoResult.imageUrl)
    return geoResult.imageUrl
  }

  // ── 4. No image found — frontend shows premium category card ──────────────
  console.log(`[PlaceImage] ℹ️  No image found for "${placeName}" — using category card`)
  imageCache.set(cacheKey, null) // Cache the miss
  return null
}

module.exports = { resolvePlaceImage }
