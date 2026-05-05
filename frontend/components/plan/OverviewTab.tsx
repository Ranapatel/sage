'use client'

import React, { memo } from 'react'
import { Plane, Hotel, Sun, Calendar, History, RefreshCw, Check, ClipboardList, MapPin, Bus } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import TransportCard from '../transport/TransportCard'
import HotelCard from '../hotel/HotelCard'
import WeatherWidget from '../weather/WeatherWidget'
import TripActions from '../actions/TripActions'

interface Props {
  transport: any[]
  hotels: any[]
  weather: any
  itinerary: any[]
  bookingStatus: any
  destination: string
  loading: boolean
  onTabChange: (tab: string) => void
  tripStatus: string
  tripHistory: any[]
  onCompleteTrip: () => void
  onNewTrip: () => void
}

function SkeletonCards({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="shimmer h-4 w-1/3 rounded" />
            <div className="shimmer h-6 w-16 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="shimmer h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="shimmer h-3 w-full rounded" />
              <div className="shimmer h-3 w-2/3 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function OverviewTab({
  transport, hotels, weather, itinerary, bookingStatus,
  destination, loading, onTabChange, tripStatus,
  tripHistory, onCompleteTrip, onNewTrip
}: Props) {
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'

  const STEPS = [
    { label: 'Search', done: transport.length > 0 || hotels.length > 0 },
    { label: 'Flight', done: bookingStatus.flightStatus === 'CONFIRMED' },
    { label: 'Hotel', done: bookingStatus.hotelStatus === 'CONFIRMED' },
    { label: 'Return', done: bookingStatus.returnStatus === 'CONFIRMED' },
    { label: 'Plan', done: itinerary.length > 0 },
  ]
  const progress = Math.round((STEPS.filter(s => s.done).length / STEPS.length) * 100)
  const hasData = transport.length > 0 || hotels.length > 0 || itinerary.length > 0

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Trip Progress ─────────────────────────────────────────────────── */}
      <div className="card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="font-bold text-sm text-[var(--text-primary)] leading-tight">
            {tripStatus === 'completed' ? '✅ Trip Completed' : `🗺️ Progress — ${progress}%`}
          </h3>
          <div className="flex-shrink-0">
            {tripStatus !== 'completed' ? (
              <button
                onClick={onCompleteTrip}
                disabled={itinerary.length === 0}
                className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
              >
                ✅ Complete
              </button>
            ) : (
              <button
                onClick={onNewTrip}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 hover:bg-[var(--primary)]/20 transition-all whitespace-nowrap"
              >
                ✈️ New Trip
              </button>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="progress-bar mb-3">
          <div className="progress-fill transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        {/* Steps */}
        <div className="flex justify-between gap-1">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s.done ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'
              }`}>
                {s.done ? '✓' : i + 1}
              </div>
              <span className={`text-[0.55rem] sm:text-[0.6rem] text-center leading-tight ${s.done ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Best Flight', value: transport[0] ? formatPrice(transport[0].price, currency) : '--', icon: Plane, color: 'text-blue-400', tab: 'transport' },
          { label: 'Best Hotel', value: hotels[0] ? `${formatPrice(hotels[0].price, currency)}/n` : '--', icon: Hotel, color: 'text-green-400', tab: 'hotels' },
          { label: 'Weather', value: weather ? `${weather.temperature}°C` : '--', icon: Sun, color: 'text-yellow-400', tab: null },
          { label: 'Days Planned', value: String(itinerary.length || 0), icon: Calendar, color: 'text-purple-400', tab: 'itinerary' },
        ].map((s, i) => (
          <div
            key={i}
            onClick={() => s.tab && onTabChange(s.tab)}
            className={`card p-3 sm:p-4 ${s.tab ? 'cursor-pointer hover:border-[var(--border-bright)] active:scale-95' : ''} transition-all duration-200`}
          >
            <s.icon size={22} className={`${s.color} mb-2`} />
            {loading && s.value === '--' ? (
              <div className="shimmer h-6 w-16 rounded mb-1" />
            ) : (
              <div className={`text-base sm:text-xl font-bold font-mono truncate ${s.color}`}>{s.value}</div>
            )}
            <div className="text-[0.6rem] sm:text-xs text-[var(--text-muted)] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Quick Nav Chips (mobile-friendly) ─────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: 'Flights', icon: Plane, tab: 'transport', count: transport.length, color: 'text-blue-400' },
          { label: 'Return', icon: RefreshCw, tab: 'return', count: bookingStatus.returnStatus === 'CONFIRMED' ? 1 : 0, color: 'text-[var(--primary)]' },
          { label: 'History', icon: History, tab: 'history', count: tripHistory?.length || 0, color: 'text-purple-400' },
        ].map(a => (
          <button
            key={a.tab}
            onClick={() => onTabChange(a.tab)}
            className="card p-3 sm:p-4 text-center hover:border-[var(--border-bright)] active:scale-95 transition-all group"
          >
            <div className="flex justify-center mb-1">
              <a.icon size={26} className={`${a.color} group-hover:text-[var(--accent)] transition-colors`} />
            </div>
            <div className={`text-base sm:text-lg font-bold font-mono ${a.color}`}>{a.count}</div>
            <div className="text-[0.6rem] sm:text-[0.65rem] text-[var(--text-muted)] mt-0.5 leading-tight">{a.label}</div>
          </button>
        ))}
      </div>

      {/* ── No data placeholder ────────────────────────────────────────────── */}
      {!hasData && !loading && (
        <div className="card p-8 sm:p-12 text-center flex flex-col items-center gap-3">
          <div className="text-5xl sm:text-6xl">✈️</div>
          <h3 className="font-bold text-base sm:text-lg text-[var(--text-primary)]">Ready to explore?</h3>
          <p className="text-[var(--text-muted)] text-sm max-w-xs">
            Enter your origin, destination and dates above to generate a personalised trip plan.
          </p>
        </div>
      )}

      {/* ── Main content + sidebar grid ───────────────────────────────────── */}
      {(hasData || loading) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Left / main */}
          <div className="lg:col-span-2 space-y-4">

            {/* Top Flights */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)] flex items-center gap-2">
                  <Plane size={16} className="text-blue-400" /> Top Flights
                </h3>
                {transport.length > 0 && (
                  <button onClick={() => onTabChange('transport')} className="text-xs text-[var(--primary)] hover:underline">
                    View all ({transport.length}) →
                  </button>
                )}
              </div>
              {loading ? <SkeletonCards /> : transport.slice(0, 2).map((t: any) => <TransportCard key={t.id} item={t} />)}
              {!loading && transport.length === 0 && (
                <div className="card p-5 text-center text-[var(--text-muted)] text-sm">No flights yet — search above</div>
              )}
            </div>

            {/* Top Hotels */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)] flex items-center gap-2">
                  <Hotel size={16} className="text-green-400" /> Top Hotels
                </h3>
                {hotels.length > 0 && (
                  <button onClick={() => onTabChange('hotels')} className="text-xs text-[var(--primary)] hover:underline">
                    View all ({hotels.length}) →
                  </button>
                )}
              </div>
              {loading ? <SkeletonCards /> : hotels.slice(0, 2).map((h: any) => <HotelCard key={h.id} item={h} />)}
              {!loading && hotels.length === 0 && (
                <div className="card p-5 text-center text-[var(--text-muted)] text-sm">No hotels yet — search above</div>
              )}
            </div>

            {/* Return Journey card */}
            <div className="card p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <RefreshCw size={28} className="text-[var(--primary)] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[var(--text-primary)]">Return Journey</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {bookingStatus.returnStatus === 'CONFIRMED'
                      ? `✅ ${bookingStatus.selectedReturn?.name}`
                      : bookingStatus.returnStatus === 'SELECTED'
                      ? '⏳ Selected — confirm to book'
                      : 'Not yet booked'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onTabChange('return')}
                className={`text-xs py-1.5 px-3 rounded-lg transition-all flex-shrink-0 ${
                  bookingStatus.returnStatus === 'CONFIRMED' ? 'badge-green' : 'btn-outline'
                }`}
              >
                {bookingStatus.returnStatus === 'CONFIRMED' ? 'View' : 'Book →'}
              </button>
            </div>
          </div>

          {/* Right / sidebar */}
          <div className="space-y-4">
            {/* Weather */}
            {weather && <WeatherWidget weather={weather} destination={destination} />}

            {/* Day 1 preview */}
            {itinerary.length > 0 && (
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                    <Calendar size={15} /> Day 1 Preview
                  </h3>
                  <button onClick={() => onTabChange('itinerary')} className="text-xs text-[var(--primary)] hover:underline">
                    Full plan →
                  </button>
                </div>
                <div className="space-y-2">
                  {itinerary[0]?.places.slice(0, 5).map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-[var(--text-muted)] w-10 flex-shrink-0">{p.time}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[var(--text-primary)] truncate">{p.name}</div>
                        <div className="text-[var(--text-muted)] text-[0.65rem]">{p.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking tracker */}
            <div className="card p-4">
              <h3 className="font-bold text-sm text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <ClipboardList size={15} /> Booking Status
              </h3>
              {[
                { label: 'Flight', status: bookingStatus.flightStatus },
                { label: 'Hotel', status: bookingStatus.hotelStatus },
                { label: 'Return', status: bookingStatus.returnStatus },
              ].map((b: any) => (
                <div key={b.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-sm text-[var(--text-secondary)]">{b.label}</span>
                  <span className={`badge text-[0.65rem] ${
                    b.status === 'CONFIRMED' ? 'badge-green' : b.status === 'PENDING' ? 'badge-amber' : 'badge-red'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Past trips */}
            {(tripHistory?.length ?? 0) > 0 && (
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                    <History size={15} /> Past Trips
                  </h3>
                  <button onClick={() => onTabChange('history')} className="text-xs text-[var(--primary)] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="space-y-2">
                  {tripHistory.slice(0, 3).map((t: any) => (
                    <div key={t.tripId} className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border)] last:border-0">
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--text-primary)] truncate">{t.destination}</p>
                        <p className="text-[var(--text-muted)]">{t.dates?.start || 'No date'}</p>
                      </div>
                      {t.rating && <span className="text-yellow-400 flex-shrink-0">{'★'.repeat(t.rating)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export */}
            <div className="card p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--text-primary)]">Export Itinerary</p>
                <p className="text-xs text-[var(--text-muted)]">Download or share your plan</p>
              </div>
              <TripActions />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(OverviewTab)
