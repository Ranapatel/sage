'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Plane, Sparkles, TrendingUp } from 'lucide-react'
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
const LOCAL_CITIES_RAW = [
  { name: 'Hyderabad, India', type: 'city' as const, aliases: [] as string[] },
  { name: 'Mumbai, India', type: 'city' as const, aliases: [] as string[] },
  { name: 'Delhi, India', type: 'city' as const, aliases: [] as string[] },
  { name: 'Bengaluru, India', type: 'city' as const, aliases: ['bangalore'] },
  { name: 'Chennai, India', type: 'city' as const, aliases: ['madras'] },
  { name: 'Kolkata, India', type: 'city' as const, aliases: ['calcutta'] },
  { name: 'Pune, India', type: 'city' as const, aliases: [] as string[] },
  { name: 'Goa, India', type: 'city' as const, aliases: [] as string[] },
  { name: 'Jaipur, India', type: 'city' as const, aliases: ['rajasthan'] },
  { name: 'Kochi, India', type: 'city' as const, aliases: ['kerala', 'keral', 'cochin'] },
  { name: 'Agra, India', type: 'city' as const, aliases: [] as string[] },
  { name: 'Varanasi, India', type: 'city' as const, aliases: ['banaras', 'benaras', 'kashi'] },
  { name: 'Udaipur, India', type: 'city' as const, aliases: [] as string[] },
  { name: 'Manali, India', type: 'city' as const, aliases: ['himachal'] },
  { name: 'Shimla, India', type: 'city' as const, aliases: [] as string[] },
  { name: 'Srinagar, India', type: 'city' as const, aliases: ['kashmir'] },
  { name: 'Leh, India', type: 'city' as const, aliases: ['ladakh', 'leh ladakh'] },
  { name: 'Gangtok, India', type: 'city' as const, aliases: ['sikkim'] },
  { name: 'Pondicherry, India', type: 'city' as const, aliases: ['puducherry'] },
  { name: 'Ahmedabad, India', type: 'city' as const, aliases: ['gujarat'] },
  { name: 'Thiruvananthapuram, India', type: 'city' as const, aliases: ['trivandrum'] },
  { name: 'Guwahati, India', type: 'city' as const, aliases: ['assam'] },
  { name: 'Bali, Indonesia', type: 'city' as const, aliases: [] as string[] },
  { name: 'Bangkok, Thailand', type: 'city' as const, aliases: [] as string[] },
  { name: 'Phuket, Thailand', type: 'city' as const, aliases: [] as string[] },
  { name: 'Singapore', type: 'city' as const, aliases: [] as string[] },
  { name: 'Kuala Lumpur, Malaysia', type: 'city' as const, aliases: [] as string[] },
  { name: 'Dubai, UAE', type: 'city' as const, aliases: [] as string[] },
  { name: 'Abu Dhabi, UAE', type: 'city' as const, aliases: [] as string[] },
  { name: 'London, United Kingdom', type: 'city' as const, aliases: [] as string[] },
  { name: 'Paris, France', type: 'city' as const, aliases: [] as string[] },
  { name: 'Barcelona, Spain', type: 'city' as const, aliases: [] as string[] },
  { name: 'Rome, Italy', type: 'city' as const, aliases: [] as string[] },
  { name: 'Amsterdam, Netherlands', type: 'city' as const, aliases: [] as string[] },
  { name: 'New York, USA', type: 'city' as const, aliases: [] as string[] },
  { name: 'Los Angeles, USA', type: 'city' as const, aliases: [] as string[] },
  { name: 'Tokyo, Japan', type: 'city' as const, aliases: [] as string[] },
  { name: 'Seoul, South Korea', type: 'city' as const, aliases: [] as string[] },
  { name: 'Sydney, Australia', type: 'city' as const, aliases: [] as string[] },
  { name: 'Melbourne, Australia', type: 'city' as const, aliases: [] as string[] },
  { name: 'Maldives', type: 'city' as const, aliases: [] as string[] },
  { name: 'Colombo, Sri Lanka', type: 'city' as const, aliases: [] as string[] },
  { name: 'Kathmandu, Nepal', type: 'city' as const, aliases: [] as string[] },
  { name: 'Hong Kong, China', type: 'city' as const, aliases: [] as string[] },
  { name: 'Istanbul, Turkey', type: 'city' as const, aliases: [] as string[] },
  { name: 'Cairo, Egypt', type: 'city' as const, aliases: [] as string[] },
  { name: 'Cape Town, South Africa', type: 'city' as const, aliases: [] as string[] },
  { name: 'Nairobi, Kenya', type: 'city' as const, aliases: [] as string[] },
  { name: 'Toronto, Canada', type: 'city' as const, aliases: [] as string[] },
  { name: 'Vancouver, Canada', type: 'city' as const, aliases: [] as string[] },
]

