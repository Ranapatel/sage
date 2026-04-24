import axios from 'axios'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — inject session + auth token
API.interceptors.request.use((config) => {
  if (typeof sessionStorage !== 'undefined') {
    const sessionId = sessionStorage.getItem('sessionId')
    if (sessionId) config.headers['x-session-id'] = sessionId
  }
  // Inject auth token from persisted store if not already set
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

// Response interceptor
API.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Something went wrong'
    return Promise.reject(new Error(msg))
  }
)

export const tripAPI = {
  // Search all travel data in parallel
  search: (params: {
    from: string; to: string; startDate: string; endDate?: string;
    budget?: number; travelers?: number; style?: string
  }) => API.post('/api/search', params),

  // Autocomplete
  getAutocomplete: (query: string) => API.get(`/api/places/autocomplete?query=${encodeURIComponent(query)}`),

  // IP Geo Location
  getIpLocation: () => API.get('/api/places/ip-location'),

  // AI Itinerary generation
  generateItinerary: (params: {
    destination: string; days: number; budget: number;
    style: string; preferences: string[]; members: number; startDate?: string
  }) => API.post('/api/itinerary/generate', params),

  // Budget Optimizer
  optimizeBudget: (params: {
    destination: string; days: number; budget: number;
    style: string; preferences: string[]; members: number
  }) => API.post('/api/itinerary/optimize-budget', params),

  // Weather
  getWeather: (destination: string) => API.get(`/api/weather/${encodeURIComponent(destination)}`),

  // Booking
  initBooking: (data: { type: 'flight' | 'hotel'; itemId: string; userDetails: any }) =>
    API.post('/api/booking/init', data),

  confirmBooking: (bookingId: string) => API.post(`/api/booking/${bookingId}/confirm`),

  // Exploration
  getActivities: (destination: string, category?: string) =>
    API.get(`/api/explore/activities/${encodeURIComponent(destination)}`, { params: { category } }),

  getRestaurants: (destination: string) =>
    API.get(`/api/explore/restaurants/${encodeURIComponent(destination)}`),

  // Notifications
  getNotifications: (sessionId: string) => API.get(`/api/notifications/${sessionId}`),

  // Profile
  saveProfile: (profile: any) => API.post('/api/profile', profile),
}

export const authAPI = {
  signup: (data: { name: string; email: string; password: string; currency: string; country: string }) =>
    API.post('/api/auth/signup', data),
  login: (email: string, password: string) => API.post('/api/auth/login', { email, password }),
  logout: () => API.post('/api/auth/logout'),
  me: () => API.get('/api/auth/me'),
  updateProfile: (data: any) => API.patch('/api/auth/profile', data),
}

export default API
