'use client'

import React, { useEffect, useState } from 'react'
import { TrainCard, TrainResult } from './TrainCard'
import { TrainsEmpty } from './TrainsEmpty'
import { TrainsSkeleton } from './TrainsSkeleton'

interface TrainsPanelProps {
  origin: string
  destination: string
  date: string            // YYYY-MM-DD
  passengers?: number
}

type PanelState =
  | { status: 'loading' }
  | { status: 'success'; results: TrainResult[]; searchUrl: string }
  | { status: 'empty'; searchUrl: string }
  | { status: 'error'; searchUrl: string; message: string }

export function TrainsPanel({
  origin,
  destination,
  date,
  passengers = 1,
}: TrainsPanelProps) {
  const [state, setState] = useState<PanelState>({ status: 'loading' })

  useEffect(() => {
    let active = true
    async function load() {
      setState({ status: 'loading' })
      try {
        const res = await fetch('/api/transport/trains/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin, destination, travelDate: date, passengers }),
        })
        if (!res.ok) throw new Error('Failed to load trains')
        const data = await res.json()
        
        if (!active) return
        
        if (data.results && data.results.length > 0) {
          setState({
            status: 'success',
            results: data.results,
            searchUrl: data.searchUrl || 'https://www.makemytrip.com/railways/',
          })
        } else {
          setState({
            status: 'empty',
            searchUrl: data.searchUrl || 'https://www.makemytrip.com/railways/',
          })
        }
      } catch (err: any) {
        if (!active) return
        setState({
          status: 'error',
          searchUrl: 'https://www.makemytrip.com/railways/',
          message: err.message || 'Could not load trains.',
        })
      }
    }
    
    if (origin && destination && date) {
      load()
    } else {
      setState({
        status: 'empty',
        searchUrl: 'https://www.makemytrip.com/railways/',
      })
    }

    return () => {
      active = false
    }
  }, [origin, destination, date, passengers])

  if (state.status === 'loading') return <TrainsSkeleton />

  if (state.status === 'empty' || state.status === 'error') {
    return (
      <TrainsEmpty
        searchUrl={state.searchUrl}
        origin={origin}
        destination={destination}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 animate-fade-in">
      <div className="text-xs font-bold text-[var(--text-muted)] mb-1">
        {state.results.length} trains found · data via ERAIL · book on MakeMyTrip
      </div>
      {state.results.map((train) => (
        <TrainCard key={train.trainNumber} train={train} />
      ))}
      <a
        href={state.searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-center font-bold text-xs text-[var(--primary)] hover:underline py-3 block bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:bg-slate-50 transition-colors"
      >
        View all trains on MakeMyTrip →
      </a>
    </div>
  )
}

export default TrainsPanel
