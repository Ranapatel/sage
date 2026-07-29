/**
 * WeatherAdapter — pluggable weather provider.
 *
 * Phase 1 ships a Null adapter that returns null (no I/O). To enable real
 * weather data, swap `getWeatherAdapter()` to return an Open-Meteo / OWM
 * implementation. No callers need to change.
 */

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

/**
 * Factory — returns the configured adapter. Override by changing this function
 * (env-driven).
 */
export function getWeatherAdapter(): WeatherAdapter {
  const provider = (process.env.WEATHER_ADAPTER || 'null').toLowerCase()
  if (provider === 'null') return new NullWeatherAdapter()
  // Future: if (provider === 'open-meteo') return new OpenMeteoWeatherAdapter()
  return new NullWeatherAdapter()
}