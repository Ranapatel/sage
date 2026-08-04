/**
 * TripSage — Google Places Integration Types
 *
 * These are TripSage-internal types. The UI consumes only these shapes.
 * Google-specific raw types are kept private inside the service files.
 */

// ── TripSage Normalized Place ────────────────────────────────────────────────

export interface TripSagePlace {
  id: string                      // Google Place ID or internal ID
  name: string
  address: string
  latitude: number
  longitude: number
  rating: number | null
  userRatingsTotal: number | null
  priceLevel: number | null       // 0-4 (Google scale)
  category: PlaceCategory
  types: string[]                 // raw Google types, useful for filtering
  photoUrl: string | null         // first photo URL (pre-resolved)
  googleMapsUrl: string
  isOpenNow: boolean | null
  source: 'google_places'
}

// ── Place Details (extended info for detail pages) ───────────────────────────

export interface TripSagePlaceDetails extends TripSagePlace {
  phone: string | null
  website: string | null
  editorialSummary: string | null
  openingHours: string[] | null   // human-readable period strings
  reviews: TripSagePlaceReview[]
  photos: TripSagePlacePhoto[]
}

export interface TripSagePlaceReview {
  author: string
  rating: number
  text: string
  relativeTime: string
  profilePhotoUrl: string | null
}

export interface TripSagePlacePhoto {
  url: string
  width: number
  height: number
  attributions: string[]
}

// ── Categories ──────────────────────────────────────────────────────────────

export type PlaceCategory =
  // searchPlaces categories
  | 'attractions' | 'restaurants' | 'cafes' | 'museums' | 'parks'
  | 'shopping' | 'beaches' | 'temples' | 'landmarks'
  // nearbySearch categories
  | 'hospitals' | 'pharmacies' | 'bus_stops' | 'metro_stations'
  | 'parking' | 'fuel_stations'
  // catch-all
  | 'general'

// ── Google Places API (New) included types mapping ──────────────────────────
// Maps TripSage categories → Google Places API (New) `includedTypes` values.
// Ref: https://developers.google.com/maps/documentation/places/web-service/place-types

export const CATEGORY_TO_GOOGLE_TYPES: Record<PlaceCategory, string[]> = {
  attractions:     ['tourist_attraction'],
  restaurants:     ['restaurant'],
  cafes:           ['cafe'],
  museums:         ['museum'],
  parks:           ['park'],
  shopping:        ['shopping_mall', 'department_store'],
  beaches:         ['natural_feature'],  // ponytail: no "beach" type in Places (New); natural_feature + textQuery is the ceiling. Upgrade: use textQuery "beaches near X" directly.
  temples:         ['hindu_temple', 'church', 'mosque', 'synagogue'],
  landmarks:       ['historical_landmark', 'tourist_attraction'],
  hospitals:       ['hospital'],
  pharmacies:      ['pharmacy'],
  bus_stops:       ['bus_station'],
  metro_stations:  ['subway_station'],
  parking:         ['parking'],
  fuel_stations:   ['gas_station'],
  general:         ['point_of_interest'],
}

// ── Search / Nearby request params ──────────────────────────────────────────

export interface SearchPlacesParams {
  destination: string
  category: PlaceCategory
  maxResults?: number     // default 10
}

export interface NearbySearchParams {
  latitude: number
  longitude: number
  category: PlaceCategory
  radiusMeters?: number   // default 1500
  maxResults?: number     // default 10
}

export interface PlaceDetailsParams {
  placeId: string
}

export interface PlacePhotosParams {
  placeId: string
  maxPhotos?: number      // default 5
  maxWidthPx?: number     // default 800
}

// ── Hybrid Itinerary Models ──────────────────────────────────────────────────

export interface PlaceReviewSummary {
  loved: string[]                  // key highlights visitors loved
  complaints: string[]             // common complaints or gotchas
  photographyTips: string[]        // tips for photography, best angles, timing
  accessibilityNotes: string       // accessibility insights
  bestHours: string                // best hours to visit
  whoShouldVisit: string           // target demographic description
  whoShouldSkip: string            // who should skip this place
  hiddenTips: string[]             // lesser-known tips
}

export interface HybridItinerarySlot {
  placeId: string | null           // Google Place ID, null if transit/meals not matching google
  name: string                     // name matching Google Place or specific dining spot
  time: string                     // e.g. "09:00"
  category: PlaceCategory
  activity: string                 // specific description of what to do
  visitDurationMinutes: number     // estimated time on site
  estimatedCost: number            // cost in INR
  tip: string                      // local tip from LLM
}

export interface HybridItinerarySlotExtended extends HybridItinerarySlot {
  rating?: number | null
  reviewsCount?: number | null
  photoUrl?: string | null
  googleMapsUrl?: string | null
  phone?: string | null
  website?: string | null
  openingHours?: string[] | null
  coordinates?: [number, number]
  reviewSummary?: PlaceReviewSummary | null
}

export interface HybridDayPlan {
  day: number
  date: string                     // YYYY-MM-DD
  slots: {
    morning: HybridItinerarySlotExtended | null
    afternoon: HybridItinerarySlotExtended | null
    evening: HybridItinerarySlotExtended | null
    night: HybridItinerarySlotExtended | null
  }
  places: HybridItinerarySlotExtended[]
  travelTimeMinutes: number        // sum of daily transit times
  walkingDistanceMeters: number    // total walking distance estimation
  transportation: string           // daily transport recommendations (e.g. metro, walking, auto)
  rainyDayAlternatives: string[]   // alternative indoor activities for this day
}

export interface HybridItinerary {
  destination: string
  days: number
  style: string
  itinerary: HybridDayPlan[]
  totalEstimatedCost: number
  budgetBreakdown: {
    flightsEstimate: number
    hotelsEstimate: number
    foodEstimate: number
    activitiesEstimate: number
    remainingBudget: number
  }
  budgetWarning: string | null
  tips: string[]
}

export interface UserPersonaVector {
  pace?: 'Relaxed' | 'Balanced' | 'Packed'
  walkingToleranceKm?: number
  ageGroup?: 'Youth' | 'Adults' | 'Seniors' | 'FamilyWithKids'
  accessibilityNeeds?: string[]
  dietaryPreferences?: string[]
  solarPreference?: 'sunrise' | 'sunset' | 'golden_hour' | 'none'
}

export interface HybridItineraryParams {
  destination: string
  from?: string
  days: number
  budget: number
  currency?: string
  style: string
  members: number
  preferences?: string[]
  startDate?: string
  persona?: UserPersonaVector
  pace?: 'Relaxed' | 'Balanced' | 'Packed'
  walkingToleranceKm?: number
  ageGroup?: 'Youth' | 'Adults' | 'Seniors' | 'FamilyWithKids'
  accessibilityNeeds?: string[]
  dietaryPreferences?: string[]
  solarPreference?: 'sunrise' | 'sunset' | 'golden_hour' | 'none'
}

// Update TripSagePlaceDetails to optionally hold the reviewSummary
export interface TripSagePlaceDetailsExtended extends TripSagePlaceDetails {
  reviewSummary?: PlaceReviewSummary | null
}

