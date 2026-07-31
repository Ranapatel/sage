import axios, { type AxiosInstance } from 'axios'
import type { TrainStationInfo, TrainOption } from '@/store/tripStore'

// ─── Shared response shape from TripSage backend ─────────────────────────────

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  meta?: Record<string, any>
  error?: string | null
}

export interface SearchData {
  transport: any[]
  hotels:    any[]
  buses:     any[]
  busSearchUrl?: string
  cars:      any[]
  weather:   any
  itinerary: any[]
  exploration: any[]
  trains?:   any[]
  trainSearchUrl?: string
  trainStationInfo?: any
  flightError?: string
  flightValidation?: any
}

export interface ItineraryData {
  itinerary: any[]
  totalEstimatedCost?: number
  tips?: string[]
}

/** Matches the output schema from hotelRecommendationService.js */
export interface HotelRecommendation {
  hotel_name:            string
  price_per_night:       string   // "1200" | "Price unavailable"
  currency:              string
  rating:                string   // "4.5" | "Not rated"
  image_url:             string
  image_source:          'hotelbeds-cdn' | 'placeholder'
  location:              string
  amenities:             string[]
  booking_link:          string
  rate_key:              string | null
  rate_type:             string
  recommendation_reason: string
  image_path?:           string | null
  gallery_paths?:        string[]
  rooms?:                any[]
  _meta: {
    id:            string
    rank:          number
    score:         number
    source:        string
    nights:        number | null
    total_price:   number | null
    category_name: string | null
    live_status:   string | null
    rate_type:     string
  }
}

/** Response from POST /api/hotels/checkrate */
export interface CheckRateResult {
  success:              boolean
  rateType:             'BOOKABLE' | 'RECHECK'
  rateKey:              string
  netInr:               number
  net:                  string
  currency:             string
  boardCode:            string
  boardName:            string
  cancellationPolicies: { amount: string; from: string }[]
  rateComments:         string
  priceChanged:         boolean
  priceDiff:            number   // percentage change, e.g. +5 or -2
}

/** Hotel content from Hotelbeds Content API */
export interface HotelContent {
  code:          string | number
  name:          string
  description:   string
  address:       string
  city:          string
  postalCode:    string
  countryCode:   string
  phone:         string
  email:         string
  web:           string
  latitude:      number | null
  longitude:     number | null
  checkInTime:   string
  checkOutTime:  string
  categoryCode:  string
  categoryName:  string
  images:        { path: string; url: string; order: number; visualOrder: number; type: string }[]
  facilities:    { code: string; groupCode: string; name: string; hotelMandatory?: boolean; voucher?: boolean }[]
  issues?:       { code: string; dateFrom: string; dateTo: string }[]
}

/** Guest data collected by GuestInfoForm */
export interface GuestData {
  holder:    { firstName: string; lastName: string }
  guests:    { firstName: string; lastName: string }[]
  contact:   { email: string; phone: string }
}

/** Complete booking record stored after successful confirmation */
export interface FullBookingRecord {
  bookingId:            string
  status:               'CONFIRMED' | 'PENDING' | 'CANCELLED'
  bookingReference:     string
  clientReference:      string
  hotelName:            string
  hotelAddress:         string
  checkIn:              string
  checkOut:             string
  roomType:             string
  boardType:            string
  totalPrice:           number
  currency:             string
  guests:               { name: string; type: string; role: string }[]
  cancellationPolicies: { amount: string; from: string }[]
  bookingDate:          string
}

/** Voucher data from GET /api/booking/:id/voucher */
export interface VoucherData {
  bookingReference:  string
  clientReference:   string
  status:            string
  bookingDate:       string
  hotel: {
    code: string; name: string; address: string; phone: string
    checkIn: string; checkOut: string; checkInTime: string; checkOutTime: string
  }
  guests:             { name: string; type: string; role?: string }[]
  room:               { type: string; boardType: string }
  cancellationPolicy: string
  totalPaid:          { amount: number; currency: string }
  contact:            { email: string; phone: string }
  checkInInstructions: string[]
  rateComments?:      string
}

