'use client'

<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react'
import { tripAPI } from '@/lib/api'
=======
import React, { useState, useEffect, useRef, useCallback } from 'react'
>>>>>>> 1f08c79 (fix: improve landing page UI and integrate backend functionality)

export type Location = {
  id: string
  name: string
<<<<<<< HEAD
  type: 'city'
=======
  city: string
  country: string
  latitude?: number
  longitude?: number
  iataCode?: string
  displayName?: string   // full description e.g. "Goa, India"
  description?: string   // from Google Places
  type: 'city' | 'airport'
>>>>>>> 1f08c79 (fix: improve landing page UI and integrate backend functionality)
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

// Session-level cache to avoid refetching same queries
const cache: Record<string, Location[]> = {}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Search location...',
  className = '',
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [state, setState] = useState<AutoCompleteState>({ status: 'idle' })
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(false) // flag: user picked a suggestion
  const wrapperRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Sync external value changes (e.g. auto-detect)
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

<<<<<<< HEAD
  const isSelectingRef = useRef(false)

=======
  // Debounced fetch whenever query changes (and user didn't just select)
>>>>>>> 1f08c79 (fix: improve landing page UI and integrate backend functionality)
  useEffect(() => {
    if (selected) { setSelected(false); return }
    const trimmed = query.trim()
<<<<<<< HEAD
=======

>>>>>>> 1f08c79 (fix: improve landing page UI and integrate backend functionality)
    if (trimmed.length < 2) {
      setState({ status: 'idle' })
      setIsOpen(false)
      return
    }

<<<<<<< HEAD
    if (isSelectingRef.current) {
      isSelectingRef.current = false
      return
    }

    const timer = setTimeout(() => {
      fetchSuggestions(trimmed)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const fetchSuggestions = async (searchTerm: string) => {
    if (cache[searchTerm.toLowerCase()]) {
      const data = cache[searchTerm.toLowerCase()]
=======
    // Check cache immediately
    const cacheKey = trimmed.toLowerCase()
    if (cache[cacheKey]) {
      const data = cache[cacheKey]
>>>>>>> 1f08c79 (fix: improve landing page UI and integrate backend functionality)
      setState({ status: data.length > 0 ? 'success' : 'empty', data })
      setIsOpen(true)
      return
    }

    const timer = setTimeout(() => fetchSuggestions(trimmed), 250)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const fetchSuggestions = async (searchTerm: string) => {
    // Abort any in-flight request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setState({ status: 'loading' })
    setIsOpen(true)

    try {
<<<<<<< HEAD
      const res = await tripAPI.getAutocomplete(searchTerm)
      
      const results = res.data
      console.log('LocationAutocomplete API results:', results);
      
      if (!Array.isArray(results) || results.length === 0) {
        console.log('LocationAutocomplete API returned empty');
=======
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const res = await fetch(
        `${baseURL}/api/places/autocomplete?query=${encodeURIComponent(searchTerm)}`,
        { signal: abortRef.current.signal }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const resData = await res.json()
      const raw = resData.data || []

      if (raw.length === 0) {
>>>>>>> 1f08c79 (fix: improve landing page UI and integrate backend functionality)
        setState({ status: 'empty' })
        cache[searchTerm.toLowerCase()] = []
        return
      }

<<<<<<< HEAD
      const locations: Location[] = results.map((r: any) => {
        let displayName = '';
        if (typeof r === 'string') {
          displayName = r;
        } else if (r.city && r.country) {
          displayName = `${r.city}${r.state && r.state !== r.city ? `, ${r.state}` : ''}, ${r.country}`;
        } else if (r.name && r.country) {
          displayName = `${r.name}${r.state && r.state !== r.name ? `, ${r.state}` : ''}, ${r.country}`;
        } else if (r.description) {
          displayName = r.description;
        } else if (r.displayName) {
          const parts = r.displayName.split(',');
          // If the raw display name is very long, try to just take the first and last parts (Name, ..., Country)
          if (parts.length > 3) {
            displayName = `${parts[0].trim()}, ${parts[parts.length - 1].trim()}`;
          } else {
            displayName = r.displayName;
          }
        } else {
          displayName = r.city || r.name || r.formatted_address || (Object.values(r).find(v => typeof v === 'string') as string) || 'Unknown Location';
        }

        return {
          id: r.id || r.place_id || Math.random().toString(36).slice(2),
          name: displayName,
=======
      const locations: Location[] = raw.map((r: any, i: number) => {
        // Build the best display name: prefer Google's full description
        const fullName =
          r.description ||          // Google Places full: "Goa, India"
          r.displayName ||           // backend alias
          [r.city || r.name, r.country].filter(Boolean).join(', ')

        return {
          id: r.id?.toString() ?? `loc_${i}`,
          name: r.city || r.name || fullName.split(',')[0] || '',
          city: r.city || r.name || fullName.split(',')[0] || '',
          country: r.country || fullName.split(',').slice(-1)[0]?.trim() || '',
          latitude: r.latitude ?? 0,
          longitude: r.longitude ?? 0,
          iataCode: r.iataCode,
          displayName: fullName,
          description: r.description,
>>>>>>> 1f08c79 (fix: improve landing page UI and integrate backend functionality)
          type: 'city' as const,
        }
      })

      cache[searchTerm.toLowerCase()] = locations
      console.log('Setting status to success, locations:', locations);
      setState({ status: 'success', data: locations })
    } catch (err: any) {
<<<<<<< HEAD
      console.error('LocationAutocomplete API error:', err);
      if (err.name === 'AbortError') return // Ignore aborted fetch errors
=======
      if (err.name === 'AbortError') return
>>>>>>> 1f08c79 (fix: improve landing page UI and integrate backend functionality)
      setState({ status: 'error', message: 'Unable to fetch suggestions' })
    }
  }

  const handleSelect = (loc: Location) => {
<<<<<<< HEAD
    isSelectingRef.current = true
    setQuery(loc.name)
    onChange(loc.name)
=======
    // Use the full accurate description (e.g. "Goa, India") as the input value
    const displayValue = loc.displayName || [loc.city, loc.country].filter(Boolean).join(', ')
    setSelected(true)
    setQuery(displayValue)
    onChange(displayValue)
>>>>>>> 1f08c79 (fix: improve landing page UI and integrate backend functionality)
    setState({ status: 'idle' })
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    onChange(val)
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        value={query}
        autoComplete="off"
        spellCheck={false}
        onChange={handleInputChange}
        onFocus={() => {
          if (state.status === 'success' || state.status === 'empty' || state.status === 'error') {
            setIsOpen(true)
          }
        }}
      />

      {/* Spinner inside input */}
      {state.status === 'loading' && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <span className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin inline-block" />
        </div>
      )}
<<<<<<< HEAD
      
      {isOpen && state.status !== 'idle' && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-fade-in">
          
          {state.status === 'loading' && (
            <div className="px-4 py-3 text-sm text-slate-500 text-center flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin inline-block"></span>
              Searching...
            </div>
          )}
          
=======

      {/* Dropdown */}
      {isOpen && state.status !== 'idle' && state.status !== 'loading' && (
        <div className="absolute z-[9999] w-full mt-1.5 overflow-hidden rounded-2xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(15,20,35,0.97) 0%, rgba(20,28,50,0.97) 100%)',
            border: '1px solid rgba(99,179,237,0.18)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(99,179,237,0.08)',
          }}>

>>>>>>> 1f08c79 (fix: improve landing page UI and integrate backend functionality)
          {state.status === 'empty' && (
            <div className="px-4 py-5 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              <div className="text-2xl mb-1">🔍</div>
              No locations found for &ldquo;{query}&rdquo;
            </div>
          )}

          {state.status === 'error' && (
            <div className="px-4 py-4 text-sm text-center text-red-400">
              {state.message}
            </div>
          )}

          {state.status === 'success' && (
<<<<<<< HEAD
            <div className="max-h-[300px] overflow-y-auto">
              {state.data.map((loc) => (
                <div
                  key={loc.id}
                  className="px-5 py-3 hover:bg-orange-50 cursor-pointer transition-colors group flex items-center justify-between border-b border-gray-50 last:border-0"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(loc)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                      📍 {loc.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-gray-100 text-slate-500 uppercase tracking-widest group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                    City
                  </span>
                </div>
              ))}
=======
            <div className="max-h-[280px] overflow-y-auto">
              {/* Header */}
              <div className="px-4 pt-3 pb-1.5 flex items-center gap-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-[0.6rem] font-bold uppercase tracking-widest"
                  style={{ color: '#60a5fa' }}>Suggested Destinations</span>
              </div>
              {state.data.map((loc, idx) => {
                const mainLabel = loc.displayName || [loc.city, loc.country].filter(Boolean).join(', ')
                const city = loc.city || mainLabel.split(',')[0]
                const country = mainLabel.includes(',') ? mainLabel.split(',').slice(1).join(',').trim() : ''
                return (
                  <div
                    key={loc.id}
                    className="group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150"
                    style={{
                      borderBottom: idx < state.data.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelect(loc)
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,179,237,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Pin icon */}
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ background: 'rgba(var(--primary-rgb, 0,194,124),0.15)', color: 'var(--primary)' }}>
                      📍
                    </div>
                    {/* Labels */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-semibold truncate transition-colors"
                        style={{ color: '#ffffff' }}>
                        {city}
                      </span>
                      {country && (
                        <span className="text-[0.7rem] truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>
                          {country}
                        </span>
                      )}
                    </div>
                    {/* City badge */}
                    <span className="flex-shrink-0 text-[0.6rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition-all"
                      style={{ background: 'rgba(99,179,237,0.12)', color: '#63b3ed' }}>
                      City
                    </span>
                  </div>
                )
              })}
>>>>>>> 1f08c79 (fix: improve landing page UI and integrate backend functionality)
            </div>
          )}
        </div>
      )}
    </div>
  )
}
