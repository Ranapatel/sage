/**
 * Notification engine — Phase 7 of the Contextual Intelligence Layer plan.
 *
 * Generates Notification rows on relevant events (price drop, weather alert,
 * visa reminder). Also broadcasts via Socket.IO so subscribed clients receive
 * a real-time push. Integrates with the existing /api/notifications endpoint.
 */

import { prisma } from '../prisma/prisma.client'
import type { ContextObject } from './context.types'
import type { ModuleHandler } from './recommendation.service'
import { createNotification } from './memory.service'
import { emitNotification as emitSocket, emitDestinationAlert } from '../utils/socketEmitter'

/**
 * Generates notifications proactively — called by background jobs and the
 * recommendation engine. Returns the count of new notifications emitted.
 */
export async function emitPriceDropNotifications(
  userId: string,
  tripId: string,
  route: string,
  oldPrice: number,
  newPrice: number,
  currency = 'INR'
): Promise<number> {
  const dropPct = ((oldPrice - newPrice) / oldPrice) * 100
  if (dropPct < 5) return 0 // <5% drops aren't worth a notification.
  const notif = await createNotification({
    userId,
    tripId,
    kind: 'PRICE_DROP',
    title: `Price drop on ${route}`,
    body: `Prices for ${route} dropped ${dropPct.toFixed(0)}% to ${currency} ${Math.round(newPrice)}.`,
    metadata: { route, oldPrice, newPrice, currency },
  })
  emitSocket(userId, { ...notif, kind: 'PRICE_DROP' })
  return 1
}

export async function emitWeatherAdvisory(
  userId: string,
  tripId: string,
  destination: string,
  conditions: string
) {
  const notif = await createNotification({
    userId,
    tripId,
    kind: 'WEATHER',
    title: `Weather alert for ${destination}`,
    body: `${conditions}. Plan indoor backups for affected days.`,
    metadata: { destination, conditions },
  })
  emitSocket(userId, notif)
  // Also fan out to the destination room so other travelers see it.
  emitDestinationAlert(destination, 'WEATHER_ALERT', {
    title: `Weather in ${destination}`,
    message: conditions,
    timestamp: new Date().toISOString(),
  })
}

export async function emitBudgetWarning(userId: string, tripId: string, percentUsed: number) {
  if (percentUsed < 80) return
  const notif = await createNotification({
    userId,
    tripId,
    kind: 'BUDGET',
    title: 'Budget check-in',
    body: `You've used ${percentUsed.toFixed(0)}% of your trip budget. Consider trimming discretionary spend.`,
    metadata: { percentUsed },
  })
  emitSocket(userId, notif)
}

/**
 * Module handler — exposed in the recommendation dispatcher.
 * Returns a recommendation describing which notifications were *suggested*
 * for generation (but doesn't auto-create them — that's the caller's job).
 */
export const recommendNotifications: ModuleHandler = async (input: any, ctx: ContextObject) => {
  const trip = ctx.trip
  const suggestions: Array<{ kind: string; title: string; rationale: string }> = []

  // 1. If the trip starts in ≤7 days and they have a weather snapshot,
  //    suggest a weather advisory.
  if (trip && trip.daysUntilStart <= 7 && ctx.liveData.weather.available) {
    suggestions.push({
      kind: 'WEATHER',
      title: 'Pre-departure weather advisory',
      rationale: `Trip starts in ${trip.daysUntilStart} day(s) — share weather outlook.`,
    })
  }

  // 2. Budget warning if they have history with high burn rate.
  if (trip && trip.budget > 0 && ctx.history.totalTrips === 0) {
    suggestions.push({
      kind: 'BUDGET',
      title: 'First-trip savings tip',
      rationale: 'First trip — let budget intelligence show you how to allocate spend.',
    })
  }

  // 3. Visa reminder if international.
  const intl = !!input?.international
  if (intl && trip && trip.daysUntilStart <= 30) {
    suggestions.push({
      kind: 'VISA',
      title: 'Visa reminder',
      rationale: 'International travel within 30 days — confirm visa status.',
    })
  }

  return [
    {
      type: 'NotificationSuggestions',
      scores: {
        aiConfidenceScore: 70,
        convenienceScore: 80,
      },
      data: {
        suggestions,
        note: 'Use createNotification() in memory.service.ts to actually emit these.',
      },
      aiConfidence: 70,
    },
  ]
}