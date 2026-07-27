const express = require('express')
const router = express.Router()
const axios = require('axios')

// ── Built-in city list — ultimate fallback, always works ─────────────────────
const CITIES = [
  { name: 'Hyderabad', country: 'India', lat: 17.385, lon: 78.487 },
  { name: 'Mumbai', country: 'India', lat: 19.076, lon: 72.877 },
  { name: 'Delhi', country: 'India', lat: 28.614, lon: 77.209 },
  { name: 'Bengaluru', country: 'India', lat: 12.972, lon: 77.594, aliases: ['bangalore'] },
  { name: 'Chennai', country: 'India', lat: 13.083, lon: 80.270, aliases: ['madras'] },
  { name: 'Kolkata', country: 'India', lat: 22.573, lon: 88.364, aliases: ['calcutta'] },
  { name: 'Pune', country: 'India', lat: 18.520, lon: 73.856 },
  { name: 'Goa', country: 'India', lat: 15.300, lon: 74.124 },
  { name: 'Jaipur', country: 'India', lat: 26.912, lon: 75.789, aliases: ['rajasthan'] },
  { name: 'Kochi', country: 'India', lat: 9.931, lon: 76.267, aliases: ['kerala', 'keral', 'cochin'] },
  { name: 'Agra', country: 'India', lat: 27.176, lon: 78.008 },
  { name: 'Varanasi', country: 'India', lat: 25.316, lon: 82.973, aliases: ['banaras', 'benaras', 'kashi'] },
  { name: 'Udaipur', country: 'India', lat: 24.585, lon: 73.712 },
  { name: 'Manali', country: 'India', lat: 32.241, lon: 77.186, aliases: ['himachal'] },
  { name: 'Shimla', country: 'India', lat: 31.105, lon: 77.173 },
  { name: 'Darjeeling', country: 'India', lat: 27.041, lon: 88.263 },
  { name: 'Amritsar', country: 'India', lat: 31.634, lon: 74.872, aliases: ['punjab'] },
  { name: 'Mysuru', country: 'India', lat: 12.296, lon: 76.639, aliases: ['mysore', 'karnataka'] },
  { name: 'Srinagar', country: 'India', lat: 34.082, lon: 74.798, aliases: ['kashmir'] },
  { name: 'Rishikesh', country: 'India', lat: 30.087, lon: 78.268, aliases: ['uttarakhand'] },
  { name: 'Ooty', country: 'India', lat: 11.413, lon: 76.695, aliases: ['tamil nadu'] },
  { name: 'Visakhapatnam', country: 'India', lat: 17.686, lon: 83.218, aliases: ['vizag', 'andhra pradesh'] },
  { name: 'Coimbatore', country: 'India', lat: 11.017, lon: 76.955 },
  { name: 'Bhopal', country: 'India', lat: 23.259, lon: 77.413, aliases: ['madhya pradesh'] },
  { name: 'Indore', country: 'India', lat: 22.719, lon: 75.857 },
  { name: 'Chandigarh', country: 'India', lat: 30.733, lon: 76.779 },
  { name: 'Nagpur', country: 'India', lat: 21.145, lon: 79.082 },
  { name: 'Lucknow', country: 'India', lat: 26.850, lon: 80.949, aliases: ['uttar pradesh'] },
  { name: 'Patna', country: 'India', lat: 25.594, lon: 85.138, aliases: ['bihar'] },
  { name: 'Leh', country: 'India', lat: 34.153, lon: 77.577, aliases: ['ladakh', 'leh ladakh'] },
  { name: 'Gangtok', country: 'India', lat: 27.329, lon: 88.612, aliases: ['sikkim'] },
  { name: 'Shillong', country: 'India', lat: 25.578, lon: 91.883, aliases: ['meghalaya'] },
  { name: 'Thiruvananthapuram', country: 'India', lat: 8.525, lon: 76.936, aliases: ['trivandrum'] },
  { name: 'Ahmedabad', country: 'India', lat: 23.023, lon: 72.571, aliases: ['gujarat'] },
  { name: 'Jodhpur', country: 'India', lat: 26.293, lon: 73.016 },
  { name: 'Dehradun', country: 'India', lat: 30.317, lon: 78.032 },
  { name: 'Madurai', country: 'India', lat: 9.925, lon: 78.120 },
  { name: 'Pondicherry', country: 'India', lat: 11.934, lon: 79.830, aliases: ['puducherry'] },
  { name: 'Raipur', country: 'India', lat: 21.251, lon: 81.629, aliases: ['chhattisgarh'] },
  { name: 'Ranchi', country: 'India', lat: 23.344, lon: 85.310, aliases: ['jharkhand'] },
  { name: 'Guwahati', country: 'India', lat: 26.145, lon: 91.736, aliases: ['assam'] },
  { name: 'Bali', country: 'Indonesia', lat: -8.340, lon: 115.092 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.756, lon: 100.502 },
  { name: 'Phuket', country: 'Thailand', lat: 7.878, lon: 98.398 },
  { name: 'Singapore', country: 'Singapore', lat: 1.352, lon: 103.820 },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.140, lon: 101.687 },
  { name: 'Dubai', country: 'UAE', lat: 25.205, lon: 55.271 },
  { name: 'Abu Dhabi', country: 'UAE', lat: 24.453, lon: 54.377 },
  { name: 'London', country: 'United Kingdom', lat: 51.507, lon: -0.128 },
  { name: 'Paris', country: 'France', lat: 48.857, lon: 2.352 },
  { name: 'Barcelona', country: 'Spain', lat: 41.385, lon: 2.173 },
  { name: 'Rome', country: 'Italy', lat: 41.902, lon: 12.496 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.374, lon: 4.890 },
  { name: 'New York', country: 'USA', lat: 40.713, lon: -74.006 },
  { name: 'Los Angeles', country: 'USA', lat: 34.052, lon: -118.244 },
  { name: 'San Francisco', country: 'USA', lat: 37.775, lon: -122.419 },
  { name: 'Tokyo', country: 'Japan', lat: 35.689, lon: 139.692 },
  { name: 'Seoul', country: 'South Korea', lat: 37.566, lon: 126.978 },
  { name: 'Sydney', country: 'Australia', lat: -33.869, lon: 151.209 },
  { name: 'Melbourne', country: 'Australia', lat: -37.813, lon: 144.963 },
  { name: 'Maldives', country: 'Maldives', lat: 3.202, lon: 73.220 },
  { name: 'Colombo', country: 'Sri Lanka', lat: 6.927, lon: 79.862 },
  { name: 'Kathmandu', country: 'Nepal', lat: 27.717, lon: 85.324 },
  { name: 'Hong Kong', country: 'China', lat: 22.302, lon: 114.177 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.015, lon: 28.980 },
  { name: 'Cairo', country: 'Egypt', lat: 30.045, lon: 31.236 },
  { name: 'Cape Town', country: 'South Africa', lat: -33.925, lon: 18.424 },
  { name: 'Nairobi', country: 'Kenya', lat: -1.286, lon: 36.818 },
  { name: 'Toronto', country: 'Canada', lat: 43.651, lon: -79.347 },
  { name: 'Vancouver', country: 'Canada', lat: 49.283, lon: -123.121 },
  { name: 'Hanoi', country: 'Vietnam', lat: 21.029, lon: 105.852 },
  { name: 'Zurich', country: 'Switzerland', lat: 47.377, lon: 8.542 },
  { name: 'Prague', country: 'Czech Republic', lat: 50.076, lon: 14.438 },
  { name: 'Athens', country: 'Greece', lat: 37.984, lon: 23.728 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.722, lon: -9.139 },
  { name: 'Berlin', country: 'Germany', lat: 52.520, lon: 13.405 },
  { name: 'Vienna', country: 'Austria', lat: 48.208, lon: 16.374 },
]

