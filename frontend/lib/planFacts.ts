/**
 * Trip cost lines always add up to the published total.
 * Spend strings like "₹1,200" are one amount; a comma is not a second number.
 */

export interface CostSummary {
  total: number
  flights: number
  hotels: number
  food: number
  activities: number
}

export function parseSpendAmount(spend?: string | null): number {
  if (!spend) return 0
  const normalized = String(spend).replace(/,/g, '')
  const nums = normalized.match(/\d+/g)
  if (!nums || nums.length === 0) return 0
  if (nums.length === 1) return parseInt(nums[0], 10)
  const first = parseInt(nums[0], 10)
  const last = parseInt(nums[nums.length - 1], 10)
  return (first + last) / 2
}

export function placeSpend(place: { estimatedCost?: number; estimatedSpend?: string } | null | undefined): number {
  if (!place) return 0
  if (typeof place.estimatedCost === 'number' && Number.isFinite(place.estimatedCost)) {
    return place.estimatedCost
  }
  return parseSpendAmount(place.estimatedSpend)
}

/** Four lines that add up to the budget exactly. The last line keeps the remainder. */
export function allocateBudget(budget: number): CostSummary {
  const totalBudget = Math.max(0, Math.round(budget || 0))
  const flights = Math.floor(totalBudget * 0.4)
  const hotels = Math.floor(totalBudget * 0.25)
  const activities = Math.floor(totalBudget * 0.2)
  const food = totalBudget - flights - hotels - activities
  return {
    total: flights + hotels + food + activities,
    flights,
    hotels,
    food,
    activities,
  }
}

export function summaryFromBreakdown(raw: any, totalEstimated?: number): CostSummary | null {
  if (!raw || typeof raw !== 'object') return null
  const flights = Math.round(Number(raw.flightsEstimate ?? raw.transportEstimate) || 0)
  const hotels = Math.round(Number(raw.hotelsEstimate) || 0)
  const food = Math.round(Number(raw.foodEstimate) || 0)
  const activities = Math.round(Number(raw.activitiesEstimate) || 0)
  const sum = flights + hotels + food + activities
  const total = Number.isFinite(Number(totalEstimated)) ? Math.round(Number(totalEstimated)) : sum
  if (total !== sum) return null
  return { total, flights, hotels, food, activities }
}
