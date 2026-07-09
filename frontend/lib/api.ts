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
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — inject session
_API.interceptors.request.use((config) => {
  if (typeof sessionStorage !== 'undefined') {
    const sessionId = sessionStorage.getItem('sessionId')
    if (sessionId) config.headers['x-session-id'] = sessionId
  }
  return config
})

// Response interceptor — unwraps res.data so callers receive the API body directly
_API.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const msg = err.response?.data?.message || err.message || 'Something went wrong'
    return Promise.reject(new Error(msg))
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
  }, config?: { signal?: AbortSignal }): Promise<ApiResponse<SearchData>> =>
    API.post('/api/search', params, config),

  getAutocomplete: (query: string): Promise<ApiResponse<any[]>> =>
    API.get(`/api/places/autocomplete?query=${encodeURIComponent(query)}`),

  getIpLocation: (): Promise<ApiResponse<any>> =>
    API.get('/api/places/ip-location'),

  generateItinerary: (params: {
    destination: string; days: number; budget: number; currency?: string
    style: string; preferences: string[]; members: number; startDate?: string
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

  getExplorePlaces: (destination: string): Promise<ApiResponse<any[]>> =>
    API.get(`/api/explore/places/${encodeURIComponent(destination)}`),



  getNotifications: (sessionId: string): Promise<ApiResponse<any[]>> =>
    API.get(`/api/notifications/${sessionId}`),

  saveProfile: (profile: any): Promise<ApiResponse<any>> =>
    API.post('/api/profile', profile),

  getReviews: (): Promise<ApiResponse<any[]>> =>
    API.get('/api/reviews'),

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
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authAPI = {
  signup: async (data: any): Promise<ApiResponse<any>> => ({ success: true, message: 'Mock success', data: {} }),
  login: async (email: string, password: string): Promise<ApiResponse<any>> => ({ success: true, message: 'Mock success', data: {} }),
  logout: async (): Promise<ApiResponse<any>> => ({ success: true, message: 'Mock success', data: {} }),
  me: async (): Promise<ApiResponse<any>> => ({ success: true, message: 'Mock success', data: {} }),
  updateProfile: async (data: any): Promise<ApiResponse<any>> => ({ success: true, message: 'Mock success', data: {} }),
}

export default _API
