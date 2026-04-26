'use client'

import { useState } from 'react'
import { useTripStore, type TransportOption } from '@/store/tripStore'
import { affiliateLinks } from '@/lib/utils'
import { formatPrice } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import { trackEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'

interface Props {
  tripContext: any
}

function generateReturnOptions(from: string, to: string, endDate: string, budget: number): TransportOption[] {
  const base = Math.round(budget * 0.2)
  return [
    {
      id: 'rt1', type: 'flight',
      name: `IndiGo ${to.split(',')[0]} → ${from.split(',')[0]}`,
      price: base, rating: 4.3, duration: '5h 30m',
      departure: '07:00', arrival: '12:30',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80',
      bookingLink: affiliateLinks.flight(to, from, endDate.replace(/-/g, '') || ''),
      score: 0.84, liveStatus: 'On Time',
      offers: ['Best value return', 'Free check-in baggage'],
    },
    {
      id: 'rt2', type: 'flight',
      name: `Air Asia ${to.split(',')[0]} → ${from.split(',')[0]}`,
      price: Math.round(base * 0.85), rating: 3.9, duration: '6h 00m',
      departure: '14:00', arrival: '20:00',
      image: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&q=80',
      bookingLink: affiliateLinks.flight(to, from, endDate.replace(/-/g, '') || ''),
      score: 0.74, liveStatus: 'On Time',
      offers: ['Early bird discount'],
    },
    {
      id: 'rt3', type: 'flight',
      name: `Emirates ${to.split(',')[0]} → ${from.split(',')[0]}`,
      price: Math.round(base * 1.3), rating: 4.7, duration: '4h 45m',
      departure: '22:00', arrival: '02:45+1',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80',
      bookingLink: affiliateLinks.flight(to, from, endDate.replace(/-/g, '') || ''),
      score: 0.91, liveStatus: 'On Time',
      offers: ['Premium class upgrade available', 'Lounge access'],
    },
  ]
}

const STATUS_STEPS = ['INIT', 'SELECTED', 'PENDING', 'CONFIRMED']

export default function ReturnBookingTab({ tripContext }: Props) {
  const {
    returnTransport, setReturnTransport, bookingStatus,
    setBookingStatus, addNotification, userProfile
  } = useTripStore()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'

  const [confirming, setConfirming] = useState(false)
  const [generated, setGenerated] = useState(returnTransport.length > 0)

  const returnStep = STATUS_STEPS.indexOf(bookingStatus.returnStatus)

  const handleGenerate = () => {
    const opts = generateReturnOptions(
      tripContext.startLocation || 'Home',
      tripContext.destination || 'Destination',
      tripContext.endDate || '',
      userProfile.budget,
    )
    setReturnTransport(opts)
    setGenerated(true)
    addNotification({
      id: Date.now().toString(), type: 'info',
      title: '🔄 Return Options Ready',
      message: `${opts.length} return flights found for ${tripContext.endDate}`,
      timestamp: new Date().toISOString(), read: false,
    })
    toast.success(`Found ${opts.length} return flight options!`)
  }

  const handleSelect = (item: TransportOption) => {
    setBookingStatus({ returnStatus: 'SELECTED', selectedReturn: item })
    addNotification({
      id: Date.now().toString(), type: 'info',
      title: '✈️ Return Flight Selected',
      message: `${item.name} — ${formatPrice(item.price, currency)}`,
      timestamp: new Date().toISOString(), read: false,
    })
    toast.success('Return flight selected!')
  }

  const handleConfirm = async () => {
    if (!bookingStatus.selectedReturn) { toast.error('Select a return flight first'); return }
    setConfirming(true)
    setBookingStatus({ returnStatus: 'PENDING' })
    await new Promise(r => setTimeout(r, 1500))
    setBookingStatus({ returnStatus: 'CONFIRMED' })
    addNotification({
      id: Date.now().toString(), type: 'info',
      title: '✅ Return Flight Confirmed',
      message: `${bookingStatus.selectedReturn?.name} confirmed!`,
      timestamp: new Date().toISOString(), read: false,
    })
    toast.success('Return flight confirmed! 🎉')
    setConfirming(false)
  }

  const scoreColor = (score: number) =>
    score >= 0.85 ? 'text-green-400' : score >= 0.7 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title text-xl">🔄 Return Journey</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {tripContext.destination} → {tripContext.startLocation || 'Home'}
            {tripContext.endDate && ` · ${tripContext.endDate}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="live-dot"></span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Live prices</span>
        </div>
      </div>

      {/* Booking progress */}
      <div className="card p-5">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-4 font-mono">Return Booking Progress</p>
        <div className="flex items-center gap-2">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i <= returnStep ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'
                }`}>
                  {i < returnStep ? '✓' : i + 1}
                </div>
                <span className="text-[0.6rem] text-[var(--text-muted)] mt-1 text-center">{step}</span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 -mt-4 transition-all ${i < returnStep ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected return */}
      {bookingStatus.selectedReturn && (
        <div className="glass rounded-xl p-4 border border-[var(--primary)]/30">
          <p className="text-xs text-[var(--text-muted)] mb-1 font-mono uppercase tracking-wider">Selected Return</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[var(--text-primary)]">{bookingStatus.selectedReturn.name}</p>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1">
                <span>🛫 {bookingStatus.selectedReturn.departure}</span>
                <span>🛬 {bookingStatus.selectedReturn.arrival}</span>
                <span>⏱ {bookingStatus.selectedReturn.duration}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold font-mono text-[var(--primary)]">{formatPrice(bookingStatus.selectedReturn.price, currency)}</div>
              {bookingStatus.returnStatus === 'CONFIRMED'
                ? <span className="badge badge-green text-[0.65rem]">✅ Confirmed</span>
                : <span className="badge badge-amber text-[0.65rem]">{bookingStatus.returnStatus}</span>
              }
            </div>
          </div>
        </div>
      )}

      {/* Generate button */}
      {!generated ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-4">🔄</div>
          <h3 className="font-bold text-[var(--text-primary)] mb-2">Generate Return Options</h3>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            Auto-suggest optimized return flights based on your trip end date
          </p>
          <button onClick={handleGenerate} className="btn-primary py-3 px-8">
            🔍 Find Return Flights
          </button>
        </div>
      ) : (
        <>
          {/* Flight cards */}
          <div className="space-y-4">
            {returnTransport.map((item) => (
              <div key={item.id} className={`card p-5 flex flex-col gap-4 transition-all ${
                bookingStatus.selectedReturn?.id === item.id ? 'border-[var(--primary)]' : ''
              }`}>
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)] text-sm">{item.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                          <span>⏱ {item.duration}</span>
                          <span>🛫 {item.departure}</span>
                          <span>🛬 {item.arrival}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-bold font-mono text-[var(--primary)]">{formatPrice(item.price, currency)}</div>
                        <div className="text-xs text-[var(--text-muted)]">per person</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`badge ${item.liveStatus === 'On Time' ? 'badge-green' : 'badge-amber'} text-[0.7rem]`}>{item.liveStatus}</span>
                      <span className="text-xs text-[var(--text-muted)]">⭐ {item.rating}</span>
                      <span className={`text-xs font-mono font-bold ${scoreColor(item.score)}`}>Score: {(item.score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {item.offers && item.offers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.offers.map((o, i) => (
                      <span key={i} className="badge badge-amber text-[0.65rem]">🏷️ {o}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <a href={item.bookingLink} target="_blank" rel="noopener noreferrer"
                    onClick={() => trackEvent('booking_click', { type: 'return_flight', name: item.name, price: item.price })}
                    className="btn-primary text-sm py-2 px-4 flex-1 text-center">
                    Book Now →
                  </a>
                  <button onClick={() => handleSelect(item)} className="btn-outline text-sm py-2 px-4">
                    {bookingStatus.selectedReturn?.id === item.id ? '✓ Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Confirm return */}
          {bookingStatus.returnStatus !== 'CONFIRMED' ? (
            <button
              onClick={handleConfirm}
              disabled={!bookingStatus.selectedReturn || confirming}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirming ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : bookingStatus.returnStatus === 'SELECTED' ? 'Confirm Return Booking →' : 'Select a Return Flight First'}
            </button>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <p className="text-green-400 font-bold text-lg">✅ Return Journey Confirmed!</p>
              <p className="text-[var(--text-muted)] text-sm mt-1">{bookingStatus.selectedReturn?.name}</p>
              <a href={bookingStatus.selectedReturn?.bookingLink} target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent('booking_click', { type: 'return_flight', name: bookingStatus.selectedReturn?.name, price: bookingStatus.selectedReturn?.price })}
                className="text-xs text-[var(--primary)] hover:underline mt-2 block">View booking details →</a>
            </div>
          )}

          <button onClick={() => { setGenerated(false); setReturnTransport([]) }}
            className="btn-outline w-full py-2 text-sm">
            🔄 Search Again
          </button>
        </>
      )}
    </div>
  )
}
