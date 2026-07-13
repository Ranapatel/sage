import axios from 'axios'
import crypto from 'crypto'
import { prisma } from '../../prisma/prisma.client'
import { GeoapifyKeyManager } from './geoapifyKeyManager'

interface LocationInput {
  lat: number
  lon: number
}

interface MatrixResponse {
  distances: number[][]
  durations: number[][]
  sources: any[]
  targets: any[]
  isFallback?: boolean
  creditsUsed?: number
}

/**
 * Threshold: use full N×N matrix for ≤ this many places.
 * Above this threshold, use sparse (source-to-targets) strategy.
 */
const SPARSE_THRESHOLD = 5

export class RouteMatrixService {
  /**
   * Calculate time-distance route matrix for a list of locations.
   */
  static async calculateRouteMatrix(
    locations: LocationInput[],
    mode: string = 'drive',
    tripId?: string,
    dayNumber?: number
  ): Promise<MatrixResponse> {
    if (!locations || locations.length === 0) {
      return { distances: [], durations: [], sources: [], targets: [] }
    }

    // 1. Generate unique hash for locations list
    const locationsHash = crypto.createHash('sha256')
      .update(JSON.stringify(locations) + '_' + mode)
      .digest('hex')

    // 2. Check Database cache first (persistent 7 days TTL)
    if (tripId && dayNumber !== undefined) {
      try {
        const cached = await prisma.routeMatrixCache.findUnique({
          where: { locationsHash }
        })
        if (cached && new Date() < new Date(cached.expiresAt)) {
          return JSON.parse(cached.matrixData)
        }
      } catch (e: any) {
        console.warn('[RouteMatrixService] Cache retrieval error:', e.message)
      }
    }

    // 3. Prepare payload mapping
    const geoapifyLocations = locations.map(l => ({
      location: [l.lon, l.lat] // Geoapify expects [lon, lat]
    }))

    // Calculate credits: max(sources, targets) * min(sources, targets, 10)
    const n = locations.length
    const creditsUsed = n * Math.min(n, 10)

    let key = ''
    try {
      // 4. Try Primary Key
      key = await GeoapifyKeyManager.getAvailableKey()
      const result = await this.callAPI(key, geoapifyLocations, mode)
      
      await GeoapifyKeyManager.trackRequest(key, creditsUsed)
      
      // Save cache in DB asynchronously
      if (tripId && dayNumber !== undefined) {
        this.saveCache(tripId, dayNumber, locationsHash, result)
      }

      return result
    } catch (err: any) {
      console.warn(`[RouteMatrixService] Route Matrix Key 1 failed (${key}):`, err.message)
      if (key) {
        await GeoapifyKeyManager.trackFailure(key)
      }

      // 5. Try Secondary Fallback Key
      const { key1, key2 } = GeoapifyKeyManager.getKeys()
      const fallbackKey = key === key1 ? key2 : key1

      if (fallbackKey && fallbackKey !== key) {
        try {
          console.log('[RouteMatrixService] Trying fallback Route Matrix API Key...')
          const result = await this.callAPI(fallbackKey, geoapifyLocations, mode)
          
          await GeoapifyKeyManager.trackRequest(fallbackKey, creditsUsed)

          if (tripId && dayNumber !== undefined) {
            this.saveCache(tripId, dayNumber, locationsHash, result)
          }

          return result
        } catch (fallbackErr: any) {
          console.warn(`[RouteMatrixService] Route Matrix Key 2 failed (${fallbackKey}):`, fallbackErr.message)
          if (fallbackKey) {
            await GeoapifyKeyManager.trackFailure(fallbackKey)
          }
        }
      }

      // 6. Both Keys failed: Try returning expired cache from DB
      if (tripId && dayNumber !== undefined) {
        try {
          const expiredCache = await prisma.routeMatrixCache.findUnique({
            where: { locationsHash }
          })
          if (expiredCache) {
            console.log('[RouteMatrixService] Returning expired cached matrix data.')
            return JSON.parse(expiredCache.matrixData)
          }
        } catch (e: any) {
          // ignore
        }
      }

      // 7. Last Fallback: Generate straight-line haversine distance matrix
      console.warn('[RouteMatrixService] Fallback to straight-line haversine matrix.')
      return this.generateStraightLineMatrix(locations, mode)
    }
  }

