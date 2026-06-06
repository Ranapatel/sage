'use client'

import React, { memo, lazy, Suspense } from 'react'
import { 
  Truck, PlaneLanding, History, PlaneTakeoff, Building2, 
  CloudSun, CalendarDays, Check, ClipboardList, Star, Calendar, Plane
} from 'lucide-react'
import { formatPrice, convertPrice, SYMBOLS } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import { useTripStore } from '@/store/tripStore'
import { getDaysBetween } from '@/lib/utils'
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
  const { userProfile, tripContext } = useTripStore()
  
  const travelers = userProfile?.members || 2
  const budget = userProfile?.budget || 2000

  // Calculate days & nights
  let days = itinerary.length
  if (days === 0 && tripContext.startDate && tripContext.endDate) {
    days = getDaysBetween(tripContext.startDate, tripContext.endDate)
  }
  days = Math.max(1, days || 3)
  const nights = Math.max(1, days - 1)

  // Selected Flight cost (per person * travelers)
  const selectedFlight = bookingStatus.selectedFlight
  const selectedReturn = bookingStatus.selectedReturn
  const flightCostINR = ((selectedFlight?.price || 0) + (selectedReturn?.price || 0)) * travelers

  // Selected Hotel cost (price per night * nights)
  const selectedHotel = bookingStatus.selectedHotel
  const hotelCostINR = (selectedHotel?.price || 0) * nights

  // Activities cost (sum of estimatedCost in itinerary)
  const activitiesCostINR = itinerary.reduce((sum, day) => {
    const daySum = day.places?.reduce((pSum: number, place: any) => pSum + (place.estimatedCost || 0), 0) || 0
    return sum + daySum
  }, 0)

  // Convert to target currency
  const flightCost = convertPrice(flightCostINR, currency)
  const hotelCost = convertPrice(hotelCostINR, currency)
  const activitiesCost = convertPrice(activitiesCostINR, currency)
  
  const totalSelectedCost = flightCost + hotelCost + activitiesCost
  const remainingBudget = budget - totalSelectedCost
  const isOverBudget = totalSelectedCost > budget

  // Custom formatting for target currency values
  const formatTargetPrice = (amount: number) => {
    const symbol = SYMBOLS[currency] ?? currency
    const locale = currency === 'INR' ? 'en-IN' : 'en-US'
    return `${symbol}${Math.round(amount).toLocaleString(locale)}`
  }
  
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
            {tripStatus === 'completed' ? 'Trip Completed' : `Trip Progress — ${progress}%`}
          </h3>
          <div className="flex items-center gap-2">
            {tripStatus !== 'completed' ? (
              <button onClick={onCompleteTrip} disabled={itinerary.length === 0}
                className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5">
                <Check size={14} /> Complete Trip
              </button>
            ) : (
              <button onClick={onNewTrip}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 hover:bg-[var(--primary)]/20 transition-all flex items-center gap-1.5">
                <Plane size={14} /> Start New Trip
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
          { label: 'View Transport', icon: Truck, tab: 'transport', count: transport.length, color: 'text-blue-400' },
          { label: 'Return Flight', icon: PlaneLanding, tab: 'return', count: bookingStatus.returnStatus === 'CONFIRMED' ? 1 : 0, color: 'text-[var(--primary)]' },
          { label: 'Trip History', icon: History, tab: 'history', count: tripHistory?.length || 0, color: 'text-purple-400' },
        ].map(a => (
          <button key={a.tab} onClick={() => onTabChange(a.tab)}
            className="card p-4 text-center hover:border-[var(--border-bright)] transition-all group">
            <div className="flex justify-center mb-2">
              <a.icon size={20} className={`${a.color} group-hover:text-[var(--accent)] transition-all duration-300 hover:brightness-125`} />
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
          { label: 'Best Flight', value: transport[0] ? formatPrice(transport[0].price, currency) : '--', icon: PlaneTakeoff, color: 'text-blue-400' },
          { label: 'Best Hotel', value: hotels[0] ? `${formatPrice(hotels[0].price, currency)}/night` : '--', icon: Building2, color: 'text-green-400' },
          { label: 'Weather', value: weather ? `${weather.temperature}°C` : '--', icon: CloudSun, color: 'text-yellow-400' },
          { label: 'Days Planned', value: itinerary.length || 0, icon: CalendarDays, color: 'text-purple-400' },
        ].map((s, i) => (
          <div key={i} className="card p-4 group">
            <div className="mb-2">
              <s.icon size={20} className={`${s.color} group-hover:text-[var(--accent)] transition-all duration-300 hover:brightness-125`} />
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
              <PlaneLanding size={32} className="text-[var(--primary)]" />
              <div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">Return Journey</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {bookingStatus.returnStatus === 'CONFIRMED'
                    ? `Confirmed: ${bookingStatus.selectedReturn?.name}`
                    : bookingStatus.returnStatus === 'SELECTED'
                    ? 'Selected — confirm to book'
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

          {/* Budget Tracker */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                <ClipboardList size={16} className="text-[var(--primary)]" />
                Trip Budget Tracker
              </h3>
              <span className="text-xs font-bold font-mono text-[var(--text-muted)]">
                Budget: {formatTargetPrice(budget)}
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="space-y-1">
              <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-slate-800 border border-slate-700/50">
                {budget > 0 && (
                  <>
                    <div 
                      className="bg-blue-500 h-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (flightCost / budget) * 100)}%` }}
                      title={`Flights: ${formatTargetPrice(flightCost)}`}
                    />
                    <div 
                      className="bg-green-500 h-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (hotelCost / budget) * 100)}%` }}
                      title={`Hotels: ${formatTargetPrice(hotelCost)}`}
                    />
                    <div 
                      className="bg-purple-500 h-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (activitiesCost / budget) * 100)}%` }}
                      title={`Activities: ${formatTargetPrice(activitiesCost)}`}
                    />
                  </>
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] px-0.5">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Flights</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Hotels</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Activities</span>
              </div>
            </div>

            {/* Detailed list */}
            <div className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center justify-between">
                <span>Flights Cost</span>
                <span className="font-bold font-mono text-[var(--text-primary)]">
                  {flightCost > 0 ? (
                    `${formatTargetPrice(flightCost)}`
                  ) : (
                    <span className="text-[var(--text-muted)] italic font-normal">None selected</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Hotels Cost</span>
                <span className="font-bold font-mono text-[var(--text-primary)]">
                  {hotelCost > 0 ? (
                    `${formatTargetPrice(hotelCost)}`
                  ) : (
                    <span className="text-[var(--text-muted)] italic font-normal">None selected</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Activities Cost</span>
                <span className="font-bold font-mono text-[var(--text-primary)]">
                  {activitiesCost > 0 ? (
                    `${formatTargetPrice(activitiesCost)}`
                  ) : (
                    <span className="text-[var(--text-muted)] italic font-normal">None planned</span>
                  )}
                </span>
              </div>
              <div className="h-px bg-[var(--border)] my-1" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-[var(--text-primary)]">Remaining Budget</span>
                <span className={`font-extrabold font-mono ${remainingBudget >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatTargetPrice(remainingBudget)}
                </span>
              </div>
            </div>

            {/* Warning Message */}
            {isOverBudget && (
              <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-[11px] flex gap-2">
                <span className="text-sm shrink-0">⚠️</span>
                <div>
                  <p className="font-bold leading-tight">Exceeds Budget</p>
                  <p className="mt-0.5 leading-relaxed">
                    Selected flights or hotels + activities exceed your budget limit by <strong>{formatTargetPrice(Math.abs(remainingBudget))}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

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
                      {t.rating && (
                        <div className="flex items-center gap-0.5 text-yellow-400 mt-1">
                          {Array.from({ length: t.rating }).map((_, idx) => (
                            <Star key={idx} size={10} fill="currentColor" stroke="none" />
                          ))}
                        </div>
                      )}
                    </div>
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
