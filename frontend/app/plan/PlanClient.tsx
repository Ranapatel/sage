'use client'

import { useState, useEffect, lazy, Suspense, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTripStore, type HotelOption, type TransportOption, type TripRecord } from '@/store/tripStore'
import { isIndianTrip } from '@/lib/indianCities'
import { useSocket } from '@/hooks/useSocket'
import { tripAPI } from '@/lib/api'
import { fetchWithRetry } from '@/lib/fetchWithRetry'
import { formatDate, getDaysBetween } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUser } from '@clerk/nextjs'
import { SYMBOLS, formatPrice, ALL_CURRENCIES, convertToINR } from '@/lib/currency'
import { trackEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plane, Bus, Train, Car, MapPin, TrendingUp, RefreshCw, 
  Compass, Map, ClipboardList, Search, Plus, 
  Check, LogOut, Menu, X, Bell, History, Settings, Wallet, 
  CalendarDays, Users, LayoutDashboard, Building2, Share2, BookmarkPlus, User, Pencil, Sliders
} from 'lucide-react'
import UserMenu from '@/components/layout/UserMenu'
import { addBookmark } from '@/lib/bookmarkUtils'
import { 
  Icon3DOverview, 
  Icon3DTransport, 
  Icon3DCar,
  Icon3DStay, 
  Icon3DItinerary, 
  Icon3DExplore, 
  Icon3DMap, 
  Icon3DBookings 
} from '@/components/ui/TripSageIcons'

// Lazy load components
const TransportCard = lazy(() => import('@/components/transport/TransportCard'))
const HotelCard = lazy(() => import('@/components/hotel/HotelCard'))
const ItineraryView = lazy(() => import('@/components/itinerary/ItineraryView'))
const WeatherWidget = lazy(() => import('@/components/weather/WeatherWidget'))
const NotificationsPanel = lazy(() => import('@/components/notifications/NotificationsPanel'))
const ExploreSection = lazy(() => import('@/components/explore/ExploreSection'))
const MapView = lazy(() => import('@/components/map/MapView'))
const BookingStatus = lazy(() => import('@/components/booking/BookingStatus'))
const FeedbackModal = lazy(() => import('@/components/feedback/FeedbackModal'))
const TripActions = lazy(() => import('@/components/actions/TripActions'))
const LocationAutocomplete = lazy(() => import('@/components/ui/LocationAutocomplete'))
const BudgetOptimizerTab = lazy(() => import('@/components/optimizer/BudgetOptimizerTab'))
const BusesPanel = lazy(() => import('@/components/transport/BusesPanel'))

const CarsTab = lazy(() => import('@/components/transport/CarsTab'))
const TrainsPanel = lazy(() => import('@/components/transport/TrainsPanel'))
const CurrencySelector = lazy(() => import('@/components/ui/CurrencySelector'))
const OverviewTab = lazy(() => import('@/components/plan/OverviewTab'))
const TransportTab = lazy(() => import('@/components/plan/TransportTab'))
const HotelsTab = lazy(() => import('@/components/plan/HotelsTab'))
const TripHistoryTab = lazy(() => import('@/components/history/TripHistoryTab'))

// Helper for loading state
const TabLoader = () => (
  <div className="flex flex-col items-center justify-center py-20 space-y-4">
    <div className="w-8 h-8 border-[3px] border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[#9CA3AF] text-sm">Loading...</p>
  </div>
)

const TABS = [
  { id: 'overview', label: 'Overview', icon: Icon3DOverview },
  { id: 'transport', label: 'Transport', icon: Icon3DTransport },
  { id: 'hotels', label: 'Stay', icon: Icon3DStay },
  { id: 'itinerary', label: 'Itinerary', icon: Icon3DItinerary },
  { id: 'explore', label: 'Explore', icon: Icon3DExplore },
  { id: 'map', label: 'Map', icon: Icon3DMap },
  { id: 'bookings', label: 'Bookings', icon: Icon3DBookings },
]

const isInternationalTrip = (from: string, to: string) => {
  const f = from.toLowerCase();
  const t = to.toLowerCase();
  const domesticCities = [
    'mumbai', 'delhi', 'bengaluru', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 
    'ahmedabad', 'pune', 'goa', 'jaipur', 'agra', 'varanasi', 'kochi', 'udaipur', 
    'manali', 'shimla', 'darjeeling', 'amritsar', 'mysuru', 'srinagar', 'rishikesh', 
    'ooty', 'visakhapatnam', 'coimbatore', 'bhopal', 'indore', 'chandigarh', 
    'nagpur', 'lucknow', 'patna'
  ];
  const hasDomesticTo = domesticCities.some(city => t.includes(city)) || t.includes('india');
  const hasDomesticFrom = domesticCities.some(city => f.includes(city)) || f.includes('india');
  return !(hasDomesticTo && hasDomesticFrom);
}

const getMinRequiredBudgetInINR = (from: string, to: string, days: number, travelers: number) => {
  const isInter = isInternationalTrip(from, to);
  const minFlight = isInter ? 15000 : 2000;
  const minHotelPerNight = isInter ? 2500 : 800;
  const minDailyExpense = isInter ? 2000 : 500;

  const totalFlightCost = minFlight * travelers;
  const totalHotelCost = minHotelPerNight * Math.max(1, days - 1);
  const totalDailyExpense = minDailyExpense * days * travelers;

  return totalFlightCost + totalHotelCost + totalDailyExpense;
}

function createFallbackItinerary(destination: string, daysCount: number, style: string) {
  const destName = (destination || 'Destination').split(',')[0].trim()
  const days = []
  
  for (let i = 1; i <= daysCount; i++) {
    const theme = i === 1 ? `Arrival & Highlights of ${destName}`
      : i === 2 ? `Cultural Exploration & Landmark Tour`
      : i === 3 ? `Scenic Sights & Hidden Gems`
      : `Day ${i}: Local Experiences & Leisure`
      
    days.push({
      day: i,
      date: new Date().toISOString().split('T')[0],
      theme,
      weather: { condition: 'Sunny', temp: '26°C', note: 'Pleasant sightseeing weather' },
      foodNote: `Try popular local specialties and cozy cafes around central ${destName}`,
      budgetNote: `Estimated daily budget fits your ${style} trip preference`,
      places: [
        {
          name: i === 1 ? `Central Square & Landmark Heritage in ${destName}` : `Morning Nature & Cultural Tour in ${destName}`,
          category: 'Attraction',
          time: '09:30 AM',
          duration: '2.5 hrs',
          estimatedSpend: '₹500',
          whyItFits: `Top-rated iconic destination in ${destName} matching your ${style} preference.`,
          smartLabels: ['Must Visit', 'Highly Rated', 'Photogenic']
        },
        {
          name: `Historic Old Town & Market Walk`,
          category: 'Cultural Sight',
          time: '01:00 PM',
          duration: '2 hrs',
          estimatedSpend: '₹800',
          travelTimeFromPrev: '15 mins taxi',
          whyItFits: 'Immerse in local crafts, street flavors, and vibrant heritage.',
          smartLabels: ['Local Culture', 'Handicrafts']
        },
        {
          name: `Sunset Viewpoint & Signature Dinner`,
          category: 'Dining & Views',
          time: '06:00 PM',
          duration: '3 hrs',
          estimatedSpend: '₹1,200',
          travelTimeFromPrev: '20 mins',
          whyItFits: 'Breathtaking evening views paired with authentic regional cuisine.',
          smartLabels: ['Sunset Point', 'Top Cuisine']
        }
      ]
    })
  }
  
  return days
}

