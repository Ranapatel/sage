export interface SmartItineraryInput {
  destination: string
  origin?: string
  startDate?: string
  days?: number
  budget?: number
  currency?: string
  travelers?: number
  bookedHotel?: string | { name: string; coordinates?: any }
  travelStyle?: string
  interests?: string[]
  preferredLanguage?: string
}

export interface InteractivePlace {
  id?: string
  name: string
  time?: string
  durationMinutes?: number
  category?: string
  description?: string
  location?: { lat: number; lng: number }
  address?: string
  rating?: number
  price?: number
  whySuggested?: string
  audioGuideScript?: string
  photoUrl?: string
  [key: string]: any
}

export interface SmartItineraryDay {
  day: number
  date?: string
  theme?: string
  places: InteractivePlace[]
  summary?: string
  [key: string]: any
}

export interface SmartItineraryResponse {
  success: boolean
  destination: string
  totalDays: number
  weatherSummary?: string
  itinerary: SmartItineraryDay[]
  [key: string]: any
}

export interface LearningFeedback {
  tripId?: string
  destination: string
  rating: number
  likedCategories?: string[]
  dislikedCategories?: string[]
  comments?: string
  placeName?: string
  action?: string
  timestamp?: string
}
