'use client'

import { useState, useEffect, lazy, Suspense, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTripStore, type HotelOption, type TransportOption, type TripRecord } from '@/store/tripStore'
import { useSocket } from '@/hooks/useSocket'
import { tripAPI } from '@/lib/api'
import { fetchWithRetry } from '@/lib/fetchWithRetry'
import { formatDate, getDaysBetween } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { SYMBOLS, formatPrice, ALL_CURRENCIES } from '@/lib/currency'
import { trackEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plane, Bus, Car, MapPin, TrendingUp, RefreshCw, 
  Compass, Map, ClipboardList, Search, Plus, 
  Check, LogOut, Menu, X, Bell, History,
  LayoutDashboard, Building2, Settings, User
} from 'lucide-react'

// Lazy load components
const TransportCard = lazy(() => import('@/components/transport/TransportCard'))
const HotelCard = lazy(() => import('@/components/hotel/HotelCard'))
const ItineraryView = lazy(() => import('@/components/itinerary/ItineraryView'))
const WeatherWidget = lazy(() => import('@/components/weather/WeatherWidget'))
const NotificationsPanel = lazy(() => import('@/components/notifications/NotificationsPanel'))
const ExploreSection = lazy(() => import('@/components/explore/ExploreSection'))
const MapView = lazy(() => import('@/components/map/MapView'))
const BookingStatus = lazy(() => import('@/components/booking/BookingStatus'))
const ReturnBookingTab = lazy(() => import('@/components/booking/ReturnBookingTab'))
const FeedbackModal = lazy(() => import('@/components/feedback/FeedbackModal'))
const TripHistoryTab = lazy(() => import('@/components/history/TripHistoryTab'))
const TripActions = lazy(() => import('@/components/actions/TripActions'))
const LocationAutocomplete = lazy(() => import('@/components/ui/LocationAutocomplete'))
const BudgetOptimizerTab = lazy(() => import('@/components/optimizer/BudgetOptimizerTab'))
const BusesTab = lazy(() => import('@/components/transport/BusesTab'))
const CarsTab = lazy(() => import('@/components/transport/CarsTab'))
const CurrencySelector = lazy(() => import('@/components/ui/CurrencySelector'))
const OverviewTab = lazy(() => import('@/components/plan/OverviewTab'))
const TransportTab = lazy(() => import('@/components/plan/TransportTab'))
const HotelsTab = lazy(() => import('@/components/plan/HotelsTab'))

// Helper for loading state
const TabLoader = () => (
  <div className="flex flex-col items-center justify-center py-20 space-y-4">
    <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[var(--text-muted)] animate-pulse">Loading module...</p>
  </div>
)

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'transport', label: 'Flights', icon: Plane },
  { id: 'buses', label: 'Buses', icon: Bus },
  { id: 'cars', label: 'Cabs', icon: Car },
  { id: 'hotels', label: 'Hotels', icon: Building2 },
  { id: 'itinerary', label: 'Itinerary', icon: MapPin },
  { id: 'optimizer', label: 'Optimizer', icon: TrendingUp },
  { id: 'return', label: 'Return', icon: RefreshCw },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'bookings', label: 'Bookings', icon: ClipboardList },
  { id: 'history', label: 'History', icon: History },
]

