'use client'

import React, { useEffect, useState } from 'react'
import BusCard from './BusCard'
import BusesSkeleton from './BusesSkeleton'
import BusesEmpty from './BusesEmpty'

interface BusesPanelProps {
  origin?: string
  destination?: string
  date?: string
  passengers?: number
}

type PanelState =
  | { status: 'loading' }
  | { status: 'success'; results: any[]; searchUrl: string }
  | { status: 'empty'; searchUrl: string }
  | { status: 'error'; searchUrl: string; message: string }

export function BusesPanel({
  origin = '',
  destination = '',
  date = '',
  passengers = 1,
}: BusesPanelProps) {
  const [state, setState] = useState<PanelState>(() => {
    if (origin && destination && date) {
      return { status: 'loading' }
    }
    return {
      status: 'empty',
      searchUrl: 'https://www.makemytrip.com/bus-tickets/',
    }
  })

  useEffect(() => {
    let active = true
    async function load() {
      setState({ status: 'loading' })
      try {
        const res = await fetch('/api/transport/buses/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin, destination, travelDate: date, passengers }),
        })
        if (!res.ok) throw new Error('Failed to load buses')
        const data = await res.json()
        
        if (!active) return
        
        if (data.results && data.results.length > 0) {
          setState({
            status: 'success',
            results: data.results,
            searchUrl: data.searchUrl || 'https://www.makemytrip.com/bus-tickets/',
          })
        } else {
          setState({
            status: 'empty',
            searchUrl: data.searchUrl || 'https://www.makemytrip.com/bus-tickets/',
          })
        }
      } catch (err: any) {
        if (!active) return
        setState({
          status: 'error',
          searchUrl: 'https://www.makemytrip.com/bus-tickets/',
          message: err.message || 'Could not load buses.',
        })
      }
    }
    
    if (origin && destination && date) {
      load()
    } else {
      Promise.resolve().then(() => {
        if (active) {
          setState({
            status: 'empty',
            searchUrl: 'https://www.makemytrip.com/bus-tickets/',
          })
        }
      })
    }

    return () => {
      active = false
    }
  }, [origin, destination, date, passengers])

  if (state.status === 'loading') return <BusesSkeleton />

  if (state.status === 'empty' || state.status === 'error') {
    return (
      <BusesEmpty
        searchUrl={state.searchUrl}
        origin={origin}
        destination={destination}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 animate-fade-in">
      <div className="text-xs font-bold text-[var(--text-muted)] mb-1">
        {state.results.length} bus options found · book on MakeMyTrip
      </div>
      {state.results.map((bus: any, idx: number) => (
        <BusCard key={idx} bus={bus} />
      ))}
      <a
        href={state.searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-center font-bold text-xs text-[var(--primary)] hover:underline py-3 block bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:bg-slate-50 transition-colors"
      >
        Book Bus Tickets on MakeMyTrip →
      </a>
    </div>
  )
}

export default BusesPanel
