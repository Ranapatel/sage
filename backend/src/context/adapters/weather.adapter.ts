/**
 * WeatherAdapter — pluggable weather provider.
 *
 * Phase 8 ships two implementations:
 *   - `null`        — returns null (no I/O). Default.
 *   - `open-meteo`  — calls the no-key Open-Meteo API (https://open-meteo.com/).
 *
 * Activate via env var: `WEATHER_ADAPTER=open-meteo`
 * No callers need to change.
 */

import axios from 'axios'
import type { WeatherSnapshot } from '../context.types'

export interface WeatherAdapter {
  readonly name: string
  /** Returns null when unavailable — collectors MUST handle null. */
  fetch(lat: number, lng: number, isoDate?: string): Promise<WeatherSnapshot | null>
}

/**
 * Default null adapter — used until a real provider is wired.
 * Returns null to keep the rest of the pipeline safe (collectors use
 * Promise.allSettled and degrade gracefully).
 */
export class NullWeatherAdapter implements WeatherAdapter {
  readonly name = 'null'

  async fetch(_lat: number, _lng: number, _isoDate?: string): Promise<WeatherSnapshot | null> {
    return null
  }
}

/** Open-Meteo — no-key weather API. Returns null on any error. */
export class OpenMeteoWeatherAdapter implements WeatherAdapter {
  readonly name = 'open-meteo'

  async fetch(lat: number, lng: number, isoDate?: string): Promise<WeatherSnapshot | null> {
    try {
      const url = 'https://api.open-meteo.com/v1/forecast'
      const params: Record<string, string> = {
        latitude:  String(lat),
        longitude: String(lng),
        current_weather: 'true',
        daily: 'temperature_2m_max,temperature_2m_min,weathercode',
        timezone: 'auto',
        forecast_days: '7',
      }
      if (isoDate) params['start_date'] = isoDate.split('T')[0]
      const res = await axios.get(url, { params, timeout: 3500 })
      const data = res.data ?? {}
      const cw = data.current_weather
      const daily = data.daily ?? {}

      const dailyList: WeatherSnapshot['daily'] = []
      if (Array.isArray(daily.time)) {
        for (let i = 0; i < daily.time.length; i++) {
          dailyList.push({
            date: daily.time[i],
            minC: daily.temperature_2m_min?.[i] ?? 0,
            maxC: daily.temperature_2m_max?.[i] ?? 0,
            conditions: describeWeatherCode(daily.weathercode?.[i]),
          })
        }
      }

      if (!cw && dailyList.length === 0) return null
      return {
        tempC: cw?.temperature ?? 0,
        conditions: describeWeatherCode(cw?.weathercode),
        daily: dailyList,
      }
    } catch (err: any) {
      console.warn('[WeatherAdapter] open-meteo error:', err?.message || err)
      return null
    }
  }
}

/** Convert WMO weather codes (used by Open-Meteo) to a friendly description. */
function describeWeatherCode(code: number | undefined): string {
  if (typeof code !== 'number') return 'Unknown'
  if (code === 0) return 'Clear'
  if (code <= 2) return 'Mostly Clear'
  if (code === 3) return 'Cloudy'
  if (code <= 49) return 'Foggy'
  if (code <= 59) return 'Drizzle'
  if (code <= 69) return 'Rain'
  if (code <= 79) return 'Snow'
  if (code <= 86) return 'Showers'
  if (code <= 99) return 'Thunderstorm'
  return 'Unknown'
}

/**
 * Factory — returns the configured adapter. Override via `WEATHER_ADAPTER`.
 * Unknown values fall back to NullWeatherAdapter (safe default).
 */
export function getWeatherAdapter(): WeatherAdapter {
  const provider = (process.env.WEATHER_ADAPTER || 'null').toLowerCase()
  if (provider === 'open-meteo') return new OpenMeteoWeatherAdapter()
  return new NullWeatherAdapter()
}