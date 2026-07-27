// ✂️ PONYTAIL: Smart Itinerary Intelligence types covering Phases 1 through 8 including interactive place metadata and continuous learning feedback.

export interface SmartItineraryInput {
  destination: string
  origin?: string
  startDate?: string
  days: number
  budget: number
  currency?: string
  travelers?: number
  bookedHotel?: {
    name: string
    address?: string
    coordinates?: [number, number]
  }
  travelStyle?: string
  interests?: string[]
  preferredLanguage?: string
}

export interface InteractivePlace {
  name: string
  category: 'culture' | 'nature' | 'dining' | 'activity' | 'transport' | 'shopping' | 'accommodation'
  time: string
  coordinates: [number, number]
  description: string
  estimatedCost: number
  // Phase 5: Rationale & Explanations
  whySelected: string
  bestTimeToVisit: string
  nearbyPlaces: string[]
  travelTimeMinutes: number
  tips: string
  // Phase 6: Interactive Metadata
  realTimeImages: string[]
  googleMapsUrl: string
  voiceScript: string
  bookingUrl?: string
}

export interface SmartItineraryDay {
  day: number
  date: string
  places: InteractivePlace[]
}

export interface SmartItineraryResponse {
  success: boolean
  destination: string
  totalDays: number
  totalEstimatedCost: number
  itinerary: SmartItineraryDay[]
  explanationsSummary: {
    whyHotel: string
    whyActivities: string
    whyRestaurants: string
    whyRoute: string
    whyTiming: string
  }
  tips: string[]
}

export interface LearningFeedback {
  userId?: string
  tripId?: string
  placeName: string
  action: 'saved' | 'skipped' | 'rated'
  rating?: number
  timestamp?: string
}
