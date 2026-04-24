'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTripStore, type HotelOption, type TransportOption, type TripRecord } from '@/store/tripStore'
import { useSocket } from '@/hooks/useSocket'
import { tripAPI } from '@/lib/api'
import { affiliateLinks, formatCurrency, formatDate, getDaysBetween } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { SYMBOLS, formatPrice, ALL_CURRENCIES } from '@/lib/currency'
import toast from 'react-hot-toast'

// Sub-components
import TransportCard from '@/components/transport/TransportCard'
import HotelCard from '@/components/hotel/HotelCard'
import ItineraryView from '@/components/itinerary/ItineraryView'
import WeatherWidget from '@/components/weather/WeatherWidget'
import NotificationsPanel from '@/components/notifications/NotificationsPanel'
import ExploreSection from '@/components/explore/ExploreSection'
import MapView from '@/components/map/MapView'
import BookingStatus from '@/components/booking/BookingStatus'
import ReturnBookingTab from '@/components/booking/ReturnBookingTab'
import FeedbackModal from '@/components/feedback/FeedbackModal'
import TripHistoryTab from '@/components/history/TripHistoryTab'
import TripActions from '@/components/actions/TripActions'
import LocationAutocomplete from '@/components/ui/LocationAutocomplete'
import BudgetOptimizerTab from '@/components/optimizer/BudgetOptimizerTab'

const TABS = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'transport', label: 'Transport', icon: '✈️' },
  { id: 'hotels', label: 'Hotels', icon: '🏨' },
  { id: 'itinerary', label: 'Itinerary', icon: '📅' },
  { id: 'optimizer', label: 'Optimizer', icon: '💰' },
  { id: 'return', label: 'Return', icon: '🔄' },
  { id: 'explore', label: 'Explore', icon: '🌍' },
  { id: 'map', label: 'Map', icon: '🗺️' },
  { id: 'bookings', label: 'Bookings', icon: '📋' },
  { id: 'history', label: 'History', icon: '📁' },
]

