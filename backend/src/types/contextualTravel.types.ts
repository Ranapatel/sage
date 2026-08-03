export interface UserTravelContext {
  destination?: string
  origin?: string
  startDate?: string
  days?: number
  budget?: number
  members?: number
  interests?: string[]
  [key: string]: any
}

export interface CollectedData {
  hotels?: any[]
  activities?: any[]
  weather?: any
  flights?: any[]
  trains?: any[]
  buses?: any[]
  [key: string]: any
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
