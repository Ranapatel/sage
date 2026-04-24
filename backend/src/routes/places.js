const express = require('express')
const router = express.Router()
const axios = require('axios')

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

/**
 * GET /api/places/autocomplete?query=goa
 *
 * Uses Nominatim (OpenStreetMap) — 100% free, no subscription needed.
 * Falls back to Google Geocoding if GOOGLE_PLACES_API_KEY is set.
 */
router.get('/autocomplete', async (req, res) => {
  const { query } = req.query
  if (!query || query.length < 2) {
    return res.status(400).json({ success: false, error: 'Query must be at least 2 characters' })
  }

  // ── Try Nominatim first (always free, always works) ──
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 8,
        featuretype: 'city',
        // Prefer cities / populated places
        extratags: 1,
      },
      headers: {
        // Nominatim requires a User-Agent
        'User-Agent': 'TripSage/2.0 (travel planning app)',
        'Accept-Language': 'en',
      },
      timeout: 6000,
    })

    const raw = response.data || []

    // Filter to only city / town / village level results and deduplicate
    const seen = new Set()
    const locations = raw
      .filter((r) => {
        const t = r.type || r.class || ''
        return (
          ['city', 'town', 'village', 'hamlet', 'suburb', 'administrative', 'municipality'].includes(t) ||
          r.class === 'place' ||
          r.class === 'boundary'
        )
      })
      .map((r) => {
        const addr = r.address || {}
        const cityName =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.county ||
          r.name ||
          r.display_name.split(',')[0]
        const country = addr.country || ''
        const state = addr.state || ''
        const key = `${cityName.toLowerCase()}-${country.toLowerCase()}`
        return { r, cityName, country, state, key }
      })
      .filter(({ key }) => {
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 7)
      .map(({ r, cityName, country, state }, i) => ({
        id: r.place_id?.toString() || `nom_${i}`,
        name: cityName,
        city: cityName,
        country,
        state,
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
        displayName: r.display_name,
      }))

    if (locations.length > 0) {
      return res.json({ success: true, data: locations, source: 'nominatim' })
    }

    // If Nominatim returned nothing, fall through to Google fallback
  } catch (err) {
    console.error('[Places] Nominatim error:', err.message)
  }

  // ── Google Geocoding fallback (if key is set) ──
  if (GOOGLE_PLACES_API_KEY) {
    try {
      const gRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: query,
          key: GOOGLE_PLACES_API_KEY,
          result_type: 'locality|administrative_area_level_1',
        },
        timeout: 6000,
      })

      const results = gRes.data?.results || []
      const seen = new Set()
      const locations = results
        .slice(0, 7)
        .map((r, i) => {
          const addr = r.address_components || []
          const cityComp = addr.find((a) => a.types.includes('locality'))
          const countryComp = addr.find((a) => a.types.includes('country'))
          const cityName = cityComp?.long_name || r.formatted_address.split(',')[0]
          const country = countryComp?.long_name || ''
          const key = `${cityName.toLowerCase()}-${country.toLowerCase()}`
          if (seen.has(key)) return null
          seen.add(key)
          return {
            id: r.place_id || `g_${i}`,
            name: cityName,
            city: cityName,
            country,
            latitude: r.geometry.location.lat,
            longitude: r.geometry.location.lng,
          }
        })
        .filter(Boolean)

      return res.json({ success: true, data: locations, source: 'google' })
    } catch (err) {
      console.error('[Places] Google geocode fallback error:', err.message)
    }
  }

  return res.status(500).json({ success: false, error: 'Unable to fetch suggestions' })
})

/**
 * GET /api/places/ip-location
 *
 * Uses ipapi.co — free tier (1000 req/day), no API key needed.
 */
router.get('/ip-location', async (req, res) => {
  // Forward the real client IP if behind a proxy
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress

  try {
    // ipapi.co free endpoint — no key required
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
        city: d.city,
        country: d.country_name,
        country_code: d.country_code,
        region: d.region,
        latitude: d.latitude,
        longitude: d.longitude,
        timezone: d.timezone,
        currency: d.currency,
      },
    })
  } catch (err) {
    console.error('[Places] IP location error:', err.message)
    // Return a silent fallback — don't block the UI
    return res.json({
      success: false,
      data: null,
      error: 'Unable to detect location',
    })
  }
})

module.exports = router
