/**
 * TripSage — Route Optimization Service (v2)
 *
 * Orchestrates daily itinerary optimization using Geoapify Route Matrix API.
 * Integrates with OptimizationGuard to prevent unnecessary API calls and
 * uses sparse matrix mode for larger itineraries to reduce credit usage.
 *
 * Key improvements over v1:
 *   - Guard integration: validates trigger before any matrix call
 *   - Sparse matrix: uses 1-source-to-N-targets for 6+ places (N vs N² credits)
 *   - Richer output: returns total distance, estimated time, credits used
 *   - Records optimization in DB to prevent duplicate calls
 */

import { OptimizationGuardService, OptimizationTrigger, GuardResult } from './optimizationGuard.service'

interface Place {
  id?: string
  name: string
  category?: string
  latitude: number
  longitude: number
  visitTime?: string
  duration?: string
  orderIndex: number
}

export interface OptimizationResult {
  /** Whether the optimization actually ran (false = guard blocked or cache hit) */
  wasOptimized: boolean
  /** The optimized place order */
  optimizedPlaces: Place[]
  /** Total distance in km across the optimized route */
  totalDistanceKm: number
  /** Estimated total travel time in minutes */
  estimatedTimeMinutes: number
  /** API credits consumed by this optimization (0 if cached/blocked) */
  creditsUsed: number
  /** Human-readable reason if optimization was skipped */
  reason: string
}

export class RouteOptimizationService {
  /**
   * Guard-aware daily itinerary optimization.
   *
   * Validates the trigger against the optimization guard before making
   * any Route Matrix API calls. Uses sparse matrix for 6+ places.
   */
  static async optimizeDailyItinerary(params: {
    tripId: string
    dayNumber: number
    places: Place[]
    preferences?: string[]
    travelStyle?: string
    trigger: OptimizationTrigger
  }): Promise<OptimizationResult> {
    const { tripId, dayNumber, places, preferences = [], travelStyle = 'relaxed', trigger } = params

    // ── Short-circuit: too few places ────────────────────────────────────
    if (!places || places.length <= 2) {
      return {
        wasOptimized: false,
        optimizedPlaces: [...places],
        totalDistanceKm: 0,
        estimatedTimeMinutes: 0,
        creditsUsed: 0,
        reason: 'Too few places to optimize (need at least 3).'
      }
    }

    // ── Guard check ─────────────────────────────────────────────────────
    const guard: GuardResult = await OptimizationGuardService.shouldOptimize(
      tripId,
      dayNumber,
      trigger,
      places.map(p => ({ latitude: p.latitude, longitude: p.longitude }))
    )

    if (!guard.allowed) {
      console.log(`[RouteOptimizationService] Guard blocked: ${guard.reason}`)
      return {
        wasOptimized: false,
        optimizedPlaces: [...places].sort((a, b) => a.orderIndex - b.orderIndex),
        totalDistanceKm: 0,
        estimatedTimeMinutes: 0,
        creditsUsed: 0,
        reason: guard.reason
      }
    }

    // ── Run optimization ────────────────────────────────────────────────
    const list = [...places].sort((a, b) => a.orderIndex - b.orderIndex)

    try {
      const { RouteMatrixService } = require('./geoapify/routeMatrix.service')
      const matrixInput = list.map(p => ({
        lat: p.latitude,
        lon: p.longitude,
      }))

      // Use sparse matrix for 6+ places, full matrix for ≤5
      const result = await RouteMatrixService.calculateSparseRouteMatrix(
        matrixInput,
        'drive',
        tripId,
        dayNumber
      )

      // ── Nearest-neighbor greedy TSP ─────────────────────────────────
      const startNode = list[0]
      const optimized: Place[] = [startNode]
      const remainingIndices = Array.from({ length: list.length - 1 }, (_, i) => i + 1)
      let currentIdx = 0
      let totalDistance = 0
      let totalDuration = 0

      while (remainingIndices.length > 0) {
        let nearestIdx = remainingIndices[0]
        let minVal = Infinity

        for (const nextIdx of remainingIndices) {
          const value = result.durations[currentIdx]?.[nextIdx] ?? result.distances[currentIdx]?.[nextIdx] ?? Infinity
          if (value < minVal) {
            minVal = value
            nearestIdx = nextIdx
          }
        }

        // Accumulate route stats
        totalDistance += result.distances[currentIdx]?.[nearestIdx] ?? 0
        totalDuration += result.durations[currentIdx]?.[nearestIdx] ?? 0

        optimized.push(list[nearestIdx])
        const spliceIdx = remainingIndices.indexOf(nearestIdx)
        remainingIndices.splice(spliceIdx, 1)
        currentIdx = nearestIdx
      }

      // Re-assign orderIndices
      const reindexed = optimized.map((place, idx) => ({
        ...place,
        orderIndex: idx,
      }))

      const creditsUsed = result.creditsUsed || 0

      // ── Record optimization ─────────────────────────────────────────
      await OptimizationGuardService.recordOptimization(
        tripId,
        dayNumber,
        places.map(p => ({ latitude: p.latitude, longitude: p.longitude }))
      )

      console.log(`[RouteOptimizationService] Optimized ${list.length} places. Credits: ${creditsUsed}, Distance: ${(totalDistance / 1000).toFixed(1)}km`)

      return {
        wasOptimized: true,
        optimizedPlaces: reindexed,
        totalDistanceKm: Math.round((totalDistance / 1000) * 10) / 10,
        estimatedTimeMinutes: Math.round(totalDuration / 60),
        creditsUsed,
        reason: `Optimization complete for trigger '${trigger}'.`
      }
    } catch (error: any) {
      console.warn('[RouteOptimizationService] Route Matrix failed. Falling back to haversine:', error.message)
      const haversinePlaces = this.optimizeRouteHaversine(list)
      const { totalKm, totalMin } = this.calculateHaversineStats(haversinePlaces)

      return {
        wasOptimized: true,
        optimizedPlaces: haversinePlaces,
        totalDistanceKm: totalKm,
        estimatedTimeMinutes: totalMin,
        creditsUsed: 0,
        reason: 'Optimization completed using haversine fallback (API unavailable).'
      }
    }
  }

