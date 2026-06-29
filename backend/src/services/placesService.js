const axios = require('axios')
const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')

// ── In-memory cache (fast path, resets on restart) ──────────────────────────
const memCache = new Map()

// Flag to bypass Google geocoding if we hit the daily quota limit (stops redundant 429 retries)
let googlePlacesQuotaExceeded = false

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

// ── Geocode via RapidAPI Google Places ───────────────────────────────────────
async function googleGeocode(placeName, cityContext = '', attempt = 1) {
  const rapidKey = process.env.RAPIDAPI_KEY
  const host = process.env.RAPIDAPI_HOST_PLACES || 'google-map-places.p.rapidapi.com'
  
  if (!rapidKey || rapidKey === 'your_rapidapi_key') return null
  if (googlePlacesQuotaExceeded) return null

  const cacheKey = `goog|${placeName}|${cityContext}`.toLowerCase()
  if (memCache.has(cacheKey)) return memCache.get(cacheKey)

  // Try Redis cache (persists across nodemon restarts)
  try {
    const rKey = generateCacheKey('goog_geo', { place: placeName, city: cityContext })
    const cached = await cacheGet(rKey)
    if (cached) { memCache.set(cacheKey, cached); return cached }
  } catch { /* Redis unavailable */ }

  const query = cityContext ? `${placeName}, ${cityContext}` : placeName
  try {
    const res = await axios.get(`https://${host}/maps/api/place/textsearch/json`, {
      params: { query },
      headers: {
        'x-rapidapi-key': rapidKey,
        'x-rapidapi-host': host
      },
      timeout: 7000,
    })
    const top = res.data?.results?.[0]
    if (!top) return null
    const result = {
      lat: top.geometry.location.lat,
      lng: top.geometry.location.lng,
      placeId: top.place_id,
      formattedAddress: top.formatted_address,
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${top.place_id}`,
      source: 'google_places_rapid',
    }
    memCache.set(cacheKey, result)
    try {
      const rKey = generateCacheKey('goog_geo', { place: placeName, city: cityContext })
      await cacheSet(rKey, result, 86400 * 30) // Cache Google Place queries for 30 days
    } catch { /* Redis unavailable */ }
    return result
  } catch (err) {
    const errorMsg = err.response?.data?.message || ''
    const isQuotaExceeded = errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('exceeded')
    
    if (isQuotaExceeded) {
      console.warn(`[Places/Rapid] Quota exceeded for RapidAPI Google Places. Disabling Google geocoding for this session.`)
      googlePlacesQuotaExceeded = true
      return null
    }

    if (err.response?.status === 429 && attempt <= 3) {
      const delay = attempt * 1000 // 1s, 2s, 3s
      console.warn(`[Places/Rapid] Rate limited (429) for "${placeName}" — retrying in ${delay}ms (Attempt ${attempt}/3)...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return googleGeocode(placeName, cityContext, attempt + 1)
    }
    console.warn(`[Places/Rapid] Failed for "${placeName}": ${err.message}`)
    return null
  }
}

// ── Geocode via Photon ────────────────────────────────────────────────────────
async function photonGeocode(placeName, cityContext = '') {
  const key = `photon|${placeName}|${cityContext}`.toLowerCase()
  if (memCache.has(key)) return memCache.get(key)

  // Try Redis cache
  try {
    const rKey = generateCacheKey('photon_geo', { place: placeName, city: cityContext })
    const cached = await cacheGet(rKey)
    if (cached) { memCache.set(key, cached); return cached }
  } catch { /* Redis unavailable */ }

  const q = cityContext ? `${placeName}, ${cityContext}` : placeName
  try {
    const res = await axios.get('https://photon.komoot.io/api/', {
      params: { q: q, limit: 1 },
      headers: { 'User-Agent': 'TripSage/2.0' },
      timeout: 5000,
    })
    const hit = res.data?.features?.[0]
    if (!hit) return null

    const result = {
      lat: hit.geometry.coordinates[1],
      lng: hit.geometry.coordinates[0],
      placeId: hit.properties.osm_id?.toString() || Math.random().toString(36).slice(2),
      formattedAddress: [
        hit.properties.name,
        hit.properties.city || hit.properties.state,
        hit.properties.country
      ].filter(Boolean).join(', '),
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
      source: 'photon',
    }
    memCache.set(key, result)
    try {
      const rKey = generateCacheKey('photon_geo', { place: placeName, city: cityContext })
      await cacheSet(rKey, result, 86400 * 30) // 30 days
    } catch { /* Redis unavailable */ }
    return result
  } catch (err) {
    console.warn(`[Places] Photon failed for "${placeName}": ${err.message}`)
    return null
  }
}

async function geocodePlace(placeName, cityContext = '') {
  const google = await googleGeocode(placeName, cityContext)
  if (google) return google
  
  const photon = await photonGeocode(placeName, cityContext)
  if (photon) return photon

  return nominatimGeocode(placeName, cityContext)
}

async function enrichItineraryWithRealCoords(itinerary, destination) {
  const allPlaces = itinerary.flatMap(d => d.places)
  const total = allPlaces.length
  const hasGoogle = process.env.GOOGLE_PLACES_API_KEY &&
    process.env.GOOGLE_PLACES_API_KEY !== 'your_google_places_key'

  console.log(`[Places] Geocoding ${total} places for "${destination}" via ${hasGoogle ? 'Google' : 'Nominatim'}...`)

  const enriched = []
  for (const day of itinerary) {
    const enrichedPlaces = []
    for (const place of day.places) {
      const geo = await geocodePlace(place.name, destination)
      enrichedPlaces.push(geo ? {
        ...place,
        coordinates: [geo.lat, geo.lng],
        placeId: geo.placeId,
        formattedAddress: geo.formattedAddress,
        googleMapsUrl: geo.googleMapsUrl,
        coordSource: geo.source,
      } : { ...place, coordSource: 'ai_estimated' })
    }
    enriched.push({ ...day, places: enrichedPlaces })
  }

  const real = enriched.flatMap(d => d.places).filter(p => p.coordSource !== 'ai_estimated').length
  console.log(`[Places] ✅ ${real}/${total} places geocoded`)
  return enriched
}

async function searchPlace(query, city = '') {
  return geocodePlace(query, city)
}

module.exports = { geocodePlace, enrichItineraryWithRealCoords, searchPlace }
