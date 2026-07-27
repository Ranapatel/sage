// ✂️ PONYTAIL: Smart Budget Intelligence types defining inputs, feasibility statuses, allocations, and spending tracking.

export interface SmartBudgetInput {
  destination: string
  origin?: string
  startDate?: string
  durationDays: number
  budget: number
  currency?: string
  travelers?: number
  travelStyle?: string
  preferences?: string[]
}

export type FeasibilityStatus = 'WITHIN_BUDGET' | 'TIGHT_BUT_FEASIBLE' | 'NOT_FEASIBLE'

export interface CostEstimates {
  flights: number
  hotels: number
  localTransport: number
  dining: number
  activities: number
  miscellaneous: number
  totalEstimate: number
}

export interface BudgetAllocation {
  accommodation: number
  transportation: number
  food: number
  activities: number
  emergencyBuffer: number
  perDayBreakdown: {
    day: number
    allocatedAmount: number
    suggestedMaxMealCost: number
    suggestedMaxStayCost: number
  }[]
}

export interface BudgetAlternativeSuggestions {
  minimumRequiredBudget: number
  shortenedTripOption?: {
    suggestedDays: number
    estimatedCost: number
  }
  nearbyDestinationOption?: {
    destinationName: string
    estimatedCost: number
  }
  flexibleDateAdvice: string
}

export interface BudgetFeasibilityResult {
  status: FeasibilityStatus
  estimates: CostEstimates
  feasibilitySummary: string
  allocation: BudgetAllocation
  alternatives?: BudgetAlternativeSuggestions
}

export interface SpendingItem {
  id?: string
  category: 'accommodation' | 'transportation' | 'food' | 'activities' | 'misc'
  amount: number
  description: string
  date?: string
}

export interface SpendingTrackResult {
  totalBudget: number
  totalSpent: number
  remainingBudget: number
  burnRatePerDay: number
  projectedOverspend: boolean
  warningAlert?: string
  cheaperAlternatives?: string[]
}