export default function PlanPage() {
  const router = useRouter()
  const { emit } = useSocket()
  const {
    userProfile, tripContext, transport, hotels, itinerary,
    weather, notifications, bookingStatus, loading, isConnected,
    tripStatus, feedbackStatus, tripHistory,
    setTrip, setProfile, setTransport, setHotels, setItinerary,
    setWeather, setLoading, setError, addNotification,
    completeTrip, startNewTrip, setItinerary: restoreItinerary,
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
        // Auto search if destination set
        if (ctx.from && ctx.to) {
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

        <div className="flex items-center gap-3">
          {/* Download + Share */}
          <TripActions />

          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors"
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <span className="text-lg">🔔</span>
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>

          {/* Currency selector */}
          <select
            value={currency}
            onChange={e => updateCurrency(e.target.value as any)}
            className="glass border border-[var(--border)] rounded-lg text-xs px-2 py-1.5 text-[var(--text-primary)] font-mono cursor-pointer hidden sm:block"
          >
            {ALL_CURRENCIES.map(c => (
              <option key={c} value={c}>{SYMBOLS[c]} {c}</option>
            ))}
          </select>

          {tripStatus === 'planning' || tripStatus === 'active' ? (
            <button
              onClick={() => { completeTrip(); setShowFeedback(true) }}
              disabled={itinerary.length === 0}
              className="btn-outline py-2 px-3 text-xs border-green-500/50 text-green-400 hover:bg-green-500/10 disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block"
            >
              ✅ Complete
            </button>
          ) : (
            <button
              onClick={() => { startNewTrip(); setActiveTab('overview') }}
              className="btn-outline py-2 px-3 text-xs border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10 hidden sm:block"
            >
              ➕ New Trip
            </button>
          )}

          {/* User avatar / login */}
          {isLoggedIn && user ? (
            <div className="flex items-center gap-2">
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
                ↩
              </button>
            </div>
          ) : (
            <button onClick={() => router.push('/auth')} className="btn-primary py-2 px-4 text-sm hidden sm:block">
              Sign In
            </button>
          )}

          <button
            onClick={() => runSearch()}
            className="btn-primary py-2 px-3 text-sm"
            disabled={loading || !searchForm.from || !searchForm.to}
          >
            {loading ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : '🔄'}
          </button>
          
          <button className="sm:hidden p-2 text-[var(--text-primary)] text-xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? '✖' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 top-[60px] bg-[var(--bg-base)] z-[9999] p-6 flex flex-col gap-6 animate-fade-in overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Currency</span>
            <select
              value={currency}
              onChange={e => updateCurrency(e.target.value as any)}
              className="glass border border-[var(--border)] rounded-lg text-xs px-2 py-1.5 text-[var(--text-primary)] font-mono cursor-pointer"
            >
              {ALL_CURRENCIES.map(c => (
                <option key={c} value={c}>{SYMBOLS[c]} {c}</option>
              ))}
            </select>
          </div>
          
          {tripStatus === 'planning' || tripStatus === 'active' ? (
            <button
              onClick={() => { completeTrip(); setShowFeedback(true); setMobileMenuOpen(false); }}
              disabled={itinerary.length === 0}
              className="btn-outline w-full py-3 text-sm border-green-500/50 text-green-400"
            >
              ✅ Complete Trip
            </button>
          ) : (
            <button
              onClick={() => { startNewTrip(); setActiveTab('overview'); setMobileMenuOpen(false); }}
              className="btn-outline w-full py-3 text-sm border-[var(--primary)] text-[var(--primary)]"
            >
              ➕ New Trip
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
      <div className="px-4 py-4 max-w-7xl mx-auto">
        <div className="glass rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
            <LocationAutocomplete className="input-field text-sm w-full" placeholder="From..." value={searchForm.from}
              onChange={val => setSearchForm(p => ({ ...p, from: val }))} />
            <LocationAutocomplete className="input-field text-sm w-full" placeholder="To..." value={searchForm.to}
              onChange={val => setSearchForm(p => ({ ...p, to: val }))} />
            <input className="input-field text-sm w-full" type="date" value={searchForm.startDate}
              onChange={e => setSearchForm(p => ({ ...p, startDate: e.target.value }))} />
            <input className="input-field text-sm w-full" type="date" value={searchForm.endDate}
              onChange={e => setSearchForm(p => ({ ...p, endDate: e.target.value }))} />
            <input className="input-field text-sm w-full" placeholder={`Budget ${SYMBOLS[currency] || '$'}`} type="number" value={searchForm.budget}
              onChange={e => setSearchForm(p => ({ ...p, budget: e.target.value }))} />
            <select className="input-field text-sm w-full bg-[var(--bg-card)]" value={searchForm.travelers}
              onChange={e => setSearchForm(p => ({ ...p, travelers: e.target.value }))}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} {n===1?'Person':'People'}</option>)}
            </select>
            <button
              onClick={() => runSearch()}
              className="btn-primary text-sm py-2"
              disabled={loading}
            >
              {loading ? '...' : '🔍 Search'}
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
      <div className="px-4 max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
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
              {t.icon} {t.label}
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
      <main className="px-4 py-6 max-w-7xl mx-auto animate-fade-in">
        {activeTab === 'overview' && (
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
        )}
        {activeTab === 'transport' && <TransportTab transport={transport} loading={loading} tripContext={tripContext} searchForm={searchForm} />}
        {activeTab === 'hotels' && <HotelsTab hotels={hotels} loading={loading} tripContext={tripContext} searchForm={searchForm} />}
        {activeTab === 'itinerary' && <ItineraryView itinerary={itinerary} loading={loading} />}
        {activeTab === 'optimizer' && <BudgetOptimizerTab />}
        {activeTab === 'return' && <ReturnBookingTab tripContext={tripContext} />}
        {activeTab === 'explore' && <ExploreSection destination={tripContext.destination} />}
        {activeTab === 'map' && <MapView itinerary={itinerary} />}
        {activeTab === 'bookings' && <BookingStatus />}
        {activeTab === 'history' && (
          <TripHistoryTab
            onPlanSimilar={(record) => {
              setSearchForm({ from: record.startLocation, to: record.destination, startDate: record.dates.start, endDate: record.dates.end, budget: String(record.budget), travelers: String(record.members), style: record.style })
              startNewTrip()
              setActiveTab('overview')
              toast.success(`Planning a similar trip to ${record.destination}!`)
            }}
            onReopenItinerary={(record) => {
              restoreItinerary(record.itinerary)
              setActiveTab('itinerary')
              toast.success('Itinerary restored!')
            }}
          />
        )}
      </main>

      {/* FEEDBACK MODAL */}
      {showFeedback && feedbackStatus === 'pending' && (
        <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}
    </div>
  )
}

// Overview Tab
function OverviewTab({ transport, hotels, weather, itinerary, bookingStatus, destination, loading, onTabChange, tripStatus, tripHistory, onCompleteTrip, onNewTrip }: any) {
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const STEPS = [
    { label: 'Search', done: transport.length > 0 || hotels.length > 0 },
    { label: 'Flight', done: bookingStatus.flightStatus === 'CONFIRMED' },
    { label: 'Hotel', done: bookingStatus.hotelStatus === 'CONFIRMED' },
    { label: 'Return', done: bookingStatus.returnStatus === 'CONFIRMED' },
    { label: 'Itinerary', done: itinerary.length > 0 },
  ]
  const progress = Math.round((STEPS.filter(s => s.done).length / STEPS.length) * 100)

  return (
    <div className="space-y-6">
      {/* Trip Progress Tracker */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-[var(--text-primary)]">
            {tripStatus === 'completed' ? '✅ Trip Completed' : `🗺️ Trip Progress — ${progress}%`}
          </h3>
          <div className="flex items-center gap-2">
            {tripStatus !== 'completed' ? (
              <button onClick={onCompleteTrip} disabled={itinerary.length === 0}
                className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                ✅ Complete Trip
              </button>
            ) : (
              <button onClick={onNewTrip}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 hover:bg-[var(--primary)]/20 transition-all">
                ✈️ Start New Trip
              </button>
            )}
          </div>
        </div>
        <div className="progress-bar mb-3">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s.done ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'}`}>
                {s.done ? '✓' : i + 1}
              </div>
              <span className={`text-[0.6rem] ${s.done ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'View Transport', icon: '✈️', tab: 'transport', count: transport.length, color: 'text-blue-400' },
          { label: 'Return Flight', icon: '🔄', tab: 'return', count: bookingStatus.returnStatus === 'CONFIRMED' ? 1 : 0, color: 'text-[var(--primary)]' },
          { label: 'Trip History', icon: '📁', tab: 'history', count: tripHistory?.length || 0, color: 'text-purple-400' },
        ].map(a => (
          <button key={a.tab} onClick={() => onTabChange(a.tab)}
            className="card p-4 text-center hover:border-[var(--border-bright)] transition-all">
            <div className="text-2xl mb-1">{a.icon}</div>
            <div className={`text-lg font-bold font-mono ${a.color}`}>{a.count}</div>
            <div className="text-[0.65rem] text-[var(--text-muted)] mt-0.5">{a.label}</div>
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Best Flight', value: transport[0] ? formatPrice(transport[0].price, currency) : '--', icon: '✈️', color: 'text-blue-400' },
          { label: 'Best Hotel', value: hotels[0] ? `${formatPrice(hotels[0].price, currency)}/night` : '--', icon: '🏨', color: 'text-green-400' },
          { label: 'Weather', value: weather ? `${weather.temperature}°C` : '--', icon: '🌤️', color: 'text-yellow-400' },
          { label: 'Days Planned', value: itinerary.length || 0, icon: '📅', color: 'text-purple-400' },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[var(--text-primary)]">Top Flights</h3>
            <button onClick={() => onTabChange('transport')} className="text-xs text-[var(--primary)] hover:underline">View all →</button>
          </div>
          {loading ? <SkeletonCards /> : transport.slice(0, 2).map((t: TransportOption) => <TransportCard key={t.id} item={t} />)}

          <div className="flex items-center justify-between mt-4">
            <h3 className="font-bold text-[var(--text-primary)]">Top Hotels</h3>
            <button onClick={() => onTabChange('hotels')} className="text-xs text-[var(--primary)] hover:underline">View all →</button>
          </div>
          {loading ? <SkeletonCards /> : hotels.slice(0, 2).map((h: HotelOption) => <HotelCard key={h.id} item={h} />)}

          {/* Return journey visibility */}
          <div className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">Return Journey</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {bookingStatus.returnStatus === 'CONFIRMED'
                    ? `✅ ${bookingStatus.selectedReturn?.name}`
                    : bookingStatus.returnStatus === 'SELECTED'
                    ? '⏳ Selected — confirm to book'
                    : 'Not yet booked'}
                </p>
              </div>
            </div>
            <button onClick={() => onTabChange('return')}
              className={`text-xs py-1.5 px-3 rounded-lg transition-all ${bookingStatus.returnStatus === 'CONFIRMED' ? 'badge-green' : 'btn-outline'}`}>
              {bookingStatus.returnStatus === 'CONFIRMED' ? 'View' : 'Book Return →'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {weather && <WeatherWidget weather={weather} destination={destination} />}

          {/* Quick itinerary preview */}
          {itinerary.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[var(--text-primary)]">📅 Day 1 Preview</h3>
                <button onClick={() => onTabChange('itinerary')} className="text-xs text-[var(--primary)]">Full plan →</button>
              </div>
              <div className="space-y-2">
                {itinerary[0]?.places.map((p: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="font-mono text-xs text-[var(--text-muted)] mt-0.5 w-12">{p.time}</span>
                    <div>
                      <div className="font-medium text-[var(--text-primary)] text-xs">{p.name}</div>
                      <div className="text-[var(--text-muted)] text-xs">{p.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking tracker */}
          <div className="card p-4">
            <h3 className="font-bold text-sm text-[var(--text-primary)] mb-3">📋 Booking Status</h3>
            {[
              { label: 'Flight', status: bookingStatus.flightStatus },
              { label: 'Hotel', status: bookingStatus.hotelStatus },
              { label: 'Return', status: bookingStatus.returnStatus },
            ].map(b => (
              <div key={b.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-sm text-[var(--text-secondary)]">{b.label}</span>
                <span className={`badge text-[0.7rem] ${b.status === 'CONFIRMED' ? 'badge-green' : b.status === 'PENDING' ? 'badge-amber' : 'badge-red'}`}>{b.status}</span>
              </div>
            ))}
          </div>

          {/* Recent trip history */}
          {tripHistory?.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[var(--text-primary)]">📁 Past Trips</h3>
                <button onClick={() => onTabChange('history')} className="text-xs text-[var(--primary)]">View all →</button>
              </div>
              <div className="space-y-2">
                {tripHistory.slice(0, 3).map((t: any) => (
                  <div key={t.tripId} className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border)] last:border-0">
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{t.destination}</p>
                      <p className="text-[var(--text-muted)]">{t.dates.start || 'No date'}</p>
                    </div>
                    {t.rating && <span className="text-yellow-400">{'★'.repeat(t.rating)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Transport Tab
function TransportTab({ transport, loading, tripContext, searchForm }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title text-xl">✈️ Transport Options</h2>
        <div className="flex items-center gap-2">
          <span className="live-dot"></span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Live prices</span>
        </div>
      </div>

      {/* Bus option */}
      <div className="glass rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">🚌 Also check buses</p>
          <p className="text-xs text-[var(--text-muted)]">Affordable intercity travel options</p>
        </div>
        <a
          href={affiliateLinks.bus(searchForm.from || '', searchForm.to || '', searchForm.startDate || '')}
          target="_blank" rel="noopener noreferrer"
          className="btn-outline text-xs py-1.5 px-3"
        >
          Search Buses →
        </a>
      </div>

      {loading ? <SkeletonCards count={3} /> : (
        transport.length > 0 ? (
          <div className="space-y-4">
            {transport.map((t: any) => <TransportCard key={t.id} item={t} showDetail />)}
          </div>
        ) : (
          <EmptyState icon="✈️" title="No flights found" desc="Try adjusting your search criteria" />
        )
      )}
    </div>
  )
}

// Hotels Tab
function HotelsTab({ hotels, loading, tripContext, searchForm }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title text-xl">🏨 Hotel Options</h2>
        <div className="flex items-center gap-2">
          <span className="live-dot"></span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Live availability</span>
        </div>
      </div>

      {/* Car rental */}
      <div className="glass rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">🚗 Need a rental car?</p>
          <p className="text-xs text-[var(--text-muted)]">Best rates from top providers</p>
        </div>
        <a href={affiliateLinks.car(tripContext?.destination || '')} target="_blank" rel="noopener noreferrer"
          className="btn-outline text-xs py-1.5 px-3">
          Find Cars →
        </a>
      </div>

      {loading ? <SkeletonCards count={3} /> : (
        hotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hotels.map((h: any) => <HotelCard key={h.id} item={h} showDetail />)}
          </div>
        ) : (
          <EmptyState icon="🏨" title="No hotels found" desc="Try adjusting your dates or budget" />
        )
      )}
    </div>
  )
}

// Utility components
function SkeletonCards({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="shimmer h-4 w-1/3 rounded"></div>
          <div className="shimmer h-3 w-2/3 rounded"></div>
          <div className="shimmer h-3 w-1/2 rounded"></div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="card p-12 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-bold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-[var(--text-muted)] text-sm">{desc}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-grid flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">🌍</div>
        <p className="text-[var(--primary)] font-mono">Initializing TripSage...</p>
      </div>
    </div>
  )
}
