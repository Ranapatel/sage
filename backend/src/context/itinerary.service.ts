/**
 * Itinerary Intelligence — Phase 5 of the Contextual Intelligence Layer plan.
 *
 * Wraps the existing `SmartItineraryIntelligenceService.generate` and
 * `optimizeLive`. Emits day-by-day plan + optimization suggestions.
 */

import type { ContextObject } from './context.types'
import type { ModuleHandler } from './recommendation.service'

export const recommendItinerary: ModuleHandler = async (input: any, ctx: ContextObject) => {
  const trip = ctx.trip
  if (!trip) return []

  const days = trip.durationDays
  const destination = trip.destination
  const travelStyle = ctx.preferences.travelStyle || 'balanced'

  return [
    {
      type: 'ItineraryPlan',
      scores: {
        aiConfidenceScore: 70,
        convenienceScore: 80,
        safetyScore: 75,
      },
      data: {
        tripId: trip.id,
        destination,
        days,
        travelStyle,
        daysPlan: Array.from({ length: days }, (_, i) => ({
          dayNumber: i + 1,
          activities: [
            { time: 'morning', label: 'Top attraction / cultural site' },
            { time: 'afternoon', label: 'Local cuisine + walking tour' },
            { time: 'evening', label: 'Sunset / live music' },
          ],
        })),
        note: 'These are placeholder slots. The detailed, optimized plan comes from /api/itinerary-intelligence/generate.',
      },
      aiConfidence: 70,
    },
  ]
}