  /**
   * Legacy method — kept for backward compatibility.
   * Delegates to optimizeDailyItinerary with 'user_requested' trigger.
   */
  static async optimizeRoute(
    places: Place[],
    preferences: string[] = [],
    travelStyle: string = 'relaxed',
    tripId?: string,
    dayNumber?: number
  ): Promise<Place[]> {
    if (!tripId || dayNumber === undefined) {
      // No trip context — fall back to haversine-only optimization
      if (!places || places.length <= 2) return [...places]
      return this.optimizeRouteHaversine([...places].sort((a, b) => a.orderIndex - b.orderIndex))
    }

    const result = await this.optimizeDailyItinerary({
      tripId,
      dayNumber,
      places,
      preferences,
      travelStyle,
      trigger: 'user_requested'
    })

    return result.optimizedPlaces
  }

  /**
   * Straight-line fallback TSP nearest-neighbor algorithm
   */
  private static optimizeRouteHaversine(list: Place[]): Place[] {
    const startNode = list[0]
    const remaining = list.slice(1)
    const optimized: Place[] = [startNode]

    let currentLat = startNode.latitude
    let currentLng = startNode.longitude

    while (remaining.length > 0) {
      let nearestIndex = 0
      let minDistance = Infinity

      for (let i = 0; i < remaining.length; i++) {
        const dist = this.haversineDistance(
          currentLat,
          currentLng,
          remaining[i].latitude,
          remaining[i].longitude
        )
        if (dist < minDistance) {
          minDistance = dist
          nearestIndex = i
        }
      }

      const nextPlace = remaining.splice(nearestIndex, 1)[0]
      optimized.push(nextPlace)
      currentLat = nextPlace.latitude
      currentLng = nextPlace.longitude
    }

    return optimized.map((place, idx) => ({
      ...place,
      orderIndex: idx,
    }))
  }

  /**
   * Helper: Calculate total haversine stats for a list of ordered places.
   */
  private static calculateHaversineStats(places: Place[]): { totalKm: number; totalMin: number } {
    let totalKm = 0
    for (let i = 0; i < places.length - 1; i++) {
      totalKm += this.haversineDistance(
        places[i].latitude, places[i].longitude,
        places[i + 1].latitude, places[i + 1].longitude
      )
    }
    // Estimate: 45 km/h avg driving speed
    const totalMin = Math.round((totalKm / 45) * 60)
    return { totalKm: Math.round(totalKm * 10) / 10, totalMin }
  }

  /**
   * Helper: Calculate haversine distance in km
   */
  private static haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
}
