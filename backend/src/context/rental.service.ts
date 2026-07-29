/**
 * Rental Intelligence — Phase 5 of the Contextual Intelligence Layer plan.
 *
 * Vehicle category + capacity + budget scoring. Provides a stub that
 * returns a vehicle-type recommendation based on traveler count + budget.
 */

import type { ContextObject } from './context.types'
import type { ModuleHandler } from './recommendation.service'

export const recommendRental: ModuleHandler = async (input: any, ctx: ContextObject) => {
  const trip = ctx.trip
  if (!trip) return []

  const travelers = trip.travelers
  let category: 'bike' | 'scooter' | 'economy-car' | 'mid-size-suv' | 'large-suv' = 'economy-car'
  if (travelers <= 1) category = 'bike'
  else if (travelers <= 2) category = 'scooter'
  else if (travelers <= 4) category = 'economy-car'
  else if (travelers <= 6) category = 'mid-size-suv'
  else category = 'large-suv'

  const perDay = trip.budget / Math.max(1, trip.durationDays) * 0.10

  return [
    {
      type: 'RentalSuggestion',
      scores: {
        budgetScore: 80,
        familyScore: travelers > 4 ? 80 : 70,
        convenienceScore: 75,
        aiConfidenceScore: 60,
      },
      data: {
        tripId: trip.id,
        travelers,
        recommendedCategory: category,
        estimatedPerDayCost: Math.round(perDay),
        currency: ctx.user.currency ?? 'INR',
        note: 'For live inventory and pricing, use the cars search endpoint at /api/search.',
      },
      aiConfidence: 60,
    },
  ]
}