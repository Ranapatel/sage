const express = require('express')
const router = express.Router()
const axios = require('axios')

// Google Places is served via google-map-places.p.rapidapi.com (RAPIDAPI_KEY)
const GROQ_API_KEY = process.env.GROQ_API_KEY
const RAPIDAPI_HOST_PLACES = process.env.RAPIDAPI_HOST_PLACES || 'google-map-places.p.rapidapi.com'

/**
 * GET /api/places/autocomplete?query=goa
 *
 * Three-tier autocomplete (ordered by reliability):
 *   1. RapidAPI Google Places Autocomplete — fastest, native partial matching
 *   2. Groq AI — fallback: intent-aware partial matching ("mum"→Mumbai)
 *   3. Nominatim (OpenStreetMap) — free fallback, works for complete names
 */
router.get('/autocomplete', async (req, res) => {
  const { query } = req.query
  if (!query || query.length < 2) {
    return res.status(400).json({ success: false, error: 'Query must be at least 2 characters' })
  }

  // ── 1. RapidAPI Google Places Autocomplete (Fastest, built for this) ──────
  const rapidApiKey = process.env.RAPIDAPI_KEY
  if (rapidApiKey) {
    try {
      const gRes = await axios.get(`https://${RAPIDAPI_HOST_PLACES}/maps/api/place/autocomplete/json`, {
        params: {
          input: query,
          types: '(cities)',
          language: 'en',
        },
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST_PLACES,
          'x-rapidapi-key': rapidApiKey
        },
        timeout: 6000,
      })

      const predictions = gRes.data?.predictions || []
      const seen = new Set()
      const locations = predictions
        .slice(0, 7)
        .map((p, i) => {
          const mainText = p.structured_formatting?.main_text || p.description.split(',')[0]
          const parts = p.description.split(',')
          const country = parts[parts.length - 1]?.trim() || ''
          const state = parts.length > 2 ? parts[parts.length - 2]?.trim() : ''
          const key = `${mainText.toLowerCase()}-${country.toLowerCase()}`
          if (seen.has(key)) return null
          seen.add(key)
          return {
            id: p.place_id || `gp_${i}`,
            name: mainText,
            city: mainText,
            country,
            state,
            displayName: p.description,
          }
        })
        .filter(Boolean)

      if (locations.length > 0) {
        return res.json({ success: true, data: locations, source: 'rapidapi_google_places' })
      }
    } catch (err) {
      console.error('[Places] RapidAPI Google Places error:', err.message)
    }
  }

  // ── 2. Groq AI (Fallback — best for partial/intent-based queries) ─────────
  if (GROQ_API_KEY) {
    try {
      const groqRes = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are a precise city autocomplete API. Rules: (1) Return ONLY real cities, towns, or administrative regions — NO airports, landmarks, parks, theme parks, or fictional places. (2) Only include a city in a country if it genuinely exists there. (3) Return a raw JSON array with no explanation, markdown, or code fences.',
            },
            {
              role: 'user',
              content: `List up to 7 real cities or regions whose name starts with or closely matches "${query}". Prioritize the most globally popular travel destinations first. Return a JSON array: [{"id":"1","name":"City Name","city":"City Name","country":"Country Name","state":"State or Region"}]. No airports, no landmarks, no made-up locations.`,
            },
          ],
          temperature: 0.1,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      )

      const content = groqRes.data?.choices?.[0]?.message?.content || ''
      const jsonMatch = content.match(/\[[\s\S]*?\]/)
      if (jsonMatch) {
        const raw = JSON.parse(jsonMatch[0])
        if (Array.isArray(raw) && raw.length > 0) {
          // Deduplicate by city+country and assign stable IDs
          const seen = new Set()
          const aiLocations = raw
            .filter((item) => {
              const key = `${(item.name || item.city || '').toLowerCase()}-${(item.country || '').toLowerCase()}`
              if (!key || seen.has(key)) return false
              seen.add(key)
              return true
            })
            .slice(0, 7)
            .map((item, i) => ({
              id: item.id || `ai_${i}`,
              name: item.name || item.city || '',
              city: item.city || item.name || '',
              country: item.country || '',
              state: item.state || '',
            }))
          if (aiLocations.length > 0) {
            return res.json({ success: true, data: aiLocations, source: 'ai' })
          }
        }
      }
    } catch (err) {
      console.error('[Places] Groq AI error:', err.message)
    }
  }


  // ── 3. Nominatim / OpenStreetMap (free, no key) ───────────────────────────
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 10,
        extratags: 1,
      },
      headers: {
        'User-Agent': 'TripSage/2.0 (travel planning app)',
        'Accept-Language': 'en',
      },
      timeout: 6000,
    })

    const raw = response.data || []
    const seen = new Set()
    const locations = raw
      .map((r) => {
        const addr = r.address || {}
        // Prefer the most specific name; fall back to state for destinations like Goa, Kerala
        const cityName =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.county ||
          addr.state ||
          r.name ||
          r.display_name.split(',')[0]
        const country = addr.country || ''
        const state = addr.state || ''
        if (!cityName) return null
        const key = `${cityName.toLowerCase()}-${country.toLowerCase()}`
        return { r, cityName, country, state, key }
      })
      .filter((item) => {
        if (!item) return false
        if (seen.has(item.key)) return false
        seen.add(item.key)
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
  } catch (err) {
    console.error('[Places] Nominatim error:', err.message)
  }

  return res.status(500).json({ success: false, error: 'Unable to fetch location suggestions' })
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
