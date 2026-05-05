'use client'

import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTripStore, type HotelOption, type TransportOption, type TripRecord } from '@/store/tripStore'
import { useSocket } from '@/hooks/useSocket'
import { tripAPI } from '@/lib/api'
import { formatDate, getDaysBetween } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { SYMBOLS, formatPrice, ALL_CURRENCIES } from '@/lib/currency'
import { trackEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, Plane, Bus, Car, Hotel, MapPin, TrendingUp, RefreshCw, 
  Compass, Map, ClipboardList, Search, Plus, 
  Check, LogOut, Menu, X, Bell, History
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
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'transport', label: 'Flights', icon: Plane },
  { id: 'buses', label: 'Buses', icon: Bus },
  { id: 'cars', label: 'Cabs', icon: Car },
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'itinerary', label: 'Itinerary', icon: MapPin },
  { id: 'optimizer', label: 'Optimizer', icon: TrendingUp },
  { id: 'return', label: 'Return', icon: RefreshCw },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'bookings', label: 'Bookings', icon: ClipboardList },
  { id: 'history', label: 'History', icon: History },
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
  const [searchForm, setSearchForm] = useState({
    from: '', to: '', startDate: '', endDate: '', budget: '2000', travelers: '2', style: 'adventure'
  })

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
        // Load values into form but do NOT auto-search. Let the user click search manually.
        // This prevents the app from automatically searching old trips like Hyderabad on every refresh.
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
    
    // Clear previous results
    setTransport([])
    setHotels([])
    setBuses([])
    setCars([])
    setItinerary([])

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
      // 1. Fire progressive WebSocket stream for trips
      emit('GENERATE_TRIP_STREAM', {
        destination: p.to,
        from: p.from,
        startDate: p.startDate,
        endDate: p.endDate,
        budget: p.budget,
        travelers: p.travelers,
        style: p.style,
        preferences: userProfile.preferences
      });

      // Emit socket event for real-time updates (price/weather alerts)
      emit('SUBSCRIBE_UPDATES', { destination: p.to, sessionId: sessionStorage.getItem('sessionId') })

      // 2. Fetch weather asynchronously in parallel
      tripAPI.getWeather(p.to)
        .then(res => {
          if (res?.data) setWeather(res.data)
        })
        .catch(err => console.warn('[Weather] failed:', err.message));

      addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: '🔄 Generating Trip',
        message: `Building your ${p.to} trip plan progressively...`,
        timestamp: new Date().toISOString(),
        read: false,
      })

    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Stream initiation failed')
      setLoading(false)
      setAiThinking(false)
    }
  }

  // Listen to complete event to turn off local aiThinking
  useEffect(() => {
    if (!loading && aiThinking) {
      setAiThinking(false)
    }
  }, [loading, aiThinking])



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
          <TripActions />

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
          <CurrencySelector
            value={currency}
            onChange={val => updateCurrency(val as any)}
            className="hidden sm:block min-w-[140px]"
          />

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
            <CurrencySelector
              value={currency}
              onChange={val => updateCurrency(val as any)}
              className="min-w-[140px]"
            />
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
          <NotificationsPanel onClose={() => setShowNotifs(false)} />
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="px-3 sm:px-4 py-4 max-w-7xl mx-auto w-full box-border">
        <div className="glass rounded-xl p-3 sm:p-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2.5 sm:gap-3">
            <LocationAutocomplete className="input-field text-[13px] sm:text-sm w-full !bg-white/50 !border-slate-200/60 focus:!bg-white transition-all" placeholder="From..." value={searchForm.from}
              onChange={val => setSearchForm(p => ({ ...p, from: val }))} />
            <LocationAutocomplete className="input-field text-[13px] sm:text-sm w-full !bg-white/50 !border-slate-200/60 focus:!bg-white transition-all" placeholder="To..." value={searchForm.to}
              onChange={val => setSearchForm(p => ({ ...p, to: val }))} />
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
        <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 z-[1000] shadow-[0_-8px_30px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-[64px]">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'transport', label: 'Flights', icon: Plane },
            { id: 'hotels', label: 'Hotels', icon: Hotel },
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