  /**
   * Calculate a sparse route matrix: one source → all other targets.
   * Uses the greedy nearest-neighbor approach with sequential sparse calls.
   *
   * For N locations:
   *   - Full N×N = N² credits
   *   - Sparse   = N credits (1 source × N targets)
   *
   * Returns a full N×N-compatible MatrixResponse where only row 0
   * has real API data and the rest are filled with Infinity.
   * The optimization service uses only row 0 for the first hop
   * then re-queries for subsequent hops.
   */
  static async calculateSparseRouteMatrix(
    locations: LocationInput[],
    mode: string = 'drive',
    tripId?: string,
    dayNumber?: number
  ): Promise<MatrixResponse> {
    if (!locations || locations.length === 0) {
      return { distances: [], durations: [], sources: [], targets: [], creditsUsed: 0 }
    }

    // For small sets, a full matrix is cheap enough — delegate
    if (locations.length <= SPARSE_THRESHOLD) {
      return this.calculateRouteMatrix(locations, mode, tripId, dayNumber)
    }

    // 1. Generate unique hash including the sparse strategy marker
    const locationsHash = crypto.createHash('sha256')
      .update(JSON.stringify(locations) + '_' + mode + '_sparse')
      .digest('hex')

    // 2. Check DB cache first
    if (tripId && dayNumber !== undefined) {
      try {
        const cached = await prisma.routeMatrixCache.findUnique({
          where: { locationsHash }
        })
        if (cached && new Date() < new Date(cached.expiresAt)) {
          console.log('[RouteMatrixService] Sparse matrix cache hit.')
          return JSON.parse(cached.matrixData)
        }
      } catch (e: any) {
        console.warn('[RouteMatrixService] Sparse cache retrieval error:', e.message)
      }
    }

    // 3. Build sparse payload: source = first location, targets = all locations
    const sourceLocations = [{ location: [locations[0].lon, locations[0].lat] }]
    const targetLocations = locations.map(l => ({ location: [l.lon, l.lat] }))

    // Credits: max(sources, targets) * min(sources, targets, 10)
    // With 1 source and N targets: max(1, N) * min(1, N, 10) = N * 1 = N
    const creditsUsed = locations.length

    let key = ''
    try {
      key = await GeoapifyKeyManager.getAvailableKey()
      const sparseResult = await this.callSparseAPI(key, sourceLocations, targetLocations, mode)

      await GeoapifyKeyManager.trackRequest(key, creditsUsed)

      // Expand sparse result (1×N) into a full N×N matrix for compatibility.
      // Row 0 has real data. All other rows use haversine fallback.
      const fullMatrix = this.expandSparseToFull(locations, sparseResult, mode)
      fullMatrix.creditsUsed = creditsUsed

      // Save to cache
      if (tripId && dayNumber !== undefined) {
        this.saveCache(tripId, dayNumber, locationsHash, fullMatrix)
      }

      console.log(`[RouteMatrixService] Sparse matrix: ${locations.length} places → ${creditsUsed} credits (saved ${locations.length * locations.length - creditsUsed})`)
      return fullMatrix
    } catch (err: any) {
      console.warn(`[RouteMatrixService] Sparse matrix failed (${key}):`, err.message)
      if (key) {
        await GeoapifyKeyManager.trackFailure(key)
      }

      // Try fallback key
      const { key1, key2 } = GeoapifyKeyManager.getKeys()
      const fallbackKey = key === key1 ? key2 : key1

      if (fallbackKey && fallbackKey !== key) {
        try {
          console.log('[RouteMatrixService] Trying fallback key for sparse matrix...')
          const sparseResult = await this.callSparseAPI(fallbackKey, sourceLocations, targetLocations, mode)
          await GeoapifyKeyManager.trackRequest(fallbackKey, creditsUsed)

          const fullMatrix = this.expandSparseToFull(locations, sparseResult, mode)
          fullMatrix.creditsUsed = creditsUsed

          if (tripId && dayNumber !== undefined) {
            this.saveCache(tripId, dayNumber, locationsHash, fullMatrix)
          }
          return fullMatrix
        } catch (fallbackErr: any) {
          console.warn(`[RouteMatrixService] Sparse fallback key failed:`, fallbackErr.message)
          if (fallbackKey) await GeoapifyKeyManager.trackFailure(fallbackKey)
        }
      }

      // Expired cache?
      if (tripId && dayNumber !== undefined) {
        try {
          const expiredCache = await prisma.routeMatrixCache.findUnique({ where: { locationsHash } })
          if (expiredCache) {
            console.log('[RouteMatrixService] Returning expired sparse cache.')
            return JSON.parse(expiredCache.matrixData)
          }
        } catch { /* ignore */ }
      }

      // Final fallback: haversine
      console.warn('[RouteMatrixService] Sparse fallback to haversine.')
      const haversine = this.generateStraightLineMatrix(locations, mode)
      haversine.creditsUsed = 0
      return haversine
    }
  }

