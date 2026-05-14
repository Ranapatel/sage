import type { Metadata } from 'next'
import PlanClient from './PlanClient'

<<<<<<< HEAD
export const metadata: Metadata = {
  title: 'AI Trip Planner | Design Your Perfect Itinerary',
  description: 'Use TripSage AI to plan your next adventure. Get personalized itineraries, real-time flight and hotel options, and smart travel recommendations based on your budget.',
  keywords: ['AI travel planner', 'personalized itinerary', 'trip planning software', 'smart travel planning'],
}

export default function PlanPage() {
  return <PlanClient />
=======
import { useState, useEffect, lazy, Suspense, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTripStore, type HotelOption, type TransportOption, type TripRecord } from '@/store/tripStore'
import { useSocket } from '@/hooks/useSocket'
import { tripAPI } from '@/lib/api'
import { formatDate, getDaysBetween } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { SYMBOLS } from '@/lib/currency'
import { trackEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, Plane, Bus, Car, Hotel, MapPin, TrendingUp, RefreshCw, 
  Compass, Map, ClipboardList, Search, Plus, Settings,
  Check, LogOut, Menu, X, Bell, History
} from 'lucide-react'

// Lazy load components
const ItineraryView = lazy(() => import('@/components/itinerary/ItineraryView'))
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
  { id: 'overview',  label: 'Overview',  icon: Home },
  { id: 'transport', label: 'Flights',   icon: Plane },
  { id: 'buses',     label: 'Buses',     icon: Bus },
  { id: 'cars',      label: 'Cabs',      icon: Car },
  { id: 'hotels',    label: 'Hotels',    icon: Hotel },
  { id: 'itinerary', label: 'Itinerary', icon: MapPin },
  { id: 'optimizer', label: 'Optimizer', icon: TrendingUp },
  { id: 'return',    label: 'Return',    icon: RefreshCw },
  { id: 'explore',   label: 'Explore',   icon: Compass },
  { id: 'map',       label: 'Map',       icon: Map },
  { id: 'bookings',  label: 'Bookings',  icon: ClipboardList },
  { id: 'history',   label: 'History',   icon: History },
]

