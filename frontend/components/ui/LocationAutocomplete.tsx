'use client'

import React, { useState, useEffect, useRef } from 'react'
import { tripAPI } from '@/lib/api'

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

// Simple session-level cache
const cache: Record<string, Location[]> = {}

export default function LocationAutocomplete({ value, onChange, placeholder = 'Search location...', className = '' }: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [state, setState] = useState<AutoCompleteState>({ status: 'idle' })
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isSelectingRef = useRef(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setState({ status: 'idle' })
      setIsOpen(false)
      return
    }

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
      setState({ status: data.length > 0 ? 'success' : 'empty', data })
      setIsOpen(true)
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setState({ status: 'loading' })
    setIsOpen(true)

    try {
      const res = await tripAPI.getAutocomplete(searchTerm)
      
      const results = res.data
      console.log('LocationAutocomplete API results:', results);
      
      if (!Array.isArray(results) || results.length === 0) {
        console.log('LocationAutocomplete API returned empty');
        setState({ status: 'empty' })
        cache[searchTerm.toLowerCase()] = []
        return
      }

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
          type: 'city' as const,
        }
      })

      cache[searchTerm.toLowerCase()] = locations
      console.log('Setting status to success, locations:', locations);
      setState({ status: 'success', data: locations })
    } catch (err: any) {
      console.error('LocationAutocomplete API error:', err);
      if (err.name === 'AbortError') return // Ignore aborted fetch errors
      setState({ status: 'error', message: 'Unable to fetch suggestions' })
    }
  }

  const handleSelect = (loc: Location) => {
    isSelectingRef.current = true
    setQuery(loc.name)
    onChange(loc.name)
    setState({ status: 'idle' })
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value)
        }}
        onFocus={() => {
          if (state.status === 'success' || state.status === 'loading' || state.status === 'empty' || state.status === 'error') {
            setIsOpen(true)
          }
        }}
      />
      
      {state.status === 'loading' && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <span className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin inline-block"></span>
        </div>
      )}
      
      {isOpen && state.status !== 'idle' && (
        <div className="absolute left-0 z-[100] min-w-[280px] mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-fade-in">
          
          {state.status === 'loading' && (
            <div className="px-4 py-3 text-sm text-slate-500 text-center flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin inline-block"></span>
              Searching...
            </div>
          )}
          
          {state.status === 'empty' && (
            <div className="px-4 py-4 text-sm text-slate-500 text-center">
              No locations found
            </div>
          )}

          {state.status === 'error' && (
            <div className="px-4 py-4 text-sm text-red-500 text-center">
              {state.message}
            </div>
          )}

          {state.status === 'success' && (
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}
