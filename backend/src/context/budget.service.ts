/**
 * Budget Intelligence — Phase 4 of the Contextual Intelligence Layer plan.
 *
 * Reads Trip + TravelPreference + recent spend to produce a typed `BudgetPlan`
 * with daily allocation, by-category totals, alternatives, and warnings.
 *
 * Phase 3 stub: returns an empty list so the orchestrator imports cleanly.
 * Phase 4 replaces the body with the real implementation.
 */

import { prisma } from '../prisma/prisma.client'
import type { ContextObject } from './context.types'
import type { ModuleHandler } from './recommendation.service'
import { BUDGET_ALLOCATION_DEFAULTS, BUDGET_WARN } from './context.constants'
import type { BudgetAllocation, BudgetPlan } from './context.types'

export const recommendBudget: ModuleHandler = async (input: any, ctx: ContextObject) => {
  const trip = ctx.trip
  if (!trip) {
    return []
  }

  const totalBudget = trip.budget
  const durationDays = trip.durationDays
  const travelers = trip.travelers
  const perDayBudget = totalBudget / Math.max(1, durationDays)
  const currency = ctx.user.currency ?? 'INR'

  // Detect budget range from preferences.
  const range = (ctx.preferences.budgetRange || '').toLowerCase()
  const allocation = { ...BUDGET_ALLOCATION_DEFAULTS }
  if (range === 'budget') {
    allocation.accommodation = 0.40
    allocation.food = 0.28
    allocation.activities = 0.07
    allocation.emergency = 0.12
    allocation.transportation = 0.13
  } else if (range === 'luxury') {
    allocation.accommodation = 0.45
    allocation.food = 0.22
    allocation.activities = 0.12
    allocation.emergency = 0.08
    allocation.transportation = 0.13
  }

  const allocations: BudgetAllocation[] = (
    ['accommodation', 'transportation', 'food', 'activities', 'emergency'] as const
  ).map((category) => {
    const pct = allocation[category]
    const total = totalBudget * pct
    return {
      category,
      total,
      perDay: total / Math.max(1, durationDays),
      percentage: Math.round(pct * 100),
    }
  })

  // Build alternative plans the user can swap in.
  const alternatives: BudgetPlan['alternatives'] = []

  // 1. Cheaper: shave 20% off accommodation, push to other categories.
  const cheapPlan = { ...allocation, accommodation: 0.25, transportation: 0.20, food: 0.30, activities: 0.15, emergency: 0.10 }
  if (range !== 'budget') {
    alternatives.push({
      label: 'Budget-optimized',
      deltaCost: -totalBudget * 0.10,
      rationale: 'Saves ~10% by switching to hostels / street food / free attractions.',
    })
  }

  // 2. Premium: bump accommodation/food up.
  if (range !== 'luxury') {
    alternatives.push({
      label: 'Premium experience',
      deltaCost: totalBudget * 0.15,
      rationale: '4-star hotels, fine dining, and paid tours. Adds ~15% to total.',
    })
  }

  // 3. Family-of-N multiplier: if traveling in a group, suggest shared lodging.
  if (travelers >= 3) {
    alternatives.push({
      label: 'Group-friendly',
      deltaCost: -totalBudget * 0.05,
      rationale: 'Apartment rental + shared meals saves ~5% for 3+ travelers.',
    })
  }

  // Warnings — based on ratio of perDay to itinerary density.
  const daysPerTraveler = durationDays / Math.max(1, travelers)
  const warnings: BudgetPlan['warnings'] = []
  if (perDayBudget < 1000 && durationDays > 3) {
    warnings.push({
      level: 'warning',
      message: `Daily budget of ${currency} ${Math.round(perDayBudget)} is tight for a ${durationDays}-day trip. Consider cutting activities or extending duration.`,
    })
  }
  if (perDayBudget > 25000) {
    warnings.push({
      level: 'info',
      message: `Daily budget of ${currency} ${Math.round(perDayBudget)} is generous — consider adding buffer for premium experiences.`,
    })
  }
  if (range === 'luxury' && perDayBudget < 5000) {
    warnings.push({
      level: 'critical',
      message: 'Your travel style is "luxury" but the per-day budget is low. Confirm expectations.',
    })
  }
  void BUDGET_WARN

  const data: BudgetPlan = {
    tripId: trip.id,
    destination: trip.destination,
    durationDays,
    travelers,
    totalBudget,
    currency,
    perDayBudget,
    allocation: allocations,
    alternatives,
    warnings,
  }

  // Compute per-dimension scores for the decision engine.
  const scoredDaily = perDayBudget >= 1500 ? 85 : perDayBudget >= 800 ? 70 : 50
  const scoredFit = range === 'budget' ? 90 : range === 'luxury' ? 80 : 75
  const aiConfidence = allocations.length > 0 ? 80 : 50

  return [
    {
      type: 'BudgetPlan',
      scores: {
        budgetScore: scoredDaily,
        safetyScore: scoredFit,
        aiConfidenceScore: aiConfidence,
      },
      data,
      aiConfidence,
    },
  ]
}
