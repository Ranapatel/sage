/**
 * Recommendation orchestrator — Phase 6 of the Contextual Intelligence Layer plan.
 *
 * Routes `recommend({ module, input, ctx })` to the right module service, applies
 * the decision-service scoring, and writes a RecommendationLog row (Phase 6).
 *
 * Phase 3: scaffold + dispatch table. Phase 4 wires the budget module fully.
 * Phase 5 wires the remaining eight modules.
 */

import { prisma } from '../prisma/prisma.client'
import { decide } from './decision.service'
import { buildContext } from './context.service.bootstrap'
import { MODULE_IDS } from './context.constants'
import type { ContextObject, ModuleId, Recommendation } from './context.types'

export interface RecommendInput {
  /** Authenticated user (required). */
  userId: string
  /** Module to dispatch to. */
  module: ModuleId
  /** Optional trip context — used when building the ContextObject. */
  tripId?: string
  /** Module-specific input. */
  input?: unknown
  /** Skip cache for the context build (e.g. fresh recompute). */
  bypassCache?: boolean
}

/**
 * Module handler signature. Each module exports a `recommend(input, ctx)`
 * that returns an array of partial-recommendations (data + scores). The
 * orchestrator normalizes them into the full `Recommendation<T>` envelope.
 */
export type ModuleHandler = (input: any, ctx: ContextObject) => Promise<
  Array<{
    type: string
    scores: import('./context.types').Scores
    data: any
    aiConfidence?: number
  }>
>

// Lazy import map — module services may not all exist yet. Phase 4+ adds them.
const moduleHandlers: Partial<Record<ModuleId, () => Promise<ModuleHandler>>> = {
  [MODULE_IDS.BUDGET]:       async () => (await import('./budget.service')).recommendBudget,
  [MODULE_IDS.TRANSPORT]:    async () => (await import('./transport.service')).recommendTransport,
  [MODULE_IDS.WEATHER]:      async () => (await import('./weather.service')).recommendWeather,
  [MODULE_IDS.HOTEL]:        async () => (await import('./hotel.service')).recommendHotels,
  [MODULE_IDS.RESTAURANT]:   async () => (await import('./restaurant.service')).recommendRestaurants,
  [MODULE_IDS.ROUTE]:        async () => (await import('./route.service')).recommendRoute,
  [MODULE_IDS.ITINERARY]:    async () => (await import('./itinerary.service')).recommendItinerary,
  [MODULE_IDS.RENTAL]:       async () => (await import('./rental.service')).recommendRental,
  [MODULE_IDS.ACTIVITY]:     async () => (await import('./activity.service')).recommendActivities,
  [MODULE_IDS.NOTIFICATION]: async () => (await import('./notification.service')).recommendNotifications,
}

async function getHandler(module: ModuleId): Promise<ModuleHandler> {
  const factory = moduleHandlers[module]
  if (factory) return factory()
  return stubHandler
}

async function stubHandler(_input: any, _ctx: ContextObject) {
  return []
}

function hashInput(input: unknown): string {
  const str = JSON.stringify(input ?? null)
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(36)
}

/**
 * Main entry point. Builds a context (with cache), dispatches to the right
 * module handler, scores each recommendation, logs the run, and returns the
 * final list.
 */