export default function PlanPage() {
  const router = useRouter()
  const { emit } = useSocket()
  const {
    userProfile, tripContext, transport, hotels, buses, cars, itinerary,
    weather, notifications, bookingStatus, loading, isConnected,
    tripStatus, feedbackStatus, tripHistory,
    setTrip, setProfile, setTransport, setHotels, setBuses, setCars, setItinerary,
    setWeather, setLoading, setError, addNotification,
    completeTrip, startNewTrip,
  } = useTripStore()
  const { user, isLoggedIn, logout, updateCurrency } = useAuthStore()

  // Active currency: user's saved currency or default INR
  const currency = user?.currency ?? 'INR'

  const [activeTab, setActiveTab] = useState('overview')
  const [showNotifs, setShowNotifs] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false) // mobile search toggle
  const [searchForm, setSearchForm] = useState({
    from: '', to: '', startDate: '', endDate: '', budget: '2000', travelers: '2', style: 'adventure'
  })
  // Prevent duplicate auto-searches on mount
  const hasAutoSearched = useRef(false)

  // Tab cache to prevent re-renders and make switching instant
  const [tabCache, setTabCache] = useState<Record<string, boolean>>({ overview: true })

  useEffect(() => {
    setTabCache(prev => ({ ...prev, [activeTab]: true }))
  }, [activeTab])


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
        // Auto search if destination set — only once
        if (ctx.from && ctx.to && !hasAutoSearched.current) {
          hasAutoSearched.current = true
          setTimeout(() => runSearch(ctx), 500)
        }
      } catch (e) {}
    }
    setInitialized(true)
  }, [])

  const runSearch = async (params?: any) => {
    const p = params || {
      from: searchForm.from, to: searchForm.to,
      startDate: searchForm.startDate, endDate: searchForm.endDate,
      budget: parseInt(searchForm.budget),
      travelers: parseInt(searchForm.travelers),
      style: searchForm.style,
    }
    if (!p.from || !p.to) return

    setLoading(true)
    setAiThinking(true)
    setError(null)

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
      // Parallel API calls
      const [searchRes, weatherRes] = await Promise.allSettled([
        tripAPI.search(p),
        tripAPI.getWeather(p.to),
      ])

      if (searchRes.status === 'fulfilled' && searchRes.value?.data) {
        const d = searchRes.value.data
        if (d.transport) setTransport(d.transport)
        if (d.hotels) setHotels(d.hotels)
        if (d.buses) setBuses(d.buses)
        if (d.cars) setCars(d.cars)
        toast.success(`Found ${d.transport?.length || 0} flights and ${d.hotels?.length || 0} hotels!`)
      }

      if (weatherRes.status === 'fulfilled' && weatherRes.value?.data) {
        setWeather(weatherRes.value.data)
      }

      // Generate itinerary
      const days = p.endDate ? getDaysBetween(p.startDate, p.endDate) : 3
      const itiRes = await tripAPI.generateItinerary({
        destination: p.to,
        days: days,
        budget: parseInt(p.budget) || 2000,
        style: p.style || 'adventure',
        preferences: userProfile.preferences,
        members: parseInt(p.travelers) || 2,
        startDate: p.startDate,
      })
      if (itiRes?.data?.itinerary) {
        setItinerary(itiRes.data.itinerary)
        trackEvent('trip_generated', { destination: p.to, days: days, style: p.style })
      }

      // Emit socket event for real-time updates
      emit('SUBSCRIBE_UPDATES', { destination: p.to, sessionId: sessionStorage.getItem('sessionId') })

      addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: '✅ Trip Ready',
        message: `Your ${p.to} trip plan is ready!`,
        timestamp: new Date().toISOString(),
        read: false,
      })

    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Search failed')
    } finally {
      setLoading(false)
      setAiThinking(false)
    }
  }



  const unreadCount = notifications.filter(n => !n.read).length

  if (!initialized) return <LoadingSkeleton />

  return (
    <div className="min-h-screen bg-grid">
      {/* TOP NAV */}
      <nav className="glass-dark sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="flex items-center gap-2">
            <Image
              src="https://res.cloudinary.com/dob5llmb2/image/upload/v1774999435/LOGO_xbwcwe.png"
              alt="TripSage" width={32} height={32} className="rounded-lg" unoptimized
            />
            <span className="font-bold text-[var(--primary)] hidden sm:block">TripSage</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--primary)] animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-[var(--text-muted)]">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
        </div>

        {/* Trip info pill */}
        {tripContext.destination && (
          <div className="glass px-4 py-1.5 rounded-full text-sm hidden md:flex items-center gap-3">
            <span className="text-[var(--text-muted)]">{tripContext.startLocation}</span>
            <span className="text-[var(--primary)]">→</span>
            <span className="font-semibold text-[var(--text-primary)]">{tripContext.destination}</span>
            {tripContext.startDate && (
              <span className="text-[var(--text-muted)] text-xs">· {formatDate(tripContext.startDate)}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Download + Share */}
          <Suspense fallback={<div className="w-8 h-8 rounded-full bg-[var(--bg-card)] animate-pulse" />}>
            <TripActions />
          </Suspense>

          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors"
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <Bell size={20} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors" />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>

          {/* Currency selector */}
          <Suspense fallback={<div className="hidden sm:block min-w-[140px] h-9 rounded-lg bg-[var(--bg-card)] animate-pulse" />}>
            <CurrencySelector
              value={currency}
              onChange={val => updateCurrency(val as any)}
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
              onClick={() => { startNewTrip(); setActiveTab('overview') }}
              className="btn-outline py-2 px-3 text-xs border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10 hidden sm:block"
            >
              <Plus size={14} /> New Trip
            </button>
          )}

          {/* User avatar / login */}
          {isLoggedIn && user ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
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
            <button onClick={() => router.push('/auth')} className="btn-primary py-2 px-4 text-sm hidden sm:block">
              Sign In
            </button>
          )}

          {/* Mobile search toggle */}
          <button
            onClick={() => setShowSearch(s => !s)}
            className={`sm:hidden p-2 rounded-lg transition-colors ${showSearch ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-primary)]'}`}
            title="Search"
          >
            <Search size={20} />
          </button>

          <button
            onClick={() => runSearch()}
            className="hidden sm:flex btn-primary p-2 sm:py-2 sm:px-3 text-sm items-center justify-center"
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
            <Suspense fallback={<div className="min-w-[140px] h-9 rounded-lg bg-[var(--bg-card)] animate-pulse" />}>
              <CurrencySelector
                value={currency}
                onChange={val => updateCurrency(val as any)}
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
              onClick={() => { startNewTrip(); setActiveTab('overview'); setMobileMenuOpen(false); }}
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
          <Suspense fallback={<div className="glass rounded-2xl p-4 animate-pulse h-32" />}>
            <NotificationsPanel onClose={() => setShowNotifs(false)} />
          </Suspense>
        </div>
      )}

      {/* SEARCH BAR — always visible on desktop, toggleable on mobile */}
      <div className={`px-3 sm:px-4 max-w-7xl mx-auto w-full box-border transition-all duration-300 overflow-hidden ${
        showSearch ? 'py-3 max-h-[500px] opacity-100' : 'py-0 max-h-0 opacity-0 sm:max-h-[500px] sm:opacity-100 sm:py-4'
      }`}>
        <div className="glass rounded-xl p-3 sm:p-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2.5 sm:gap-3">
            <Suspense fallback={<div className="input-field animate-pulse !bg-white/50 h-10 w-full" />}>
              <LocationAutocomplete className="input-field text-[13px] sm:text-sm w-full !bg-white/50 !border-slate-200/60 focus:!bg-white transition-all" placeholder="From city..." value={searchForm.from}
                onChange={val => setSearchForm(p => ({ ...p, from: val }))} />
            </Suspense>
            <Suspense fallback={<div className="input-field animate-pulse !bg-white/50 h-10 w-full" />}>
              <LocationAutocomplete className="input-field text-[13px] sm:text-sm w-full !bg-white/50 !border-slate-200/60 focus:!bg-white transition-all" placeholder="To city..." value={searchForm.to}
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
              onClick={() => { runSearch(); setShowSearch(false) }}
              className="btn-primary w-full py-2.5 text-[13px] sm:text-sm flex items-center justify-center gap-1.5"
              disabled={loading}
            >
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Search size={15} /> Search</>}
            </button>
          </div>
        </div>
      </div>

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
              <p className="text-sm font-semibold text-[var(--primary)]">Groq AI Engine processing...</p>
              <p className="text-xs text-[var(--text-muted)]">Searching flights, hotels, generating itinerary in parallel</p>
            </div>
            <div className="ml-auto font-mono text-xs text-[var(--text-muted)]">
              LLaMA3-70B · Real-time
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="px-3 sm:px-4 max-w-7xl mx-auto w-full overflow-hidden box-border">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar w-full relative snap-x">
          {TABS.map(t => (
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
              onNewTrip={() => { startNewTrip(); setActiveTab('overview') }}
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
              <ItineraryView itinerary={itinerary} loading={loading} destination={tripContext.destination} />
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
              <MapView itinerary={itinerary} />
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
                  setSearchForm({ from: record.startLocation, to: record.destination, startDate: record.dates.start, endDate: record.dates.end, budget: String(record.budget), travelers: String(record.members), style: record.style })
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

      {/* MOBILE BOTTOM NAV — 5 tabs horizontal, matches design */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-xl border-t border-slate-200/80 z-[1000] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-[62px]">
          {[
            { id: 'overview',  label: 'Overview',  icon: Home },
            { id: 'transport', label: 'Flights',   icon: Plane },
            { id: 'hotels',    label: 'Hotels',    icon: Hotel },
            { id: 'itinerary', label: 'Itinerary', icon: MapPin },
            { id: 'bookings',  label: 'Bookings',  icon: ClipboardList },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 relative ${
                activeTab === t.id ? 'text-orange-500' : 'text-slate-400'
              }`}
            >
              {activeTab === t.id && (
                <motion.div layoutId="mobileActiveTab" className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-orange-500 rounded-b-full" />
              )}
              <t.icon size={22} strokeWidth={activeTab === t.id ? 2.5 : 1.8} />
              <span className="text-[10px] font-bold uppercase tracking-tight">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
>>>>>>> 1f08c79 (fix: improve landing page UI and integrate backend functionality)
}
