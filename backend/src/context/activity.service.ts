/**
 * Activity Intelligence — Phase 5 of the Contextual Intelligence Layer plan.
 *
 * Weather + budget + interests + opening hours + crowd + family suitability.
 * Returns a stub activity plan informed by the user's interests.
 */

import type { ContextObject } from './context.types'
import type { ModuleHandler } from './recommendation.service'

export const recommendActivities: ModuleHandler = async (input: any, ctx: ContextObject) => {
  const trip = ctx.trip
  if (!trip) return []

  const interests = ctx.preferences.interests ?? []
  const isFamily = (ctx.preferences.travelStyle || '').toLowerCase() === 'family'

  // Build a small set of interest-driven activity categories.
  const recommended = [
    ...(interests.includes('culture') || interests.length === 0 ? ['heritage-walk', 'museum'] : []),
    ...(interests.includes('food') ? ['food-tour', 'cooking-class'] : []),
    ...(interests.includes('nature') ? ['park-nature', 'sunset-viewpoint'] : []),
    ...(interests.includes('adventure') ? ['trek', 'water-sports'] : []),
    ...(interests.includes('shopping') ? ['local-market', 'boutique'] : []),
    ...(interests.includes('nightlife') ? ['live-music', 'rooftop-bar'] : []),
    ...(interests.length === 0 ? ['local-walk', 'scenic-viewpoint'] : []),
  ]

  return [
    {
      type: 'ActivityPlan',
      scores: {
        familyScore: isFamily ? 85 : 70,
        convenienceScore: 75,
        aiConfidenceScore: 65,
      },
      data: {
        tripId: trip.id,
        destination: trip.destination,
        recommended,
        weatherAware: ctx.liveData.weather.available,
        note: 'Detailed live activity listings come from /api/explore/activities/:destination.',
      },
      aiConfidence: 65,
    },
  ]
}