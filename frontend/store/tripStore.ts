import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const uuidv4 = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

export interface UserProfile {
  budget: number
  currency: string
  travelStyle: string
  groupType: string
  preferences: string[]
  members: number
}

export interface TripContext {
  startLocation: string
  destination: string
  startDate: string
  endDate: string
  currentDay: number
}

export interface TransportOption {
  id: string
  type: 'flight' | 'bus' | 'train' | 'car'
  name: string
  price: number
  rating: number
  duration: string
  departure: string
  arrival: string
  image: string
  bookingLink: string
  score: number
  liveStatus: string
  offers?: string[]
}

export interface HotelOption {
  id: string
  name: string
  price: number
  rating: number
  image: string
  location: string
  bookingLink: string
  score: number
  liveStatus: string
  amenities?: string[]
  offers?: string[]
}

export interface ItineraryDay {
  day: number
  date: string
  places: {
    name: string
    time: string
    category: string
    coordinates: [number, number]
    description: string
    image?: string
  }[]
}

export interface WeatherData {
  condition: string
  percentage: number
  temperature: number
  humidity: number
  wind: number
  lastUpdated: string
  forecast: {
    date: string
    condition: string
    high: number
    low: number
  }[]
}

export interface Notification {
  id: string
  type: 'info' | 'alert' | 'deal' | 'weather'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export interface BookingStatus {
  flightStatus: 'INIT' | 'SELECTED' | 'PENDING' | 'CONFIRMED'
  hotelStatus: 'INIT' | 'SELECTED' | 'PENDING' | 'CONFIRMED'
  returnStatus: 'INIT' | 'SELECTED' | 'PENDING' | 'CONFIRMED'
  selectedFlight?: TransportOption
  selectedHotel?: HotelOption
  selectedReturn?: TransportOption
}

export interface FeedbackData {
  rating: number
  feedback: string
  experienceTags: string[]
}

export interface TripRecord {
  tripId: string
  destination: string
  startLocation: string
  dates: { start: string; end: string }
  bookings: {
    transport?: TransportOption
    hotel?: HotelOption
    returnTransport?: TransportOption
  }
  itinerary: ItineraryDay[]
  rating?: number
  feedback?: string
  experienceTags?: string[]
  status: 'completed' | 'cancelled'
  createdAt: string
  budget: number
  style: string
  members: number
}

interface TripStore {
  // State
  userProfile: UserProfile
  tripContext: TripContext
  transport: TransportOption[]
  returnTransport: TransportOption[]
  hotels: HotelOption[]
  itinerary: ItineraryDay[]
  weather: WeatherData | null
  notifications: Notification[]
  bookingStatus: BookingStatus
  loading: boolean
  error: string | null
  isConnected: boolean
  activeTab: string
  tripStatus: 'planning' | 'active' | 'completed'
  feedbackStatus: 'idle' | 'pending' | 'submitted'
  currentTripId: string | null
  tripHistory: TripRecord[]

  // Actions
  setProfile: (profile: Partial<UserProfile>) => void
  setTrip: (trip: Partial<TripContext>) => void
  setTransport: (transport: TransportOption[]) => void
  setReturnTransport: (transport: TransportOption[]) => void
  setHotels: (hotels: HotelOption[]) => void
  setItinerary: (itinerary: ItineraryDay[]) => void
  setWeather: (weather: WeatherData) => void
  addNotification: (notif: Notification) => void
  markNotifRead: (id: string) => void
  setBookingStatus: (status: Partial<BookingStatus>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setConnected: (connected: boolean) => void
  setActiveTab: (tab: string) => void
  setTripStatus: (status: 'planning' | 'active' | 'completed') => void
  setFeedbackStatus: (status: 'idle' | 'pending' | 'submitted') => void
  submitFeedback: (data: FeedbackData) => void
  completeTrip: () => void
  startNewTrip: () => void
  addTripToHistory: (record: TripRecord) => void
  reset: () => void
}

const initialProfile: UserProfile = {
  budget: 2000,
  currency: 'USD',
  travelStyle: 'adventure',
  groupType: 'couple',
  preferences: [],
  members: 2,
}

const initialTrip: TripContext = {
  startLocation: '',
  destination: '',
  startDate: '',
  endDate: '',
  currentDay: 1,
}

const initialBooking: BookingStatus = {
  flightStatus: 'INIT',
  hotelStatus: 'INIT',
  returnStatus: 'INIT',
}

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      userProfile: initialProfile,
      tripContext: initialTrip,
      transport: [],
      returnTransport: [],
      hotels: [],
      itinerary: [],
      weather: null,
      notifications: [],
      bookingStatus: initialBooking,
      loading: false,
      error: null,
      isConnected: false,
      activeTab: 'plan',
      tripStatus: 'planning',
      feedbackStatus: 'idle',
      currentTripId: null,
      tripHistory: [],

