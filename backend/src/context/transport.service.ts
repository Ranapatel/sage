/**
 * Transport Intelligence — Phase 5 of the Contextual Intelligence Layer plan.
 *
 * Provides a thin wrapper that delegates to the existing transport-intelligence
 * module. Used by the recommendation dispatcher when callers ask for transport.
 */

import { planJourney } from '../modules/transport-intelligence/transportIntelligence.service'
import type { ContextObject } from './context.types'
import type { ModuleHandler } from './recommendation.service'

export const recommendTransport: ModuleHandler = async (input: any, ctx: ContextObject) => {
  const trip = ctx.trip
  if (!trip) return []

  const origin = (input?.origin as string) || ctx.user.homeCity || ''
  const destination = (input?.destination as string) || trip.destination
  const date = (input?.date as string) || trip.startDate?.slice(0, 10)

  if (!origin || !destination || !date) {
    return [
      {
        type: 'TransportPlan',
        scores: { aiConfidenceScore: 20, journeyScore: 50 },
        data: {
          available: false,
          reason: 'origin, destination, and date are required',
          tripId: trip.id,
        },
        aiConfidence: 20,
      },
    ]
  }

  try {
    const result = await planJourney({
      origin,
      destination,
      date,
      passengers: ctx.trip?.travelers ?? 1,
      rankPreference: 'balanced',
      userId: ctx.user.id,
    })

    return [
      {
        type: 'TransportPlan',
        scores: {
          journeyScore: result.alternativeJourneys.length > 0 ? 80 : 70,
          convenienceScore: 80,
          reliabilityScore: 75,
          aiConfidenceScore: 70,
          budgetScore: 70,
        },
        data: result,
        aiConfidence: 70,
      },
    ]
  } catch (err: any) {
    return [
      {
        type: 'TransportPlan',
        scores: { aiConfidenceScore: 10 },
        data: {
          available: false,
          reason: 'transport-intelligence plan failed',
          error: process.env.NODE_ENV === 'production' ? undefined : err?.message,
        },
        aiConfidence: 10,
      },
    ]
  }
}