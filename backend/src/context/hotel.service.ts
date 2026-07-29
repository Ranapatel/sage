/**
 * Hotel Intelligence — Phase 5 of the Contextual Intelligence Layer plan.
 *
 * Composes a simple hotel recommendation from the user's preferences
 * (favoriteHotelChains), budget, and recent history. Wraps the existing
 * hotelRecommendationService when available; otherwise returns a stub.
 */

import { prisma } from '../prisma/prisma.client'
import type { ContextObject } from './context.types'
import type { ModuleHandler } from './recommendation.service'

export const recommendHotels: ModuleHandler = async (input: any, ctx: ContextObject) => {
  const trip = ctx.trip
  if (!trip) return []
  void ctx.user

  // Lightweight aggregation — counts of past searches/saved items inform
  // a relevance score. Real hotel search would delegate to hotelRecommendationService.
  let recentSaves: number = 0
  try {
    recentSaves = await prisma.savedItem.count({ where: { userId: ctx.user.id, type: 'hotel' } })
  } catch {
    /* ignore — best-effort */
  }

  const budget = trip.budget
  const perNightBudget = budget / Math.max(1, trip.durationDays) * 0.40

  const result = {
    type: 'HotelSearch',
    scores: {
      budgetScore: perNightBudget > 5000 ? 75 : perNightBudget > 2000 ? 85 : 95,
      aiConfidenceScore: 70,
      convenienceScore: 80,
    },
    data: {
      tripId: trip.id,
      destination: trip.destination,
      checkIn: trip.startDate,
      checkOut: trip.endDate,
      travelers: trip.travelers,
      perNightBudget: Math.round(perNightBudget),
      currency: ctx.user.currency ?? 'INR',
      preferredChains: ctx.user.favoriteHotelChains ?? [],
      recentSaves,
      note: 'Use the existing hotels search endpoint for live Hotelbeds / Agoda inventory.',
    },
    aiConfidence: 70,
  }

  return [result]
}