'use client'

import React, { memo, useState, useMemo, useEffect } from 'react'
import HotelCard from '../hotel/HotelCard'
import HotelDetailModal from '../hotel/HotelDetailModal'
import HotelBookingFlow from '../hotel/HotelBookingFlow'
import { formatPrice } from '@/lib/currency'

interface Props {
  hotels: any[]
  loading: boolean
  tripContext: any
  searchForm: any
}

type SortMode = 'recommended' | 'price-low' | 'price-high' | 'rating'

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    {Array.from({ length: 3 }).map((_, idx) => (
      <div key={idx} className="card p-3 space-y-3 animate-pulse">
        <div className="h-44 w-full bg-[var(--bg-card-hover)] rounded-xl" />
        <div className="h-4 w-3/4 bg-[var(--bg-card-hover)] rounded" />
        <div className="h-3 w-1/2 bg-[var(--bg-card-hover)] rounded" />
        <div className="h-4 w-1/4 bg-[var(--bg-card-hover)] rounded" />
      </div>
    ))}
  </div>
)

const EmptyState = ({ onReset, isFiltered }: { onReset?: () => void; isFiltered?: boolean }) => (
  <div style={{
    textAlign: 'center', padding: '60px 20px',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '16px'
  }}>
    <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.1rem' }}>
      {isFiltered ? 'No hotels match your filter criteria' : 'No hotel properties found'}
    </h3>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: onReset ? '16px' : '0' }}>
      {isFiltered
        ? 'Try adjusting your star rating, meal plan, or price limit.'
        : 'Try searching for a different destination or date range.'}
    </p>
    {onReset && (
      <button
        onClick={onReset}
        style={{
          padding: '8px 20px',
          background: 'var(--primary)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.82rem',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Reset All Filters
      </button>
    )}
  </div>
)

function HotelsTab({ hotels, loading, tripContext, searchForm }: Props) {
  const [sortMode, setSortMode] = useState<SortMode>('recommended')

  // Filter States
  const [starFilter, setStarFilter] = useState<number | null>(null)
  const [priceLimit, setPriceLimit] = useState<number>(1000000)
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
      if (highest > 0) {
        setPriceLimit(prev => (prev === 1000000 ? highest : Math.max(prev, highest)))
      }
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
              <option value="3">3 Stars & Above</option>
              <option value="4">4 Stars & Above</option>
              <option value="5">5 Stars Only</option>
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
        <EmptyState
          isFiltered={Boolean(hotels && hotels.length > 0)}
          onReset={hotels && hotels.length > 0 ? () => {
            setStarFilter(null)
            setPriceLimit(maxCeiling)
            setBoardFilter('all')
          } : undefined}
        />
      )}

      {/* ── Hotel Detail Modal ─────────────────────────────────────────── */}
      <HotelDetailModal />

      {/* ── Hotel Booking Flow Modal ────────────────────────────────────── */}
      <HotelBookingFlow />
    </div>
  )
}

export default memo(HotelsTab)
