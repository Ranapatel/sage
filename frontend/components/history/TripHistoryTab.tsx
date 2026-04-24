'use client'

import { useTripStore, type TripRecord } from '@/store/tripStore'
import { formatDate } from '@/lib/utils'
import { formatPrice } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

interface Props {
  onPlanSimilar?: (record: TripRecord) => void
  onReopenItinerary?: (record: TripRecord) => void
}

export default function TripHistoryTab({ onPlanSimilar, onReopenItinerary }: Props) {
  const { tripHistory } = useTripStore()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'

  if (tripHistory.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">No Trip History Yet</h3>
        <p className="text-[var(--text-muted)] text-sm">Complete your first trip to see it here.</p>
        <p className="text-[var(--text-muted)] text-xs mt-2">Past trips are stored locally on this device.</p>
      </div>
    )
  }

  const stars = (n?: number) => n ? '★'.repeat(n) + '☆'.repeat(5 - n) : '—'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title text-xl">📁 Trip History</h2>
        <span className="badge badge-green text-xs">{tripHistory.length} Trip{tripHistory.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-4">
        {tripHistory.map((trip) => (
          <div key={trip.tripId} className="card overflow-hidden">
            {/* Header strip */}
            <div className="h-2 w-full" style={{
              background: trip.status === 'completed'
                ? 'linear-gradient(90deg, var(--primary), var(--primary-light))'
                : 'linear-gradient(90deg, #ef4444, #b91c1c)',
            }} />

            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-[var(--text-primary)]">
                      {trip.startLocation || 'Home'} → {trip.destination}
                    </h3>
                    <span className={`badge text-[0.65rem] ${trip.status === 'completed' ? 'badge-green' : 'badge-red'}`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    {trip.dates.start && <span>📅 {formatDate(trip.dates.start)}{trip.dates.end ? ` → ${formatDate(trip.dates.end)}` : ''}</span>}
                    <span>👥 {trip.members} traveler{trip.members !== 1 ? 's' : ''}</span>
                    <span>💰 {formatPrice(trip.budget, currency)} budget</span>
                    <span>🎯 {trip.style}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {trip.rating ? (
                    <div>
                      <div className="text-yellow-400 text-sm">{stars(trip.rating)}</div>
                      <div className="text-xs text-[var(--text-muted)]">{trip.rating}/5</div>
                    </div>
                  ) : (
                    <span className="badge badge-amber text-[0.6rem]">No rating</span>
                  )}
                </div>
              </div>

              {/* Bookings summary */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Flight', value: trip.bookings.transport?.name, icon: '✈️', price: trip.bookings.transport?.price },
                  { label: 'Hotel', value: trip.bookings.hotel?.name, icon: '🏨', price: trip.bookings.hotel?.price },
                  { label: 'Return', value: trip.bookings.returnTransport?.name, icon: '🔄', price: trip.bookings.returnTransport?.price },
                ].map(b => (
                  <div key={b.label} className="glass rounded-lg p-3 text-center">
                    <div className="text-lg mb-1">{b.icon}</div>
                    <div className="text-[0.65rem] text-[var(--text-muted)] uppercase tracking-wider">{b.label}</div>
                    {b.value ? (
                      <>
                        <div className="text-xs font-semibold text-[var(--text-primary)] truncate mt-0.5">{b.value.split(' ')[0]}</div>
                        {b.price && <div className="text-xs font-mono text-[var(--primary)]">{formatPrice(b.price, currency)}</div>}
                      </>
                    ) : (
                      <div className="text-xs text-[var(--text-muted)]">Not booked</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Feedback preview */}
              {trip.feedback && (
                <div className="glass rounded-lg p-3 mb-4">
                  <p className="text-xs text-[var(--text-muted)] mb-1 font-mono">Your feedback</p>
                  <p className="text-sm text-[var(--text-secondary)] italic">"{trip.feedback}"</p>
                  {trip.experienceTags && trip.experienceTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {trip.experienceTags.map(tag => (
                        <span key={tag} className="badge badge-green text-[0.6rem]">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Itinerary preview */}
              {trip.itinerary.length > 0 && (
                <div className="glass rounded-lg p-3 mb-4">
                  <p className="text-xs text-[var(--text-muted)] mb-2 font-mono">{trip.itinerary.length}-day itinerary</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {trip.itinerary.slice(0, 5).map(day => (
                      <div key={day.day} className="flex-shrink-0 text-center">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center text-xs font-bold text-[var(--primary)]">
                          {day.day}
                        </div>
                        <div className="text-[0.55rem] text-[var(--text-muted)] mt-1">{day.places.length}p</div>
                      </div>
                    ))}
                    {trip.itinerary.length > 5 && (
                      <div className="flex-shrink-0 text-center">
                        <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center text-xs text-[var(--text-muted)]">
                          +{trip.itinerary.length - 5}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {trip.itinerary.length > 0 && (
                  <button
                    onClick={() => onReopenItinerary?.(trip)}
                    className="btn-outline text-xs py-2 px-4 flex-1"
                  >
                    📅 Reopen Itinerary
                  </button>
                )}
                <button
                  onClick={() => onPlanSimilar?.(trip)}
                  className="btn-primary text-xs py-2 px-4 flex-1"
                >
                  ✈️ Plan Similar Trip
                </button>
              </div>

              <p className="text-[0.6rem] text-[var(--text-muted)] text-right mt-2 font-mono">
                Saved {new Date(trip.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