// ─── Axios instance ──────────────────────────────────────────────────────────

// The response interceptor unwraps res.data, so all methods resolve to ApiResponse<T>.
// We cast the axios instance to reflect this so callers get correct types.
//
// NEXT_PUBLIC_API_URL must be set in .env.local (http://localhost:4000 in dev).
// We also hard-code the local fallback so hot-reload works without a restart.
const _API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — inject session + Clerk bearer token if available.
_API.interceptors.request.use((config) => {
  if (typeof sessionStorage !== 'undefined') {
    const sessionId = sessionStorage.getItem('sessionId')
    if (sessionId) config.headers['x-session-id'] = sessionId
  }
  // Inject the Clerk bearer token if present in localStorage. The backend's
  // authMiddleware requires it on protected endpoints (e.g. /api/context/*).
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('tripsage-auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        const token = parsed?.state?.token
        if (token && !config.headers?.Authorization) {
          config.headers = config.headers ?? {}
          ;(config.headers as any).Authorization = `Bearer ${token}`
        }
      }
    } catch {
      // Ignore parse errors — protected endpoints will return 401.
    }
  }
  return config
})

// Response interceptor — unwraps res.data so callers receive the API body directly
_API.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const msg = err.response?.data?.message || err.message || 'Something went wrong'
    const customErr: any = new Error(msg)
    customErr.status = err.response?.status
    customErr.statusCode = err.response?.status
    customErr.url = err.config?.url
    customErr.method = err.config?.method?.toUpperCase()
    customErr.response = err.response
    customErr.code = err.code
    return Promise.reject(customErr)
  }
)

// Cast to any so we can re-declare with correct return types below
const API = _API as any

// ─── Trip API ────────────────────────────────────────────────────────────────