const LOCAL_CITIES = LOCAL_CITIES_RAW.map((c, i) => ({
  id: `local_${i}`,
  name: c.name,
  type: c.type,
  aliases: c.aliases,
}))

// ── Session-level cache — avoids redundant network requests ───────────────────
const queryCache = new Map<string, Location[]>()
// Throttle network-error logging so we only warn once per failure session
let networkErrorLogged = false

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
  // KEY FIX: dropdown must NEVER open until user actively types into this field
  const hasUserInteractedRef = useRef(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSentValueRef = useRef(value)

  // Sync external value changes (e.g. sessionStorage pre-fill on plan page)
  // Only updates the text — never triggers the dropdown
  useEffect(() => {
    if (value !== lastSentValueRef.current) {
      setQuery(value)
      lastSentValueRef.current = value
      // Reset so a programmatic value change never opens the dropdown
      hasUserInteractedRef.current = false
    }
  }, [value])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        isFocusedRef.current = false
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

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
      if (isFocusedRef.current && hasUserInteractedRef.current) setIsOpen(true)
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
      setState({ status: 'success', data: LOCAL_CITIES.slice(0, 6) })
      if (isFocusedRef.current && hasUserInteractedRef.current) setIsOpen(true)
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

      const locations: Location[] = results
        .map((r: any) => {
          let displayName = ''

          if (r.city && r.country) {
            displayName = `${r.city}, ${r.country}`
          } else if (r.name && r.country) {
            displayName = `${r.name}, ${r.country}`
          } else if (r.displayName) {
            const parts: string[] = r.displayName.split(',')
            displayName =
              parts.length > 1
                ? `${parts[0].trim()}, ${parts[parts.length - 1].trim()}`
                : r.displayName
          } else {
            displayName = r.name || r.city || 'Unknown'
          }

          return {
            id: r.id ?? r.place_id ?? Math.random().toString(36).slice(2),
            name: displayName,
            type: 'city' as const,
          }
        })

      queryCache.set(cacheKey, locations)
      networkErrorLogged = false // Reset on success
      setState({ status: 'success', data: locations })
      if (isFocusedRef.current && hasUserInteractedRef.current) setIsOpen(true)
    } catch (err: any) {
      if (err?.name === 'AbortError') return // Silently ignore cancelled requests
      // Throttle: only log once per failure session to avoid console spam
      if (!networkErrorLogged) {
        networkErrorLogged = true
        console.warn('[LocationAutocomplete] Backend unavailable — using fallback cities.')
      }
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // If API fails and user is still interacting, show fallback cities
      if (isFocusedRef.current && hasUserInteractedRef.current) {
        setState({ status: 'success', data: LOCAL_CITIES.slice(0, 6) })
        setIsOpen(true)
      }
    } finally {
      setIsFetching(false)
    }
  }, [])

  // ── Debounced search trigger ─────────────────────────────────────────────────
  useEffect(() => {
    // Skip search if user just selected from dropdown
    if (isSelectingRef.current) {
      isSelectingRef.current = false
      return
    }

    // CRITICAL: never search or open dropdown unless user actively typed
    if (!hasUserInteractedRef.current || !isFocusedRef.current) return

    const trimmed = query.trim()
    if (trimmed.length < 2) {
      Promise.resolve().then(() => {
        setState({ status: 'idle' })
        setIsOpen(false)
        setIsFetching(false)
      })
      abortRef.current?.abort()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      return
    }

    const cacheKey = trimmed.toLowerCase()

    // 1. Instant Cache Check
    if (queryCache.has(cacheKey)) {
      abortRef.current?.abort()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setIsFetching(false)

      const cached = queryCache.get(cacheKey)!
      Promise.resolve().then(() => {
        setState(
          cached.length > 0
            ? { status: 'success', data: cached }
            : { status: 'empty' }
        )
        setIsOpen(true)
      })
      return
    }

    // 2. Local Instant Search (Show matches instantly as they type — also checks aliases)
    const localMatches = LOCAL_CITIES.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(cacheKey)
      const aliasMatch = c.aliases.some(a => a.includes(cacheKey) || cacheKey.includes(a))
      return nameMatch || aliasMatch
    }).slice(0, 6)

    Promise.resolve().then(() => {
      if (localMatches.length > 0) {
        setState({ status: 'success', data: localMatches })
        setIsOpen(true)
      } else {
        setState({ status: 'loading' })
        setIsOpen(true)
      }
    })

    // 3. Debounce API call (300ms)
    const timer = setTimeout(() => {
      fetchSuggestions(trimmed)
    }, 300)

    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])


  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSelect = (loc: Location) => {
    isSelectingRef.current = true
    hasUserInteractedRef.current = false
    setQuery(loc.name)
    lastSentValueRef.current = loc.name
    onChange(loc.name)
    setState({ status: 'idle' })
    setIsOpen(false)
    isFocusedRef.current = false
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    // Every keystroke marks this as a user-initiated interaction
    hasUserInteractedRef.current = true
    setQuery(val)
    lastSentValueRef.current = val
    onChange(val)
  }

  const handleFocus = () => {
    isFocusedRef.current = true
    // Only reopen if the user has previously typed AND results exist
    // Never open on focus alone (e.g. page load with pre-filled values)
    if (
      hasUserInteractedRef.current &&
      state.status === 'success' &&
      (state as any).data?.length > 0
    ) {
      setIsOpen(true)
    }
  }

  const handleBlur = () => {
    isFocusedRef.current = false
    // Delay closing to allow dropdown item clicks to register first
    setTimeout(() => {
      if (!isFocusedRef.current) {
        setIsOpen(false)
      }
    }, 200)
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="relative" ref={wrapperRef} suppressHydrationWarning>
      {/* Text input */}
      <input
        type="text"
        className={`${className} !bg-white text-[#111827] placeholder-[#9CA3AF] placeholder:text-[#9CA3AF]`}
        style={{ backgroundColor: '#FFFFFF', color: '#111827' }}
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
          <span className="w-4 h-4 border-2 border-[#EA580C] border-t-transparent rounded-full animate-spin inline-block" />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && state.status !== 'idle' && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-[999] w-full min-w-[280px] mt-2 rounded-[20px] border border-[#E8E0D8] bg-white/98 backdrop-blur-xl p-2 shadow-[0_12px_36px_rgba(0,0,0,0.12)] text-left transition-all animate-fade-in"
        >
          {/* Searching state */}
          {state.status === 'loading' && (
            <div className="px-4 py-4 text-xs font-semibold text-[#6B6B6B] text-center flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-[#EA580C] border-t-transparent rounded-full animate-spin inline-block" />
              <span>Searching top destinations...</span>
            </div>
          )}

          {/* No results */}
          {state.status === 'empty' && (
            <div className="px-4 py-5 text-xs font-semibold text-[#6B6B6B] text-center">
              No places found matching &ldquo;<span className="text-[#1A1A1A] font-bold">{query}</span>&rdquo;
            </div>
          )}

          {/* Error */}
          {state.status === 'error' && (
            <div className="px-4 py-3 text-xs font-bold text-rose-500 text-center">
              {state.message}
            </div>
          )}

          {/* Results list */}
          {state.status === 'success' && (
            <div className="max-h-[300px] overflow-y-auto hide-scrollbar space-y-1">
              <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#A1A1AA] flex items-center justify-between border-b border-[#E8E0D8]/60 mb-1">
                <span className="flex items-center gap-1.5 text-[#EA580C]">
                  <Sparkles size={12} strokeWidth={2.5} />
                  Suggested Destinations
                </span>
                <span className="text-[9px] font-bold text-[#A1A1AA]">{state.data.length} Cities</span>
              </div>

              {state.data.map((loc) => {
                const parts = loc.name.split(',')
                const city = parts[0]?.trim() || loc.name
                const country = parts.slice(1).join(',').trim() || 'India'
                const isInternational = country && !country.toLowerCase().includes('india')

                return (
                  <div
                    key={loc.id}
                    role="option"
                    aria-selected={false}
                    className="p-2.5 cursor-pointer flex items-center justify-between rounded-xl bg-white hover:bg-[#FFF4EE]/70 hover:border-[#FED7AA] border border-transparent transition-all duration-150 group"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(loc)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FFF4EE] group-hover:bg-[#EA580C] text-[#EA580C] group-hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-2xs">
                        {isInternational ? <Plane size={15} strokeWidth={2.2} /> : <MapPin size={15} strokeWidth={2.2} />}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-extrabold text-[#1A1A1A] group-hover:text-[#EA580C] transition-colors leading-tight">
                          {city}
                        </div>
                        <div className="text-[11px] font-semibold text-[#6B6B6B]">
                          {country}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

