/**
 * imageService.js
 * Fetches real destination/travel images from Unsplash.
 * Falls back to curated static URLs if the API key is missing or the call fails.
 */

const axios = require('axios')
const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY

// Curated high-quality travel fallback images (Unsplash free CDN — no auth needed)
const FALLBACK_FLIGHT_IMAGES = [
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
  'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80',
  'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&q=80',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80',
  'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800&q=80',
]

const FALLBACK_HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
]

/**
 * Fetch a real photo URL from Unsplash for a given search term.
 * Returns null if the API is unavailable so callers can use fallbacks.
 */
async function fetchUnsplashImage(query, orientation = 'landscape') {
  if (!UNSPLASH_KEY) return null

  const cacheKey = generateCacheKey('img_v2', { query, orientation })
  const cached = await cacheGet(cacheKey)
  if (cached) return cached

  try {
    const res = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query,
        per_page: 5,
        orientation,
        order_by: 'relevant',
        content_filter: 'high',
      },
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
      timeout: 5000,
    })

    const results = res.data?.results || []
    if (results.length === 0) return null

    // Pick a random image from the top 5 results to ensure variety across hotels in the same destination
    const randomIndex = Math.floor(Math.random() * results.length)
    const best = results[randomIndex]
    const url = `${best.urls.raw}&w=800&q=80&auto=format&fit=crop`

    // Cache for 24 hours — images don't change
    await cacheSet(cacheKey, url, 86400)
    return url
  } catch (err) {
    console.warn(`[Images] Unsplash fetch failed for "${query}":`, err.message)
    return null
  }
}

/**
 * Get a destination image for use in hotel/flight cards.
 * Returns a working URL — never null.
 */
async function getDestinationImage(destination, type = 'hotel', index = 0) {
  const query = type === 'hotel'
    ? `${destination} luxury hotel`
    : `${destination} airport travel`

  const real = await fetchUnsplashImage(query)
  if (real) return real

  const fallbacks = type === 'hotel' ? FALLBACK_HOTEL_IMAGES : FALLBACK_FLIGHT_IMAGES
  return fallbacks[index % fallbacks.length]
}

/**
 * Batch-enrich an array of hotel objects with real Unsplash images.
 * Replaces static/empty images in-place. Runs at most 3 API calls
 * (rest uses cached or fallbacks) to avoid hitting rate limits.
 */
function getHotelbedsFallbackImage(identifier) {
  let hash = 0
  const str = String(identifier || 'default')
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const fallbackIndex = Math.abs(hash) % 4 + 1 // 1 to 4
  const relPath = `00/004200/004200a_hb_ro_00${fallbackIndex}.jpg`
  return {
    image: `https://photos.hotelbeds.com/giata/bigger/${relPath}`,
    image_path: relPath,
    gallery_paths: [relPath],
    images: [`https://photos.hotelbeds.com/giata/bigger/${relPath}`]
  }
}

async function enrichHotelsWithImages(hotels, destination) {
  // Enforce Hotelbeds-only images: do NOT query or use Unsplash for hotels.
  // We also strip out any external/Unsplash URLs that may have slipped into hotel.image.
  return hotels.map(hotel => {
    let img = hotel.image
    if (img) {
      const isAbsolute = img.startsWith('http://') || img.startsWith('https://')
      const isRealProvider = img.includes('hotelbeds') || img.includes('bookingassets') || img.includes('agoda')
      if (isAbsolute && !isRealProvider) {
        img = null
      }
    }

    if (!img) {
      const fallbacks = getHotelbedsFallbackImage(hotel.id || hotel.name)
      return {
        ...hotel,
        image: fallbacks.image,
        image_path: hotel.image_path || fallbacks.image_path,
        gallery_paths: (hotel.gallery_paths && hotel.gallery_paths.length > 0) ? hotel.gallery_paths : fallbacks.gallery_paths,
        images: (hotel.images && hotel.images.length > 0) ? hotel.images : fallbacks.images
      }
    }
    return hotel
  })
}

/**
 * Batch-enrich flight cards with real destination images.
 */
async function enrichFlightsWithImages(flights, destination) {
  if (!destination) return flights
  // One real image fetch for all flights (they share the destination)
  const img = await fetchUnsplashImage(`${destination} travel`)
  if (!img) return flights

  return flights.map((f, i) => ({
    ...f,
    image: f.image?.includes('ht_') || !f.image ? img : f.image,
  }))
}

module.exports = {
  fetchUnsplashImage,
  getDestinationImage,
  enrichHotelsWithImages,
  enrichFlightsWithImages,
}
