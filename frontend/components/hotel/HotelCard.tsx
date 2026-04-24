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

export default function HotelCard({ item, showDetail }: Props) {
  const { setBookingStatus, addNotification } = useTripStore()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const { discount, urgency, hotelScarcity, countdownLabel } = useUrgency(item.id ?? 'ht')

  const originalPrice = Math.round(item.price * (100 / (100 - discount)) / 100) * 100
  const displayOriginal = formatPrice(originalPrice, currency)
  const displayPrice = formatPrice(item.price, currency)
  const savings = formatPrice(originalPrice - item.price, currency)

  // Normalise rating to 0–5
  const rawRating = parseFloat(item.rating) || 0
  const stars = rawRating > 5 ? Math.round(rawRating / 2) : Math.round(rawRating)
  const filled = Math.min(5, Math.max(0, stars))
  const empty = 5 - filled
  const displayRating = rawRating > 5 ? (rawRating / 2).toFixed(1) : rawRating.toFixed(1)

  const handleSelect = () => {
    setBookingStatus({ hotelStatus: 'SELECTED', selectedHotel: item })
    addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: '🏨 Hotel Selected',
      message: `${item.name} - ${displayPrice}/night`,
      timestamp: new Date().toISOString(),
      read: false,
    })
    toast.success('Hotel selected! Complete booking →')
  }

  return (
    <div className="card overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/10">

      {/* Hero image */}
      <div className="relative h-48 overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Discount badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-green-500 text-white text-xs font-black px-2 py-1 rounded-lg shadow-lg">
            {discount}% OFF
          </span>
        </div>

        {/* Scarcity */}
        <div className="absolute top-3 right-3">
          <span className="bg-red-500/90 backdrop-blur text-white text-[0.65rem] font-bold px-2 py-1 rounded-lg animate-pulse">
            🏨 {hotelScarcity}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
          <div className="text-white text-xs flex items-center gap-1">📍 {item.location}</div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-xs">{'★'.repeat(filled)}{'☆'.repeat(empty)}</span>
            <span className="text-white/80 text-[0.65rem]">{displayRating}/5</span>
          </div>
        </div>
      </div>

      {/* Urgency strip */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/10 border-b border-orange-500/20">
        <span className="text-orange-400 text-[0.7rem] font-bold uppercase tracking-wide">
          🔥 {urgency}
        </span>
        <span className="text-orange-300 text-[0.65rem] font-mono font-semibold">
          ⏳ {countdownLabel} left
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Name + Pricing */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-[var(--text-primary)] leading-tight flex-1">{item.name}</h3>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-[var(--text-muted)] line-through leading-none">{displayOriginal}</div>
            <div className="text-2xl font-black font-mono text-[var(--primary)] leading-tight">{displayPrice}</div>
            <div className="text-[0.65rem] text-[var(--text-muted)]">/night</div>
          </div>
        </div>

        {/* Savings callout */}
        <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <span className="text-green-400 text-sm">💰</span>
          <span className="text-green-400 text-xs font-semibold">
            You save {savings} on this booking!
          </span>
        </div>

        {/* Source badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-[var(--primary)]">Score: {Math.round((item.score ?? 0.7) * 100)}%</span>
          {item.source === 'live' && <span className="badge badge-green text-[0.6rem]">Live Price</span>}
          {item.source === 'estimated' && <span className="badge badge-amber text-[0.6rem]">Estimated</span>}
        </div>

        {showDetail && item.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.amenities.map((a: string, i: number) => (
              <span key={i} className="badge badge-green text-[0.65rem]">{a}</span>
            ))}
          </div>
        )}

        {showDetail && item.offers?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.offers.map((o: string, i: number) => (
              <span key={i} className="badge badge-amber text-[0.65rem]">🏷️ {o}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2 pt-1">
          <a
            href={item.bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white hover:opacity-90 transition-opacity shadow-md shadow-[var(--primary)]/30"
          >
            Book Now — Save {discount}% →
          </a>
          <button onClick={handleSelect} className="btn-outline text-sm py-2 px-3">
            Select
          </button>
        </div>
      </div>
    </div>
  )
}