      setProfile: (profile) => set((s) => ({ userProfile: { ...s.userProfile, ...profile } })),
      setTrip: (trip) => set((s) => ({ tripContext: { ...s.tripContext, ...trip } })),
      setTransport: (transport) => set({ transport }),
      setReturnTransport: (returnTransport) => set({ returnTransport }),
      setHotels: (hotels) => set({ hotels }),
      setItinerary: (itinerary) => set({ itinerary }),
      setWeather: (weather) => set({ weather }),
      addNotification: (notif) => set((s) => ({ notifications: [notif, ...s.notifications].slice(0, 20) })),
      markNotifRead: (id) => set((s) => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      setBookingStatus: (status) => set((s) => ({ bookingStatus: { ...s.bookingStatus, ...status } })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setConnected: (connected) => set({ isConnected: connected }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setTripStatus: (tripStatus) => set({ tripStatus }),
      setFeedbackStatus: (feedbackStatus) => set({ feedbackStatus }),

      completeTrip: () => {
        const s = get()
        const tripId = s.currentTripId || uuidv4()
        const record: TripRecord = {
          tripId,
          destination: s.tripContext.destination,
          startLocation: s.tripContext.startLocation,
          dates: { start: s.tripContext.startDate, end: s.tripContext.endDate },
          bookings: {
            transport: s.bookingStatus.selectedFlight,
            hotel: s.bookingStatus.selectedHotel,
            returnTransport: s.bookingStatus.selectedReturn,
          },
          itinerary: s.itinerary,
          status: 'completed',
          createdAt: new Date().toISOString(),
          budget: s.userProfile.budget,
          style: s.userProfile.travelStyle,
          members: s.userProfile.members,
        }
        set((st) => ({
          tripStatus: 'completed',
          feedbackStatus: 'pending',
          currentTripId: tripId,
          tripHistory: [record, ...st.tripHistory],
        }))
      },

      submitFeedback: (data: FeedbackData) => {
        const { currentTripId } = get()
        set((s) => ({
          feedbackStatus: 'submitted',
          tripHistory: s.tripHistory.map(t =>
            t.tripId === currentTripId
              ? { ...t, rating: data.rating, feedback: data.feedback, experienceTags: data.experienceTags }
              : t
          ),
        }))
      },

      startNewTrip: () => {
        set({
          transport: [],
          returnTransport: [],
          hotels: [],
          itinerary: [],
          weather: null,
          bookingStatus: initialBooking,
          error: null,
          loading: false,
          tripStatus: 'planning',
          feedbackStatus: 'idle',
          currentTripId: uuidv4(),
          tripContext: initialTrip,
          activeTab: 'overview',
          notifications: [],
        })
        sessionStorage.removeItem('tripContext')
      },

      addTripToHistory: (record) => set((s) => ({
        tripHistory: [record, ...s.tripHistory.filter(t => t.tripId !== record.tripId)],
      })),

      reset: () => set({
        transport: [], returnTransport: [], hotels: [], itinerary: [], weather: null,
        notifications: [], bookingStatus: initialBooking, error: null, loading: false,
        tripStatus: 'planning', feedbackStatus: 'idle',
      }),
    }),
    {
      name: 'tripsage-store',
      partialize: (state) => ({
        userProfile: state.userProfile,
        tripHistory: state.tripHistory,
        currentTripId: state.currentTripId,
        // Persist active trip state so user can continue their trip
        tripContext: state.tripContext,
        transport: state.transport,
        hotels: state.hotels,
        itinerary: state.itinerary,
        bookingStatus: state.bookingStatus,
        tripStatus: state.tripStatus,
        returnTransport: state.returnTransport,
        weather: state.weather,
      }),
    }
  )
)
