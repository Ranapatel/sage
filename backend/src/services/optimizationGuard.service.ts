/**
 * TripSage — Optimization Guard Service
 *
 * Central gatekeeper that decides whether a Route Matrix API call should proceed.
 * Prevents unnecessary API credit consumption by validating triggers,
 * checking for duplicate optimization requests, enforcing cooldowns,
 * and throttling under high usage.
 */

import crypto from 'crypto'
import { prisma } from '../prisma/prisma.client'
import { GeoapifyKeyManager } from './geoapify/geoapifyKeyManager'
import { cacheGet, cacheSet } from '../../config/redis'

// ── Trigger Types ─────────────────────────────────────────────────────────────

export type OptimizationTrigger =
  | 'itinerary_generated'   // New trip created — always allow
  | 'user_requested'        // User clicked "Optimize my route" — always allow
  | 'places_changed'        // User modified ≥2 places — allow
  | 'preferences_changed'   // User changed travel mode/style — allow
  | 'page_opened'           // User just opened the trip page — BLOCK
  | 'day_switched'          // User switched between itinerary days — BLOCK
  | 'map_viewed'            // User opened the map — BLOCK

// Triggers that are allowed to fire route matrix optimization
const ALLOWED_TRIGGERS: OptimizationTrigger[] = [
  'itinerary_generated',
  'user_requested',
  'places_changed',
  'preferences_changed'
]

// Triggers that are allowed even when throttled (high credit usage)
const HIGH_PRIORITY_TRIGGERS: OptimizationTrigger[] = [
  'itinerary_generated',
  'user_requested'
]

// Cooldown period (in ms) between optimizations for the same trip-day
const OPTIMIZATION_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

// Redis key prefix for cooldown tracking
const COOLDOWN_KEY_PREFIX = 'geoapify:opt_cooldown:'

// ── Guard Result ──────────────────────────────────────────────────────────────

export interface GuardResult {
  allowed: boolean
  reason: string
  creditsRemaining?: number
  usagePercent?: number
}

// ── Service ───────────────────────────────────────────────────────────────────

export class OptimizationGuardService {
  /**
   * Determine whether a route optimization should be allowed.
   *
   * @param tripId     - The trip ID
   * @param dayNumber  - The day number within the trip
   * @param trigger    - What caused the optimization request
   * @param places     - Current set of places (for hash comparison)
   * @returns GuardResult indicating whether optimization should proceed
   */
  static async shouldOptimize(
    tripId: string,
    dayNumber: number,
    trigger: OptimizationTrigger,
    places: { latitude: number; longitude: number }[]
  ): Promise<GuardResult> {
    // ── 1. Trigger check ──────────────────────────────────────────────────
    if (!ALLOWED_TRIGGERS.includes(trigger)) {
      return {
        allowed: false,
        reason: `Trigger '${trigger}' does not warrant route optimization. Matrix calls are restricted to: ${ALLOWED_TRIGGERS.join(', ')}.`
      }
    }

    // ── 2. Duplicate hash check ───────────────────────────────────────────
    //    If the places haven't changed since the last optimization, skip.
    const currentHash = this.generatePlacesHash(places)

    try {
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { optimizationHash: true, optimizedAt: true } as any
      }) as any

      if (trip?.optimizationHash === currentHash && trigger !== 'user_requested') {
        return {
          allowed: false,
          reason: 'Places have not changed since last optimization. Skipping redundant matrix call.'
        }
      }
    } catch {
      // If the columns don't exist yet (pre-migration), skip this check gracefully
    }

    // ── 3. Cooldown check ────────────────────────────────────────────────
    //    Don't re-optimize the same day within the cooldown period
    //    unless it's a user-explicit request or new itinerary generation.
    if (!HIGH_PRIORITY_TRIGGERS.includes(trigger)) {
      const cooldownKey = `${COOLDOWN_KEY_PREFIX}${tripId}_${dayNumber}`
      try {
        const lastOptTime = await cacheGet(cooldownKey)
        if (lastOptTime) {
          const elapsed = Date.now() - Number(lastOptTime)
          if (elapsed < OPTIMIZATION_COOLDOWN_MS) {
            const remainingSec = Math.ceil((OPTIMIZATION_COOLDOWN_MS - elapsed) / 1000)
            return {
              allowed: false,
              reason: `Optimization cooldown active. Try again in ${remainingSec} seconds, or use explicit 'Optimize Route' button.`
            }
          }
        }
      } catch {
        // Redis unavailable — skip cooldown check
      }
    }

    // ── 4. Usage throttle check ──────────────────────────────────────────
    //    If daily credit usage > 80%, only allow high-priority triggers.
    const usagePercent = await GeoapifyKeyManager.getUsagePercentage()
    if (usagePercent > 80 && !HIGH_PRIORITY_TRIGGERS.includes(trigger)) {
      return {
        allowed: false,
        reason: `Daily API credit usage at ${usagePercent.toFixed(0)}%. Only explicit optimization requests are allowed when usage exceeds 80%.`,
        usagePercent
      }
    }

    // ── All checks passed ────────────────────────────────────────────────
    return {
      allowed: true,
      reason: `Optimization allowed for trigger '${trigger}'.`,
      usagePercent
    }
  }

  /**
   * Record that an optimization was performed.
   * Sets the cooldown timer and updates the trip's optimization hash.
   */
  static async recordOptimization(
    tripId: string,
    dayNumber: number,
    places: { latitude: number; longitude: number }[]
  ): Promise<void> {
    const currentHash = this.generatePlacesHash(places)

    // Set cooldown in Redis (TTL = cooldown duration)
    const cooldownKey = `${COOLDOWN_KEY_PREFIX}${tripId}_${dayNumber}`
    try {
      await cacheSet(cooldownKey, String(Date.now()), Math.ceil(OPTIMIZATION_COOLDOWN_MS / 1000))
    } catch {
      // Redis unavailable — cooldown won't work but don't break the flow
    }

    // Update trip's optimization tracking fields
    try {
      await (prisma.trip as any).update({
        where: { id: tripId },
        data: {
          optimizationHash: currentHash,
          optimizedAt: new Date()
        }
      })
    } catch {
      // If columns don't exist yet (pre-migration), log and move on
      console.warn('[OptimizationGuard] Could not update trip optimization fields (migration may be pending).')
    }
  }

  /**
   * Generate a deterministic hash from place coordinates.
   * Used to detect whether places have changed since last optimization.
   */
  private static generatePlacesHash(
    places: { latitude: number; longitude: number }[]
  ): string {
    const coords = places.map(p => `${p.latitude.toFixed(6)},${p.longitude.toFixed(6)}`).join('|')
    return crypto.createHash('sha256').update(coords).digest('hex').substring(0, 16)
  }
}
