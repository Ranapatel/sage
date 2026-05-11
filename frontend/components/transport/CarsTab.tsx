'use client'

import React, { memo } from 'react'
import { useTripStore } from '@/store/tripStore'
import Image from 'next/image'
import { trackEvent } from '@/lib/analytics'

function CarsTab() {
  const { cars, loading, tripContext } = useTripStore()

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
  const affiliateEntry = cars?.find((c: any) => c.source === 'affiliate_redirect')
  const destination    = tripContext?.destination || ''
  const redirectUrl    = affiliateEntry?.bookingLink ||
    `https://naiawork.com/g/wqjhitsyjqbd777ee50d5ea594bb46/?dest=${encodeURIComponent(destination)}&source=tripsage`

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Info banner */}
      <div className="glass rounded-xl p-4 border border-[var(--border)] flex items-start gap-3">
        <span className="text-2xl">ℹ️</span>
        <div>
          <p className="font-semibold text-sm text-[var(--text-primary)]">Real-time car rental search</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Live car rental availability, pricing and free cancellation options are fetched directly from DiscoverCars —
            a trusted car rental aggregator. Click below to search in real-time.
          </p>
        </div>
      </div>

      {/* DiscoverCars CTA card */}
      <div className="card overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all">
        <div className="relative h-32 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80"
            alt="Search Rental Cars on TripSage"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <div className="text-white font-bold text-lg">🚗 Search Rental Cars</div>
            <div className="text-white/70 text-sm mt-1">
              {destination ? `In ${destination.split(',')[0]}` : 'Enter your destination to search'}
            </div>
          </div>
          <div className="absolute top-3 right-3">
            <span className="bg-[#16a085] text-white text-xs font-bold px-2 py-1 rounded-lg">
              DiscoverCars
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-3 text-xs text-[var(--text-muted)]">
            <span className="badge badge-green">Free Cancellation</span>
            <span className="badge badge-amber">Live Availability</span>
            <span className="badge badge-green">No Hidden Fees</span>
          </div>
          <a
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('booking_click', { type: 'car', name: 'DiscoverCars', source: 'affiliate_redirect' })}
            className="w-full text-center block py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#16a085] to-[#1abc9c] text-white hover:opacity-90 transition-opacity shadow-md"
          >
            Search Live Car Rentals on DiscoverCars →
          </a>
        </div>
      </div>
    </div>
  )
}

export default memo(CarsTab)
