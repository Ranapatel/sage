'use client'

import { useState } from 'react'
import { Search, MapPin, Calendar, Users, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import type { ActivitySearchParams } from '@/types/activities'

interface Props {
  onSearch: (params: ActivitySearchParams) => void
  loading:  boolean
}

const TRIP_STYLES: { label: string; type?: string }[] = [
  { label: 'All Activities' },
  { label: 'Tours & Sightseeing', type: 'TOURS' },
  { label: 'Adventure & Sports',   type: 'SPORTS' },
  { label: 'Culture & Museums',    type: 'CULTURAL' },
  { label: 'Food & Nightlife',     type: 'GASTRONOMY' },
  { label: 'Wellness & Spa',       type: 'WELLNESS' },
  { label: 'Transfers',            type: 'TRANSFERS' },
]

export default function ActivitySearchForm({ onSearch, loading }: Props) {
  const [today] = useState(() => new Date().toISOString().split('T')[0])
  const [nextWeek] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])

  const [destination, setDestination]   = useState('')
  const [fromDate, setFromDate]         = useState(today)
  const [toDate, setToDate]             = useState(nextWeek)
  const [adults, setAdults]             = useState(2)
  const [children, setChildren]         = useState(0)
  const [keyword, setKeyword]           = useState('')
  const [activityType, setActivityType] = useState('')
  const [showFilters, setShowFilters]   = useState(false)
  const [minPrice, setMinPrice]         = useState('')
  const [maxPrice, setMaxPrice]         = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!destination.trim()) return

    const adultPaxes  = Array.from({ length: adults },   () => ({ age: 30, type: 'ADULT'  as const }))
    const childPaxes  = Array.from({ length: children }, () => ({ age: 10, type: 'CHILD'  as const }))
    const paxes       = [...adultPaxes, ...childPaxes]
    if (paxes.length === 0) paxes.push({ age: 30, type: 'ADULT' })

    const params: ActivitySearchParams = {
      destinationCode: destination.trim().toUpperCase(),
      fromDate,
      toDate,
      paxes,
      language: 'en',
      from: 1,
      to:   20,
    }
    if (keyword.trim())     params.keyword      = keyword.trim()
    if (activityType)       params.activityType = activityType
    if (minPrice)           params.minPrice     = parseFloat(minPrice)
    if (maxPrice)           params.maxPrice     = parseFloat(maxPrice)

    onSearch(params)
  }

  return (
    <form onSubmit={handleSubmit} className="activity-search-form">
      <div className="search-form-card">
        {/* Header */}
        <div className="search-form-header">
          <div className="search-icon-wrap">
            <Search size={22} />
          </div>
          <div>
            <h2 className="search-form-title">Discover Experiences</h2>
            <p className="search-form-sub">Tours, adventures &amp; local activities worldwide</p>
          </div>
        </div>

        {/* Main fields */}
        <div className="search-main-grid">
          {/* Destination */}
          <div className="search-field">
            <label className="search-label">
              <MapPin size={14} /> Destination Code
            </label>
            <input
              id="activity-destination"
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="e.g. BCN, PAR, BKK"
              required
              maxLength={20}
              className="search-input"
            />
            <span className="search-hint">Hotelbeds destination code</span>
          </div>

          {/* From Date */}
          <div className="search-field">
            <label className="search-label">
              <Calendar size={14} /> From
            </label>
            <input
              id="activity-from-date"
              type="date"
              value={fromDate}
              min={today}
              onChange={e => setFromDate(e.target.value)}
              required
              className="search-input"
            />
          </div>

          {/* To Date */}
          <div className="search-field">
            <label className="search-label">
              <Calendar size={14} /> To
            </label>
            <input
              id="activity-to-date"
              type="date"
              value={toDate}
              min={fromDate}
              onChange={e => setToDate(e.target.value)}
              required
              className="search-input"
            />
          </div>

          {/* Travellers */}
          <div className="search-field">
            <label className="search-label">
              <Users size={14} /> Travellers
            </label>
            <div className="pax-row">
              <div className="pax-control">
                <span className="pax-label">Adults</span>
                <button type="button" className="pax-btn" onClick={() => setAdults(Math.max(1, adults - 1))}>−</button>
                <span className="pax-val">{adults}</span>
                <button type="button" className="pax-btn" onClick={() => setAdults(Math.min(20, adults + 1))}>+</button>
              </div>
              <div className="pax-control">
                <span className="pax-label">Children</span>
                <button type="button" className="pax-btn" onClick={() => setChildren(Math.max(0, children - 1))}>−</button>
                <span className="pax-val">{children}</span>
                <button type="button" className="pax-btn" onClick={() => setChildren(Math.min(10, children + 1))}>+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Keyword */}
        <div className="search-keyword-row">
          <div className="search-field flex-1">
            <label className="search-label">Keyword (optional)</label>
            <input
              id="activity-keyword"
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="e.g. sailing, cooking class, Eiffel Tower..."
              maxLength={100}
              className="search-input"
            />
          </div>
        </div>

        {/* Activity type chips */}
        <div className="type-chips-row">
          {TRIP_STYLES.map(s => (
            <button
              key={s.label}
              type="button"
              onClick={() => setActivityType(s.type || '')}
              className={`type-chip ${activityType === (s.type || '') ? 'type-chip--active' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Advanced filters toggle */}
        <button
          type="button"
          className="filters-toggle"
          onClick={() => setShowFilters(v => !v)}
        >
          <SlidersHorizontal size={14} />
          Advanced filters
          {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showFilters && (
          <div className="filters-panel">
            <div className="search-field">
              <label className="search-label">Min price (EUR)</label>
              <input
                id="activity-min-price"
                type="number"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="0"
                min="0"
                className="search-input"
              />
            </div>
            <div className="search-field">
              <label className="search-label">Max price (EUR)</label>
              <input
                id="activity-max-price"
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="5000"
                min="0"
                className="search-input"
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          id="activity-search-submit"
          type="submit"
          disabled={loading || !destination.trim()}
          className="search-submit-btn"
        >
          {loading ? (
            <span className="btn-spinner" />
          ) : (
            <Search size={18} />
          )}
          {loading ? 'Searching...' : 'Search Activities'}
        </button>
      </div>
    </form>
  )
}
