// ✂️ PONYTAIL: Smart Budget Intelligence Service implementing Phase 2 Feasibility, Phase 3 Optimization & Alternatives, Phase 4 Daily Allocation, and Phase 5 Real-Time Spending Tracking.

import {
  SmartBudgetInput,
  BudgetFeasibilityResult,
  CostEstimates,
  BudgetAllocation,
  BudgetAlternativeSuggestions,
  FeasibilityStatus,
  SpendingItem,
  SpendingTrackResult,
} from '../types/smartBudget.types'

export class SmartBudgetIntelligenceService {
  /**
   * Phase 2 & Phase 3: Analyze Budget Feasibility & Generate Intelligent Allocations or Alternatives
   */
  static analyzeAndOptimize(input: SmartBudgetInput): BudgetFeasibilityResult {
    const { destination, durationDays = 2, budget = 5000, travelers = 1 } = input

    // Baseline cost estimation heuristics per day & person
    const isDomestic = !/europe|usa|japan|uk|australia/i.test(destination)
    const baseDailyStay = isDomestic ? 1200 : 5000
    const baseDailyFood = isDomestic ? 800 : 2500
    const baseDailyTransit = isDomestic ? 300 : 1200
    const baseDailyActivities = isDomestic ? 400 : 1800
    const baseFlightCost = input.origin ? (isDomestic ? 3500 : 25000) * travelers : 0

    const estHotels = Math.round(baseDailyStay * durationDays * Math.ceil(travelers / 2))
    const estFood = Math.round(baseDailyFood * durationDays * travelers)
    const estTransport = Math.round((baseDailyTransit * durationDays * travelers) + baseFlightCost)
    const estActivities = Math.round(baseDailyActivities * durationDays * travelers)
    const estMisc = Math.round(budget * 0.05)

    const totalEstimate = estHotels + estFood + estTransport + estActivities + estMisc

    const estimates: CostEstimates = {
      flights: baseFlightCost,
      hotels: estHotels,
      localTransport: Math.round(baseDailyTransit * durationDays * travelers),
      dining: estFood,
      activities: estActivities,
      miscellaneous: estMisc,
      totalEstimate,
    }

    let status: FeasibilityStatus = 'WITHIN_BUDGET'
    let feasibilitySummary = `Your budget of ₹${budget.toLocaleString('en-IN')} is sufficient for ${durationDays} days in ${destination}.`

    if (totalEstimate > budget * 1.35) {
      status = 'NOT_FEASIBLE'
      feasibilitySummary = `Allocated budget (₹${budget.toLocaleString('en-IN')}) is below the estimated minimum requirement (₹${totalEstimate.toLocaleString('en-IN')}) for ${durationDays} days in ${destination}.`
    } else if (totalEstimate > budget) {
      status = 'TIGHT_BUT_FEASIBLE'
      feasibilitySummary = `Budget of ₹${budget.toLocaleString('en-IN')} is tight. We recommend budget hostels, local transit, and prioritizing free attractions in ${destination}.`
    }

    const allocation = this.allocateDailyBudget(budget, durationDays, travelers)

    let alternatives: BudgetAlternativeSuggestions | undefined = undefined
    if (status === 'NOT_FEASIBLE') {
      alternatives = this.generateAlternatives(input, totalEstimate)
    }

    return {
      status,
      estimates,
      feasibilitySummary,
      allocation,
      alternatives,
    }
  }