const EXCLUDE_KEYWORDS = [
  'sea', 'ocean', 'lake', 'mountain', 'river', 'gulf', 'bay', 'desert', 'forest', 'park',
  'islands', 'island', 'region', 'province', 'district', 'county', 'state', 'hills', 'valley',
  'canal', 'peak', 'canyon', 'peninsula', 'cape', 'reef', 'beach', 'plain', 'plateau', 'volcano'
]

function isCityOrAirport(name, displayName) {
  const n = (name || '').toLowerCase()
  const d = (displayName || '').toLowerCase()
  return !EXCLUDE_KEYWORDS.some(kw => n.includes(kw) || d.includes(kw))
}

function cityFallback(query) {
  const q = query.toLowerCase()
  return CITIES
    .filter(c => {
      const nameMatch = c.name.toLowerCase().includes(q)
      const countryMatch = c.country.toLowerCase().includes(q)
      const aliasMatch = (c.aliases || []).some(a => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()))
      return (nameMatch || countryMatch || aliasMatch) && isCityOrAirport(c.name, c.country)
    })
    .slice(0, 6)
    .map((c, i) => ({
      id: `builtin_${i}`,
      name: `${c.name}, ${c.country}`,
      city: c.name,
      country: c.country,
      state: '',
      displayName: `${c.name}, ${c.country}`,
      description: `${c.name}, ${c.country}`,
      latitude: c.lat,
      longitude: c.lon,
      source: 'builtin',
    }))
}

