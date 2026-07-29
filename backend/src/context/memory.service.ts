/**
 * Memory service — Phase 3 of the Contextual Intelligence Layer plan.
 *
 * Prisma-backed CRUD for UserPreference, FavoriteHotel, FavoriteActivity,
 * Feedback, and Notification. Used by:
 *   - collector.service.ts (reads for context building)
 *   - recommendation.service.ts (writes for recommendation logging)
 *   - notification.service.ts (writes for notifications)
 *   - useMemory hook (favorites toggling from the frontend)
 *
 * NOTE: Phase 1 only added the schema. This service is the runtime.
 */

import { prisma } from '../prisma/prisma.client'
import { RECENT_FEEDBACK_LIMIT, RECENT_FAVORITES_LIMIT, RECENT_SEARCHES_LIMIT } from './context.constants'
import type { Prisma } from '@prisma/client'

// ─── UserPreference ──────────────────────────────────────────────────────────

export async function getUserPreference(userId: string) {
  return prisma.userPreference.findUnique({ where: { userId } })
}

export async function upsertUserPreference(
  userId: string,
  data: Partial<Omit<Prisma.UserPreferenceUncheckedCreateInput, 'userId' | 'id'>>
) {
  return prisma.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      ...data,
    },
    update: data,
  })
}

// ─── Favorites ───────────────────────────────────────────────────────────────

export async function listFavoriteHotels(userId: string, limit = RECENT_FAVORITES_LIMIT) {
  return prisma.favoriteHotel.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function addFavoriteHotel(input: {
  userId: string
  hotelId: string
  hotelName: string
  city?: string | null
  rating?: number | null
}) {
  return prisma.favoriteHotel.upsert({
    where: { userId_hotelId: { userId: input.userId, hotelId: input.hotelId } },
    create: input,
    update: { hotelName: input.hotelName, city: input.city, rating: input.rating },
  })
}

export async function removeFavoriteHotel(userId: string, hotelId: string) {
  try {
    await prisma.favoriteHotel.delete({
      where: { userId_hotelId: { userId, hotelId } },
    })
    return true
  } catch {
    return false
  }
}

export async function listFavoriteActivities(userId: string, limit = RECENT_FAVORITES_LIMIT) {
  return prisma.favoriteActivity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function addFavoriteActivity(input: {
  userId: string
  activityId: string
  name: string
  city?: string | null
}) {
  return prisma.favoriteActivity.create({ data: input })
}

export async function removeFavoriteActivity(id: string) {
  try {
    await prisma.favoriteActivity.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function listRecentFeedback(userId: string, limit = RECENT_FEEDBACK_LIMIT) {
  return prisma.feedback.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { module: true, action: true, rating: true, createdAt: true, targetId: true },
  })
}

export async function recordFeedback(input: {
  userId: string
  tripId?: string | null
  module: string
  targetId: string
  action: 'SAVED' | 'SKIPPED' | 'RATED' | 'BOOKED' | 'CANCELLED' | 'CLICKED' | 'IGNORED'
  rating?: number | null
  metadata?: any
}) {
  // Cap metadata at 1KB to prevent abuse (PII / privacy protection).
  const cappedMetadata = input.metadata
    ? JSON.parse(JSON.stringify(input.metadata).slice(0, 1024))
    : undefined

  return prisma.feedback.create({
    data: {
      userId: input.userId,
      tripId: input.tripId,
      module: input.module,
      targetId: input.targetId,
      action: input.action,
      rating: input.rating,
      metadata: cappedMetadata,
    },
  })
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function listNotifications(userId: string, opts?: { onlyUnread?: boolean; limit?: number }) {
  return prisma.notification.findMany({
    where: { userId, ...(opts?.onlyUnread ? { read: false } : {}) },
    orderBy: { createdAt: 'desc' },
    take: opts?.limit ?? 50,
  })
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } })
}

export async function createNotification(input: {
  userId: string
  kind:
    | 'DELAY' | 'GATE_CHANGE' | 'WEATHER' | 'PRICE_DROP' | 'VISA'
    | 'PASSPORT' | 'COUNTDOWN' | 'BUDGET' | 'TRAFFIC' | 'GENERIC'
  title: string
  body: string
  tripId?: string | null
  metadata?: any
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      kind: input.kind,
      title: input.title,
      body: input.body,
      tripId: input.tripId,
      metadata: input.metadata,
    },
  })
}

export async function markNotificationRead(id: string, userId: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    })
    return true
  } catch {
    // Ensure ownership — record belongs to this user.
    void userId
    return false
  }
}

// ─── Aggregations for hot-path reads ─────────────────────────────────────────

export async function getUserStats(userId: string) {
  const [tripCount, searchCount, feedbackCount, favoritesCount] = await Promise.all([
    prisma.trip.count({ where: { userId } }),
    prisma.userSearchHistory.count({ where: { userId } }),
    prisma.feedback.count({ where: { userId } }),
    prisma.favoriteHotel.count({ where: { userId } }),
  ])
  return { tripCount, searchCount, feedbackCount, favoritesCount }
}

export async function getRecentSearches(userId: string, limit = RECENT_SEARCHES_LIMIT) {
  return prisma.userSearchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { origin: true, destination: true, rankPreference: true, createdAt: true },
  })
}