export default function PlanClient() {
  const router = useRouter()
  const { emit } = useSocket()
  const {
    userProfile, tripContext, transport, hotels, buses, cars, itinerary,
    weather, notifications, bookingStatus, loading, isConnected,
    tripStatus, feedbackStatus, tripHistory,
    setTrip, setProfile, setTransport, setHotels, setBuses, setCars, setItinerary,
    setWeather, setLoading, setError, addNotification,
    completeTrip, startNewTrip, reset
  } = useTripStore()
  const { user, isLoggedIn, logout, updateCurrency } = useAuthStore()

  const [activeTab, setActiveTab] = useState('overview')
  const [showNotifs, setShowNotifs] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchForm, setSearchForm] = useState({
    from: '', to: '', startDate: '', endDate: '', budget: '2000', travelers: '2', style: 'adventure', currency: 'INR'
  })

  // Active currency: user's saved currency, or form's selected currency, or default INR
  const currency = user?.currency ?? searchForm.currency ?? 'INR'

  // Tab cache to prevent re-renders and make switching instant
  const [tabCache, setTabCache] = useState<Record<string, boolean>>({ overview: true })

  useEffect(() => {
    setTabCache(prev => ({ ...prev, [activeTab]: true }))
  }, [activeTab])

  // ── RESULT CACHE: keyed by search params so same query never re-fetches ──
  const resultCacheRef = useRef<Record<string, {
    transport: any[]; hotels: any[]; buses: any[]; cars: any[];
    itinerary: any[]; weather: any;
  }>>({})

  // Generate a deterministic cache key from search parameters
  const getCacheKey = useCallback((p: { from: string; to: string; startDate?: string; endDate?: string; budget?: number; travelers?: number; style?: string }) => {
    return [
      p.from?.toLowerCase().trim(),
      p.to?.toLowerCase().trim(),
      p.startDate || '',
      p.endDate || '',
      String(p.budget || ''),
      String(p.travelers || ''),
      p.style || '',
    ].join('|')
  }, [])

  // Track the current search cache key so socket handlers can save to the right slot
  const activeCacheKeyRef = useRef<string>('')
  
  // Track active AbortController to cancel previous requests if a new search starts
  const abortControllerRef = useRef<AbortController | null>(null)

  // Activate ALL data-bearing tabs at once so skeletons render simultaneously
  const activateAllTabs = useCallback(() => {
    setTabCache({
      overview: true, transport: true, buses: true, cars: true,
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
        setSearchForm({
          from: ctx.from || '',
          to: ctx.to || '',
          startDate: ctx.startDate || '',
          endDate: ctx.endDate || '',
          budget: ctx.budget || '2000',
          travelers: ctx.travelers || '2',
          style: ctx.style || 'adventure',
          currency: ctx.currency || 'INR',
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
        // Load values into form but do NOT auto-search. Let the user click search manually.
        // This prevents the app from automatically searching old trips like Hyderabad on every refresh.
      } catch (e) {}
    }
    setInitialized(true)
  }, [setTrip, setProfile])

  const runSearch = async (params?: any) => {
    const p = params || {
      from: searchForm.from, to: searchForm.to,
      startDate: searchForm.startDate, endDate: searchForm.endDate,
      budget: parseInt(searchForm.budget),
      travelers: parseInt(searchForm.travelers),
      style: searchForm.style,
    }
    if (!p.from || !p.to) return

    // Dismiss any active inputs (closes mobile keyboard and dropdowns instantly)
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    const cacheKey = getCacheKey(p)

    // ── CHECK CACHE: if we already fetched this exact query, restore instantly ──
    const cached = resultCacheRef.current[cacheKey]
    if (cached && (cached.transport.length > 0 || cached.hotels.length > 0 || cached.itinerary.length > 0)) {
      // Restore all cached data without any loading state or API call
      setTransport(cached.transport)
      setHotels(cached.hotels)
      setBuses(cached.buses)
      setCars(cached.cars)
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
          () => tripAPI.search({
            from: p.from,
            to: p.to,
            startDate: p.startDate,
            endDate: p.endDate,
            budget: p.budget,
            travelers: p.travelers,
            style: p.style,
          }, { signal }),
          { timeout: 10000, maxRetries: 2, label: 'Search' }
        ).catch(err => {
          if (err.message?.includes('canceled') || err.name === 'AbortError') return null
          throw err
        }),
        // Weather fetched in parallel
        fetchWithRetry(
          () => tripAPI.getWeather(p.to, { signal }),
          { timeout: 10000, maxRetries: 2, label: 'Weather' }
        ).catch(err => {
          if (err.message?.includes('canceled') || err.name === 'AbortError') return null
          console.warn('[Weather] failed after retries:', err.message)
          return null
        }),
        // Itinerary fetched in parallel
        fetchWithRetry(
          () => tripAPI.generateItinerary({
            destination: p.to,
            days: p.startDate && p.endDate ? Math.max(1, Math.ceil((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 3600 * 24))) : 3,
            budget: p.budget,
            style: p.style,
            preferences: [],
            members: p.travelers,
            startDate: p.startDate
          }, { signal }),
          { timeout: 20000, maxRetries: 1, label: 'Itinerary' }
        ).catch(err => {
          if (err.message?.includes('canceled') || err.name === 'AbortError') return null
          console.warn('[Itinerary] failed:', err.message)
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
        if (d.hotels) setHotels(d.hotels)
        if (d.buses) setBuses(d.buses)
        if (d.cars) setCars(d.cars)
      }

      // Populate weather
      if (weatherResult?.data) {
        setWeather(weatherResult.data)
      }

      // Populate itinerary
      if (itineraryResult?.data?.itinerary) {
        setItinerary(itineraryResult.data.itinerary)
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

  // Listen to real-time socket data as supplementary updates
  // (price drops, weather alerts — search results come from REST now)
  useEffect(() => {
    if (!loading && aiThinking) {
      setAiThinking(false)
    }
  }, [loading, aiThinking])

  const handleNewTripClick = useCallback(() => {
    // 1. Clear searchForm state to empty placeholders in React state
    setSearchForm({
      from: '',
      to: '',
      startDate: '',
      endDate: '',
      budget: '',
      travelers: '2',
      style: 'adventure',
      currency: currency
    })

    // 2. Clear all store values via store action
    startNewTrip()

    // 3. Clear resultCacheRef cache completely to prevent previous search data from loading
    resultCacheRef.current = {}

    // 4. Force tabCache to reset to only 'overview' so nothing is pre-rendered or cached
    setTabCache({ overview: true })

    // 5. Navigate to overview tab instantly
    setActiveTab('overview')

    // 6. Clear session and local storage keys for tripContext and tripsage-store
    sessionStorage.removeItem('tripContext')
    localStorage.removeItem('tripsage-store')

    // Show instant feedback
    toast.success('Ready to plan your new trip!')
  }, [startNewTrip, currency])

  const unreadCount = notifications.filter(n => !n.read).length

  if (!initialized) return <LoadingSkeleton />

  return (
    <div className="min-h-screen bg-grid">
      {/* TOP NAV */}
      <nav className="glass-dark sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="flex items-center gap-2">
            <img
              src="https://res.cloudinary.com/dob5llmb2/image/upload/v1778407506/Primary.JPEG.Logo_1_o0h85v.png"
              alt="TripSage" width={32} height={32} className="rounded-lg w-[32px] h-[32px] object-contain"
            />
            <span className="font-bold text-[var(--primary)] text-lg hidden sm:block tracking-tight whitespace-nowrap">TripSage</span>
          </button>
          <div className="hidden sm:flex shrink-0 items-center gap-1.5 px-2 py-1 rounded-md border border-slate-200/60 bg-white/50 shadow-sm backdrop-blur-sm">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-[10px] font-bold tracking-wider text-slate-500 whitespace-nowrap">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
        </div>

        {/* Trip info pill */}
        {tripContext.destination && (
          <div className="glass px-4 py-1.5 rounded-full text-sm hidden lg:flex items-center gap-3">
            <span className="text-[var(--text-muted)]">{tripContext.startLocation}</span>
            <span className="text-[var(--primary)]">→</span>
            <span className="font-semibold text-[var(--text-primary)]">{tripContext.destination}</span>
            {tripContext.startDate && (
              <span className="text-[var(--text-muted)] text-xs">· {formatDate(tripContext.startDate)}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Download + Share */}
          <Suspense fallback={null}>
            <TripActions />
          </Suspense>

          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors"
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <Bell size={18} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors" />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>

          {/* Settings */}
          <button
            className="p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors"
            onClick={() => toast.success('Settings opened')}
            title="Settings"
          >
            <Settings size={18} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors" />
          </button>

          {/* Currency selector */}
          <Suspense fallback={null}>
            <CurrencySelector
              value={currency}
              onChange={val => {
                updateCurrency(val as any)
                setSearchForm(p => ({ ...p, currency: val }))
              }}
              className="hidden sm:block min-w-[140px]"
            />
          </Suspense>

          {tripStatus === 'planning' || tripStatus === 'active' ? (
            <button
              onClick={() => { completeTrip(); setShowFeedback(true) }}
              disabled={itinerary.length === 0}
              className="btn-outline py-2 px-3 text-xs border-green-500/50 text-green-400 hover:bg-green-500/10 disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block"
            >
              <Check size={14} /> Complete
            </button>
          ) : (
            <button
              onClick={handleNewTripClick}
              className="btn-outline py-2 px-3 text-xs border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10 hidden sm:block"
            >
              <Plus size={14} /> New Trip
            </button>
          )}

          {/* User avatar / login */}
          {isLoggedIn && user ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white flex-shrink-0">
                <User size={16} className="text-white hover:brightness-125 transition-all" />
              </div>
              <span className="text-xs font-semibold text-[var(--text-primary)] hidden md:block max-w-[80px] truncate">
                {user.name}
              </span>
              <button
                onClick={() => { logout(); router.push('/auth') }}
                className="text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors hidden md:block"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => router.push('/auth')} className="btn-primary py-2 px-3 text-sm hidden sm:flex items-center gap-1.5 whitespace-nowrap">
              <User size={16} /> Sign In
            </button>
          )}

          <button
            onClick={() => runSearch()}
            className="btn-primary p-2 sm:py-2 sm:px-3 text-sm flex items-center justify-center"
            disabled={loading || !searchForm.from || !searchForm.to}
          >
            {loading ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <RefreshCw size={18} />}
          </button>
          
          <button className="sm:hidden p-2 text-[var(--text-primary)] text-xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 top-[60px] bg-[var(--bg-dark)] z-[9999] p-6 flex flex-col gap-6 animate-fade-in overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Currency</span>
            <Suspense fallback={null}>
              <CurrencySelector
                value={currency}
                onChange={val => {
                  updateCurrency(val as any)
                  setSearchForm(p => ({ ...p, currency: val }))
                }}
                className="min-w-[140px]"
              />
            </Suspense>
          </div>
          
          {tripStatus === 'planning' || tripStatus === 'active' ? (
            <button
              onClick={() => { completeTrip(); setShowFeedback(true); setMobileMenuOpen(false); }}
              disabled={itinerary.length === 0}
              className="btn-outline w-full py-3 text-sm border-green-500/50 text-green-400"
            >
              <Check size={16} /> Complete Trip
            </button>
          ) : (
            <button
              onClick={() => { handleNewTripClick(); setMobileMenuOpen(false); }}
              className="btn-outline w-full py-3 text-sm border-[var(--primary)] text-[var(--primary)]"
            >
              <Plus size={16} /> New Trip
            </button>
          )}

          <div className="h-px bg-[var(--border)] my-2"></div>

          {isLoggedIn && user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-[var(--text-primary)]">{user.name}</span>
              </div>
              <button onClick={() => { logout(); router.push('/auth'); }} className="btn-outline text-red-400 border-red-500/30 w-full py-3">Logout</button>
            </div>
          ) : (
            <button onClick={() => { router.push('/auth'); setMobileMenuOpen(false); }} className="btn-primary w-full py-3">Sign In</button>
          )}
        </div>
      )}

      {/* NOTIFICATIONS PANEL */}
      {showNotifs && (
        <div className="fixed top-16 right-4 z-50 w-80">
          <Suspense fallback={null}>
            <NotificationsPanel onClose={() => setShowNotifs(false)} />
          </Suspense>
        </div>
      )}

      {/* SEARCH BAR */}
      {activeTab === 'overview' && (
        <div className="px-3 sm:px-4 py-4 max-w-7xl mx-auto w-full box-border">
          <div className="glass rounded-xl p-3 sm:p-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2.5 sm:gap-3">
              <Suspense fallback={<input className="input-field text-[13px] sm:text-sm w-full" placeholder="From..." disabled />}>
                <LocationAutocomplete className="input-field text-[13px] sm:text-sm w-full !bg-white/50 !border-slate-200/60 focus:!bg-white transition-all" placeholder="From..." value={searchForm.from}
                  onChange={val => setSearchForm(p => ({ ...p, from: val }))} />
              </Suspense>
              <Suspense fallback={<input className="input-field text-[13px] sm:text-sm w-full" placeholder="To..." disabled />}>
                <LocationAutocomplete className="input-field text-[13px] sm:text-sm w-full !bg-white/50 !border-slate-200/60 focus:!bg-white transition-all" placeholder="To..." value={searchForm.to}
                  onChange={val => setSearchForm(p => ({ ...p, to: val }))} />
              </Suspense>
              <input className="input-field text-[13px] sm:text-sm w-full !bg-white/50 !border-slate-200/60 focus:!bg-white transition-all" type="date" value={searchForm.startDate}
                onChange={e => setSearchForm(p => ({ ...p, startDate: e.target.value }))} />
              <input className="input-field text-[13px] sm:text-sm w-full !bg-white/50 !border-slate-200/60 focus:!bg-white transition-all" type="date" value={searchForm.endDate}
                onChange={e => setSearchForm(p => ({ ...p, endDate: e.target.value }))} />
              <input className="input-field text-[13px] sm:text-sm w-full !bg-white/50 !border-slate-200/60 focus:!bg-white transition-all" placeholder={`Budget ${SYMBOLS[currency] || '$'}`} type="number" value={searchForm.budget}
                onChange={e => setSearchForm(p => ({ ...p, budget: e.target.value }))} />
              <select className="input-field text-[13px] sm:text-sm w-full !bg-white/50 !border-slate-200/60 focus:!bg-white transition-all" value={searchForm.travelers}
                onChange={e => setSearchForm(p => ({ ...p, travelers: e.target.value }))}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} {n===1?'Person':'People'}</option>)}
              </select>
              <button
                onClick={() => runSearch()}
                className="btn-primary w-full py-2.5 text-[13px] sm:text-sm"
                disabled={loading}
              >
                {loading ? '...' : <><Search size={16} /> Search</>}
              </button>
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
              <p className="text-xs text-[var(--text-muted)]">Estimated time: ~15 seconds · Calling flight API · hotel API · weather · AI ranking</p>
            </div>
            <div className="ml-auto font-mono text-xs text-[var(--text-muted)]">
              Skyscanner · Booking.com · Open-Meteo
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="px-3 sm:px-4 max-w-7xl mx-auto w-full overflow-hidden box-border">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar w-full relative snap-x">
          {TABS.filter(t => t.id !== 'buses' || buses.length > 0).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <t.icon size={18} className={`${activeTab === t.id ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-[var(--accent)]'} transition-colors`} />
              {t.label}
              {t.id === 'transport' && transport.length > 0 && (
                <span className="badge badge-green text-[0.6rem] py-0 px-1">{transport.length}</span>
              )}
              {t.id === 'hotels' && hotels.length > 0 && (
                <span className="badge badge-green text-[0.6rem] py-0 px-1">{hotels.length}</span>
              )}
              {t.id === 'buses' && buses.length > 0 && (
                <span className="badge badge-green text-[0.6rem] py-0 px-1">{buses.length}</span>
              )}
              {t.id === 'history' && tripHistory.length > 0 && (
                <span className="badge badge-amber text-[0.6rem] py-0 px-1">{tripHistory.length}</span>
              )}
              {t.id === 'return' && bookingStatus.returnStatus === 'CONFIRMED' && (
                <span className="badge badge-green text-[0.6rem] py-0 px-1">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="px-4 py-6 max-w-7xl mx-auto animate-fade-in pb-24 md:pb-6">
        <Suspense fallback={<TabLoader />}>
          <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
            <OverviewTab
              transport={transport} hotels={hotels}
              weather={weather} itinerary={itinerary}
              bookingStatus={bookingStatus}
              destination={tripContext.destination}
              loading={loading}
              onTabChange={setActiveTab}
              tripStatus={tripStatus}
              tripHistory={tripHistory}
              onCompleteTrip={() => { completeTrip(); setShowFeedback(true) }}
              onNewTrip={handleNewTripClick}
            />
          </div>
          
          {tabCache.transport && (
            <div className={activeTab === 'transport' ? 'block' : 'hidden'}>
              <TransportTab transport={transport} loading={loading} tripContext={tripContext} searchForm={searchForm} />
            </div>
          )}
          
          {tabCache.buses && (
            <div className={activeTab === 'buses' ? 'block' : 'hidden'}>
              <BusesTab />
            </div>
          )}
          
          {tabCache.cars && (
            <div className={activeTab === 'cars' ? 'block' : 'hidden'}>
              <CarsTab />
            </div>
          )}
          
          {tabCache.hotels && (
            <div className={activeTab === 'hotels' ? 'block' : 'hidden'}>
              <HotelsTab hotels={hotels} loading={loading} tripContext={tripContext} searchForm={searchForm} />
            </div>
          )}
          
          {tabCache.itinerary && (
            <div className={activeTab === 'itinerary' ? 'block' : 'hidden'}>
              <ItineraryView itinerary={itinerary} loading={loading} />
            </div>
          )}
          
          {tabCache.optimizer && (
            <div className={activeTab === 'optimizer' ? 'block' : 'hidden'}>
              <BudgetOptimizerTab />
            </div>
          )}
          
          {tabCache.return && (
            <div className={activeTab === 'return' ? 'block' : 'hidden'}>
              <ReturnBookingTab tripContext={tripContext} />
            </div>
          )}
          
          {tabCache.explore && (
            <div className={activeTab === 'explore' ? 'block' : 'hidden'}>
              <ExploreSection destination={tripContext.destination} />
            </div>
          )}
          
          {tabCache.map && (
            <div className={activeTab === 'map' ? 'block' : 'hidden'}>
              <MapView itinerary={itinerary} hotels={hotels} tripContext={tripContext} />
            </div>
          )}
          
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
                    currency: currency
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
        </Suspense>
      </main>

      {/* FEEDBACK MODAL */}
      {showFeedback && feedbackStatus === 'pending' && (
        <Suspense fallback={null}>
          <FeedbackModal onClose={() => setShowFeedback(false)} />
        </Suspense>
      )}

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 z-[1000] shadow-[0_-8px_30px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-[64px]">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'transport', label: 'Flights', icon: Plane },
            { id: 'hotels', label: 'Hotels', icon: Building2 },
            { id: 'itinerary', label: 'Itinerary', icon: MapPin },
            { id: 'bookings', label: 'Bookings', icon: ClipboardList },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={`flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all duration-300 relative ${
                activeTab === t.id ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <t.icon size={22} strokeWidth={activeTab === t.id ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-tight uppercase">{t.label}</span>
              {activeTab === t.id && (
                <motion.div 
                  layoutId="activeTabUnderline"
                  className="absolute top-0 w-8 h-1 bg-orange-500 rounded-b-full"
                />
              )}
            </button>
          ))}
        </div>
      </nav>
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