/**
 * GET /api/places/autocomplete?query=goa
 * Priority: 1. Built-in city list (instant, accurate for popular destinations)
 *           2. Nominatim (supplements with international cities not in builtin)
 *           3. Photon (fallback if Nominatim fails)
 */

router.get('/autocomplete', async (req, res) => {
  // Prevent aggressive browser caching and 304 Not Modified responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.setHeader('Surrogate-Control', 'no-store')
  res.set('ETag', false)

  const rawQuery = (req.query.query || '').trim()
  if (!rawQuery || rawQuery.length < 2) {
    return res.json({ success: true, data: cityFallback(rawQuery || 'a'), source: 'builtin' })
  }

  // Normalize: strip country part — "goa, indi" → "goa", "Paris, France" → "Paris"
  const query = rawQuery.split(',')[0].trim()
  if (query.length < 2) {
    return res.json({ success: true, data: cityFallback(query || 'a'), source: 'builtin' })
  }

  // ── 1. Built-in city list — instant, always accurate ─────────────────────
  // Run FIRST so popular destinations like "Goa, India" always anchor results.
  // (OSM classifies Goa as a "state", not a "city", so Nominatim filters it out.)
  const builtinResults = cityFallback(query)
  const builtinCityNames = new Set(builtinResults.map(r => r.name.toLowerCase()))
  const builtinCountries = new Set(builtinResults.map(r => r.country.toLowerCase()))

  // ── 2. Nominatim + Photon — run in PARALLEL to halve response time ────────
  const nominatimPromise = axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q: query, format: 'json', addressdetails: 1,
      limit: 10, 'accept-language': 'en',
      featuretype: 'city',
    },
    headers: {
      'User-Agent': 'TripSage/2.0 (travel planning; contact: rana@tripsage.in)',
      'Accept-Language': 'en',
    },
    timeout: 3000,
  }).catch(err => {
    console.warn('[Places] Nominatim error:', err.message)
    return { data: [] }
  })

  const photonPromise = axios.get('https://photon.komoot.io/api/', {
    params: { q: query, limit: 12, lang: 'en' },
    timeout: 3000,
    headers: { 'User-Agent': 'TripSage/2.0' },
  }).catch(err => {
    console.warn('[Places] Photon error:', err.message)
    return { data: { features: [] } }
  })

  // If builtins already have good results, return immediately + fire API in background for cache warming
  if (builtinResults.length >= 3) {
    return res.json({ success: true, data: builtinResults, source: 'builtin' })
  }

  const [nominatimRes, photonRes] = await Promise.all([nominatimPromise, photonPromise])

  // ── Parse Nominatim results ──────────────────────────────────────────────
  let nominatimResults = []
  try {
    const raw = nominatimRes.data || []
    const seen = new Set()

    nominatimResults = raw
      .filter(r => {
        const cls = r.class || '', type = r.type || ''
        const imp = r.importance || 0
        if (imp < 0.45) return false
        const name = (r.name || '').toLowerCase()
        const country = (r.address?.country || '').toLowerCase()
        if (builtinCityNames.has(name) || builtinCountries.has(country)) return false
        if (!isCityOrAirport(r.name || r.display_name.split(',')[0], r.display_name)) return false
        return (
          cls === 'place' ||
          type === 'city' || type === 'town' ||
          type === 'village' || type === 'municipality'
        )
      })
      .sort((a, b) => (b.importance || 0) - (a.importance || 0))
      .map((r, i) => {
        const addr = r.address || {}
        const cityName = r.name || addr.city || addr.town || r.display_name.split(',')[0].trim()
        const country = addr.country || ''
        const displayName = country ? `${cityName}, ${country}` : cityName
        if (seen.has(displayName.toLowerCase())) return null
        seen.add(displayName.toLowerCase())
        return {
          id: r.place_id?.toString() || `nom_${i}`,
          name: displayName, city: cityName, country, state: '',
          displayName, description: displayName,
          latitude: parseFloat(r.lat), longitude: parseFloat(r.lon),
          source: 'nominatim',
        }
      })
      .filter(Boolean)
      .slice(0, 3)
  } catch (err) {
    // Already caught above
  }

  // ── Parse Photon results ─────────────────────────────────────────────────
  let photonResults = []
  try {
    const features = photonRes.data?.features || []
    const seen = new Set(builtinCityNames) // Avoid duplicating builtins
    photonResults = features
      .filter(f => {
        const p = f.properties || {}
        const type = p.type || ''
        if (!['city', 'town', 'village', 'municipality'].includes(type)) return false
        const name = p.name || p.city || ''
        const country = p.country || ''
        return isCityOrAirport(name, `${name}, ${country}`)
      })
      .map((f, i) => {
        const p = f.properties || {}
        const cityName = p.name || p.city || ''
        const country = p.country || ''
        if (!cityName) return null
        const displayName = country ? `${cityName}, ${country}` : cityName
        if (seen.has(displayName.toLowerCase())) return null
        seen.add(displayName.toLowerCase())
        return {
          id: `photon_${i}`,
          name: displayName, city: cityName, country, state: '',
          displayName, description: displayName,
          latitude: f.geometry?.coordinates?.[1] || 0,
          longitude: f.geometry?.coordinates?.[0] || 0,
          source: 'photon',
        }
      })
      .filter(Boolean)
      .slice(0, 3)
  } catch (err) {
    // Already caught above
  }

  // ── Combine: builtins first, then Nominatim, then Photon ──────────────────
  const combined = [...builtinResults, ...nominatimResults, ...photonResults].slice(0, 6)
  if (combined.length > 0) {
    return res.json({ success: true, data: combined, source: 'combined' })
  }

  // Return empty array instead of 404 to prevent frontend console errors
  return res.json({ success: true, data: [] })
})



/**
 * GET /api/places/ip-location
 */
router.get('/ip-location', async (req, res) => {
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress

  try {
    const url = clientIp && !clientIp.startsWith('127') && !clientIp.startsWith('::')
      ? `https://ipapi.co/${clientIp}/json/`
      : 'https://ipapi.co/json/'

    const response = await axios.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'TripSage/2.0' },
    })
    const d = response.data
    if (d.error) throw new Error(d.reason || 'ipapi error')

    return res.json({
      success: true,
      data: {
        city: d.city, country: d.country_name, country_code: d.country_code,
        region: d.region, latitude: d.latitude, longitude: d.longitude,
        timezone: d.timezone, currency: d.currency,
      },
    })
  } catch (err) {
    console.error('[Places] IP location error:', err.message)
    return res.json({ success: false, data: null, error: 'Unable to detect location' })
  }
})

module.exports = router
