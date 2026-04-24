const axios = require('axios')
const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')

/**
 * Weather using Open-Meteo (completely free, no API key required)
 * + Nominatim for city → lat/lng lookup
 * Falls back to mock data if all else fails.
 */

const WMO_CODES = {
  0: 'Clear Sky', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy Fog', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
  61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
  71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
  80: 'Rain Showers', 81: 'Rain Showers', 82: 'Heavy Rain Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
}

async function getCoords(destination) {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: destination, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'TripSage-AI-Travel-OS/2.0' },
      timeout: 5000,
    })
    if (res.data?.[0]) {
      return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) }
    }
  } catch { /* ignore */ }
  return null
}

async function getWeather(destination) {
  const cacheKey = generateCacheKey('weather', { destination })
  const cached = await cacheGet(cacheKey)
  if (cached) return { ...cached, meta: { cache: true } }

  try {
    // Step 1: Geocode city name
    const coords = await getCoords(destination)
    if (!coords) return getMockWeather(destination)

    // Step 2: Fetch weather from Open-Meteo (no API key!)
    const [currentRes, forecastRes] = await Promise.all([
      axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: coords.lat,
          longitude: coords.lng,
          current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,cloud_cover,weathercode,visibility',
          timezone: 'auto',
          forecast_days: 1,
        },
        timeout: 6000,
      }),
      axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: coords.lat,
          longitude: coords.lng,
          daily: 'weathercode,temperature_2m_max,temperature_2m_min',
          timezone: 'auto',
          forecast_days: 4,
        },
        timeout: 6000,
      }),
    ])

    const c = currentRes.data.current
    const d = forecastRes.data.daily

    const weather = {
      condition: WMO_CODES[c.weathercode] || 'Clear',
      description: (WMO_CODES[c.weathercode] || 'Clear').toLowerCase(),
      percentage: c.cloud_cover,
      temperature: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      wind: Math.round(c.wind_speed_10m),
      visibility: Math.round((c.visibility || 10000) / 1000),
      lastUpdated: new Date().toISOString(),
      forecast: d.time.slice(1, 4).map((date, i) => ({
        date,
        condition: WMO_CODES[d.weathercode[i + 1]] || 'Clear',
        high: Math.round(d.temperature_2m_max[i + 1]),
        low: Math.round(d.temperature_2m_min[i + 1]),
      })),
    }

    const result = { success: true, data: weather, meta: { cache: false, source: 'open-meteo' } }
    await cacheSet(cacheKey, result, 10 * 60)
    return result
  } catch (err) {
    console.error('[WeatherService] Error:', err.message)
    return getMockWeather(destination)
  }
}

function getMockWeather(destination) {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain']
  const condition = conditions[Math.floor(Math.random() * 3)]
  return {
    success: true,
    data: {
      condition,
      percentage: Math.floor(Math.random() * 40) + 10,
      temperature: Math.floor(Math.random() * 15) + 22,
      feelsLike: Math.floor(Math.random() * 15) + 20,
      humidity: Math.floor(Math.random() * 30) + 60,
      wind: Math.floor(Math.random() * 20) + 5,
      visibility: 10,
      lastUpdated: new Date().toISOString(),
      forecast: ['Today', 'Tomorrow', 'Day 3'].map((_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        condition: conditions[i % conditions.length],
        high: Math.floor(Math.random() * 8) + 25,
        low: Math.floor(Math.random() * 8) + 18,
      })),
    },
    meta: { cache: false, source: 'mock' }
  }
}

module.exports = { getWeather }
