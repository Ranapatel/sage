const axios = require('axios')
const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')

// ── In-memory cache (fast path, resets on restart) ──────────────────────────
const memCache = new Map()

// ── Global Nominatim rate limiter (one call every 1.5s, shared across all requests) ──
let nominatimBusy = false
const nominatimWaitQueue = []

function withNominatimSlot() {
  return new Promise(resolve => {
    nominatimWaitQueue.push(resolve)
    if (!nominatimBusy) drainNominatim()
  })
}

async function drainNominatim() {
  if (nominatimWaitQueue.length === 0) { nominatimBusy = false; return }
  nominatimBusy = true
  const next = nominatimWaitQueue.shift()
  next() // release the slot
  await new Promise(r => setTimeout(r, 1500)) // 1.5s between calls
  drainNominatim()
}

// ── Geocode via Nominatim ────────────────────────────────────────────────────
async function nominatimGeocode(placeName, cityContext = '') {
  const key = `nom|${placeName}|${cityContext}`.toLowerCase()
  if (memCache.has(key)) return memCache.get(key)

  // Try Redis cache (persists across nodemon restarts)
  try {
    const rKey = generateCacheKey('geo', { place: placeName, city: cityContext })
    const cached = await cacheGet(rKey)
    if (cached) { memCache.set(key, cached); return cached }
  } catch { /* Redis unavailable */ }

  await withNominatimSlot()

  const q = cityContext ? `${placeName}, ${cityContext}` : placeName
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q, format: 'json', limit: 1, addressdetails: 1 },
      headers: { 'User-Agent': 'TripSage-AI-Travel-OS/2.0 (tripsage.ai)' },
      timeout: 7000,
    })
    const hit = res.data?.[0]
    if (!hit) return null

    const result = {
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      placeId: hit.place_id?.toString(),
      formattedAddress: hit.display_name,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
      source: 'nominatim',
    }
    // Cache in memory + Redis (24h)
    memCache.set(key, result)
    try {
      const rKey = generateCacheKey('geo', { place: placeName, city: cityContext })
      await cacheSet(rKey, result, 86400)
    } catch { /* Redis unavailable */ }
    return result
  } catch (err) {
    if (err.response?.status === 429) {
      console.warn(`[Places] Rate limited for "${placeName}" — using AI coords`)
    } else {
      console.warn(`[Places] Nominatim failed for "${placeName}": ${err.message}`)
    }
    return null
  }
}

// ── Geocode via Google Places ────────────────────────────────────────────────
async function googleGeocode(placeName, cityContext = '') {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key || key === 'your_google_places_key') return null

  const cacheKey = `goog|${placeName}|${cityContext}`.toLowerCase()
  if (memCache.has(cacheKey)) return memCache.get(cacheKey)

  const query = cityContext ? `${placeName}, ${cityContext}` : placeName
  try {
    const res = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: { query, key },
      timeout: 5000,
    })
    const top = res.data?.results?.[0]
    if (!top) return null
    const result = {
      lat: top.geometry.location.lat,
      lng: top.geometry.location.lng,
      placeId: top.place_id,
      formattedAddress: top.formatted_address,
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${top.place_id}`,
      source: 'google_places',
      googlePhotos: top.photos ? top.photos.map(p => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${key}`) : []
    }
    memCache.set(cacheKey, result)
    return result
  } catch (err) {
    console.warn(`[Places/Google] Failed for "${placeName}": ${err.message}`)
    return null
  }
}

async function geocodePlace(placeName, cityContext = '') {
  const google = await googleGeocode(placeName, cityContext)
  if (google) return google
  return nominatimGeocode(placeName, cityContext)
}

async function getUnsplashImage(placeName, destination) {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return null

  const cacheKey = `unsplash|${placeName}|${destination}`.toLowerCase()
  if (memCache.has(cacheKey)) return memCache.get(cacheKey)

  try {
    const rKey = generateCacheKey('unsplash', { place: placeName, dest: destination })
    const cached = await cacheGet(rKey)
    if (cached) { memCache.set(cacheKey, cached); return cached }
  } catch { /* ignore */ }

  try {
    const q = encodeURIComponent(`${placeName} ${destination}`)
    const res = await axios.get(`https://api.unsplash.com/search/photos?query=${q}&per_page=3&client_id=${key}`, { timeout: 5000 })
    if (res.data?.results?.length > 0) {
      const urls = res.data.results.map(img => img.urls.regular)
      memCache.set(cacheKey, urls)
      try {
        const rKey = generateCacheKey('unsplash', { place: placeName, dest: destination })
        await cacheSet(rKey, urls, 86400 * 7)
      } catch { /* ignore */ }
      return urls
    }
  } catch (err) {
    console.warn(`[Unsplash] Failed for "${placeName}": ${err.message}`)
  }
  return null
}

async function enrichItineraryWithRealCoords(itinerary, destination) {
  const allPlaces = itinerary.flatMap(d => d.places)
  const total = allPlaces.length
  const hasGoogle = process.env.GOOGLE_PLACES_API_KEY &&
    process.env.GOOGLE_PLACES_API_KEY !== 'your_google_places_key'

  console.log(`[Places] Enriching ${total} places for "${destination}"...`)

  const enriched = await Promise.all(
    itinerary.map(async (day) => {
      const enrichedPlaces = await Promise.all(
        day.places.map(async (place) => {
          let geo = null
          if (hasGoogle) {
            geo = await geocodePlace(place.name, destination)
          }
          const images = await getUnsplashImage(place.name, destination)
          const combinedImages = []
          if (geo && geo.googlePhotos && geo.googlePhotos.length > 0) {
            combinedImages.push(...geo.googlePhotos)
          }
          if (images && images.length > 0) {
            combinedImages.push(...images)
          }

          return {
            ...place,
            coordinates: geo ? [geo.lat, geo.lng] : place.coordinates,
            placeId: geo?.placeId,
            formattedAddress: geo?.formattedAddress,
            googleMapsUrl: geo?.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ', ' + destination)}`,
            coordSource: geo?.source || 'ai_estimated',
            images: combinedImages,
          }
        })
      )
      return { ...day, places: enrichedPlaces }
    })
  )

  const realGeo = enriched.flatMap(d => d.places).filter(p => p.coordSource !== 'ai_estimated').length
  const realImg = enriched.flatMap(d => d.places).filter(p => p.images && p.images.length > 0).length
  console.log(`[Places] ✅ ${realGeo}/${total} geocoded | ${realImg}/${total} images fetched`)
  return enriched
}

async function searchPlace(query, city = '') {
  return geocodePlace(query, city)
}

module.exports = { geocodePlace, enrichItineraryWithRealCoords, searchPlace }
