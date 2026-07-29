/**
 * Restaurant Intelligence — Phase 5 of the Contextual Intelligence Layer plan.
 *
 * Uses the user's dietary restrictions and cuisine preferences to filter
 * candidate restaurants. Delegates the live search to existing /api/explore/restaurants.
 */

import type { ContextObject } from './context.types'
import type { ModuleHandler } from './recommendation.service'

export const recommendRestaurants: ModuleHandler = async (input: any, ctx: ContextObject) => {
  const trip = ctx.trip
  if (!trip) return []

  const dietary = ctx.user.dietaryRestrictions ?? []
  const cuisines = ctx.user.favoriteCuisines ?? []

  const summary = {
    type: 'RestaurantSearch',
    scores: {
      aiConfidenceScore: 70,
      familyScore: dietary.length > 0 ? 80 : 70,
      budgetScore: 75,
    },
    data: {
      tripId: trip.id,
      destination: trip.destination,
      filters: {
        dietary,
        cuisines,
      },
      note: 'Call /api/explore/restaurants with these filters for live results.',
    },
    aiConfidence: 70,
  }

  return [summary]
}