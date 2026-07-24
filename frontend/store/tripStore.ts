import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import API from '@/lib/api'

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
  isMultiCity?: boolean
  stops?: Array<{ city: string; nights: number }>
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

export interface TrainClassFareOption {
  classCode: string
  className: string
  fare: number
  availability?: 'AVAILABLE' | 'RAC' | 'WL' | null
}

export interface TrainOption {
  id: string
  trainName: string
  trainNumber: string
  originStation: string
  originCode: string
  destinationStation: string
  destinationCode: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  lastUpdated: string
  bookingUrl: string
  travelClass: string
  trainType: string
  transfers: number
  runsOn?: string[]
  classes?: TrainClassFareOption[]
  aiRecommendation?: {
    badge: string
    reasons: string[]
  } | null
}

export interface StationInfoEntry {
  code: string
  name: string
  isSubstitute: boolean
  originalPlace?: string
  distanceKm?: number
  reason?: string
}

export interface TrainStationInfo {
  origin: StationInfoEntry
  destination: StationInfoEntry
}

export interface HotelOption {
  id: string
  name: string
  price: number
  totalPrice?: number
  nights?: number
  rating: number
  image: string
  images?: string[]
  image_path?: string | null
  gallery_paths?: string[]
  location: string
  bookingLink: string
  score: number
  liveStatus: string
  amenities?: string[]
  offers?: string[]
  rateKey?: string
  rateType?: string
  bookingReference?: string
  categoryName?: string
  currency?: string
  source?: string
  rooms?: any[]
}

export interface ItineraryDay {
  day: number
  date?: string
  theme?: string
  weather?: any
  foodNote?: string
  budgetNote?: string
  places: {
    name: string
    time?: string
    category: string
    coordinates?: [number, number] | number[]
    description?: string
    duration?: string
    estimatedSpend?: string
    travelTimeFromPrev?: string
    whyItFits?: string
    image?: string
    smartLabels?: string[]
    [key: string]: any
  }[]
  [key: string]: any
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
  selectedRoom?: { name: string; boardName: string; rateKey: string; price: number }
}

export interface FeedbackData {
  rating: number
  feedback: string
  experienceTags: string[]
}

/** Booking flow state machine for the full Hotelbeds certification workflow */
export type BookingFlowStep =
  | 'guests'       // Collecting guest info
  | 'verifying'    // Running CheckRate API
  | 'confirm-rate' // Showing updated rate (RECHECK) for user confirmation
  | 'booking'      // Calling Booking API
  | 'confirmed'    // Booking successful — showing BookingConfirmationPanel
  | 'voucher'      // Showing VoucherPage

export interface BookingFlow {
  isOpen:           boolean
  step:             BookingFlowStep
  hotel:            HotelOption | null
  room:             { name: string; boardName: string; rateKey: string; price: number; rateType?: string } | null
  guestData:        { holder: { firstName: string; lastName: string }; guests: { firstName: string; lastName: string }[]; contact: { email: string; phone: string } } | null
  checkRateResult:  { rateType: string; netInr: number; net: string; currency: string; boardName: string; cancellationPolicies: any[]; rateComments: string; priceChanged: boolean; priceDiff: number; rateKey: string } | null
  bookingRecord:    { bookingId: string; bookingReference: string; clientReference: string; hotelName: string; hotelAddress: string; checkIn: string; checkOut: string; roomType: string; boardType: string; totalPrice: number; currency: string; guests: any[]; cancellationPolicies: any[]; bookingDate: string } | null
  error:            string | null
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
  isMultiCity?: boolean
  stops?: Array<{ city: string; nights: number }>
}

interface TripStore {
  // State
  userProfile: UserProfile
  tripContext: TripContext
  transport: TransportOption[]
  returnTransport: TransportOption[]
  hotels: HotelOption[]
  buses: TransportOption[]
  busSearchUrl: string | null
  cars: TransportOption[]
  trains: TrainOption[]
  trainSearchUrl: string | null
  trainStationInfo: TrainStationInfo | null
  itinerary: ItineraryDay[]
  weather: WeatherData | null
  notifications: Notification[]
  bookingStatus: BookingStatus
  bookingFlow: BookingFlow
  loading: boolean
  error: string | null
  isConnected: boolean
  activeTab: string
  tripStatus: 'planning' | 'active' | 'completed'
  feedbackStatus: 'idle' | 'pending' | 'submitted'
  currentTripId: string | null
  tripHistory: TripRecord[]
  savedHotels: string[]
  hotelDetailId: string | null

  // Actions
  setProfile: (profile: Partial<UserProfile>) => void
  setTrip: (trip: Partial<TripContext>) => void
  setTransport: (transport: TransportOption[]) => void
  setReturnTransport: (transport: TransportOption[]) => void
  setHotels: (hotels: HotelOption[]) => void
  setBuses: (buses: TransportOption[]) => void
  setBusSearchUrl: (url: string | null) => void
  setCars: (cars: TransportOption[]) => void
  setTrains: (trains: TrainOption[]) => void
  setTrainSearchUrl: (url: string | null) => void
  setTrainStationInfo: (info: TrainStationInfo | null) => void
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
  toggleSaveHotel: (hotelId: string) => void
  setHotelDetailId: (id: string | null) => void
  // Booking flow actions
  openBookingFlow: (hotel: HotelOption, room: BookingFlow['room']) => void
  closeBookingFlow: () => void
  setBookingFlowStep: (step: BookingFlowStep, data?: Partial<BookingFlow>) => void
  cancelHotelBooking: (bookingId: string) => Promise<void>
  reset: () => void
}

