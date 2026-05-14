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
  'https://images.unsplash.com/photo-1551882547-ff40c0d51928?w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
]

/**
 * Fetch a real photo URL from Unsplash for a given search term.
 * Returns null if the API is unavailable so callers can use fallbacks.
 */
async function fetchUnsplashImage(query, orientation = 'landscape') {
  if (!UNSPLASH_KEY) return null

  const cacheKey = generateCacheKey('img', { query, orientation })
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

    // Pick the result with the highest likes (most relevant/quality)
    const best = results.reduce((a, b) => (a.likes >= b.likes ? a : b))
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
async function enrichHotelsWithImages(hotels, destination) {
  let apiCallsLeft = 5 // allow one per hotel, up to 5
  return Promise.all(hotels.map(async (hotel, i) => {
    // Keep real provider images (booking.com, agoda CDN, etc.)
    if (hotel.image && (hotel.image.includes('bookingassets') || hotel.image.includes('agoda'))) {
      return hotel
    }

    // Use hotel name + destination for a unique, relevant query
    const hotelName = (hotel.name || '').replace(/hotel|resort|inn|suites?/gi, '').trim()
    const query = hotelName
      ? `${hotelName} ${destination} hotel room`
      : `${destination} luxury hotel interior`

    let img = null
    if (apiCallsLeft > 0) {
      apiCallsLeft--
      img = await fetchUnsplashImage(query)
    }
    // Fallback: use a different fallback image per hotel so they don't all look the same
    if (!img) img = FALLBACK_HOTEL_IMAGES[i % FALLBACK_HOTEL_IMAGES.length]
    return { ...hotel, image: img }
  }))
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
