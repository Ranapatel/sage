/**
 * Collector — Phase 1 of the Contextual Intelligence Layer plan.
 *
 * Gathers User, Trip, Preferences, History, and Live Data context in parallel
 * using `Promise.allSettled` so a single failing source never breaks the
 * entire build. Returns a partial `RawContext` that the processor normalizes
 * into the canonical `ContextObject`.
 */

import { prisma } from '../prisma/prisma.client'
import { getUserPreference, listRecentFeedback, getRecentSearches, getUserStats } from './memory.service'
import { getWeatherAdapter } from './adapters/weather.adapter'
import { getFxAdapter } from './adapters/fx.adapter'
import { getTrafficAdapter } from './adapters/traffic.adapter'
import { getDelaysAdapter } from './adapters/delays.adapter'
import { getSafetyAdapter } from './adapters/safety.adapter'
import type {
  ContextObject,
  DestinationContext,
  ItineraryContext,
  HistoryContext,
  PreferencesContext,
  RawContext,
  TripContext,
  UserContext,
  WeatherContext,
} from './context.types'

export interface CollectInput {
  userId: string
  tripId?: string | null
}

function hashInput(input: CollectInput): string {
  // Stable, short hash for caching/dedup. Not cryptographic.
  const key = `${input.userId}|${input.tripId ?? ''}`
  let h = 0
  for (let i = 0; i < key.length; i++) {
    h = ((h << 5) - h + key.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(36)
}

/**
 * Parallel-collect everything needed for a context build.
 * Never throws — failures are recorded in `errors[]` and the corresponding
 * sub-context is left null/empty.
 */
export async function collectContext(input: CollectInput): Promise<RawContext> {
  const errors: RawContext['errors'] = []

  const [
    userResult,
    preferenceResult,
    userPreferenceResult,
    tripResult,
    statsResult,
    feedbackResult,
    searchesResult,
    itineraryResult,
  ] = await Promise.allSettled([
    prisma.user.findUnique({
      where: { id: input.userId },
      include: { profile: true },
    }),
    prisma.travelPreference.findUnique({ where: { userId: input.userId } }),
    getUserPreference(input.userId),
    input.tripId
      ? prisma.trip.findUnique({
          where: { id: input.tripId },
          include: { itineraryDays: { include: { activities: true } } },
        })
      : Promise.resolve(null),
    getUserStats(input.userId),
    listRecentFeedback(input.userId),
    getRecentSearches(input.userId),
    input.tripId
      ? prisma.itineraryDay.findMany({
          where: { tripId: input.tripId },
          include: { activities: true },
          orderBy: { dayNumber: 'asc' },
        })
      : Promise.resolve([]),
  ])

  // ─── User ─────────────────────────────────────────────────────────────────
  const dbUser = userResult.status === 'fulfilled' ? userResult.value : null
  if (userResult.status === 'rejected') errors.push({ source: 'user', message: String(userResult.reason) })

  let user: UserContext | null = null
  if (dbUser) {
    const travelPref = preferenceResult.status === 'fulfilled' ? preferenceResult.value : null
    const userPref = userPreferenceResult.status === 'fulfilled' ? userPreferenceResult.value : null
    user = {
      id: dbUser.id,
      clerkUserId: dbUser.clerkUserId,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      homeCity: dbUser.profile?.city ?? null,
      country: dbUser.profile?.country ?? null,
      language: dbUser.profile?.language ?? userPref?.language ?? 'en',
      currency: userPref?.currency ?? 'INR',
      preferredTransport: userPref?.preferredTransport ?? null,
      dietaryRestrictions: userPref?.dietaryRestrictions ?? [],
      accessibilityNotes: userPref?.accessibilityNotes ?? null,
      favoriteAirlines: userPref?.favoriteAirlines ?? [],
      favoriteHotelChains: userPref?.favoriteHotelChains ?? [],
      favoriteCuisines: userPref?.favoriteCuisines ?? [],
    }
    void travelPref
  }

  // ─── Trip ─────────────────────────────────────────────────────────────────
  let trip: TripContext | null = null
  if (tripResult.status === 'fulfilled' && tripResult.value) {
    const t = tripResult.value
    const start = new Date(t.startDate)
    const end = new Date(t.endDate)
    const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000))
    const daysUntilStart = Math.ceil((start.getTime() - Date.now()) / 86_400_000)
    trip = {
      id: t.id,
      destination: t.destination,
      title: t.title,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      budget: t.budget,
      travelers: t.travelers,
      status: t.status,
      daysUntilStart,
      durationDays,
    }
  } else if (tripResult.status === 'rejected') {
    errors.push({ source: 'trip', message: String(tripResult.reason) })
  }

  // ─── Preferences ──────────────────────────────────────────────────────────
  let preferences: PreferencesContext | null = null
  if (preferenceResult.status === 'fulfilled' && preferenceResult.value) {
    const p = preferenceResult.value
    const userPref = userPreferenceResult.status === 'fulfilled' ? userPreferenceResult.value : null
    preferences = {
      travelStyle: p.travelStyle,
      budgetRange: p.budgetRange,
      interests: p.interests ?? [],
      foodPreference: p.foodPreference ?? [],
      accommodationPreference: p.accommodationPreference,
      tripDuration: p.tripDuration,
      favoriteCuisines: userPref?.favoriteCuisines ?? [],
    }
  }

  // ─── History ──────────────────────────────────────────────────────────────
  let history: HistoryContext | null = null
  if (statsResult.status === 'fulfilled' && feedbackResult.status === 'fulfilled' && searchesResult.status === 'fulfilled') {
    const stats = statsResult.value
    const fb = feedbackResult.value
    const searches = searchesResult.value
    history = {
      totalTrips: stats.tripCount,
      totalSearches: stats.searchCount,
      recentFeedback: fb.map((f) => ({
        module: f.module,
        action: String(f.action),
        rating: f.rating,
        createdAt: f.createdAt.toISOString(),
      })),
    }
    void searches
  }

  // ─── Itinerary ────────────────────────────────────────────────────────────
  let itinerary: ItineraryContext | null = null
  if (itineraryResult.status === 'fulfilled' && Array.isArray(itineraryResult.value) && itineraryResult.value.length > 0) {
    itinerary = {
      dayCount: itineraryResult.value.length,
      totalActivities: itineraryResult.value.reduce((sum, d) => sum + d.activities.length, 0),
      days: itineraryResult.value.map((d) => ({
        dayNumber: d.dayNumber,
        title: d.title,
        activityCount: d.activities.length,
      })),
    }
  }

  // ─── Live data (weather/fx/traffic/delays/safety) ────────────────────────
  const weatherCtx: WeatherContext = { available: false }

  const destination = trip?.destination
  if (destination) {
    // Best-effort coordinate lookup from RailwayStations / BusStops (cheap, no extra query).
    const [station, busStop] = await Promise.allSettled([
      prisma.railwayStations.findFirst({ where: { city: destination } }),
      prisma.busStops.findFirst({ where: { city: destination } }),
    ])
    const lat =
      (station.status === 'fulfilled' && station.value?.lat) ||
      (busStop.status === 'fulfilled' && busStop.value?.lat) ||
      undefined
    const lng =
      (station.status === 'fulfilled' && station.value?.lng) ||
      (busStop.status === 'fulfilled' && busStop.value?.lng) ||
      undefined

    if (typeof lat === 'number' && typeof lng === 'number') {
      try {
        const w = await getWeatherAdapter().fetch(lat, lng, trip?.startDate)
        if (w) {
          weatherCtx.available = true
          weatherCtx.currentTempC = w.tempC
          weatherCtx.forecastSummary = w.conditions
          weatherCtx.dailyForecast = w.daily
        }
      } catch (err: any) {
        errors.push({ source: 'weather', message: err?.message || String(err) })
      }
    }
  }

  // Other adapters — fire-and-forget. They return null in Phase 1.
  let fx: any = null
  let traffic: any = null
  let delays: any = null
  let safety: any = null
  try {
    const fxRes = await getFxAdapter().fetch(user?.currency ?? 'INR', ['USD', 'EUR', 'GBP'])
    if (fxRes) fx = fxRes
  } catch (err: any) {
    errors.push({ source: 'fx', message: err?.message || String(err) })
  }
  try {
    if (destination) {
      const tRes = await getTrafficAdapter().fetch('origin', destination)
      if (tRes) traffic = tRes
      const sRes = await getSafetyAdapter().fetch(user?.country ?? 'IN', destination)
      if (sRes) safety = sRes
      const dRes = await getDelaysAdapter().fetch(destination, destination)
      if (dRes) delays = dRes
    }
  } catch (err: any) {
    errors.push({ source: 'live', message: err?.message || String(err) })
  }

  return {
    user,
    trip,
    preferences,
    history,
    itinerary,
    liveData: { weather: weatherCtx, fx, traffic, delays, safety },
    inputHash: hashInput(input),
    errors,
  }
}

// Re-export destination helper (used by processor).
export function deriveDestination(trip: TripContext | null): DestinationContext | null {
  if (!trip) return null
  return {
    city: trip.destination,
    country: undefined,
    timezone: undefined,
    currency: undefined,
    lat: undefined,
    lng: undefined,
  }
}