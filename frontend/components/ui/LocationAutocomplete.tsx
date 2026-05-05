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
        <div
          className="absolute z-[9999] w-full mt-1 rounded-lg shadow-2xl overflow-hidden bg-slate-900 backdrop-blur-xl"
          style={{
            border: '1px solid rgba(0, 194, 124, 0.4)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,194,124,0.15)',
          }}
        >
          
          {state.status === 'loading' && (
            <div className="px-4 py-3 text-sm text-[var(--text-muted)] text-center flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin inline-block"></span>
              Searching...
            </div>
          )}
          
          {state.status === 'empty' && (
            <div className="px-4 py-3 text-sm text-[var(--text-muted)] text-center">
              No results found
            </div>
          )}

          {state.status === 'error' && (
            <div className="px-4 py-3 text-sm text-red-400 text-center">
              {state.message}
            </div>
          )}

          {state.status === 'success' && state.data.map((loc) => (
            <div
              key={loc.id}
              style={{ borderBottom: '1px solid rgba(0,194,124,0.08)' }}
              className="px-4 py-2.5 hover:bg-emerald-600/40 cursor-pointer transition-colors group flex items-center justify-between last:border-b-0"
              onMouseDown={(e) => e.preventDefault()} // prevent blur before click
              onClick={() => handleSelect(loc)}
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-white">
                  📍 {loc.name}
                </span>
              </div>
              <span className="text-[0.65rem] px-2 py-0.5 rounded-md bg-[rgba(0,194,124,0.12)] text-[var(--primary)] group-hover:bg-white/20 group-hover:text-white uppercase tracking-wider font-mono">
                city
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
