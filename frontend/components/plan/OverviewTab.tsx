'use client'

import React, { memo, lazy, Suspense } from 'react'
import { Plane, Hotel, Sun, Calendar, History, RefreshCw, Check, ClipboardList } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import TransportCard from '../transport/TransportCard'
import HotelCard from '../hotel/HotelCard'

const WeatherWidget = lazy(() => import('../weather/WeatherWidget'))

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
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="shimmer h-4 w-1/3" />
            <div className="shimmer h-6 w-16" />
          </div>
          <div className="flex items-center gap-4">
            <div className="shimmer h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="shimmer h-4 w-full" />
              <div className="shimmer h-3 w-2/3" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="shimmer h-6 w-20" />
            <div className="shimmer h-6 w-20" />
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
          { label: 'View Transport', icon: Plane, tab: 'transport', count: transport.length, color: 'text-blue-400' },
          { label: 'Return Flight', icon: RefreshCw, tab: 'return', count: bookingStatus.returnStatus === 'CONFIRMED' ? 1 : 0, color: 'text-[var(--primary)]' },
          { label: 'Trip History', icon: History, tab: 'history', count: tripHistory?.length || 0, color: 'text-purple-400' },
        ].map(a => (
          <button key={a.tab} onClick={() => onTabChange(a.tab)}
            className="card p-4 text-center hover:border-[var(--border-bright)] transition-all group">
            <div className="flex justify-center mb-1">
              <a.icon size={32} className={`${a.color} group-hover:text-[var(--accent)] transition-colors`} />
            </div>
            <div className="flex justify-center">
              {loading || (a.count === 0 && a.tab !== 'history') ? (
                <div className="shimmer h-6 w-12" />
              ) : (
                <div className={`text-lg font-bold font-mono ${a.color}`}>{a.count}</div>
              )}
            </div>
            <div className="text-[0.65rem] text-[var(--text-muted)] mt-0.5">{a.label}</div>
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Best Flight', value: transport[0] ? formatPrice(transport[0].price, currency) : '--', icon: Plane, color: 'text-blue-400' },
          { label: 'Best Hotel', value: hotels[0] ? `${formatPrice(hotels[0].price, currency)}/night` : '--', icon: Hotel, color: 'text-green-400' },
          { label: 'Weather', value: weather ? `${weather.temperature}°C` : '--', icon: Sun, color: 'text-yellow-400' },
          { label: 'Days Planned', value: itinerary.length || 0, icon: Calendar, color: 'text-purple-400' },
        ].map((s, i) => (
          <div key={i} className="card p-4 group">
            <div className="mb-2">
              <s.icon size={32} className={`${s.color} group-hover:text-[var(--accent)] transition-colors`} />
            </div>
            {loading || s.value === '--' || s.value === 0 ? (
              <div className="shimmer h-7 w-24 mb-1" />
            ) : (
              <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
            )}
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
          {loading ? <SkeletonCards /> : transport.slice(0, 2).map((t: any) => <TransportCard key={t.id} item={t} />)}

          <div className="flex items-center justify-between mt-4">
            <h3 className="font-bold text-[var(--text-primary)]">Top Hotels</h3>
            <button onClick={() => onTabChange('hotels')} className="text-xs text-[var(--primary)] hover:underline">View all →</button>
          </div>
          {loading ? <SkeletonCards /> : hotels.slice(0, 2).map((h: any) => <HotelCard key={h.id} item={h} />)}

          {/* Return journey visibility */}
          <div className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw size={32} className="text-[var(--primary)]" />
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
          {weather && (
            <Suspense fallback={<div className="card p-4 h-48 animate-pulse" />}>
              <WeatherWidget weather={weather} destination={destination} />
            </Suspense>
          )}

          {/* Quick itinerary preview */}
          {itinerary.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2"><Calendar size={16} /> Day 1 Preview</h3>
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
            <h3 className="font-bold text-sm text-[var(--text-primary)] mb-3 flex items-center gap-2"><ClipboardList size={16} /> Booking Status</h3>
            {[
              { label: 'Flight', status: bookingStatus.flightStatus },
              { label: 'Hotel', status: bookingStatus.hotelStatus },
              { label: 'Return', status: bookingStatus.returnStatus },
            ].map((b: any) => (
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
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2"><History size={16} /> Past Trips</h3>
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

export default memo(OverviewTab)
