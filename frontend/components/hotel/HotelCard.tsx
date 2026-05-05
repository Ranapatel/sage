'use client'
import React, { memo } from 'react'

import { useTripStore } from '@/store/tripStore'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/currency'

import { trackEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { useIsMobile } from '@/hooks/useIsMobile'

interface Props {
  item: any
  showDetail?: boolean
}

function HotelCard({ item, showDetail }: Props) {
  const isMobile = useIsMobile()
  const { setBookingStatus, addNotification } = useTripStore()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'

  const displayPrice = item.price ? formatPrice(item.price, currency) : null

  // Normalise rating to 0–5 (Booking.com uses 0–10)
  const rawRating = parseFloat(item.rating) || 0
  const normRating = rawRating > 5 ? +(rawRating / 2).toFixed(1) : +rawRating.toFixed(1)
  const filled = Math.min(5, Math.max(0, Math.round(normRating)))
  const empty  = 5 - filled

  const handleSelect = () => {
    setBookingStatus({ hotelStatus: 'SELECTED', selectedHotel: item })
    addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: '🏨 Hotel Selected',
      message: `${item.name}${displayPrice ? ` - ${displayPrice}/night` : ''}`,
      timestamp: new Date().toISOString(),
      read: false,
    })
    toast.success('Hotel selected! Complete booking →')
  }

  // ── Source badge config ────────────────────────────────────────────────────
  const sourceBadge = (() => {
    if (item.source === 'live') return { label: '🔴 Live Price', cls: 'badge-green' }
    if (item.source === 'affiliate_redirect') return { label: '🔗 Search Live', cls: 'badge-amber' }
    if (item.source === 'api_error') return { label: '⚠️ Unavailable', cls: 'badge-red' }
    return null
  })()

  return (
    <div className="card overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-[var(--primary)]/10 hover:scale-[1.02] group">

      {/* Hero image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={getOptimizedImageUrl(item.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', isMobile)} 
          className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-110 transition-all duration-500 ease-out" 
          decoding="async"
          onError={(e: any) => {
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Source badge */}
        {sourceBadge && (
          <div className="absolute top-3 left-3">
            <span className={`badge ${sourceBadge.cls} text-xs font-black px-2 py-1 rounded-lg shadow-lg`}>
              {sourceBadge.label}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
          <div className="text-white text-xs flex items-center gap-1">📍 {item.location}</div>
          {rawRating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-xs">{'★'.repeat(filled)}{'☆'.repeat(empty)}</span>
              <span className="text-white/80 text-[0.65rem]">{normRating}/5</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-[var(--text-primary)] leading-tight flex-1 min-w-0 text-sm sm:text-base line-clamp-2">{item.name}</h3>
          <div className="text-right flex-shrink-0">
            {displayPrice ? (
              <>
                <div className="text-lg sm:text-2xl font-black font-mono text-[var(--primary)] leading-tight">
                  {displayPrice}
                </div>
                <div className="text-[0.65rem] text-[var(--text-muted)]">/night</div>
              </>
            ) : (
              <div className="text-xs text-[var(--text-muted)] italic">Price on site</div>
            )}
          </div>
        </div>

        {/* Score (if available from API) */}
        {item.score != null && item.score > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[var(--primary)]">
              Match: {Math.round(item.score * 100)}%
            </span>
            {sourceBadge && (
              <span className={`badge ${sourceBadge.cls} text-[0.6rem]`}>{sourceBadge.label}</span>
            )}
          </div>
        )}

        {/* Amenities from API */}
        {showDetail && item.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.amenities.map((a: string, i: number) => (
              <span key={i} className="badge badge-green text-[0.65rem]">{a}</span>
            ))}
          </div>
        )}

        {/* Offers from API */}
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
            onClick={() => trackEvent('booking_click', { type: 'hotel', name: item.name, price: item.price })}
            className="flex-1 text-center py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[var(--primary)]/30"
          >
            {item.source === 'affiliate_redirect' ? 'Search on Agoda →' : 'Book on Agoda →'}
          </a>
          {item.source === 'live' && (
            <button onClick={handleSelect} className="btn-outline text-sm py-2 px-3 hover:opacity-90 active:scale-95 transition-all">
              Select
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
export default memo(HotelCard)
