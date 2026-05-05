'use client'

import React, { useState, useEffect, useRef } from 'react'

export type Location = {
  id: string
  name: string
  city: string
  country: string
  latitude: number
  longitude: number
  iataCode?: string
  type: 'city' | 'airport'
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

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed === value) return // Ignore if it's just the selected value
    if (trimmed.length < 2) {
      setState({ status: 'idle' })
      setIsOpen(false)
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
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const res = await fetch(`${baseURL}/api/places/autocomplete?query=${encodeURIComponent(searchTerm)}`, {
        signal: abortControllerRef.current.signal
      })
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'API error')
      }
      
      const resData = await res.json()
      const results = resData.data || []
      
      if (results.length === 0) {
        setState({ status: 'empty' })
        cache[searchTerm.toLowerCase()] = []
        return
      }

      const locations: Location[] = results.map((r: any) => ({
        id: r.id?.toString() ?? Math.random().toString(36).slice(2),
        name: r.city || r.name || '',
        city: r.city || r.name || '',
        country: r.country || '',
        latitude: r.latitude ?? 0,
        longitude: r.longitude ?? 0,
        iataCode: r.iataCode,
        type: 'city' as const,
      }))

      cache[searchTerm.toLowerCase()] = locations
      setState({ status: 'success', data: locations })
    } catch (err: any) {
      if (err.name === 'AbortError') return // Ignore aborted fetch errors
      setState({ status: 'error', message: 'Unable to fetch suggestions' })
    }
  }

  const handleSelect = (loc: Location) => {
    const parts = [loc.city, loc.country].filter(Boolean)
    const displayValue = parts.join(', ')
    setQuery(displayValue)
    onChange(displayValue)
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
      
      {isOpen && state.status !== 'idle' && state.status !== 'loading' && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-fade-in">
          
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
                  className="px-5 py-3 hover:bg-blue-50 cursor-pointer transition-colors group flex items-center justify-between border-b border-gray-50 last:border-0"
                  onClick={() => handleSelect(loc)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">
                      📍 {loc.city}{loc.country ? `, ${loc.country}` : ''}{loc.iataCode ? ` (${loc.iataCode})` : ''}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-gray-100 text-slate-500 uppercase tracking-widest group-hover:bg-blue-100 group-hover:text-blue-600">
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
