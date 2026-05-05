'use client'

import React, { memo } from 'react'
import BusCard from './BusCard'
import { useTripStore } from '@/store/tripStore'
import { trackEvent } from '@/lib/analytics'

function BusesTab() {
  const { buses, loading, tripContext } = useTripStore()
  const from = tripContext?.startLocation || ''
  const to   = tripContext?.destination   || ''

  // Loading skeletons
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="section-title text-xl">🚌 Bus Options</h2>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 space-y-3">
              <div className="shimmer h-4 w-1/3 rounded" />
              <div className="shimmer h-6 w-1/4 rounded" />
              <div className="shimmer h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // No search performed yet
  if (!from || !to) {
    return (
      <div className="card p-12 text-center flex flex-col items-center gap-4">
        <div className="text-6xl">🚌</div>
        <h3 className="font-bold text-[var(--text-primary)]">Search to see bus options</h3>
        <p className="text-[var(--text-muted)] text-sm">Enter your origin and destination above to find buses</p>
      </div>
    )
  }

  // Route has no bus service (international/flight-only routes)
  if (!buses || buses.length === 0) {
    const redirectUrl = `https://www.redbus.in/search?fromCityName=${encodeURIComponent(from)}&toCityName=${encodeURIComponent(to)}&source=tripsage`
    return (
      <div className="space-y-4 animate-fade-in">
        <h2 className="section-title text-xl">🚌 Bus Options</h2>

        {/* No service banner */}
        <div className="glass rounded-xl p-5 border border-amber-500/30 flex items-start gap-4">
          <div className="text-3xl flex-shrink-0">⚠️</div>
          <div>
            <p className="font-semibold text-[var(--text-primary)]">No direct buses for this route</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Direct bus service is not available for <strong>{from.split(',')[0]} → {to.split(',')[0]}</strong>.
              This is likely a long-distance or international route best covered by flight.
            </p>
          </div>
        </div>

        {/* RedBus CTA for manual search */}
        <div className="card overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all group">
          <div className="relative h-32 overflow-hidden bg-slate-800">
            <img
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"
              alt="Buses"
              className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-110 transition-all duration-500"
              loading="lazy"
              onError={(e: any) => { e.currentTarget.style.opacity = '0' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <div className="text-white font-bold text-lg">🚌 Try Alternate Routes</div>
              <div className="text-white/70 text-sm mt-1">Search connecting buses on redBus</div>
            </div>
            <div className="absolute top-3 right-3">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">redBus</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="badge badge-green text-xs">Real-time seats</span>
              <span className="badge badge-amber text-xs">Live prices</span>
              <span className="badge badge-green text-xs">Instant booking</span>
            </div>
            <a
              href={redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('booking_click', { type: 'bus', source: 'affiliate_redirect' })}
              className="w-full text-center block py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              Search Connecting Buses on redBus →
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Show actual bus cards
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="section-title text-xl">🚌 Bus Options</h2>
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-xs font-mono text-[var(--text-muted)]">Estimated fares</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buses.map((b: any) => <BusCard key={b.id} item={b} />)}
      </div>
    </div>
  )
}

export default memo(BusesTab)