export const tripAPI = {
  search: (params: {
    from: string; to: string; startDate: string; endDate?: string
    budget?: number; travelers?: number; style?: string
    rooms?: number; adults?: number; children?: number
    isMultiCity?: boolean; stops?: Array<{ city: string; nights: number }>
  }, config?: { signal?: AbortSignal }): Promise<ApiResponse<SearchData>> =>
    API.post('/api/search', params, config),

  getAutocomplete: (query: string): Promise<ApiResponse<any[]>> =>
    API.get(`/api/places/autocomplete?query=${encodeURIComponent(query)}`),

  getIpLocation: (): Promise<ApiResponse<any>> =>
    API.get('/api/places/ip-location'),

  generateItinerary: (params: {
    destination: string; days: number; budget: number; currency?: string
    style: string; preferences: string[]; members: number; startDate?: string
    isMultiCity?: boolean; stops?: Array<{ city: string; nights: number }>
  }, config?: { signal?: AbortSignal }): Promise<ApiResponse<ItineraryData>> =>
    API.post('/api/itinerary/generate', params, config),

  optimizeBudget: (params: {
    destination: string; days: number; budget: number
    style: string; preferences: string[]; members: number
  }): Promise<ApiResponse<string>> =>
    API.post('/api/itinerary/optimize-budget', params),

  getWeather: (destination: string, config?: { signal?: AbortSignal }): Promise<ApiResponse<any>> =>
    API.get(`/api/weather/${encodeURIComponent(destination)}`, config),

  initBooking: (data: { type: 'flight' | 'hotel'; itemId: string; userDetails: any }): Promise<ApiResponse<any>> =>
    API.post('/api/booking/init', data),

  confirmBooking: (bookingId: string): Promise<ApiResponse<any>> =>
    API.post(`/api/booking/${bookingId}/confirm`),

  getActivities: (destination: string, params?: any): Promise<ApiResponse<any[]>> =>
    API.get(`/api/explore/activities/${encodeURIComponent(destination)}`, { params }),

  getRestaurants: (destination: string, params?: any): Promise<ApiResponse<any[]>> =>
    API.get(`/api/explore/restaurants/${encodeURIComponent(destination)}`, { params }),

  getPlaceDetails: (placeId: string): Promise<ApiResponse<any>> =>
    API.get(`/api/explore/details/${encodeURIComponent(placeId)}`),

  getExplorePlaces: (destination: string): Promise<ApiResponse<any[]>> =>
    API.get(`/api/explore/places/${encodeURIComponent(destination)}`),
  optimizeRoute: (params: {
    places: any[]
    preferences?: string[]
    travelStyle?: string
    tripId?: string
    dayNumber?: number
    trigger?: string
  }): Promise<ApiResponse<{
    optimizedPlaces: any[]
    wasOptimized: boolean
    totalDistanceKm: number
    estimatedTimeMinutes: number
    creditsUsed: number
    reason: string
  }>> =>
    API.post('/api/location/route/optimize', params),
  getNotifications: (sessionId: string): Promise<ApiResponse<any[]>> =>
    API.get(`/api/notifications/${sessionId}`),

  saveProfile: (profile: any): Promise<ApiResponse<any>> =>
    API.post('/api/profile', profile),

  getReviews: (): Promise<ApiResponse<any[]>> =>
    API.get('/api/reviews'),

  saveTrip: (tripData: any, token?: string | null): Promise<ApiResponse<any>> =>
    API.post('/api/trips', tripData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }),

  getUserTrips: (token?: string | null): Promise<ApiResponse<any[]>> =>
    API.get('/api/trips', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }),

  /**
   * Fetches ranked hotel recommendations from the Hotelbeds API.
   * Data is API-supplied only — no fabricated prices, ratings, or images.
   */
  recommendHotels: (params: {
    destination: string
    checkin:     string
    checkout:    string
    members?:    number
    budget?:     number
    rooms?:      number
    adults?:     number
    children?:   number
  }): Promise<ApiResponse<HotelRecommendation[]>> =>
    API.post('/api/hotels/recommend', params),

  /**
   * Validates a rate key before booking (Hotelbeds CheckRate API).
   * Required for RECHECK rates per Hotelbeds certification.
   */
  checkRate: (rateKey: string, originalPrice?: number, rateType?: string, hotelCode?: string): Promise<CheckRateResult> =>
    API.post('/api/hotels/checkrate', { rateKey, originalPrice, rateType, hotelCode }),

  /**
   * Fetches hotel content from the Hotelbeds Content API.
   * Returns real CDN images (photos.hotelbeds.com/giata/...) and facilities.
   */
  getHotelContent: (hotelCode: string): Promise<ApiResponse<HotelContent | null>> =>
    API.get(`/api/hotels/content/${encodeURIComponent(hotelCode)}`),

  /**
   * Creates a hotel booking with full guest pax data.
   * Implements the Hotelbeds certification booking flow.
   */
  initHotelBookingFull: (data: {
    type:        'hotel'
    itemId:      string
    userDetails: Record<string, any>
    holder:      { firstName: string; lastName: string }
    guests:      { firstName: string; lastName: string }[]
    contact:     { email: string; phone: string }
  }): Promise<ApiResponse<FullBookingRecord>> =>
    API.post('/api/booking/init', data),

  /**
   * Gets voucher data for a confirmed hotel booking.
   */
  getBookingVoucher: (bookingId: string): Promise<ApiResponse<VoucherData>> =>
    API.get(`/api/booking/${bookingId}/voucher`),

  searchTrains: (params: {
    departureCity: string
    destinationCity: string
    departureDate: string
    passengers?: number
    travelClass?: string
  }, config?: { signal?: AbortSignal }): Promise<{ trains: TrainOption[]; stationInfo: TrainStationInfo | null; isDomestic: boolean }> =>
    API.post('/api/train/search', params, config),

  /**
   * Transport Intelligence: Multi-modal door-to-door journey planning.
   * Searches direct trains/buses and finds alternative routes via hubs.
   */
  planTransport: (params: {
    origin: string
    destination: string
    date: string
    passengers?: number
    rankPreference?: 'fastest' | 'cheapest' | 'comfort' | 'balanced'
  }, config?: { signal?: AbortSignal }): Promise<ApiResponse<any>> =>
    API.post('/api/transport-intelligence/plan', params, config),
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authAPI = {
  signup: async (data: any): Promise<ApiResponse<any>> => ({ success: true, message: 'Mock success', data: {} }),
  login: async (email: string, password: string): Promise<ApiResponse<any>> => ({ success: true, message: 'Mock success', data: {} }),
  logout: async (): Promise<ApiResponse<any>> => ({ success: true, message: 'Mock success', data: {} }),
  me: async (data: any): Promise<ApiResponse<any>> => ({ success: true, message: 'Mock success', data: {} }),
  updateProfile: async (data: any): Promise<ApiResponse<any>> => ({ success: true, message: 'Mock success', data: {} }),
}

