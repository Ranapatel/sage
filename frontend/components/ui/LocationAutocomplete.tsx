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

// ── Static local cities list for instant matching ────────────────────────────
const LOCAL_CITIES = [
  { name: 'Mumbai, India', type: 'city' as const },
  { name: 'Delhi, India', type: 'city' as const },
  { name: 'Bengaluru, India', type: 'city' as const },
  { name: 'Hyderabad, India', type: 'city' as const },
  { name: 'Chennai, India', type: 'city' as const },
  { name: 'Kolkata, India', type: 'city' as const },
  { name: 'Ahmedabad, India', type: 'city' as const },
  { name: 'Pune, India', type: 'city' as const },
  { name: 'Goa, India', type: 'city' as const },
  { name: 'Jaipur, India', type: 'city' as const },
  { name: 'Agra, India', type: 'city' as const },
  { name: 'Varanasi, India', type: 'city' as const },
  { name: 'Kochi, India', type: 'city' as const },
  { name: 'Udaipur, India', type: 'city' as const },
  { name: 'Manali, India', type: 'city' as const },
  { name: 'Shimla, India', type: 'city' as const },
  { name: 'Darjeeling, India', type: 'city' as const },
  { name: 'Amritsar, India', type: 'city' as const },
  { name: 'Mysuru, India', type: 'city' as const },
  { name: 'Srinagar, India', type: 'city' as const },
  { name: 'Rishikesh, India', type: 'city' as const },
  { name: 'Ooty, India', type: 'city' as const },
  { name: 'Visakhapatnam, India', type: 'city' as const },
  { name: 'Coimbatore, India', type: 'city' as const },
  { name: 'Bhopal, India', type: 'city' as const },
  { name: 'Indore, India', type: 'city' as const },
  { name: 'Chandigarh, India', type: 'city' as const },
  { name: 'Nagpur, India', type: 'city' as const },
  { name: 'Lucknow, India', type: 'city' as const },
  { name: 'Patna, India', type: 'city' as const },
  { name: 'Bali, Indonesia', type: 'city' as const },
  { name: 'Bangkok, Thailand', type: 'city' as const },
  { name: 'Phuket, Thailand', type: 'city' as const },
  { name: 'Singapore', type: 'city' as const },
  { name: 'Kuala Lumpur, Malaysia', type: 'city' as const },
  { name: 'Dubai, UAE', type: 'city' as const },
  { name: 'Abu Dhabi, UAE', type: 'city' as const },
  { name: 'London, United Kingdom', type: 'city' as const },
  { name: 'Paris, France', type: 'city' as const },
  { name: 'Barcelona, Spain', type: 'city' as const },
  { name: 'Rome, Italy', type: 'city' as const },
  { name: 'Amsterdam, Netherlands', type: 'city' as const },
  { name: 'New York, USA', type: 'city' as const },
  { name: 'Los Angeles, USA', type: 'city' as const },
  { name: 'Tokyo, Japan', type: 'city' as const },
  { name: 'Seoul, South Korea', type: 'city' as const },
  { name: 'Sydney, Australia', type: 'city' as const },
  { name: 'Melbourne, Australia', type: 'city' as const },
  { name: 'Maldives', type: 'city' as const },
  { name: 'Colombo, Sri Lanka', type: 'city' as const },
  { name: 'Kathmandu, Nepal', type: 'city' as const },
  { name: 'Hong Kong, China', type: 'city' as const },
  { name: 'Istanbul, Turkey', type: 'city' as const },
  { name: 'Cairo, Egypt', type: 'city' as const },
  { name: 'Cape Town, South Africa', type: 'city' as const },
  { name: 'Nairobi, Kenya', type: 'city' as const },
  { name: 'Toronto, Canada', type: 'city' as const },
  { name: 'Vancouver, Canada', type: 'city' as const },
].map((c, i) => ({
  id: `local_${i}`,
  name: c.name,
  type: c.type,
}))

