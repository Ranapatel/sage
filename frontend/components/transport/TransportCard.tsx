'use client'

import { useTripStore } from '@/store/tripStore'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/currency'
import { useUrgency } from '@/hooks/useUrgency'
import toast from 'react-hot-toast'

interface Props {
  item: any
  showDetail?: boolean
}

export default function TransportCard({ item, showDetail }: Props) {
  const { setBookingStatus, addNotification } = useTripStore()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const { discount, urgency, flightScarcity, countdownLabel } = useUrgency(item.id ?? 'fl')

  const originalPrice = Math.round(item.price * (100 / (100 - discount)) / 100) * 100
  const displayOriginal = formatPrice(originalPrice, currency)
  const displayPrice = formatPrice(item.price, currency)

  const handleSelect = () => {
    setBookingStatus({ flightStatus: 'SELECTED', selectedFlight: item })
    addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: '✈️ Flight Selected',
      message: `${item.name} - ${displayPrice}`,
      timestamp: new Date().toISOString(),
      read: false,
    })
    toast.success('Flight selected! Complete booking →')
  }

  const accentColor = item.airlineColor || '#00c27c'

  return (
    <div className="card overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/10">

      {/* Flight image banner */}
      {item.image && (
        <div className="relative h-28 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e: any) => { e.target.style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

          {/* Airline logo overlay */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg flex-shrink-0">
              <img
                src={item.logo}
                alt={item.name}
                className="w-full h-full object-contain"
                onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=56&q=80' }}
              />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">
                {item.name?.split('—')[0]?.trim()}
              </div>
              <div className="text-white/70 text-xs">
                {item.departure} → {item.arrival} · {item.duration}
              </div>
            </div>
          </div>

          {/* Source badge top-right */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {item.source === 'ai-estimated' && (
              <span className="bg-purple-600/90 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full">
                🤖 AI Price
              </span>
            )}
            {item.source === 'live' && (
              <span className="bg-green-600/90 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full">
                🔴 Live
              </span>
            )}
            {item.stops === 0 && (
              <span className="bg-blue-600/90 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full">
                Non-stop
              </span>
            )}
          </div>
        </div>
      )}

      {/* Urgency banner */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/10 border-b border-orange-500/20">
        <span className="text-orange-400 text-[0.7rem] font-bold uppercase tracking-wide animate-pulse">
          🔥 {urgency}
        </span>
        <span className="text-red-400 text-[0.7rem] font-semibold">
          ⚠️ {flightScarcity}
        </span>
      </div>

      <div className="p-4">
        {/* Price + details row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge text-[0.65rem] ${item.liveStatus === 'On Time' ? 'badge-green' : 'badge-amber'}`}>
              {item.liveStatus}
            </span>
            <span className="text-xs text-[var(--text-muted)]">⭐ {item.rating}</span>
            {item.stops !== undefined && (
              <span className="text-xs text-[var(--text-muted)]">
                {item.stops === 0 ? '✈️ Direct' : `${item.stops} stop${item.stops > 1 ? 's' : ''}`}
              </span>
            )}
          </div>

          {/* Pricing */}
          <div className="text-right flex-shrink-0">
            <span className="bg-green-500 text-white text-[0.6rem] font-black px-1.5 py-0.5 rounded">
              {discount}% OFF
            </span>
            <div className="text-xs text-[var(--text-muted)] line-through mt-0.5">{displayOriginal}</div>
            <div className="text-xl font-black font-mono text-[var(--primary)] leading-tight">{displayPrice}</div>
            <div className="text-[0.65rem] text-[var(--text-muted)]">per person</div>
          </div>
        </div>

        {/* Offers */}
        {showDetail && item.offers?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.offers.map((o: string, i: number) => (
              <span key={i} className="badge badge-amber text-[0.65rem]">🏷️ {o}</span>
            ))}
          </div>
        )}

        {/* Countdown + CTA */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-center gap-1 text-[0.65rem] text-orange-400 font-mono">
            ⏳ Price resets in <span className="font-black">{countdownLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={item.bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white hover:opacity-90 transition-opacity shadow-md shadow-[var(--primary)]/30"
            >
              Book Now — Save {discount}% →
            </a>
            <button onClick={handleSelect} className="btn-outline text-sm py-2 px-3">
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

