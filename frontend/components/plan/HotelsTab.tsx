'use client'

<<<<<<< Updated upstream
import React, { memo, useState, useMemo, useEffect } from 'react'
import HotelCard from '../hotel/HotelCard'
import HotelDetailModal from '../hotel/HotelDetailModal'
import HotelBookingFlow from '../hotel/HotelBookingFlow'
import { formatPrice } from '@/lib/currency'
=======
import React, { memo, useMemo } from 'react'
import HotelCard from '../hotel/HotelCard'
import { AlertTriangle, Info, Building2 } from 'lucide-react'
import { SYMBOLS } from '@/lib/currency'
>>>>>>> Stashed changes

interface Props {
  hotels: any[]
  loading: boolean
  tripContext: any
  searchForm: any
  budget?: number
  flightCostSpent?: number
  nights?: number
  currency?: string
}

type SortMode = 'recommended' | 'price-low' | 'price-high' | 'rating'

function SkeletonCard() {
  return (
    <div className="hotel-card" style={{ overflow: 'hidden' }}>
      {/* Image skeleton */}
      <div style={{ aspectRatio: '16/11' }}>
        <div className="shimmer" style={{ width: '100%', height: '100%', borderRadius: 0 }} />
      </div>
      {/* Content skeleton */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div className="shimmer" style={{ height: '16px', width: '70%', marginBottom: '8px' }} />
        <div className="shimmer" style={{ height: '12px', width: '40%', marginBottom: '14px' }} />
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <div className="shimmer" style={{ height: '20px', width: '70px', borderRadius: '6px' }} />
          <div className="shimmer" style={{ height: '20px', width: '60px', borderRadius: '6px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '14px' }}>
          <div>
            <div className="shimmer" style={{ height: '10px', width: '60px', marginBottom: '4px' }} />
            <div className="shimmer" style={{ height: '24px', width: '90px' }} />
          </div>
          <div className="shimmer" style={{ height: '20px', width: '60px', borderRadius: '4px' }} />
        </div>
        <div className="shimmer" style={{ height: '42px', width: '100%', borderRadius: '10px' }} />
      </div>
    </div>
  )
}

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 20px',
      background: 'var(--bg-card)', borderRadius: '16px',
      border: '1px solid var(--border)'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏨</div>
      <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.1rem' }}>
        No hotels found
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Try adjusting your dates, destination, or budget to see more options
      </p>
    </div>
  )
}

<<<<<<< Updated upstream
function HotelsTab({ hotels, loading, tripContext, searchForm }: Props) {
  const [sortMode, setSortMode] = useState<SortMode>('recommended')

  // Filter States
  const [starFilter, setStarFilter] = useState<number | null>(null)
  const [priceLimit, setPriceLimit] = useState<number>(30000)
  const [boardFilter, setBoardFilter] = useState<string>('all')

  // Dynamic price ceiling from returned data
  const maxCeiling = useMemo(() => {
    if (!hotels || hotels.length === 0) return 30000
    const prices = hotels.map(h => h.price || 0)
    return Math.max(...prices, 30000)
  }, [hotels])

  // Initialize slider when hotels load
  useEffect(() => {
    if (hotels && hotels.length > 0) {
      const highest = Math.max(...hotels.map(h => h.price || 0))
      Promise.resolve().then(() => setPriceLimit(highest))
    }
  }, [hotels])

  // Apply filters first
  const filteredHotels = useMemo(() => {
    if (!hotels || hotels.length === 0) return []
    let result = [...hotels]

    // 1. Star Category Filter
    if (starFilter) {
      result = result.filter(h => h.rating >= starFilter)
    }

    // 2. Price Range Filter
    result = result.filter(h => (h.price || 0) <= priceLimit)

    // 3. Board Type Filter
    if (boardFilter !== 'all') {
      result = result.filter(h => {
        const boardText = [...(h.offers || []), ...(h.amenities || [])].join(' ').toLowerCase()
        if (boardFilter === 'breakfast') {
          return boardText.includes('breakfast') || boardText.includes('b&b') || boardText.includes('bb')
        }
        if (boardFilter === 'all-inclusive') {
          return boardText.includes('all inclusive') || boardText.includes('ai')
        }
        if (boardFilter === 'room-only') {
          return boardText.includes('room only') || boardText.includes('ro')
        }
        return true
      })
    }

    return result
  }, [hotels, starFilter, priceLimit, boardFilter])

  // Sort the filtered results
  const sortedHotels = useMemo(() => {
    const sorted = [...filteredHotels]
    switch (sortMode) {
      case 'price-low':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
      case 'price-high':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'recommended':
      default:
        return sorted.sort((a, b) => (b.score || 0) - (a.score || 0))
    }
  }, [filteredHotels, sortMode])

  const SORT_OPTIONS: { key: SortMode; label: string }[] = [
    { key: 'recommended', label: 'Recommended' },
    { key: 'price-low', label: 'Price: Low → High' },
    { key: 'price-high', label: 'Price: High → Low' },
    { key: 'rating', label: 'Top Rated' },
  ]

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px'
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '1.5rem', color: 'var(--text-primary)'
          }}>
            Hotels
          </h2>
          {!loading && hotels.length > 0 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Showing {filteredHotels.length} of {hotels.length} properties
              {tripContext?.destination ? ` in ${tripContext.destination.split(',')[0]}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────────── */}
      {!loading && hotels.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Star Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Star Rating
            </span>
            <select
              value={starFilter || ''}
              onChange={e => setStarFilter(e.target.value ? Number(e.target.value) : null)}
              style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">All Ratings</option>
              <option value="3">3★ & Above</option>
              <option value="4">4★ & Above</option>
              <option value="5">5★ Only</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span>Max Budget / Night</span>
              <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{formatPrice(priceLimit, 'INR')}</span>
            </div>
            <input
              type="range"
              min="1000"
              max={maxCeiling}
              step="500"
              value={priceLimit}
              onChange={e => setPriceLimit(Number(e.target.value))}
              style={{
                accentColor: 'var(--primary)',
                cursor: 'pointer',
                height: '6px',
                borderRadius: '3px',
                background: 'var(--border)'
              }}
            />
          </div>

          {/* Meal Plan Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Board / Meal Plan
            </span>
            <select
              value={boardFilter}
              onChange={e => setBoardFilter(e.target.value)}
              style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Meal Plans</option>
              <option value="breakfast">Breakfast Included</option>
              <option value="all-inclusive">All Inclusive</option>
              <option value="room-only">Room Only</option>
            </select>
          </div>
        </div>
=======
function HotelsTab({ hotels, loading, tripContext, searchForm, budget = 0, flightCostSpent = 0, nights = 1, currency = 'INR' }: Props) {
  const symbol = SYMBOLS[currency] ?? currency

  // Hotel per-night budget: 35% of remaining budget after flights
  const remainingAfterFlight = budget > 0 ? Math.max(0, budget - flightCostSpent) : 0
  const hotelNightlyLimit = remainingAfterFlight > 0 ? remainingAfterFlight * 0.35 : Infinity

  const { displayList, allOverBudget } = useMemo(() => {
    const sorted = [...hotels].sort((a, b) => a.price - b.price)
    if (!budget || budget <= 0) return { displayList: sorted, allOverBudget: false }
    const within = sorted.filter(h => h.price <= hotelNightlyLimit)
    if (within.length === 0) return { displayList: sorted.slice(0, 3), allOverBudget: true }
    return { displayList: within, allOverBudget: false }
  }, [hotels, hotelNightlyLimit, budget])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title text-xl flex items-center gap-2">
          <Building2 size={20} strokeWidth={1.5} className="text-[#1C1917]" /> Hotel Options
        </h2>
        <div className="flex items-center gap-2">
          <span className="live-dot"></span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Live availability</span>
        </div>
      </div>

      {budget > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-secondary,#F4F4F5)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
          <Info size={13} className="text-green-500 shrink-0" />
          <span>
            Hotel budget limit:{' '}
            <strong className="text-[var(--text-primary)] font-mono">
              {symbol}{Math.round(Math.min(hotelNightlyLimit, budget)).toLocaleString('en-IN')}/night
            </strong>
            {flightCostSpent > 0 && (
              <span className="ml-1 text-[var(--text-muted)]">
                (remaining after flights: {symbol}{Math.round(remainingAfterFlight).toLocaleString('en-IN')})
              </span>
            )}
            {nights > 1 && (
              <span className="ml-1 text-[var(--text-muted)]">· {nights} nights</span>
            )}
          </span>
        </div>
      )}

      {!loading && allOverBudget && (
        <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 text-xs">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">No hotels found within your hotel budget of {symbol}{Math.round(hotelNightlyLimit).toLocaleString('en-IN')}/night.</p>
            <p className="mt-0.5 text-amber-500">Showing cheapest available options. Consider increasing your budget or selecting a cheaper flight first.</p>
          </div>
        </div>
      )}

      {loading ? <SkeletonCards count={3} /> : (
        displayList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayList.map((h: any) => <HotelCard key={h.id} item={h} showDetail />)}
          </div>
        ) : (
          <EmptyState icon="hotel" title="No hotels found" desc="Try adjusting your dates or budget" />
        )
>>>>>>> Stashed changes
      )}

      {/* ── Sort Bar ───────────────────────────────────────────────────── */}
      {!loading && filteredHotels.length > 0 && (
        <div style={{
          display: 'flex', gap: '8px', overflowX: 'auto',
          paddingBottom: '4px'
        }} className="hide-scrollbar">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              className={`hotel-sort-btn ${sortMode === opt.key ? 'active' : ''}`}
              onClick={() => setSortMode(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Hotel Grid ─────────────────────────────────────────────────── */}
      {loading ? (
        <SkeletonGrid />
      ) : sortedHotels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sortedHotels.map((h: any) => (
            <HotelCard key={h.id} item={h} showDetail />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* ── Hotel Detail Modal ─────────────────────────────────────────── */}
      <HotelDetailModal />

      {/* ── Hotel Booking Flow Modal ────────────────────────────────────── */}
      <HotelBookingFlow />
    </div>
  )
}

export default memo(HotelsTab)

