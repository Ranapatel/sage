'use client'

import { useTripStore } from '@/store/tripStore'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/currency'
import { trackEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'

interface Props {
  item: any
  showDetail?: boolean
}

export default function TransportCard({ item, showDetail }: Props) {
  const { setBookingStatus, addNotification } = useTripStore()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'

  const displayPrice = item.price ? formatPrice(item.price, currency) : null

  const handleSelect = () => {
    setBookingStatus({ flightStatus: 'SELECTED', selectedFlight: item })
    addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: '✈️ Flight Selected',
      message: `${item.name}${displayPrice ? ` - ${displayPrice}` : ''}`,
      timestamp: new Date().toISOString(),
      read: false,
    })
    toast.success('Flight selected! Complete booking →')
  }

  // ── Source badge config ────────────────────────────────────────────────────
  const sourceBadge = (() => {
    if (item.source === 'live') return { label: '🔴 Live Price', cls: 'bg-green-600/90' }
    if (item.source === 'affiliate_redirect') return { label: '🔗 Search Live', cls: 'bg-blue-600/90' }
    if (item.source === 'api_error') return { label: '⚠️ API Error', cls: 'bg-red-600/90' }
    return null
  })()

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

          {/* Airline logo + name overlay */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
            {item.logo && (
              <div className="w-14 h-14 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg flex-shrink-0">
                <img
                  src={item.logo}
                  alt={item.name}
                  className="w-full h-full object-contain"
                  onError={(e: any) => { e.target.style.display = 'none' }}
                />
              </div>
            )}
            <div>
              <div className="text-white font-bold text-sm leading-tight">
                {item.name?.split('—')[0]?.trim()}
              </div>
              <div className="text-white/70 text-xs mt-0.5">
                {item.location && <div className="font-semibold">{item.location}</div>}
                {(item.departure || item.arrival || item.duration) && (
                  <div className="mt-0.5">
                    {[item.departure, item.arrival].filter(Boolean).join(' → ')}
                    {item.duration && ` · ${item.duration}`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Source + stops badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {sourceBadge && (
              <span className={`${sourceBadge.cls} text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full`}>
                {sourceBadge.label}
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

      <div className="p-4">
        {/* Flight details row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {item.liveStatus && (
              <span className={`badge text-[0.65rem] ${item.liveStatus === 'Live' ? 'badge-green' : 'badge-amber'}`}>
                {item.liveStatus}
              </span>
            )}
            {item.rating != null && (
              <span className="text-xs text-[var(--text-muted)]">⭐ {item.rating}</span>
            )}
            {item.stops != null && (
              <span className="text-xs text-[var(--text-muted)]">
                {item.stops === 0 ? '✈️ Direct' : `${item.stops} stop${item.stops > 1 ? 's' : ''}`}
              </span>
            )}
          </div>

          {/* Price — only shown when real */}
          <div className="text-right flex-shrink-0">
            {displayPrice ? (
              <>
                <div className="text-xl font-black font-mono text-[var(--primary)] leading-tight">
                  {displayPrice}
                </div>
                <div className="text-[0.65rem] text-[var(--text-muted)]">per person · economy</div>
              </>
            ) : (
              <div className="text-xs text-[var(--text-muted)] italic">Price on booking site</div>
            )}
          </div>
        </div>

        {/* Offers (from API only) */}
        {showDetail && item.offers?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.offers.map((o: string, i: number) => (
              <span key={i} className="badge badge-amber text-[0.65rem]">🏷️ {o}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-3 flex items-center gap-2">
          <a
            href={item.bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('booking_click', { type: 'flight', name: item.name, price: item.price })}
            className="flex-1 text-center py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white hover:opacity-90 transition-opacity shadow-md shadow-[var(--primary)]/30"
          >
            {item.source === 'affiliate_redirect' ? 'Search Live Prices →' : 'Book Now →'}
          </a>
          {item.source === 'live' && (
            <button onClick={handleSelect} className="btn-outline text-sm py-2 px-3">
              Select
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