// ─── Contextual Intelligence API ─────────────────────────────────────────────
// Wired in Phase 4 of the Contextual Intelligence Layer plan. All endpoints
// require an authenticated Clerk session (Authorization: Bearer <token>) —
// the axios instance below adds it automatically when the caller passes
// `token` via `headers`. When called from `lib/apiClient.ts` (which holds
// the session token), auth happens automatically.

export type ScoreDimension =
  | 'journeyScore'
  | 'comfortScore'
  | 'budgetScore'
  | 'safetyScore'
  | 'convenienceScore'
  | 'reliabilityScore'
  | 'familyScore'
  | 'businessScore'
  | 'accessibilityScore'
  | 'aiConfidenceScore'

export interface ScoringWeights {
  journeyScore: number
  comfortScore: number
  budgetScore: number
  safetyScore: number
  convenienceScore: number
  reliabilityScore: number
  familyScore: number
  businessScore: number
  accessibilityScore: number
  aiConfidenceScore: number
}

export interface ContextUser {
  id: string
  clerkUserId: string
  email: string
  firstName?: string | null
  lastName?: string | null
  homeCity?: string | null
  country?: string | null
  language?: string
  currency?: string
  preferredTransport?: string | null
  dietaryRestrictions?: string[]
  accessibilityNotes?: string | null
  favoriteAirlines?: string[]
  favoriteHotelChains?: string[]
  favoriteCuisines?: string[]
}

export interface ContextTrip {
  id: string
  destination: string
  title: string
  startDate: string
  endDate: string
  budget: number
  travelers: number
  status: string
  daysUntilStart: number
  durationDays: number
}

export interface ContextDestination {
  city: string
  country?: string
  timezone?: string
  currency?: string
  lat?: number
  lng?: number
}

export interface ContextBudget {
  totalBudget: number
  perDay: number
  currency: string
  allocation: {
    accommodation: number
    transportation: number
    food: number
    activities: number
    emergency: number
  }
}

export interface ContextWeather {
  available: boolean
  currentTempC?: number
  forecastSummary?: string
  dailyForecast?: Array<{ date: string; minC: number; maxC: number; conditions: string }>
  recommendation?: string
}

export interface ContextPreferences {
  travelStyle?: string | null
  budgetRange?: string | null
  interests: string[]
  foodPreference: string[]
  accommodationPreference?: string | null
  tripDuration?: string | null
  favoriteCuisines: string[]
}

export interface ContextObject {
  version: number
  builtAt: string
  user: ContextUser
  trip: ContextTrip | null
  destination: ContextDestination | null
  budget: ContextBudget | null
  transport: { preferredMode?: string; recentSearches: Array<{ origin: string; destination: string; rankPreference?: string; createdAt: string }> }
  preferences: ContextPreferences
  liveData: { weather: ContextWeather; fx?: any; traffic?: any; delays?: any; safety?: any }
  itinerary: { dayCount: number; totalActivities: number; days: Array<{ dayNumber: number; title: string; activityCount: number }> } | null
  history: { totalTrips: number; totalSearches: number; recentFeedback: Array<{ module: string; action: string; rating?: number | null; createdAt: string }>; averageSpend?: number }
  scoringWeights: ScoringWeights
}

