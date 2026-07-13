/**
 * TripSage — Geoapify Routing Service
 *
 * Implements getRoute() to generate road routes and paths between waypoints
 * using the Geoapify Routing API.
 */

import axios, { AxiosError } from 'axios'

interface Waypoint {
  latitude: number
  longitude: number
}

interface RouteResult {
  coordinates: [number, number][] // [longitude, latitude] list (Standard GeoJSON coordinates)
  distanceKm: number
  durationSeconds: number
  distance: number
  duration: number
  geometry: any
  mode: string
}

export class GeoapifyRoutingService {
  /**
   * Calculate a route traversing the specified waypoints in order, or between start and end.
   */
  static async getRoute(
    waypointsOrStart: Waypoint[] | { lat: number; lon: number } | { latitude: number; longitude: number },
    modeOrEnd?: string | { lat: number; lon: number } | { latitude: number; longitude: number },
    modeParam: string = 'walk'
  ): Promise<RouteResult> {
    const apiKey = process.env.GEOAPIFY_API_KEY
    if (!apiKey) {
      throw new Error('GEOAPIFY_API_KEY is not configured in environment variables.')
    }

    let waypoints: Waypoint[] = []
    let mode = modeParam

    if (Array.isArray(waypointsOrStart)) {
      waypoints = waypointsOrStart
      if (typeof modeOrEnd === 'string') {
        mode = modeOrEnd
      }
    } else {
      const start = waypointsOrStart as any
      const end = modeOrEnd as any
      const startLat = start.latitude ?? start.lat
      const startLon = start.longitude ?? start.lon
      const endLat = end.latitude ?? end.lat
      const endLon = end.longitude ?? end.lon

      waypoints = [
        { latitude: startLat, longitude: startLon },
        { latitude: endLat, longitude: endLon }
      ]
      if (typeof modeParam === 'string') {
        mode = modeParam
      }
    }

    if (waypoints.length < 2) {
      throw new Error('At least two valid waypoints are required to compute a route.')
    }

    // Format coordinates as pipe-separated lat,lon pairs
    const waypointsParam = waypoints
      .map(wp => `${wp.latitude},${wp.longitude}`)
      .join('|')

    try {
      const response = await axios.get('https://api.geoapify.com/v1/routing', {
        params: {
          waypoints: waypointsParam,
          mode,
          apiKey,
        },
        timeout: 8000,
        headers: {
          'User-Agent': 'TripSage-AI-Travel-OS/2.0',
        },
      })

      const data = response.data
      if (!data || !data.features || !data.features[0]) {
        throw new Error('Geoapify Routing API returned an empty or invalid route feature list.')
      }

      const topFeature = data.features[0]
      const geometry = topFeature.geometry
      const properties = topFeature.properties

      if (!geometry || !geometry.coordinates || geometry.type !== 'LineString') {
        throw new Error('Geoapify Routing API response is missing route LineString geometry.')
      }

      const distance = properties.distance || 0
      const duration = properties.time || 0
      const distanceKm = distance / 1000
      const durationSeconds = duration

      return {
        coordinates: geometry.coordinates,
        distanceKm,
        durationSeconds,
        distance,
        duration,
        geometry,
        mode
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosErr = error as AxiosError
        const status = axiosErr.response?.status

        if (axiosErr.code === 'ECONNABORTED' || axiosErr.code === 'ETIMEDOUT') {
          throw new Error('Geoapify Routing API request timed out.')
        }

        if (status === 401 || status === 403) {
          throw new Error('Invalid Geoapify API credentials.')
        }

        if (status === 429) {
          throw new Error('Geoapify Routing API rate limit exceeded. Please try again later.')
        }

        const details = axiosErr.response?.data
          ? JSON.stringify(axiosErr.response.data)
          : axiosErr.message
        throw new Error(`Geoapify Routing API error (HTTP ${status || 'network'}): ${details}`)
      }

      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Routing Service] 💥 Unexpected routing calculation error:', message)
      throw new Error(`Failed to calculate route: ${message}`)
    }
  }
}