export default function PlanClient() {
  const router = useRouter()
  const { emit } = useSocket()
  const {
    userProfile, tripContext, transport, hotels, buses, cars, trains, trainStationInfo, itinerary,
    weather, notifications, bookingStatus, loading, error, isConnected,
    tripStatus, feedbackStatus, tripHistory,
    setTrip, setProfile, setTransport, setHotels, setBuses, setBusSearchUrl, setCars, setTrains, setTrainSearchUrl, setTrainStationInfo, setItinerary,
    setWeather, setLoading, setError, addNotification,
    completeTrip, startNewTrip, reset, addTripToHistory
  } = useTripStore()
  const { user, isLoggedIn, logout, updateCurrency } = useAuthStore()
  const { isSignedIn: isClerkSignedIn } = useUser()
  const isSignedIn = isClerkSignedIn || isLoggedIn

  const [activeTab, setActiveTab] = useState('overview')
  const [showNotifs, setShowNotifs] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showEditTrip, setShowEditTrip] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moreSheetOpen, setMoreSheetOpen] = useState(false)
  const [showNewTripConfirm, setShowNewTripConfirm] = useState(false)
  const [searchForm, setSearchForm] = useState({
    from: '', to: '', startDate: '', endDate: '', budget: '2000', travelers: '2', style: 'adventure', currency: 'INR',
    rooms: '1', adults: '2', children: '0',
    isMultiCity: false,
    stops: [{ city: '', nights: 2 }, { city: '', nights: 3 }] as Array<{ city: string; nights: number }>
  })

  // Active currency: user's saved currency, or form's selected currency, or default INR
  const currency = user?.currency ?? searchForm.currency ?? 'INR'

  // Determine if the current trip is an Indian domestic route (controls Train tab visibility)
  const isIndianRoute = useMemo(() => {
    const from = searchForm.from || tripContext.startLocation
    const to = searchForm.to || tripContext.destination
    return isIndianTrip(from, to)
  }, [searchForm.from, searchForm.to, tripContext.startLocation, tripContext.destination])

  // Tab cache to prevent re-renders and make switching instant
  const [tabCache, setTabCache] = useState<Record<string, boolean>>({ overview: true })

  useEffect(() => {
    Promise.resolve().then(() => {
      setTabCache(prev => ({ ...prev, [activeTab]: true }))
    })
  }, [activeTab])

  // Merge flights, buses, cars, and trains for TransportTab
  const mergedTransport = useMemo(() => {
    return [...transport, ...buses, ...cars, ...trains]
  }, [transport, buses, cars, trains])

  // ── RESULT CACHE: keyed by search params so same query never re-fetches ──
  const resultCacheRef = useRef<Record<string, {
    transport: any[]; hotels: any[]; buses: any[]; cars: any[]; trains: any[];
    trainStationInfo: any;
    itinerary: any[]; weather: any;
  }>>({})

  // Generate a deterministic cache key from search parameters
  const getCacheKey = useCallback((p: { from: string; to: string; startDate?: string; endDate?: string; budget?: number; travelers?: number; style?: string; rooms?: number; adults?: number; children?: number }) => {
    return [
      p.from?.toLowerCase().trim(),
      p.to?.toLowerCase().trim(),
      p.startDate || '',
      p.endDate || '',
      String(p.budget || ''),
      String(p.travelers || ''),
      p.style || '',
      String(p.rooms || 1),
      String(p.adults || 2),
      String(p.children || 0),
    ].join('|')
  }, [])

  // Track the current search cache key so socket handlers can save to the right slot
  const activeCacheKeyRef = useRef<string>('')
  
  // Track active AbortController to cancel previous requests if a new search starts
  const abortControllerRef = useRef<AbortController | null>(null)

  // Activate ALL data-bearing tabs at once so skeletons render simultaneously
  const activateAllTabs = useCallback(() => {
    setTabCache({
      overview: true, transport: true, trains: true, buses: true, cars: true,
      hotels: true, itinerary: true, optimizer: true, return: true,
      explore: true, map: true, bookings: true, history: true,
    })
  }, [])

  // Save current store data into the result cache for the active key
  const saveToCache = useCallback(() => {
    const key = activeCacheKeyRef.current
    if (!key) return
    const state = useTripStore.getState()
    resultCacheRef.current[key] = {
      transport: state.transport,
      hotels: state.hotels,
      buses: state.buses,
      cars: state.cars,
      trains: state.trains,
      trainStationInfo: state.trainStationInfo,
      itinerary: state.itinerary,
      weather: state.weather,
    }
  }, [])


  // Load from session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('tripContext')
    if (saved) {
      try {
        const ctx = JSON.parse(saved)
        Promise.resolve().then(() => {
          setSearchForm({
            from: ctx.from || '',
            to: ctx.to || '',
            startDate: ctx.startDate || '',
            endDate: ctx.endDate || '',
            budget: ctx.budget || '2000',
            travelers: ctx.travelers || '2',
            style: ctx.style || 'adventure',
            currency: ctx.currency || 'INR',
            rooms: ctx.rooms || '1',
            adults: ctx.adults || '2',
            children: ctx.children || '0',
            isMultiCity: ctx.isMultiCity || false,
            stops: ctx.stops || [{ city: '', nights: 2 }, { city: '', nights: 3 }]
          })
          setTrip({
            startLocation: ctx.from || '',
            destination: ctx.to || '',
            startDate: ctx.startDate || '',
            endDate: ctx.endDate || '',
          })
          setProfile({
            budget: parseInt(ctx.budget) || 2000,
            members: parseInt(ctx.travelers) || 2,
            travelStyle: ctx.style || 'adventure',
          })
          if (ctx.to && ctx.from) {
            setActiveTab('transport')
            // Auto-trigger search so flights, trains, buses, and hotels load immediately
            setTimeout(() => {
              runSearch({
                from: ctx.from,
                to: ctx.to,
                startDate: ctx.startDate || '',
                endDate: ctx.endDate || '',
                budget: parseInt(ctx.budget) || 20000,
                travelers: parseInt(ctx.travelers) || 2,
                style: ctx.style || 'adventure',
                rooms: parseInt(ctx.rooms || '1'),
                adults: parseInt(ctx.adults || '2'),
                children: parseInt(ctx.children || '0'),
                isMultiCity: ctx.isMultiCity || false,
                stops: ctx.stops || [],
              })
            }, 100)
          }
        })
        setTrip({
          startLocation: ctx.from || '',
          destination: ctx.to || '',
          startDate: ctx.startDate || '',
          endDate: ctx.endDate || '',
        })
        setProfile({
          budget: parseInt(ctx.budget) || 20000,
          members: parseInt(ctx.travelers) || 2,
          travelStyle: ctx.style || 'adventure',
          preferences: [],
        })
      } catch (e) {}
    } else {
      // ── FRESH NAVIGATION (no prior session) ──
      // e.g. user clicked "Create my trip" from the homepage navbar.
      // Clear any stale persisted trip data (flights, hotels, itinerary) so the plan
      // page starts completely blank instead of showing the last trip's results.
      startNewTrip()
      setSearchForm({
        from: '', to: '', startDate: '', endDate: '',
        budget: '2000', travelers: '2', style: 'adventure',
        currency: user?.currency ?? 'INR',
        rooms: '1', adults: '2', children: '0',
        isMultiCity: false,
        stops: [{ city: '', nights: 2 }, { city: '', nights: 3 }]
      })
      resultCacheRef.current = {}
      setTabCache({ overview: true })
    }
    setInitialized(true)
  }, [setTrip, setProfile]) // eslint-disable-line react-hooks/exhaustive-deps


  const runSearch = async (params?: any) => {
    const p = params || {
      from: searchForm.from,
      to: searchForm.isMultiCity ? searchForm.stops.map(s => s.city).filter(Boolean).join(', ') : searchForm.to,
      startDate: searchForm.startDate,
      endDate: searchForm.endDate,
      budget: parseInt(searchForm.budget),
      travelers: parseInt(searchForm.travelers),
      style: searchForm.style,
      rooms: parseInt(searchForm.rooms || '1'),
      adults: parseInt(searchForm.adults || '2'),
      children: parseInt(searchForm.children || '0'),
      isMultiCity: searchForm.isMultiCity,
      stops: searchForm.stops,
      preferences: userProfile?.preferences || [],
    }

    if (p.isMultiCity) {
      if (!p.stops || p.stops.filter((s: any) => s.city).length === 0) {
        toast.error("Please add at least one stop city.")
        return
      }
      const totalNights = p.stops.reduce((sum: number, s: any) => sum + (s.nights || 2), 0)
      if (p.startDate) {
        const d = new Date(p.startDate)
        d.setDate(d.getDate() + totalNights)
        p.endDate = d.toISOString().split('T')[0]
      }
    }
    
    // Ensure numeric fields are valid and do not pass NaN or invalid values to the backend
    if (isNaN(p.budget) || p.budget <= 0) p.budget = 2000
    if (isNaN(p.travelers) || p.travelers <= 0) p.travelers = 2
    if (!p.style) p.style = 'adventure'

    if (!p.from || !p.to) return

    // Sync travelers (members) with adults + children to ensure total counts are correct across other sections
    const totalGuests = (p.adults || 0) + (p.children || 0)
    p.travelers = totalGuests || p.travelers || 2


    // ── BUDGET VALIDATION ──
    const days = (p.startDate && p.endDate) ? getDaysBetween(p.startDate, p.endDate) : 3
    const budgetInINR = convertToINR(p.budget, currency)
    const minBudgetInINR = getMinRequiredBudgetInINR(p.from, p.to, days, p.travelers)

    if (budgetInINR < minBudgetInINR) {
      const minRequiredFormatted = formatPrice(minBudgetInINR, currency)
      toast.error(`Your budget of ${formatPrice(budgetInINR, currency)} is too low. The minimum estimated budget for ${p.travelers} ${p.travelers === 1 ? 'person' : 'people'} for ${days} days is ${minRequiredFormatted}.`)
      return
    }


    // Dismiss any active inputs (closes mobile keyboard and dropdowns instantly)
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    const cacheKey = getCacheKey(p)

    // ── CHECK CACHE: if we already fetched this exact query, restore instantly ──
    const cached = resultCacheRef.current[cacheKey]
    if (cached && (cached.transport.length > 0 || cached.hotels.length > 0 || cached.itinerary.length > 0 || (cached.trains && cached.trains.length > 0))) {
      // Restore all cached data without any loading state or API call
      setTransport(cached.transport)
      setHotels(cached.hotels)
      setBuses(cached.buses)
      setCars(cached.cars)
      setTrains(cached.trains || [])
      setTrainStationInfo(cached.trainStationInfo || null)
      setItinerary(cached.itinerary)
      if (cached.weather) setWeather(cached.weather)

      setTrip({
        startLocation: p.from,
        destination: p.to,
        startDate: p.startDate,
        endDate: p.endDate,
      })
      setProfile({
        budget: p.budget,
        members: p.travelers,
        travelStyle: p.style,
      })

      // Activate all tabs so cached results are instantly visible
      activateAllTabs()
      activeCacheKeyRef.current = cacheKey
      toast.success('Loaded cached results instantly!', { id: 'cache-hit' })
      return
    }

    // ── CACHE MISS: fresh fetch needed ──
    activeCacheKeyRef.current = cacheKey
    
    // Abort any ongoing network requests for previous searches
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    const signal = abortController.signal
    
    // Fully reset all previous trip state (bookings, transport, itinerary, weather, etc.)
    reset()
    
    setLoading(true)
    setAiThinking(true)
    setError(null)

    // Activate ALL tabs simultaneously so every section shows loading skeletons at once
    activateAllTabs()

    setTrip({
      startLocation: p.from,
      destination: p.to,
      startDate: p.startDate,
      endDate: p.endDate,
      isMultiCity: p.isMultiCity,
      stops: p.stops,
    })

    setProfile({
      budget: p.budget,
      members: p.travelers,
      travelStyle: p.style,
    })

    try {
      // Fire all data fetches in parallel via Promise.all with timeout + retry
      const [searchResult, weatherResult, itineraryResult] = await Promise.all([
        // Main search: flights, hotels, buses, cars
        fetchWithRetry(
          (s) => tripAPI.search({
            from: p.from,
            to: p.to,
            startDate: p.startDate,
            endDate: p.endDate,
            budget: budgetInINR,
            travelers: p.travelers,
            style: p.style,
            rooms: p.rooms,
            adults: p.adults,
            children: p.children,
            isMultiCity: p.isMultiCity,
            stops: p.stops,
          }, { signal: s || signal }),
          { timeout: 25000, maxRetries: 2, label: 'Search' }
        ).catch(err => {
          if (err.message?.includes('canceled') || err.name === 'AbortError') return null
          console.warn('[Search] API error fallback:', err.message)
          return null
        }),
        // Weather fetched in parallel
        fetchWithRetry(
          (s) => tripAPI.getWeather(p.to, { signal: s || signal }),
          { timeout: 15000, maxRetries: 2, label: 'Weather' }
        ).catch(err => {
          if (err.message?.includes('canceled') || err.name === 'AbortError') return null
          console.warn('[Weather] failed after retries:', err.message)
          return null
        }),
        // Itinerary fetched in parallel
        fetchWithRetry(
          (s) => {
            let daysCount = 3
            if (p.startDate && p.endDate) {
              const start = new Date(p.startDate).getTime()
              const end = new Date(p.endDate).getTime()
              if (!isNaN(start) && !isNaN(end)) {
                daysCount = Math.max(1, Math.ceil((end - start) / (1000 * 3600 * 24)))
              }
            }
            daysCount = Math.min(Math.max(daysCount, 1), 90)

            return tripAPI.generateItinerary({
              destination: p.to,
              days: daysCount,
              budget: budgetInINR,
              currency: currency,
              style: p.style,
              preferences: p.preferences || [],
              members: p.travelers,
              startDate: p.startDate,
              isMultiCity: p.isMultiCity,
              stops: p.stops,
            }, { signal: s || signal })
          },
          { timeout: 45000, maxRetries: 2, label: 'Itinerary' }

        ).catch(err => {
          if (err.message?.includes('canceled') || err.name === 'AbortError') return null
          console.warn('[Itinerary] backend call completed with fallback:', err.message)
          return null
        }),
      ])

      // Prevent race conditions: if a newer search was initiated, discard these stale results
      if (activeCacheKeyRef.current !== cacheKey) {
        console.warn(`[PlanClient] Stale response discarded for: ${p.to}`)
        return
      }

      // Populate store with search results
      if (searchResult?.data) {
        const d = searchResult.data
        if (d.transport) setTransport(d.transport)
        if (d.flightError) useTripStore.setState({ error: d.flightError })
        if (d.hotels) setHotels(d.hotels)
        if (d.buses) setBuses(d.buses)
        if (d.busSearchUrl) setBusSearchUrl(d.busSearchUrl)
        if (d.cars) setCars(d.cars)
        if (d.trains) setTrains(d.trains)
        if (d.trainSearchUrl) setTrainSearchUrl(d.trainSearchUrl)
        if (d.trainStationInfo) setTrainStationInfo(d.trainStationInfo)
      }

      // Populate weather
      if (weatherResult?.data) {
        setWeather(weatherResult.data)
      }

      // Populate itinerary
      if (itineraryResult?.data?.itinerary && itineraryResult.data.itinerary.length > 0) {
        setItinerary(itineraryResult.data.itinerary)
      } else {
        // Fallback itinerary generator ensures users always get a complete day-by-day plan
        const calcDays = (p.startDate && p.endDate) ? Math.max(1, getDaysBetween(p.startDate, p.endDate)) : 3
        setItinerary(createFallbackItinerary(p.to, calcDays, p.style))
      }

      // Subscribe to real-time updates via WebSocket (price drops, alerts)
      emit('SUBSCRIBE_UPDATES', { destination: p.to, sessionId: sessionStorage.getItem('sessionId') })

      addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: 'Trip Ready',
        message: `Your ${p.to} trip plan is ready!`,
        timestamp: new Date().toISOString(),
        read: false,
      })

      setLoading(false)
      setAiThinking(false)
      // Save results to cache
      saveToCache()
      toast.success('Trip plan generated!', { id: 'search-done' })

    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Search failed after retries')
      setLoading(false)
      setAiThinking(false)
    }
  }

  const handleRegenerate = useCallback(async () => {
    const toastId = toast.loading("Regenerating itinerary...")
    try {
      const currentParams = {
        from: searchForm.from,
        to: searchForm.to,
        startDate: searchForm.startDate,
        endDate: searchForm.endDate,
        budget: parseInt(searchForm.budget) || 2000,
        travelers: parseInt(searchForm.travelers) || 2,
        style: searchForm.style || 'adventure',
        preferences: userProfile?.preferences || [],
      }
      const key = getCacheKey(currentParams)
      // Clear cache key first to force a fresh Miss/API call
      delete resultCacheRef.current[key]

      await runSearch(currentParams)
      toast.success("Itinerary regenerated successfully!", { id: toastId })
    } catch (err: any) {
      toast.error(err.message || "Failed to regenerate", { id: toastId })
    }
  }, [searchForm, userProfile, getCacheKey, runSearch])

  const handleShareTrip = useCallback(() => {
    const destination = tripContext.destination || 'my trip'
    const shareText = `Check out my ${destination} trip plan on TripSage! 🌍✈️`
    const shareUrl = `https://tripsage.in/plan`

    // Use native Web Share API on mobile devices (shows OS share sheet)
    if (navigator.share) {
      navigator.share({ title: `TripSage – ${destination} Trip`, text: shareText, url: shareUrl })
        .catch(() => {}) // user cancelled — no error needed
      return
    }

    // Desktop fallback — copy the TripSage plan URL with a clear note
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      .then(() => toast.success('Link copied! Note: your friend will need to plan their own trip — personal itineraries aren\'t shared yet.', { duration: 5000 }))
      .catch(() => toast.error('Could not copy link.'))
  }, [tripContext.destination])

  const handleSaveTrip = useCallback(async () => {
    if (!tripContext.destination) {
      toast.error("No active trip to save.")
      return
    }

    const record = {
      destination: tripContext.destination,
      title: `Trip to ${tripContext.destination}`,
      startDate: tripContext.startDate,
      endDate: tripContext.endDate,
      budget: Number(userProfile.budget || 0),
      travelers: Number(userProfile.members || 1),
      status: 'PLANNED',
      itineraryDays: (itinerary || []).map((day: any, idx: number) => ({
        dayNumber: idx + 1,
        title: day.title || `Day ${idx + 1}`,
        description: day.description || '',
        activities: (day.activities || []).map((act: any) => ({
          name: act.name,
          description: act.description || '',
          location: act.location || '',
          startTime: act.startTime ? new Date(act.startTime).toISOString() : null,
          endTime: act.endTime ? new Date(act.endTime).toISOString() : null,
          category: act.category || 'Sightseeing'
        }))
      })),
      itineraryPlaces: (hotels || []).map((hotel: any, idx: number) => ({
        dayNumber: 1,
        name: hotel.name,
        latitude: hotel.latitude || 0,
        longitude: hotel.longitude || 0,
        orderIndex: idx,
        category: 'Hotel'
      }))
    }

    try {
      if (isSignedIn) {
        // Real database save
        const response = await tripAPI.saveTrip(record)
        if (response.success) {
          await addBookmark('itinerary', tripContext.destination)
          toast.success("Trip saved to your profile!")
        } else {
          throw new Error(response.message || "Failed to save to database")
        }
      } else {
        // Fallback to local storage (Zustand)
        addTripToHistory({
          tripId: Date.now().toString(),
          destination: tripContext.destination,
          startLocation: tripContext.startLocation,
          dates: { start: tripContext.startDate, end: tripContext.endDate },
          bookings: {},
          itinerary: itinerary as any,
          status: 'completed',
          createdAt: new Date().toISOString(),
          budget: userProfile.budget,
          style: userProfile.travelStyle,
          members: userProfile.members
        })
        await addBookmark('itinerary', tripContext.destination)
        toast.success("Saved to browser! Log in to sync across devices.")
      }
    } catch (err: any) {
      toast.error(err.message || "Could not save trip.")
    }
  }, [tripContext, userProfile, itinerary, hotels, isSignedIn, addTripToHistory])

  // Listen to real-time socket data as supplementary updates
  // (price drops, weather alerts — search results come from REST now)
  useEffect(() => {
    if (!loading && aiThinking) {
      Promise.resolve().then(() => setAiThinking(false))
    }
  }, [loading, aiThinking])

  // ── Budget-aware derived values ──
  // Compute how much has been spent so far based on selections
  const tripDays = useMemo(() => {
    if (tripContext.startDate && tripContext.endDate) {
      return Math.max(1, getDaysBetween(tripContext.startDate, tripContext.endDate))
    }
    return itinerary.length || 3
  }, [tripContext.startDate, tripContext.endDate, itinerary.length])

  const tripNights = Math.max(1, tripDays - 1)

  // Flight cost in user display currency (already stored in user currency in the card)
  const flightCostSpent = useMemo(() => {
    const selected = bookingStatus.selectedFlight
    if (!selected) return 0
    return (selected.price || 0) * (userProfile.members || 1)
  }, [bookingStatus.selectedFlight, userProfile.members])

  // Hotel cost in user display currency
  const hotelCostSpent = useMemo(() => {
    const selected = bookingStatus.selectedHotel
    if (!selected) return 0
    return (selected.price || 0) * tripNights
  }, [bookingStatus.selectedHotel, tripNights])

  // Total budget in display currency
  const totalBudget = userProfile.budget || 0

  // The actual reset — called either directly (no active trip) or after confirm
  const executeNewTrip = useCallback(() => {
    setSearchForm({
      from: '',
      to: '',
      startDate: '',
      endDate: '',
      budget: '',
      travelers: '2',
      style: 'adventure',
      currency: currency,
      rooms: '1',
      adults: '2',
      children: '0',
      isMultiCity: false,
      stops: [{ city: '', nights: 2 }, { city: '', nights: 3 }]
    })
    startNewTrip()
    resultCacheRef.current = {}
    setTabCache({ overview: true })
    setActiveTab('overview')
    setMoreSheetOpen(false)
    setMobileMenuOpen(false)
    sessionStorage.removeItem('tripContext')
    localStorage.removeItem('tripsage-store')
    toast.success('Ready to plan your new trip!')
  }, [startNewTrip, currency])

  const handleNewTripClick = useCallback(() => {
    // Only show confirmation if there is an active trip with real data to lose
    if (tripContext.destination) {
      setShowNewTripConfirm(true)
    } else {
      executeNewTrip()
    }
  }, [tripContext.destination, executeNewTrip])

  const unreadCount = notifications.filter(n => !n.read).length

  // ── Derived trip metadata for header display ─────────────────────────────
  // Must stay ABOVE any early return to satisfy React's rules of hooks.
  const tripDaysDisplay = useMemo(() => {
    if (tripContext.startDate && tripContext.endDate) {
      return Math.max(1, getDaysBetween(tripContext.startDate, tripContext.endDate))
    }
    return null
  }, [tripContext.startDate, tripContext.endDate])

  const sym = SYMBOLS[currency] ?? currency
  const budgetDisplay = userProfile?.budget
    ? `${sym}${Math.round(userProfile.budget).toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US')}`
    : null

  if (!initialized) return <LoadingSkeleton />

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFBF7', fontFamily: 'var(--font-plus-jakarta), Inter, sans-serif' }}>
      
      {/* ── DESKTOP LEFT SIDEBAR ────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-36 bg-white border-r border-[#E8E0D8] shrink-0 sticky top-0 h-screen p-4 box-border">
        {/* Brand Logo (Logo Beside Text) */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-6 cursor-pointer group">
          <img
            src="/logo.png"
            alt="TripSage"
            width={32}
            height={32}
            className="rounded-lg shadow-xs w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-extrabold text-[#1A1A1A] text-base tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            TripSage
          </span>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-2.5 overflow-y-auto hide-scrollbar py-1">
          {TABS.map(t => {
            const isActive = activeTab === t.id
            const IconComp = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all duration-200 cursor-pointer group relative ${
                  isActive
                    ? 'bg-gradient-to-b from-orange-50 via-orange-100/40 to-amber-50 text-[#EA580C] shadow-sm border border-orange-200/80 ring-1 ring-orange-400/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {/* 2.5D Floating Vector Illustration (TOP) */}
                <div className="flex items-center justify-center p-1 transition-all duration-300 transform group-hover:scale-110">
                  <IconComp size={38} active={isActive} />
                </div>

                {/* Text Label (BOTTOM - DIRECTLY BELOW ICON) */}
                <span className="text-[12px] font-extrabold tracking-tight mt-1.5 text-center leading-tight">
                  {t.label}
                </span>

                {/* Badge Counter */}
                {t.id === 'transport' && transport.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#EA580C] text-white shadow-xs">
                    {transport.length}
                  </span>
                )}
                {t.id === 'hotels' && hotels.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#EA580C] text-white shadow-xs">
                    {hotels.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── MAIN WORKSPACE ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="bg-white border-b border-[#E8E0D8] px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-[1000] shadow-xs h-[68px] box-border">
          {/* Left: Metadata info */}
          <div className="flex items-center gap-6 min-w-0">
            {tripContext.destination ? (
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setShowEditTrip(true)}
                  title="Click to edit destination or travel dates"
                  className="flex items-center gap-3.5 text-left p-1.5 px-3 rounded-xl hover:bg-slate-100/80 border border-slate-200/50 hover:border-slate-300 transition-all cursor-pointer group bg-slate-50/50 min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Destination</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin size={13} className="text-[#EA580C] shrink-0" />
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate max-w-[140px] sm:max-w-[200px] block group-hover:text-[#EA580C] transition-colors">
                        {tripContext.startLocation || '—'} → {tripContext.destination}
                      </span>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-slate-200/70 hidden sm:block shrink-0" />

                  <div className="min-w-0 flex-1 hidden md:block">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dates</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CalendarDays size={13} className="text-[#EA580C] shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap truncate block group-hover:text-[#EA580C] transition-colors">
                        {tripContext.startDate && tripContext.endDate ? `${formatDate(tripContext.startDate)} - ${formatDate(tripContext.endDate)}` : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="w-6 h-6 rounded-lg bg-white text-[#EA580C] border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-orange-50 group-hover:border-orange-200 transition-all">
                    <Pencil size={11} />
                  </div>
                </button>

                {/* Multi-City Stops Button */}
                <button
                  type="button"
                  onClick={() => setSearchForm(p => ({ ...p, isMultiCity: !p.isMultiCity }))}
                  className={`h-9 px-3 text-xs font-extrabold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0 ${
                    searchForm.isMultiCity
                      ? 'bg-[#EA580C] text-white border-[#EA580C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Toggle Multi-City Stops Planning"
                >
                  <Compass size={13} />
                  <span className="hidden xl:inline">{searchForm.isMultiCity ? 'Single City' : 'Multi-City'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2" onClick={() => router.push('/')}>
                <span className="font-extrabold text-slate-800 text-lg">Trip Details</span>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* Currency */}
            <Suspense fallback={null}>
              <CurrencySelector
                value={currency}
                onChange={val => {
                  updateCurrency(val as any)
                  setSearchForm(p => ({ ...p, currency: val }))
                }}
                className="hidden sm:block"
              />
            </Suspense>

            {/* Complete / Save / Share */}
            <div className="hidden lg:flex items-center gap-2">
              {tripStatus === 'planning' || tripStatus === 'active' ? (
                <button
                  onClick={() => { completeTrip(); setShowFeedback(true) }}
                  disabled={itinerary.length === 0}
                  className="h-10 px-3.5 text-xs font-extrabold border border-green-500/40 text-green-600 hover:bg-green-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm flex items-center justify-center"
                >
                  Complete
                </button>
              ) : (
                <button
                  onClick={handleNewTripClick}
                  className="h-10 px-3.5 text-xs font-extrabold border border-[#EA580C]/40 text-[#EA580C] hover:bg-orange-50 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center"
                >
                  New Trip
                </button>
              )}

              <button
                onClick={handleShareTrip}
                title="Share Trip"
                className="w-10 h-10 border border-[#E8E0D8] rounded-xl hover:bg-slate-50 text-[#6B6B6B] transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <Share2 size={16} />
              </button>

              <button
                onClick={handleSaveTrip}
                title="Save Trip"
                className="w-10 h-10 border border-[#E8E0D8] rounded-xl hover:bg-slate-50 text-[#6B6B6B] transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <BookmarkPlus size={16} />
              </button>
            </div>

            {/* Notifications */}
            <button
              className="relative w-10 h-10 rounded-xl hover:bg-slate-50 border border-[#E8E0D8] transition-colors cursor-pointer flex items-center justify-center shrink-0"
              onClick={() => setShowNotifs(!showNotifs)}
              title="Notifications"
            >
              <Bell size={16} className="text-[#6B6B6B]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#EA580C] text-white text-[8px] font-black rounded-full flex items-center justify-center">{unreadCount}</span>
              )}
            </button>

            {/* Refresh Search Button */}
            <button
              onClick={() => runSearch()}
              disabled={loading || !searchForm.from || !searchForm.to}
              className="w-10 h-10 rounded-xl hover:bg-slate-50 border border-[#E8E0D8] transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
              title="Refresh results"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
              ) : (
                <RefreshCw size={16} className="text-[#6B6B6B]" />
              )}
            </button>

            {/* Mobile Hamburguer */}
            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={22} className="text-[#1A1A1A]" /> : <Menu size={22} className="text-[#1A1A1A]" />}
            </button>

            {/* User avatar */}
            <div className="hidden sm:block">
              <UserMenu />
            </div>
          </div>
        </header>
      {/* NOTIFICATIONS PANEL */}
      {showNotifs && (
        <div className="fixed top-16 right-4 z-50 w-80">
          <Suspense fallback={null}>
            <NotificationsPanel onClose={() => setShowNotifs(false)} />
          </Suspense>
        </div>
      )}

      {/* TWO-COLUMN LAYOUT */}
      <div className="flex-grow flex flex-col xl:flex-row gap-6 p-6 pb-24 lg:pb-6 max-w-[1600px] w-full mx-auto box-border">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <main>
            <Suspense fallback={<TabLoader />}>
              {/* MULTI-CITY STOPS MANAGER CARD */}
              {activeTab === 'overview' && searchForm.isMultiCity && (
                <div className="mb-6 max-w-7xl mx-auto w-full box-border animate-fade-in">
                  <div className="bg-white border border-[#E8E0D8] rounded-2xl p-6 shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#EA580C] border border-orange-200/50 flex items-center justify-center font-bold shrink-0">
                          <Compass size={20} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-base leading-tight">Multi-City Trip Planner</h3>
                          <p className="text-xs text-slate-400">Add multiple stopovers and specify nights for each city</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSearchForm(p => ({ ...p, isMultiCity: false }))}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <X size={14} /> Close Multi-City
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Row 1: Origin, Date, Budget, Style with clear labels */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ORIGIN CITY</label>
                          <Suspense fallback={<input className="input-field text-sm w-full h-11" placeholder="From..." disabled />}>
                            <LocationAutocomplete className="input-field text-sm w-full bg-slate-50/60 border-slate-200 focus:bg-white transition-all rounded-xl h-11" placeholder="From..." value={searchForm.from}
                              onChange={val => setSearchForm(p => ({ ...p, from: val }))} />
                          </Suspense>
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">START DATE</label>
                          <input className="input-field text-sm w-full bg-slate-50/60 border-slate-200 focus:bg-white transition-all rounded-xl h-11" type="date" value={searchForm.startDate}
                            onChange={e => setSearchForm(p => ({ ...p, startDate: e.target.value }))} />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BUDGET ({SYMBOLS[currency] || '$'})</label>
                          <input className="input-field text-sm w-full bg-slate-50/60 border-slate-200 focus:bg-white transition-all rounded-xl h-11" placeholder={`Budget ${SYMBOLS[currency] || '$'}`} type="number" min="0" step="100" value={searchForm.budget}
                            onChange={e => setSearchForm(p => ({ ...p, budget: e.target.value }))} />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TRAVEL STYLE</label>
                          <select className="input-field text-sm w-full bg-slate-50/60 border-slate-200 focus:bg-white transition-all rounded-xl h-11" value={searchForm.style}
                            onChange={e => setSearchForm(p => ({ ...p, style: e.target.value }))}>
                            <option value="adventure">Adventure & Outdoors</option>
                            <option value="budget">Budget Friendly</option>
                            <option value="luxury">Luxury & Premium</option>
                            <option value="cultural">Culture & Heritage</option>
                            <option value="family">Family Travel</option>
                            <option value="honeymoon">Honeymoon & Romantic</option>
                            <option value="solo">Solo Backpacking</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Dynamic Stops with Spacious Cards */}
                      <div className="space-y-3 border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-extrabold text-[#EA580C] uppercase tracking-wider">Destinations & Stopovers</span>
                          <span className="text-xs text-slate-400">{searchForm.stops.length} Cities Added</span>
                        </div>

                        <div className="space-y-3">
                          {searchForm.stops.map((stop, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50/60 border border-slate-200/80 rounded-xl p-3.5 transition-all hover:border-orange-200">
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="w-6 h-6 rounded-full bg-[#EA580C] text-white text-xs font-black flex items-center justify-center shrink-0">
                                  {index + 1}
                                </span>
                                <span className="text-xs font-bold text-slate-600 sm:hidden">Stop {index + 1}</span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <Suspense fallback={<input className="input-field w-full text-sm h-11" placeholder="Search city..." disabled />}>
                                  <LocationAutocomplete 
                                    className="input-field text-sm w-full bg-white border-slate-200 focus:border-[#EA580C] transition-all rounded-xl h-11" 
                                    placeholder={`Enter destination stop ${index + 1}...`} 
                                    value={stop.city}
                                    onChange={val => {
                                      const newStops = [...searchForm.stops]
                                      newStops[index].city = val
                                      setSearchForm(p => ({ ...p, stops: newStops }))
                                    }} 
                                  />
                                </Suspense>
                              </div>

                              <div className="w-full sm:w-36 shrink-0">
                                <select
                                  className="input-field text-sm w-full bg-white border-slate-200 focus:border-[#EA580C] transition-all rounded-xl h-11 font-bold text-slate-700"
                                  value={stop.nights}
                                  onChange={e => {
                                    const newStops = [...searchForm.stops]
                                    newStops[index].nights = parseInt(e.target.value)
                                    setSearchForm(p => ({ ...p, stops: newStops }))
                                  }}
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(n => (
                                    <option key={n} value={n}>{n} Night{n === 1 ? '' : 's'}</option>
                                  ))}
                                </select>
                              </div>

                              {searchForm.stops.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newStops = searchForm.stops.filter((_, idx) => idx !== index)
                                    setSearchForm(p => ({ ...p, stops: newStops }))
                                  }}
                                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer shrink-0 self-end sm:self-center"
                                  title="Remove stop"
                                >
                                  <X size={18} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          disabled={searchForm.stops.length >= 5}
                          onClick={() => setSearchForm(p => ({ ...p, stops: [...p.stops, { city: '', nights: 2 }] }))}
                          className="w-full sm:w-auto h-11 px-5 text-xs font-extrabold text-[#EA580C] bg-orange-50 border border-orange-200/80 hover:bg-orange-100 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40"
                        >
                          <Plus size={16} /> Add Stopover Destination
                        </button>

                        <button
                          onClick={() => { runSearch(); setActiveTab('transport'); }}
                          className="w-full sm:w-auto h-11 px-8 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
                          disabled={loading}
                        >
                          {loading ? (
                            <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                          ) : (
                            <><RefreshCw size={16} /> Generate Multi-City Trip</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}


      {/* AI THINKING */}
      {aiThinking && (
        <div className="px-4 max-w-7xl mx-auto mb-4">
          <div className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}></div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--primary)]">Analyzing user data & fetching real-time info...</p>
              <p className="text-xs text-[var(--text-muted)]">Estimated time: ~15 seconds · Calling hotel API · weather · AI ranking</p>
            </div>
            <div className="ml-auto font-mono text-xs text-[var(--text-muted)]">
              Direct Hotels · Open-Meteo
            </div>
          </div>
        </div>
      )}



          {/* Overview */}
          <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
            <OverviewTab
              transport={mergedTransport} hotels={hotels}
              weather={weather} itinerary={itinerary}
              bookingStatus={bookingStatus}
              destination={tripContext.destination}
              loading={loading}
              onTabChange={setActiveTab}
              tripStatus={tripStatus}
              tripHistory={tripHistory}
              onCompleteTrip={() => { completeTrip(); setShowFeedback(true) }}
              onNewTrip={handleNewTripClick}
              onShare={handleShareTrip}
              onSave={handleSaveTrip}
            />
          </div>

          {/* Travel (flights) */}
          {tabCache.transport && (
            <div className={activeTab === 'transport' ? 'block' : 'hidden'}>
              <TransportTab
                transport={mergedTransport} loading={loading}
                tripContext={tripContext} searchForm={searchForm}
                budget={totalBudget} hotelCostSpent={hotelCostSpent}
                currency={currency} error={error}
              />
            </div>
          )}
          
          {tabCache.cars && (
            <div className={activeTab === 'cars' ? 'block' : 'hidden'}>
              <CarsTab />
            </div>
          )}
          

          {tabCache.hotels && (
            <div className={activeTab === 'hotels' ? 'block' : 'hidden'}>
              <HotelsTab
                hotels={hotels} loading={loading}
                tripContext={tripContext} searchForm={searchForm}
              />
            </div>
          )}

          {/* Plan (itinerary) */}
          {tabCache.itinerary && (
            <div className={activeTab === 'itinerary' ? 'block' : 'hidden'}>
              <ItineraryView
                itinerary={itinerary}
                loading={loading}
                destination={tripContext.destination}
                onRegenerate={handleRegenerate}
              />
            </div>
          )}

          {/* Bookings */}
          {tabCache.bookings && (
            <div className={activeTab === 'bookings' ? 'block' : 'hidden'}>
              <BookingStatus />
            </div>
          )}
          {tabCache.history && (
            <div className={activeTab === 'history' ? 'block' : 'hidden'}>
              <TripHistoryTab
                onPlanSimilar={(record) => {
                  setSearchForm({
                    from: record.startLocation,
                    to: record.destination,
                    startDate: record.dates.start,
                    endDate: record.dates.end,
                    budget: String(record.budget),
                    travelers: String(record.members),
                    style: record.style,
                    currency: currency,
                    rooms: '1',
                    adults: String(record.members || 2),
                    children: '0',
                    isMultiCity: record.isMultiCity || false,
                    stops: record.stops || [{ city: '', nights: 2 }, { city: '', nights: 3 }]
                  })
                  startNewTrip()
                  setActiveTab('overview')
                  toast.success(`Planning a similar trip to ${record.destination}!`)
                }}
                onReopenItinerary={(record) => {
                  setItinerary(record.itinerary)
                  setActiveTab('itinerary')
                  toast.success('Itinerary restored!')
                }}
              />
            </div>
          )}

          {tabCache.explore && (
            <div className={activeTab === 'explore' ? 'block' : 'hidden'}>
              <ExploreSection destination={tripContext.destination} />
            </div>
          )}
          {tabCache.map && (
            <div className={activeTab === 'map' ? 'block' : 'hidden'}>
              <MapView itinerary={itinerary} hotels={hotels} tripContext={tripContext} isActive={activeTab === 'map'} />
            </div>
          )}

        </Suspense>
      </main>
    </div>
  </div>
</div>

      {/* FEEDBACK MODAL */}
      {showFeedback && feedbackStatus === 'pending' && (
        <Suspense fallback={null}>
          <FeedbackModal onClose={() => setShowFeedback(false)} />
        </Suspense>
      )}

      {/* EDIT TRIP MODAL */}
      {showEditTrip && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowEditTrip(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#E8E0D8] flex items-center justify-between bg-[#FFFBF7]">
              <h3 className="font-bold text-[#1A1A1A] text-lg">Edit Trip Details</h3>
              <button onClick={() => setShowEditTrip(false)} className="p-1.5 hover:bg-[#E8E0D8] rounded-lg transition-colors text-[#6B6B6B]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">From</label>
                  <Suspense fallback={<input className="input-field" disabled />}>
                    <LocationAutocomplete className="input-field w-full" placeholder="From..." value={searchForm.from} onChange={val => setSearchForm(p => ({ ...p, from: val }))} />
                  </Suspense>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">To</label>
                  <Suspense fallback={<input className="input-field" disabled />}>
                    <LocationAutocomplete className="input-field w-full" placeholder="To..." value={searchForm.to} onChange={val => setSearchForm(p => ({ ...p, to: val }))} />
                  </Suspense>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Start Date</label>
                  <input className="input-field w-full" type="date" value={searchForm.startDate} onChange={e => setSearchForm(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">End Date</label>
                  <input className="input-field w-full" type="date" value={searchForm.endDate} onChange={e => setSearchForm(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Budget ({SYMBOLS[currency] || '$'})</label>
                  <input className="input-field w-full" type="number" min="0" step="100" value={searchForm.budget} onChange={e => setSearchForm(p => ({ ...p, budget: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Travelers</label>
                  <select className="input-field w-full" value={searchForm.travelers} onChange={e => setSearchForm(p => ({ ...p, travelers: e.target.value }))}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} {n===1?'Person':'People'}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E8E0D8] bg-[#FFFBF7] flex justify-end gap-3">
              <button onClick={() => setShowEditTrip(false)} className="btn-outline px-5 py-2.5 border-[#E8E0D8] text-[#6B6B6B] hover:bg-white">
                Cancel
              </button>
              <button
                onClick={() => { setShowEditTrip(false); runSearch(); }}
                className="btn-primary px-6 py-2.5 flex items-center gap-2"
                disabled={loading}
              >
                {loading
                  ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating...</>
                  : <><RefreshCw size={16} />Update Trip</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW TRIP CONFIRMATION DIALOG ──────────────────────────────── */}
      <AnimatePresence>
        {showNewTripConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewTripConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center">
                <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                  <Plus size={28} className="text-[#EA580C]" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Start a New Trip?</h3>
                <p className="text-sm text-[#6B6B6B] mt-2 leading-relaxed">
                  Your current plan for{' '}
                  <span className="font-semibold text-[#1A1A1A]">{tripContext.destination}</span>{' '}
                  will be cleared. This cannot be undone.
                </p>
              </div>
              {/* Actions */}
              <div className="flex gap-3 px-6 pb-6 pt-2">
                <button
                  onClick={() => setShowNewTripConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-[#E8E0D8] text-[#6B6B6B] font-semibold text-sm hover:bg-[#F5F5F4] transition-colors"
                >
                  Keep Current
                </button>
                <button
                  onClick={() => { setShowNewTripConfirm(false); executeNewTrip() }}
                  className="flex-1 py-3 rounded-xl bg-[#EA580C] text-white font-bold text-sm hover:bg-[#C2410C] transition-colors"
                >
                  Start New Trip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E0D8] z-[1000]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-[60px]">
          {([
            { id: 'overview',  label: 'Overview',  icon: Icon3DOverview },
            { id: 'transport', label: 'Transport', icon: Icon3DTransport },
            { id: 'hotels',    label: 'Stay',       icon: Icon3DStay },
            { id: 'itinerary', label: 'Plan',       icon: Icon3DItinerary },
          ] as const).map(t => {
            const isActive = activeTab === t.id
            const IconComp = t.icon
            return (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setMoreSheetOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative transition-colors ${
                  isActive ? 'text-[#EA580C]' : 'text-[#9CA3AF]'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#EA580C] rounded-b-full" />
                )}
                <IconComp size={24} active={isActive} />
                <span className="text-[9px] font-bold uppercase tracking-wide">{t.label}</span>
              </button>
            )
          })}

          {/* More button — opens bottom sheet with all remaining tabs */}
          <button
            onClick={() => setMoreSheetOpen(o => !o)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative transition-colors ${
              moreSheetOpen ? 'text-[#EA580C]' : 'text-[#9CA3AF]'
            }`}
          >
            {moreSheetOpen && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#EA580C] rounded-b-full" />
            )}
            <Menu size={22} strokeWidth={moreSheetOpen ? 2.5 : 1.75} />
            <span className="text-[9px] font-bold uppercase tracking-wide">More</span>
          </button>
        </div>
      </nav>

      {/* ── MORE TABS BOTTOM SHEET ──────────────────────────────────────── */}
      <AnimatePresence>
        {moreSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/40 z-[998]"
              onClick={() => setMoreSheetOpen(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="md:hidden fixed bottom-[60px] left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[999] overflow-hidden"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-[#E8E0D8] rounded-full" />
              </div>
              <p className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-widest px-5 pb-2">More Features</p>
              <div className="grid grid-cols-3 gap-2 px-4 pb-6">
                {([
                  { id: 'explore',  label: 'Explore',  icon: Icon3DExplore },
                  { id: 'map',      label: 'Map',      icon: Icon3DMap },
                  { id: 'bookings', label: 'Bookings', icon: Icon3DBookings },
                ] as const).map(t => {
                  const isActive = activeTab === t.id
                  const IconComp = t.icon
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTab(t.id)
                        setMoreSheetOpen(false)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl transition-all border ${
                        isActive
                          ? 'bg-orange-50 border-orange-200 text-[#EA580C] shadow-xs scale-[1.02]'
                          : 'bg-[#FFFBF7] border-[#E8E0D8] text-[#6B6B6B] hover:bg-[#F5F5F4]'
                      }`}
                    >
                      <IconComp size={32} active={isActive} />
                      <span className="text-[10px] font-extrabold uppercase tracking-wide">{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-grid flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin-slow mb-4 mx-auto"></div>
        <p className="text-[var(--primary)] font-mono">Initializing TripSage...</p>
      </div>
    </div>
  )
}

