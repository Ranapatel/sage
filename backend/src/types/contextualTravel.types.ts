// ✂️ PONYTAIL: User travel context interface kept concise without deeply nested sub-schemas to minimize overhead.

export interface UserTravelContext {
  destination: string
  origin?: string
  startDate?: string
  days: number
  budget: number
  currency?: string
  members?: number
  travelStyle?: string
  interests?: string[]
  preferredLanguage?: string
}

export interface CollectedData {
  flights?: any[]
  hotels?: any[]
  trains?: any[]
  buses?: any[]
  activities?: any[]
  restaurants?: any[]
  weather?: any
  localEvents?: any[]
}

export interface ContextAnalysisResult {
  budgetFeasibility: {
    isFeasible: boolean
    estimatedTotal: number
    warning?: string
  }
  weatherImpact: {
    summary: string
    recommendOutdoor: boolean
  }
  distanceEfficiency: {
    avgDistanceKm: number
    suggestedTransport: string
  }
  score: number
}

export interface RecommendationExplanation {
  whyHotel?: string
  whyActivity?: string
  whyRestaurant?: string
  whyRoute?: string
  whyTiming?: string
}