export async function recommend(req: RecommendInput): Promise<Recommendation<any>[]> {
  const ctx = await buildContext({
    userId: req.userId,
    tripId: req.tripId ?? null,
    bypassCache: req.bypassCache,
  })

  const handler = await getHandler(req.module)
  const raw = await handler(req.input ?? {}, ctx)

  // Phase 6: pull historical affinities for this user × module.
  let affinities: Awaited<ReturnType<typeof getModuleAffinities>> = {}
  try {
    affinities = await getModuleAffinities(req.userId)
  } catch {
    /* ignore */
  }
  const affinityMultiplier = affinities?.[req.module]?.multiplier ?? 1.0

  const env: Recommendation<any>[] = raw.map((r) => {
    const decision = decide(r.scores, ctx, r.data)
    const confidence = r.aiConfidence ?? decision.confidence
    const overallScore = Math.min(100, Math.round(decision.overallScore * affinityMultiplier))
    return {
      id: `${req.module}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      module: req.module,
      type: r.type,
      scores: r.scores,
      overallScore,
      aiConfidence: confidence,
      data: r.data,
      explanation: decision.explanation,
      generatedAt: new Date().toISOString(),
      inputHash: hashInput(req.input),
    }
  })

  // Persist a RecommendationLog row per module run (best-effort).
  try {
    await prisma.recommendationLog.create({
      data: {
        userId: req.userId,
        module: req.module,
        inputHash: hashInput(req.input),
        // Prisma's JSON field accepts any JSON-serializable value. Recommendation
        // objects are plain shapes so this serializes cleanly via JSON.stringify.
        outputJson: JSON.parse(JSON.stringify(env)) as any,
        aiConfidence: env.length > 0 ? Math.round(env.reduce((s, r) => s + r.aiConfidence, 0) / env.length) : 0,
      },
    })
  } catch (err: any) {
    console.warn('[Recommend] Failed to log recommendation:', err?.message || err)
  }

  return env
}

/**
 * Mark a recommendation as accepted (or rejected) — called by the
 * POST /api/context/feedback handler when the user acts on a recommendation.
 *
 * Phase 6: ties a feedback row to the most recent RecommendationLog of the
 * same module for the user. Falls back to "any recent log" if module is missing.
 */
export async function markRecommendation({
  userId,
  module: moduleId,
  accepted,
}: {
  userId: string
  module?: ModuleId
  accepted: boolean
}) {
  const where = moduleId ? { userId, module: moduleId } : { userId }
  const last = await prisma.recommendationLog.findFirst({
    where,
    orderBy: { createdAt: 'desc' },
  })
  if (!last) return false
  return prisma.recommendationLog.update({
    where: { id: last.id },
    data: { accepted },
  })
}

/**
 * Tally the last N feedback rows for a user and return a multiplier per module.
 * Used by the decision engine (Phase 6) to bias scoring weights toward modules
 * the user has historically engaged with positively.
 */
export async function getModuleAffinities(userId: string, lookbackDays = 90) {
  const since = new Date()
  since.setDate(since.getDate() - lookbackDays)
  const rows = await prisma.feedback.findMany({
    where: { userId, createdAt: { gte: since } },
    select: { module: true, action: true, rating: true },
  })

  const tally = new Map<string, { positive: number; negative: number; total: number; avgRating?: number; ratingSum: number; ratingCount: number }>()
  for (const row of rows) {
    const t = tally.get(row.module) ?? { positive: 0, negative: 0, total: 0, ratingSum: 0, ratingCount: 0 }
    t.total++
    if (['SAVED', 'BOOKED', 'RATED', 'CLICKED'].includes(row.action)) t.positive++
    if (['SKIPPED', 'IGNORED', 'CANCELLED'].includes(row.action)) t.negative++
    if (typeof row.rating === 'number') {
      t.ratingSum += row.rating
      t.ratingCount++
    }
    tally.set(row.module, t)
  }

  const affinities: Record<string, { multiplier: number; positive: number; negative: number; avgRating?: number }> = {}
  for (const [module, t] of tally.entries()) {
    const positiveRate = t.positive / Math.max(1, t.total)
    const avgRating = t.ratingCount > 0 ? t.ratingSum / t.ratingCount : undefined
    // Multiplier 0.85x (poor) ↔ 1.15x (great). Clamped.
    const mult = Math.min(1.15, Math.max(0.85, 0.85 + positiveRate * 0.3))
    affinities[module] = {
      multiplier: Number(mult.toFixed(2)),
      positive: t.positive,
      negative: t.negative,
      avgRating,
    }
  }
  return affinities
}