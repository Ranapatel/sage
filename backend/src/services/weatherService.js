/**
 * TripSage Weather Service
 *
 * Source: Open-Meteo (https://open-meteo.com) — completely free, no API key required.
 * Geocoding: Nominatim (OpenStreetMap) — free.
 *
 * RULES:
 *  - NEVER generate random/fake weather data.
 *  - If geocoding fails → return error, not fake data.
 *  - If Open-Meteo fails → return error, not fake data.
 *  - Cache successful results for 10 minutes.
 */

'use strict'

const axios = require('axios')
const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')

// WMO Weather Code descriptions (ISO standard)
const WMO_CODES = {
  0:  'Clear Sky',       1: 'Mostly Clear',   2: 'Partly Cloudy',    3: 'Overcast',
  45: 'Foggy',          48: 'Icy Fog',
  51: 'Light Drizzle',  53: 'Drizzle',        55: 'Heavy Drizzle',
  61: 'Light Rain',     63: 'Rain',           65: 'Heavy Rain',
  71: 'Light Snow',     73: 'Snow',           75: 'Heavy Snow',
  80: 'Rain Showers',   81: 'Rain Showers',   82: 'Heavy Rain Showers',
  95: 'Thunderstorm',   96: 'Thunderstorm',   99: 'Thunderstorm',
}

// ─── Geocode via Nominatim ────────────────────────────────────────────────────

async function getCoords(destination) {
  try {
    const cityName = (destination || '').split(',')[0].trim()
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: cityName, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'TripSage-AI-Travel-OS/2.0 (tripsage.ai)' },
      timeout: 6000,
    })
    const hit = res.data?.[0]
    if (!hit) return null
    return { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon), name: hit.display_name }
  } catch (err) {
    console.warn('[Weather] Geocoding failed:', err.message)
    return null
  }
}

// ─── Main Weather Fetch ───────────────────────────────────────────────────────

async function getWeather(destination) {
  if (!destination) {
    return { success: false, data: null, meta: { source: 'validation_error' }, error: 'Destination required' }
  }

  const cacheKey = generateCacheKey('weather_v2', { destination: destination.split(',')[0].trim().toLowerCase() })
  const cached   = await cacheGet(cacheKey)
  if (cached) return { ...cached, meta: { ...cached.meta, cache: true } }

  // Step 1: Geocode
  const coords = await getCoords(destination)
  if (!coords) {
    return {
      success: false,
      data:    null,
      meta:    { cache: false, source: 'geocode_failed' },
      error:   `Could not geocode "${destination}" — weather unavailable`,
    }
  }

  try {
    // Step 2: Fetch current + 4-day forecast from Open-Meteo
    const [currentRes, forecastRes] = await Promise.all([
      axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude:  coords.lat,
          longitude: coords.lng,
          current:   [
            'temperature_2m',
            'apparent_temperature',
            'relative_humidity_2m',
            'wind_speed_10m',
            'cloud_cover',
            'weathercode',
            'visibility',
          ].join(','),
          timezone:     'auto',
          forecast_days: 1,
        },
        timeout: 7000,
      }),
      axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude:     coords.lat,
          longitude:    coords.lng,
          daily:        ['weathercode', 'temperature_2m_max', 'temperature_2m_min'].join(','),
          timezone:     'auto',
          forecast_days: 5,
        },
        timeout: 7000,
      }),
    ])

    const c = currentRes.data.current
    const d = forecastRes.data.daily

    const weather = {
      condition:   WMO_CODES[c.weathercode] || 'Clear Sky',
      description: (WMO_CODES[c.weathercode] || 'Clear Sky').toLowerCase(),
      percentage:  c.cloud_cover ?? null,
      temperature: c.temperature_2m        != null ? Math.round(c.temperature_2m)        : null,
      feelsLike:   c.apparent_temperature  != null ? Math.round(c.apparent_temperature)  : null,
      humidity:    c.relative_humidity_2m  ?? null,
      wind:        c.wind_speed_10m        != null ? Math.round(c.wind_speed_10m)        : null,
      visibility:  c.visibility            != null ? Math.round(c.visibility / 1000)     : null,
      lastUpdated: new Date().toISOString(),
      location:    coords.name || destination,
      forecast:    (d.time || []).slice(1, 5).map((date, i) => ({
        date,
        condition: WMO_CODES[d.weathercode?.[i + 1]] || 'Clear Sky',
        high:      d.temperature_2m_max?.[i + 1] != null ? Math.round(d.temperature_2m_max[i + 1]) : null,
        low:       d.temperature_2m_min?.[i + 1] != null ? Math.round(d.temperature_2m_min[i + 1]) : null,
      })),
    }

    const result = {
      success: true,
      data:    weather,
      meta:    { cache: false, source: 'open-meteo' },
      message: 'REALTIME_DATA',
    }
    await cacheSet(cacheKey, result, 10 * 60)   // cache 10 min
    return result

  } catch (err) {
    console.error('[Weather] Open-Meteo fetch failed:', err.message)
    return {
      success: false,
      data:    null,
      meta:    { cache: false, source: 'api_error' },
      error:   `Weather data unavailable for "${destination}": ${err.message}`,
    }
  }
}

module.exports = { getWeather }