  /**
   * Helper: Invoke Route Matrix API with separate sources and targets (sparse mode)
   */
  private static async callSparseAPI(
    apiKey: string,
    sources: { location: number[] }[],
    targets: { location: number[] }[],
    mode: string
  ): Promise<{ distances: number[]; durations: number[] }> {
    const response = await axios.post(
      `https://api.geoapify.com/v1/routematrix?apiKey=${apiKey}`,
      { mode, sources, targets },
      { timeout: 6000, headers: { 'Content-Type': 'application/json' } }
    )

    const data = response.data
    const matrix = data.sources_to_targets
    if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
      throw new Error('Missing sparse matrix data in response.')
    }

    // matrix[0] = array of { distance, time } from source to each target
    const row = matrix[0]
    return {
      distances: row.map((cell: any) => cell.distance || 0),
      durations: row.map((cell: any) => cell.time || 0)
    }
  }

  /**
   * Helper: Expand a 1×N sparse result into a full N×N MatrixResponse.
   * Row 0 uses API data. Other rows use haversine estimates.
   */
  private static expandSparseToFull(
    locations: LocationInput[],
    sparse: { distances: number[]; durations: number[] },
    mode: string
  ): MatrixResponse {
    const n = locations.length
    const haversine = this.generateStraightLineMatrix(locations, mode)

    // Overwrite row 0 with actual API data
    haversine.distances[0] = sparse.distances
    haversine.durations[0] = sparse.durations
    haversine.isFallback = false

    return haversine
  }

  /**
   * Helper: Invoke Route Matrix API POST (full N×N — sources = targets)
   */
  private static async callAPI(
    apiKey: string,
    locations: { location: number[] }[],
    mode: string
  ): Promise<MatrixResponse> {
    const response = await axios.post(
      `https://api.geoapify.com/v1/routematrix?apiKey=${apiKey}`,
      {
        mode,
        sources: locations,
        targets: locations
      },
      {
        timeout: 6000,
        headers: { 'Content-Type': 'application/json' }
      }
    )

    const data = response.data
    const matrix = data.sources_to_targets
    if (!matrix || !Array.isArray(matrix)) {
      throw new Error('Missing matrix data features in response.')
    }

    const distances: number[][] = []
    const durations: number[][] = []

    for (let s = 0; s < matrix.length; s++) {
      distances[s] = []
      durations[s] = []
      for (let t = 0; t < matrix[s].length; t++) {
        distances[s][t] = matrix[s][t].distance || 0
        durations[s][t] = matrix[s][t].time || 0
      }
    }

    return {
      distances,
      durations,
      sources: data.sources || [],
      targets: data.targets || []
    }
  }

  /**
   * Helper: Save cache record to DB
   */
  private static async saveCache(
    tripId: string,
    dayNumber: number,
    locationsHash: string,
    matrixData: MatrixResponse
  ): Promise<void> {
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration

      await prisma.routeMatrixCache.upsert({
        where: { locationsHash },
        update: {
          matrixData: JSON.stringify(matrixData),
          expiresAt
        },
        create: {
          tripId,
          dayNumber,
          locationsHash,
          matrixData: JSON.stringify(matrixData),
          expiresAt
        }
      })
    } catch (err: any) {
      console.warn('[RouteMatrixService] Save cache to DB failed:', err.message)
    }
  }

  /**
   * Helper: Straight-line haversine distance matrix generator
   */
  private static generateStraightLineMatrix(
    locations: LocationInput[],
    mode: string
  ): MatrixResponse {
    const distances: number[][] = []
    const durations: number[][] = []

    // Average speeds (km/h) for duration calculations
    const speed = mode === 'walk' ? 5 : mode === 'bicycle' ? 15 : 45
    const metersPerSecond = (speed * 1000) / 3600

    for (let s = 0; s < locations.length; s++) {
      distances[s] = []
      durations[s] = []
      for (let t = 0; t < locations.length; t++) {
        if (s === t) {
          distances[s][t] = 0
          durations[s][t] = 0
        } else {
          // Haversine calculation (in meters)
          const lat1 = locations[s].lat
          const lon1 = locations[s].lon
          const lat2 = locations[t].lat
          const lon2 = locations[t].lon

          const R = 6371000 // Earth radius in meters
          const dLat = ((lat2 - lat1) * Math.PI) / 180
          const dLon = ((lon2 - lon1) * Math.PI) / 180
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          const distMeters = R * c

          distances[s][t] = distMeters
          durations[s][t] = Math.round(distMeters / metersPerSecond)
        }
      }
    }

    return {
      distances,
      durations,
      sources: locations.map(l => ({ location: [l.lon, l.lat] })),
      targets: locations.map(l => ({ location: [l.lon, l.lat] })),
      isFallback: true
    }
  }
}
