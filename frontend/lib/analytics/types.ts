/**
 * Google Analytics 4 (GA4) Strongly-Typed Event Definitions for TripSage
 */

export interface CommonMetadata {
  userId?: string;
  tripId?: string;
  destination?: string;
  budget?: number | string;
  travelers?: number;
  duration?: number | string;
  source?: string;
  deviceType?: string;
  [key: string]: any;
}

// ─── Event Interfaces ────────────────────────────────────────────────────────

// 1. Auth Events
export interface SignupParams extends CommonMetadata {
  method?: 'clerk' | 'email' | 'google' | string;
}
export interface LoginParams extends CommonMetadata {
  method?: 'clerk' | 'email' | 'google' | string;
}
export interface LogoutParams extends CommonMetadata {}

// 2. Trip Flow Events
export interface CreateTripParams extends CommonMetadata {
  origin?: string;
  travelDates?: string;
  preferences?: string[];
}
export interface ItineraryGenStartedParams extends CommonMetadata {
  promptLength?: number;
  mode?: string;
}
export interface ItineraryGenSuccessParams extends CommonMetadata {
  generationDurationMs?: number;
  totalActivities?: number;
  totalCost?: number;
}
export interface ItineraryGenFailedParams extends CommonMetadata {
  errorMessage?: string;
  errorCode?: string;
}
export interface ItinerarySavedParams extends CommonMetadata {
  isPublic?: boolean;
}
export interface ItinerarySharedParams extends CommonMetadata {
  shareMethod?: 'link' | 'social' | 'copy' | string;
}
export interface ItineraryDeletedParams extends CommonMetadata {}

// 3. Search Events
export interface SearchEventParams extends CommonMetadata {
  origin?: string;
  destination?: string;
  date?: string;
  passengers?: number;
  query?: string;
  filterCount?: number;
}

// 4. Recommendation Events
export interface RecommendationViewParams extends CommonMetadata {
  itemType?: 'hotel' | 'flight' | 'restaurant' | 'activity' | 'place' | string;
  itemId?: string;
  itemName?: string;
  rankPosition?: number;
}
export interface RecommendationClickParams extends RecommendationViewParams {
  ctaLabel?: string;
}
export interface RecommendationSaveParams extends RecommendationViewParams {}

// 5. Monetization & Affiliate Events
export interface AffiliateClickParams extends CommonMetadata {
  provider?: string;
  partnerName?: string;
  itemType?: 'flight' | 'hotel' | 'train' | 'bus' | 'car' | 'activity' | string;
  itemName?: string;
  price?: number;
  affiliateUrl?: string;
}
export interface BookingClickParams extends AffiliateClickParams {}
export interface PremiumUpgradeClickParams extends CommonMetadata {
  planTier?: string;
  price?: number;
  featureContext?: string;
}

// 6. Memory Events
export interface PhotoUploadParams extends CommonMetadata {
  fileSizeMb?: number;
  fileType?: string;
}
export interface MemoryViewParams extends CommonMetadata {
  memoryId?: string;
}

// 7. AI Events
export interface AiResponseGeneratedParams extends CommonMetadata {
  model?: string;
  tokensUsed?: number;
  responseTimeMs?: number;
  promptCategory?: string;
}
export interface AiGenerationFailedParams extends CommonMetadata {
  model?: string;
  errorMessage?: string;
}
export interface AiFeedbackParams extends CommonMetadata {
  promptCategory?: string;
  feedbackText?: string;
  rating?: number;
}

// 8. Error Events
export interface ErrorParams extends CommonMetadata {
  errorMessage: string;
  errorCode?: string | number;
  stackTrace?: string;
  componentName?: string;
}

// 9. Performance Events
export interface PerformanceParams extends CommonMetadata {
  metricName: string;
  durationMs: number;
  path?: string;
}

// ─── Event Name Map ──────────────────────────────────────────────────────────

export type AnalyticsEventName =
  // Auth
  | 'signup'
  | 'login'
  | 'logout'
  // Trip Flow
  | 'create_trip'
  | 'itinerary_generation_started'
  | 'itinerary_generation_success'
  | 'itinerary_generation_failed'
  | 'itinerary_saved'
  | 'itinerary_shared'
  | 'itinerary_deleted'
  // Search
  | 'flight_search'
  | 'hotel_search'
  | 'train_search'
  | 'bus_search'
  | 'rental_search'
  | 'restaurant_search'
  | 'activity_search'
  // Recommendation
  | 'recommendation_view'
  | 'recommendation_click'
  | 'recommendation_save'
  // Monetization
  | 'affiliate_click'
  | 'booking_click'
  | 'premium_upgrade_click'
  // Memories
  | 'photo_upload'
  | 'memory_view'
  // AI
  | 'ai_response_generated'
  | 'ai_generation_failed'
  | 'ai_feedback_positive'
  | 'ai_feedback_negative'
  // Errors
  | 'api_error'
  | 'ui_error'
  | 'upload_failure'
  | 'auth_error'
  // Performance
  | 'page_load_time'
  | 'api_response_time'
  | 'itinerary_generation_duration'
  // General / Legacy
  | 'page_view'
  | string;