  /**
   * Phase 4: Daily Budget Allocation with 10% Emergency Buffer
   */
  static allocateDailyBudget(totalBudget: number, days: number, travelers: number = 1): BudgetAllocation {
    const accommodation = Math.round(totalBudget * 0.35)
    const transportation = Math.round(totalBudget * 0.20)
    const food = Math.round(totalBudget * 0.25)
    const activities = Math.round(totalBudget * 0.10)
    const emergencyBuffer = Math.round(totalBudget * 0.10)

    const netDailyBudget = Math.round((totalBudget - emergencyBuffer) / days)

    const perDayBreakdown = Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      allocatedAmount: netDailyBudget,
      suggestedMaxMealCost: Math.round((food / days) / 3),
      suggestedMaxStayCost: Math.round(accommodation / days),
    }))

    return {
      accommodation,
      transportation,
      food,
      activities,
      emergencyBuffer,
      perDayBreakdown,
    }
  }

  /**
   * Phase 3: Intelligent Budget Alternatives when budget is too low
   */
  private static generateAlternatives(input: SmartBudgetInput, minRequiredBudget: number): BudgetAlternativeSuggestions {
    const { destination, durationDays = 3, budget } = input

    // 1. Shortened trip option
    const shortenedDays = Math.max(1, Math.floor(durationDays * (budget / minRequiredBudget)))
    const shortenedCost = Math.round((minRequiredBudget / durationDays) * shortenedDays)

    // 2. Cheaper nearby destination option
    const destinationLower = destination.toLowerCase()
    let nearbyDestination = 'a nearby scenic town'
    if (destinationLower.includes('goa')) nearbyDestination = 'Gokarna'
    else if (destinationLower.includes('mumbai')) nearbyDestination = 'Lonavala'
    else if (destinationLower.includes('delhi') || destinationLower.includes('jaipur')) nearbyDestination = 'Pushkar'
    else if (destinationLower.includes('paris') || destinationLower.includes('london')) nearbyDestination = 'Prague'

    return {
      minimumRequiredBudget: minRequiredBudget,
      shortenedTripOption: {
        suggestedDays: shortenedDays,
        estimatedCost: shortenedCost,
      },
      nearbyDestinationOption: {
        destinationName: nearbyDestination,
        estimatedCost: Math.round(minRequiredBudget * 0.65),
      },
      flexibleDateAdvice: `Consider travelling mid-week or during off-peak season to save up to 35% on stays and transport in ${destination}.`,
    }
  }

  /**
   * Phase 5: Real-Time Budget Tracking & Overspend Warning System
   */
  static trackSpending(
    totalBudget: number,
    spendingItems: SpendingItem[],
    currentDay: number = 1,
    totalDays: number = 2
  ): SpendingTrackResult {
    const totalSpent = spendingItems.reduce((sum, item) => sum + item.amount, 0)
    const remainingBudget = totalBudget - totalSpent
    const avgDailyAllowed = totalBudget / totalDays
    const currentBurnRate = totalSpent / currentDay
    const projectedTotal = currentBurnRate * totalDays
    const projectedOverspend = projectedTotal > totalBudget

    let warningAlert: string | undefined = undefined
    let cheaperAlternatives: string[] | undefined = undefined

    if (remainingBudget <= 0) {
      warningAlert = `⚠️ CRITICAL: You have exceeded your total budget by ₹${Math.abs(remainingBudget).toLocaleString('en-IN')}!`
      cheaperAlternatives = [
        'Switch to free public parks and walking tours for remaining days.',
        'Opt for local street food or grocery dining.',
        'Use local buses/trains instead of taxis.',
      ]
    } else if (projectedOverspend) {
      warningAlert = `⚠️ WARNING: At your current spending rate (₹${Math.round(currentBurnRate)}/day), you are projected to exceed your budget by ₹${Math.round(projectedTotal - totalBudget)}.`
      cheaperAlternatives = [
        `Cap remaining daily dining spend to under ₹${Math.round((remainingBudget / (totalDays - currentDay + 1)) * 0.4)} per day.`,
        'Use local transit or shared rides for the rest of your trip.',
      ]
    }

    return {
      totalBudget,
      totalSpent,
      remainingBudget: Math.max(0, remainingBudget),
      burnRatePerDay: Math.round(currentBurnRate),
      projectedOverspend,
      warningAlert,
      cheaperAlternatives,
    }
  }
}
