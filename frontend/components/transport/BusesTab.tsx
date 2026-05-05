'use client'

import { useTripStore } from '@/store/tripStore'
import { trackEvent } from '@/lib/analytics'

export default function BusesTab() {
  const { buses, loading, tripContext } = useTripStore()

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-32 bg-[var(--border)] rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  // ── Affiliate redirect card (no real search API available) ────────────────
  const affiliateEntry = buses?.find((b: any) => b.source === 'affiliate_redirect')
  if (affiliateEntry || !buses || buses.length === 0) {
    const from = tripContext?.startLocation || ''
    const to   = tripContext?.destination   || ''
    const redirectUrl = affiliateEntry?.bookingLink ||
      `https://www.redbus.in/search?fromCityName=${encodeURIComponent(from)}&toCityName=${encodeURIComponent(to)}&source=tripsage`

    return (
      <div className="space-y-4 animate-fade-in">
        {/* Info banner */}
        <div className="glass rounded-xl p-4 border border-[var(--border)] flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="font-semibold text-sm text-[var(--text-primary)]">Real-time bus search</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Live bus schedules and seat availability are fetched directly from redBus — India's largest bus booking platform.
              Click below to search in real-time.
            </p>
          </div>
        </div>

        {/* redBus CTA card */}
        <div className="card overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all">
          <div className="relative h-32 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80"
              alt="Buses"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <div className="text-white font-bold text-lg">🚌 Search Buses</div>
              <div className="text-white/70 text-sm mt-1">
                {from && to ? `${from.split(',')[0]} → ${to.split(',')[0]}` : 'Enter your route to search'}
              </div>
            </div>
            <div className="absolute top-3 right-3">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                redBus
              </span>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2 mb-3 text-xs text-[var(--text-muted)]">
              <span className="badge badge-green">Real-time seats</span>
              <span className="badge badge-amber">Live prices</span>
              <span className="badge badge-green">Instant booking</span>
            </div>
            <a
              href={redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('booking_click', { type: 'bus', name: 'redBus', source: 'affiliate_redirect' })}
              className="w-full text-center block py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 transition-opacity shadow-md"
            >
              Search Live Bus Tickets on redBus →
            </a>
          </div>
        </div>
      </div>
    )
  }

  return null
}
