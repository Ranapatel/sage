/**
 * Processor — Phase 2 of the Contextual Intelligence Layer plan.
 *
 * Normalizes a `RawContext` (loose Prisma + adapter data) into the canonical
 * `ContextObject` that downstream services consume. Also resolves scoring
 * weights based on the user's travel style.
 */

import {
  BUDGET_ALLOCATION_DEFAULTS,
  DEFAULT_SCORING_WEIGHTS,
  FAMILY_SCORING_WEIGHTS,
  BUSINESS_SCORING_WEIGHTS,
  ACCESSIBILITY_SCORING_WEIGHTS,
} from './context.constants'
import { deriveDestination } from './collector.service'
import type {
  BudgetContext,
  ContextObject,
  PreferencesContext,
  RawContext,
  ScoringWeights,
  TransportContext,
} from './context.types'

/**
 * Resolve scoring weights based on user preferences. Falls back to default
 * balanced weights when no travelStyle is set.
 */
export function resolveScoringWeights(
  prefs: PreferencesContext | null,
  accessibilityNotes: string | null | undefined
): ScoringWeights {
  // Essential accessibility requirements take precedence over general travel styles
  if (accessibilityNotes && accessibilityNotes.trim().length > 0) {
    return ACCESSIBILITY_SCORING_WEIGHTS
  }
  const style = (prefs?.travelStyle || '').toLowerCase()
  if (style === 'family') return FAMILY_SCORING_WEIGHTS
  if (style === 'business') return BUSINESS_SCORING_WEIGHTS
  return DEFAULT_SCORING_WEIGHTS
}

/**
 * Build the BudgetContext from Trip + preferences + currency.
 * Uses the default 35/20/25/10/10 split, but adjusts if the user has a
 * tighter `budgetRange` preference (e.g. "budget" pushes more to accommodation).
 */
export function buildBudgetContext(
  trip: RawContext['trip'],
  currency: string,
  prefs: PreferencesContext | null
): BudgetContext | null {
  if (!trip) return null

  const totalBudget = trip.budget
  const durationDays = trip.durationDays
  const perDay = totalBudget / Math.max(1, durationDays)

  const isBudget = (prefs?.budgetRange || '').toLowerCase() === 'budget'
  const isLuxury = (prefs?.budgetRange || '').toLowerCase() === 'luxury'

  // Slight re-allocation based on budget preference.
  const allocation = { ...BUDGET_ALLOCATION_DEFAULTS }
  if (isBudget) {
    allocation.accommodation = 0.40
    allocation.food = 0.28
    allocation.activities = 0.07
    allocation.emergency = 0.12
    allocation.transportation = 0.13
  } else if (isLuxury) {
    allocation.accommodation = 0.45
    allocation.food = 0.22
    allocation.activities = 0.12
    allocation.emergency = 0.08
    allocation.transportation = 0.13
  }

  return {
    totalBudget,
    perDay,
    currency,
    allocation: {
      accommodation: allocation.accommodation,
      transportation: allocation.transportation,
      food: allocation.food,
      activities: allocation.activities,
      emergency: allocation.emergency,
    },
  }
}

export function buildTransportContext(
  preferredTransport: string | null | undefined,
  recentSearches: any[]
): TransportContext {
  return {
    preferredMode: preferredTransport ?? undefined,
    recentSearches: (recentSearches ?? []).map((s: any) => ({
      origin: s.origin,
      destination: s.destination,
      rankPreference: s.rankPreference,
      createdAt:
        s.createdAt instanceof Date
          ? s.createdAt.toISOString()
          : typeof s.createdAt === 'string'
            ? s.createdAt
            : new Date().toISOString(),
    })),
  }
}

/**
 * Normalize RawContext → ContextObject.
 * Defensive: if the user is missing, returns a minimal stub so callers don't
 * blow up. Most fields will be null/empty.
 */
export function processContext(raw: RawContext): ContextObject {
  const user = raw.user
  const prefs = raw.preferences
  const currency = user?.currency ?? 'INR'

  const budget = buildBudgetContext(raw.trip, currency, prefs)
  const transport = buildTransportContext(
    user?.preferredTransport,
    (raw.history as any)?.recentSearches ?? []
  )

  return {
    version: 1,
    builtAt: new Date().toISOString(),
    user: user ?? {
      id: '',
      clerkUserId: '',
      email: '',
      firstName: null,
      lastName: null,
    },
    trip: raw.trip,
    destination: deriveDestination(raw.trip),
    budget,
    transport,
    preferences: prefs ?? {
      interests: [],
      foodPreference: [],
      favoriteCuisines: user?.favoriteCuisines ?? [],
    },
    liveData: raw.liveData,
    itinerary: raw.itinerary,
    history:
      raw.history ?? {
        totalTrips: 0,
        totalSearches: 0,
        recentFeedback: [],
      },
    scoringWeights: resolveScoringWeights(prefs, user?.accessibilityNotes ?? null),
  }
}