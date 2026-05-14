'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { tripAPI } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Location = {
  id: string
  name: string
  type: 'city'
}

type AutoCompleteState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Location[] }
  | { status: 'empty' }
  | { status: 'error'; message: string }

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// ── Session-level cache — avoids redundant network requests ───────────────────
const queryCache = new Map<string, Location[]>()

// ── Component ─────────────────────────────────────────────────────────────────

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Search location...',
  className = '',
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [state, setState] = useState<AutoCompleteState>({ status: 'idle' })
  const [isOpen, setIsOpen] = useState(false)

  // Tracks whether the last input change was a user selecting a suggestion
  // (prevents re-triggering a search after selection)
  const isSelectingRef = useRef(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // ── Sync external value changes (e.g. auto-detect location) ─────────────────
  useEffect(() => {
    setQuery(value)
  }, [value])

  // ── Close dropdown on outside click ─────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Debounced search trigger ─────────────────────────────────────────────────
  useEffect(() => {
    // Skip search if user just selected from dropdown
    if (isSelectingRef.current) {
      isSelectingRef.current = false
      return
    }

    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setState({ status: 'idle' })
      setIsOpen(false)
      return
    }

    const timer = setTimeout(() => {
      fetchSuggestions(trimmed)
    }, 300)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // ── Fetch suggestions from backend ──────────────────────────────────────────
  const fetchSuggestions = useCallback(async (searchTerm: string) => {
    // Serve from cache when available
    const cacheKey = searchTerm.toLowerCase()
    if (queryCache.has(cacheKey)) {
      const cached = queryCache.get(cacheKey)!
      setState(
        cached.length > 0
          ? { status: 'success', data: cached }
          : { status: 'empty' }
      )
      setIsOpen(true)
      return
    }

    // Cancel any in-flight request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setState({ status: 'loading' })
    setIsOpen(true)

    try {
      const res = await tripAPI.getAutocomplete(searchTerm)
      const results = res?.data

      if (!Array.isArray(results) || results.length === 0) {
        queryCache.set(cacheKey, [])
        setState({ status: 'empty' })
        return
      }

      const locations: Location[] = results.map((r: any) => {
        let displayName = ''

        if (typeof r === 'string') {
          displayName = r
        } else if (r.city && r.country) {
          const stateStr = r.state && r.state !== r.city ? `, ${r.state}` : ''
          displayName = `${r.city}${stateStr}, ${r.country}`
        } else if (r.name && r.country) {
          const stateStr = r.state && r.state !== r.name ? `, ${r.state}` : ''
          displayName = `${r.name}${stateStr}, ${r.country}`
        } else if (r.displayName) {
          const parts: string[] = r.displayName.split(',')
          displayName =
            parts.length > 3
              ? `${parts[0].trim()}, ${parts[parts.length - 1].trim()}`
              : r.displayName
        } else if (r.description) {
          displayName = r.description
        } else {
          displayName =
            r.city ||
            r.name ||
            r.formatted_address ||
            (Object.values(r).find((v) => typeof v === 'string') as string) ||
            'Unknown Location'
        }

        return {
          id: r.id ?? r.place_id ?? Math.random().toString(36).slice(2),
          name: displayName,
          type: 'city' as const,
        }
      })

      queryCache.set(cacheKey, locations)
      setState({ status: 'success', data: locations })
    } catch (err: any) {
      if (err?.name === 'AbortError') return // Silently ignore cancelled requests
      console.error('[LocationAutocomplete] fetch error:', err?.message)
      setState({ status: 'error', message: 'Unable to fetch suggestions. Try again.' })
    }
  }, [])

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSelect = (loc: Location) => {
    isSelectingRef.current = true
    setQuery(loc.name)
    onChange(loc.name)
    setState({ status: 'idle' })
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    onChange(val)
  }

  const handleFocus = () => {
    if (
      state.status === 'success' ||
      state.status === 'empty' ||
      state.status === 'error'
    ) {
      setIsOpen(true)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Text input */}
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        value={query}
        autoComplete="off"
        spellCheck={false}
        onChange={handleInputChange}
        onFocus={handleFocus}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        role="combobox"
      />

      {/* Loading spinner inside input */}
      {state.status === 'loading' && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && state.status !== 'idle' && (
        <div
          role="listbox"
          className="absolute z-50 w-full mt-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border"
          style={{
            background: 'rgba(15,23,42,0.97)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(255,255,255,0.12)',
          }}
        >
          {/* Searching state */}
          {state.status === 'loading' && (
            <div className="px-4 py-4 text-sm text-center flex items-center justify-center gap-2" style={{ color: '#94a3b8' }}>
              <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin inline-block" />
              Searching cities...
            </div>
          )}

          {/* No results */}
          {state.status === 'empty' && (
            <div className="px-4 py-5 text-sm text-center" style={{ color: '#94a3b8' }}>
              <div className="text-2xl mb-1">📍</div>
              No cities found for &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Error */}
          {state.status === 'error' && (
            <div className="px-4 py-4 text-sm text-center" style={{ color: '#f87171' }}>
              {state.message}
            </div>
          )}

          {/* Results list */}
          {state.status === 'success' && (
            <div className="max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <div
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: '#64748b' }}
              >
                Suggested Destinations
              </div>
              {state.data.map((loc) => (
                <div
                  key={loc.id}
                  role="option"
                  aria-selected={false}
                  className="px-5 py-3 cursor-pointer transition-colors group flex items-center justify-between"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseDown={(e) => e.preventDefault()} // prevents input blur before click
                  onClick={() => handleSelect(loc)}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '1rem' }}>📍</span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: '#f1f5f9' }}
                    >
                      {loc.name}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest"
                    style={{
                      background: 'rgba(59,130,246,0.15)',
                      color: '#60a5fa',
                    }}
                  >
                    City
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
