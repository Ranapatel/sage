'use client'

import { useState } from 'react'
import BusCard from './BusCard'
import { useTripStore } from '@/store/tripStore'

export default function BusesTab() {
  const { buses, loading } = useTripStore()
  const [sortBy, setSortBy] = useState('cheapest')

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-[var(--border)] rounded-xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (!buses || buses.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        <div className="text-4xl mb-4">🚌</div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No buses available right now</h3>
        <p>Try adjusting your search criteria or dates.</p>
      </div>
    )
  }

  let displayedBuses = [...buses]

  if (sortBy === 'cheapest') {
    displayedBuses.sort((a, b) => a.price - b.price)
  } else if (sortBy === 'fastest') {
    // Basic duration sort (assumes format "Xh Ym")
    displayedBuses.sort((a, b) => {
      const aMin = parseInt(a.duration.split('h')[0] || '0') * 60 + parseInt(a.duration.split(' ')[1]?.replace('m', '') || '0')
      const bMin = parseInt(b.duration.split('h')[0] || '0') * 60 + parseInt(b.duration.split(' ')[1]?.replace('m', '') || '0')
      return aMin - bMin
    })
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border)]">
        <div className="flex gap-2">
           <span className="text-sm text-[var(--text-muted)] font-medium self-center mr-2">Sort by:</span>
           <button 
             onClick={() => setSortBy('cheapest')}
             className={`px-3 py-1 text-xs rounded-full transition-colors ${sortBy === 'cheapest' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--border)]'}`}
           >
             Cheapest First
           </button>
           <button 
             onClick={() => setSortBy('fastest')}
             className={`px-3 py-1 text-xs rounded-full transition-colors ${sortBy === 'fastest' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--border)]'}`}
           >
             Fastest Route
           </button>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedBuses.map((bus, idx) => (
          <BusCard key={bus.id || idx} item={bus} />
        ))}
      </div>
    </div>
  )
}