const POPULAR_FALLBACK_CITIES: Location[] = [
  LOCAL_CITIES[0], // Mumbai
  LOCAL_CITIES[1], // Delhi
  LOCAL_CITIES[2], // Bengaluru
  LOCAL_CITIES[3], // Hyderabad
  LOCAL_CITIES[8], // Goa
  LOCAL_CITIES[30], // Bali
]

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
  const [isFetching, setIsFetching] = useState(false)

  // Tracks whether the last input change was a user selecting a suggestion
  // (prevents re-triggering a search after selection)
  const isSelectingRef = useRef(false)
  const isFocusedRef = useRef(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSentValueRef = useRef(value)

  // ── Sync external value changes (e.g. auto-detect location) ─────────────────
  useEffect(() => {
<<<<<<< HEAD
    if (value !== lastSentValueRef.current) {
      setQuery(value)
      lastSentValueRef.current = value
    }
=======
    Promise.resolve().then(() => {
      setQuery(value)
    })
>>>>>>> staging
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

<<<<<<< HEAD
  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
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
      setIsFetching(false)
      abortRef.current?.abort()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      return
    }

    const cacheKey = trimmed.toLowerCase()

    // 1. Instant Cache Check
=======
  // ── Fetch suggestions from backend ──────────────────────────────────────────
  const fetchSuggestions = useCallback(async (searchTerm: string) => {
    // Serve from cache when available
    const cacheKey = searchTerm.toLowerCase()
>>>>>>> staging
    if (queryCache.has(cacheKey)) {
      abortRef.current?.abort()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setIsFetching(false)

      const cached = queryCache.get(cacheKey)!
      setState(
        cached.length > 0
          ? { status: 'success', data: cached }
          : { status: 'empty' }
      )
      setIsOpen(true)
      return
    }

    // 2. Local Instant Search (Show matches instantly as they type)
    const localMatches = LOCAL_CITIES.filter((c) =>
      c.name.toLowerCase().includes(cacheKey)
    ).slice(0, 6)

    if (localMatches.length > 0) {
      setState({ status: 'success', data: localMatches })
      setIsOpen(true)
    } else {
      setState({ status: 'loading' })
      if (isFocusedRef.current) setIsOpen(true)
    }

    // 3. Debounce API call (300ms)
    const timer = setTimeout(() => {
      fetchSuggestions(trimmed)
    }, 300)

    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // ── Fetch suggestions from backend ──────────────────────────────────────────
  const fetchSuggestions = useCallback(async (searchTerm: string) => {
    const cacheKey = searchTerm.toLowerCase()

    // Double check cache in case it got populated during debounce
    if (queryCache.has(cacheKey)) {
      const cached = queryCache.get(cacheKey)!
      setState(
        cached.length > 0
          ? { status: 'success', data: cached }
          : { status: 'empty' }
      )
      setIsOpen(true)
      setIsFetching(false)
      return
    }

    // Cancel any in-flight request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    // Set 5 seconds timeout fallback timer
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      console.warn('[LocationAutocomplete] Request timed out. Showing fallback cities.')
      abortRef.current?.abort()
      setIsFetching(false)
      setState({ status: 'success', data: POPULAR_FALLBACK_CITIES })
      if (isFocusedRef.current) setIsOpen(true)
    }, 5000)

    setIsFetching(true)

    try {
      const res = await tripAPI.getAutocomplete(searchTerm)
      
      // Clear timeout since response is received
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

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
      if (isFocusedRef.current) setIsOpen(true)
    } catch (err: any) {
      if (err?.name === 'AbortError') return // Silently ignore cancelled requests
      console.error('[LocationAutocomplete] fetch error:', err?.message)
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // If API fails, show fallback cities instead of blank screen
      setState({ status: 'success', data: POPULAR_FALLBACK_CITIES })
    } finally {
      setIsFetching(false)
    }
  }, [])

  // ── Debounced search trigger ─────────────────────────────────────────────────
  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false
      return
    }

    const trimmed = query.trim()
    if (trimmed.length < 2) {
      Promise.resolve().then(() => {
        setState({ status: 'idle' })
        setIsOpen(false)
      })
      return
    }

    const timer = setTimeout(() => {
      fetchSuggestions(trimmed)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, fetchSuggestions])

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSelect = (loc: Location) => {
    isSelectingRef.current = true
    setQuery(loc.name)
    lastSentValueRef.current = loc.name
    onChange(loc.name)
    setState({ status: 'idle' })
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    lastSentValueRef.current = val
    onChange(val)
  }

  const handleFocus = () => {
    isFocusedRef.current = true
    if (
      state.status === 'success' ||
      state.status === 'empty' ||
      state.status === 'error'
    ) {
      setIsOpen(true)
    }
  }

  const handleBlur = () => {
    isFocusedRef.current = false
    // Delay closing slightly to allow click on dropdown items to register first
    setTimeout(() => {
      setIsOpen(false)
    }, 200)
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
        onBlur={handleBlur}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        role="combobox"
        suppressHydrationWarning
      />

      {/* Loading spinner inside input */}
      {isFetching && (
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
              <div className="text-2xl mb-1"></div>
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
                    <span style={{ fontSize: '1rem' }}></span>
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