export type ModuleId =
  | 'budget' | 'transport' | 'weather' | 'hotel' | 'restaurant'
  | 'route' | 'itinerary' | 'rental' | 'activity' | 'notification'

export interface BudgetAllocation {
  category: 'accommodation' | 'transportation' | 'food' | 'activities' | 'emergency'
  perDay: number
  total: number
  percentage: number
}

export interface BudgetPlan {
  tripId?: string
  destination: string
  durationDays: number
  travelers: number
  totalBudget: number
  currency: string
  perDayBudget: number
  allocation: BudgetAllocation[]
  alternatives: Array<{ label: string; deltaCost: number; rationale: string }>
  warnings: Array<{ level: 'info' | 'warning' | 'critical'; message: string }>
}

export interface ContextRecommendation<T = any> {
  id: string
  module: ModuleId
  type: string
  scores: Partial<Record<ScoreDimension, number>>
  overallScore: number
  aiConfidence: number
  data: T
  explanation: string
  generatedAt: string
  inputHash: string
}

export const contextAPI = {
  /**
   * POST /api/context/build — build the ContextObject for the authenticated user.
   * Body: { tripId?: string, bypassCache?: boolean }
   */
  build: (params: { tripId?: string; bypassCache?: boolean } = {}): Promise<{ success: boolean; context: ContextObject }> =>
    API.post('/api/context/build', params),

  /**
   * POST /api/context/recommend — get recommendations for a module.
   * Body: { module, input, tripId?, bypassCache? }
   */
  recommend: <T = any>(params: {
    module: ModuleId
    input?: unknown
    tripId?: string
    bypassCache?: boolean
  }): Promise<{ success: boolean; module: ModuleId; recommendations: ContextRecommendation<T>[] }> =>
    API.post('/api/context/recommend', params),

  /**
   * POST /api/context/feedback — record user feedback.
   */
  feedback: (params: {
    module: string
    targetId: string
    action: 'SAVED' | 'SKIPPED' | 'RATED' | 'BOOKED' | 'CANCELLED' | 'CLICKED' | 'IGNORED'
    rating?: number
    tripId?: string
    metadata?: any
  }): Promise<{ success: boolean; feedback: any }> =>
    API.post('/api/context/feedback', params),

  /**
   * GET /api/context/notifications?onlyUnread=true&limit=50
   */
  listNotifications: (params?: { onlyUnread?: boolean; limit?: number }): Promise<{ success: boolean; notifications: any[] }> =>
    API.get('/api/context/notifications', { params }),

  markNotificationRead: (id: string): Promise<{ success: boolean; id: string; read: true }> =>
    API.post(`/api/context/notifications/${id}/read`),

  /**
   * POST /api/context/memory/favorite
   */
  toggleFavorite: (params: {
    type: 'hotel' | 'activity'
    action: 'add' | 'remove'
    hotelId?: string
    hotelName?: string
    city?: string
    rating?: number
    activityId?: string
    name?: string
    id?: string
  }): Promise<{ success: boolean; favorite?: any }> =>
    API.post('/api/context/memory/favorite', params),
}

/**
 * Budget Intelligence — front-end convenience wrapper.
 * Phase 4's first fully-wired module end-to-end.
 */
export const budgetAPI = {
  /**
   * Get the AI-recommended budget plan for a trip.
   * Wraps `contextAPI.recommend({ module: 'budget' })`.
   */
  plan: (params: { tripId?: string; bypassCache?: boolean; input?: any } = {}): Promise<{ success: boolean; recommendations: ContextRecommendation<BudgetPlan>[] }> =>
    API.post('/api/context/recommend', { module: 'budget', tripId: params.tripId, bypassCache: params.bypassCache, input: params.input ?? {} }),
}

export default _API
