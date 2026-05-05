import axios, { type AxiosInstance } from 'axios'

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
  cars:      any[]
  weather:   any
  itinerary: any[]
  exploration: any[]
}

export interface ItineraryData {
  itinerary: any[]
  totalEstimatedCost?: number
  tips?: string[]
}

// ─── Axios instance ──────────────────────────────────────────────────────────

// The response interceptor unwraps res.data, so all methods resolve to ApiResponse<T>.
// We cast the axios instance to reflect this so callers get correct types.
const _API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — inject session + auth token
_API.interceptors.request.use((config) => {
  if (typeof sessionStorage !== 'undefined') {
    const sessionId = sessionStorage.getItem('sessionId')
    if (sessionId) config.headers['x-session-id'] = sessionId
  }
  if (!config.headers['Authorization'] && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('tripsage-auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        const token = parsed?.state?.token
        if (token) config.headers['Authorization'] = `Bearer ${token}`
      }
    } catch { /* ignore */ }
  }
  return config
})

// Response interceptor — unwraps res.data so callers receive the API body directly
_API.interceptors.response.use(
  (res) => res.data,
  (err) => {
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
  }, noCache = false): Promise<ApiResponse<SearchData>> =>
    API.post('/api/search', params, noCache ? { headers: { 'x-no-cache': '1' } } : {}),

  getAutocomplete: (query: string): Promise<ApiResponse<any[]>> =>
    API.get(`/api/places/autocomplete?query=${encodeURIComponent(query)}`),

  getIpLocation: (): Promise<ApiResponse<any>> =>
    API.get('/api/places/ip-location'),

  generateItinerary: (params: {
    destination: string; days: number; budget: number
    style: string; preferences: string[]; members: number; startDate?: string
  }, noCache = false): Promise<ApiResponse<ItineraryData>> =>
    API.post('/api/itinerary/generate', params, noCache ? { headers: { 'x-no-cache': '1' } } : {}),

  optimizeBudget: (params: {
    destination: string; days: number; budget: number
    style: string; preferences: string[]; members: number
  }): Promise<ApiResponse<string>> =>
    API.post('/api/itinerary/optimize-budget', params),

  getWeather: (destination: string): Promise<ApiResponse<any>> =>
    API.get(`/api/weather/${encodeURIComponent(destination)}`),

  initBooking: (data: { type: 'flight' | 'hotel'; itemId: string; userDetails: any }): Promise<ApiResponse<any>> =>
    API.post('/api/booking/init', data),

  confirmBooking: (bookingId: string): Promise<ApiResponse<any>> =>
    API.post(`/api/booking/${bookingId}/confirm`),

  getActivities: (destination: string, category?: string): Promise<ApiResponse<any[]>> =>
    API.get(`/api/explore/activities/${encodeURIComponent(destination)}`, { params: { category } }),

  getRestaurants: (destination: string): Promise<ApiResponse<any[]>> =>
    API.get(`/api/explore/restaurants/${encodeURIComponent(destination)}`),

  getNotifications: (sessionId: string): Promise<ApiResponse<any[]>> =>
    API.get(`/api/notifications/${sessionId}`),

  saveProfile: (profile: any): Promise<ApiResponse<any>> =>
    API.post('/api/profile', profile),
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authAPI = {
  signup: (data: { name: string; email: string; password: string; currency: string; country: string }): Promise<ApiResponse<any>> =>
    API.post('/api/auth/signup', data),
  login: (email: string, password: string): Promise<ApiResponse<any>> =>
    API.post('/api/auth/login', { email, password }),
  logout: (): Promise<ApiResponse<any>> =>
    API.post('/api/auth/logout'),
  me: (): Promise<ApiResponse<any>> =>
    API.get('/api/auth/me'),
  updateProfile: (data: any): Promise<ApiResponse<any>> =>
    API.patch('/api/auth/profile', data),
}

export default _API