const initialProfile: UserProfile = {
  budget: 2000,
  currency: 'INR',
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
  isMultiCity: false,
  stops: [],
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
      buses: [],
      busSearchUrl: null,
      cars: [],
      trains: [],
      trainSearchUrl: null,
      trainStationInfo: null,
      itinerary: [],
      weather: null,
      notifications: [],
      bookingStatus: initialBooking,
      bookingFlow: { isOpen: false, step: 'guests', hotel: null, room: null, guestData: null, checkRateResult: null, bookingRecord: null, error: null },
      loading: false,
      error: null,
      isConnected: false,
      activeTab: 'plan',
      tripStatus: 'planning',
      feedbackStatus: 'idle',
      currentTripId: null,
      tripHistory: [],
      savedHotels: [],
      hotelDetailId: null,

      setProfile: (profile) => set((s) => ({ userProfile: { ...s.userProfile, ...profile } })),
      setTrip: (trip) => set((s) => ({
        tripContext: { ...s.tripContext, ...trip },
        currentTripId: s.currentTripId || `trip_session_${Date.now()}`,
      })),
      setTransport: (transport) => set({ transport }),
      setReturnTransport: (returnTransport) => set({ returnTransport }),
      setHotels: (hotels) => set({ hotels }),
      setBuses: (buses) => set({ buses }),
      setBusSearchUrl: (busSearchUrl) => set({ busSearchUrl }),
      setCars: (cars) => set({ cars }),
      setTrains: (trains) => set({ trains }),
      setTrainSearchUrl: (trainSearchUrl) => set({ trainSearchUrl }),
      setTrainStationInfo: (trainStationInfo) => set({ trainStationInfo }),
      setItinerary: (itinerary) => set((s) => ({
        itinerary,
        currentTripId: s.currentTripId || `trip_session_${Date.now()}`,
      })),
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
      toggleSaveHotel: (hotelId) => set((s) => ({
        savedHotels: s.savedHotels.includes(hotelId)
          ? s.savedHotels.filter(id => id !== hotelId)
          : [...s.savedHotels, hotelId]
      })),
      setHotelDetailId: (id) => set({ hotelDetailId: id }),
      setFeedbackStatus: (feedbackStatus) => set({ feedbackStatus }),

      // ── Booking flow actions ─────────────────────────────────────────────
      openBookingFlow: (hotel, room) => set({
        bookingFlow: { isOpen: true, step: 'guests', hotel, room, guestData: null, checkRateResult: null, bookingRecord: null, error: null }
      }),
      closeBookingFlow: () => set((s) => ({
        bookingFlow: { ...s.bookingFlow, isOpen: false, step: 'guests', guestData: null, checkRateResult: null, error: null }
      })),
      setBookingFlowStep: (step, data = {}) => set((s) => ({
        bookingFlow: { ...s.bookingFlow, step, ...data }
      })),

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
          buses: [],
          cars: [],
          trains: [],
          trainStationInfo: null,
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
        if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('tripContext')
      },

      addTripToHistory: (record) => set((s) => ({
        // Cap at 10 most recent trips to prevent localStorage bloat (Audit C4)
        tripHistory: [record, ...s.tripHistory.filter(t => t.tripId !== record.tripId)].slice(0, 10),
      })),

      cancelHotelBooking: async (bookingId) => {
        set({ loading: true, error: null })
        try {
          const res: any = await API.post(`/api/booking/${bookingId}/cancel`)
          if (res.success) {
            set((s) => ({
              bookingStatus: {
                ...s.bookingStatus,
                hotelStatus: 'INIT',
                selectedHotel: undefined,
                selectedRoom: undefined
              },
              bookingFlow: {
                ...s.bookingFlow,
                bookingRecord: null,
                step: 'guests'
              },
              tripHistory: s.tripHistory.map(t =>
                t.tripId === bookingId ? { ...t, status: 'cancelled' } : t
              ),
              loading: false
            }))
          } else {
            throw new Error(res.message || 'Cancellation failed')
          }
        } catch (err: any) {
          set({ error: err.message, loading: false })
          throw err
        }
      },

      reset: () => set({
        transport: [], returnTransport: [], hotels: [], buses: [], cars: [], trains: [], trainStationInfo: null, itinerary: [], weather: null,
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
        buses: state.buses,
        cars: state.cars,
        trains: state.trains,
        itinerary: state.itinerary,
        bookingStatus: state.bookingStatus,
        tripStatus: state.tripStatus,
        returnTransport: state.returnTransport,
        weather: state.weather,
      }),
    }
  )
)
