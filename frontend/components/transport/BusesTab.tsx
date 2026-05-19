'use client'

import React, { memo } from 'react'
import { useTripStore } from '@/store/tripStore'
import Image from 'next/image'
import { trackEvent } from '@/lib/analytics'

function BusesTab() {
  const { buses, loading, tripContext } = useTripStore()

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-32 bg-[var(--border)] rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!buses || buses.length === 0) return null

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Available Buses</h3>
        <span className="text-sm font-semibold text-[var(--text-muted)]">{buses.length} options</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buses.map((bus: any) => (
          <div key={bus.id} className="card p-4 hover:shadow-lg transition-all border border-[var(--border)] hover:border-[var(--primary)] flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-[var(--text-primary)]">{bus.name}</h4>
                <p className="text-xs text-[var(--text-muted)]">{bus.type || bus.busType}</p>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-lg text-[var(--text-primary)]">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(bus.price)}
                </div>
                {bus.liveStatus && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    bus.liveStatus.toLowerCase().includes('filling') 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {bus.liveStatus}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6 bg-slate-50/50 p-3 rounded-lg flex-1">
              <div className="text-center">
                <div className="font-bold text-[var(--text-primary)]">{bus.departure}</div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Depart</div>
              </div>
              <div className="flex-1 flex items-center justify-center relative px-2">
                <div className="h-px bg-slate-300 w-full"></div>
                <div className="absolute bg-white px-2 text-xs font-semibold text-slate-400">{bus.duration}</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-[var(--text-primary)]">{bus.arrival}</div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Arrive</div>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-[var(--border)]">
              <a
                href={bus.bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('booking_click', { type: 'bus', operator: bus.name })}
                className="w-full text-center block py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 transition-opacity shadow-md"
              >
                Book on redBus →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(BusesTab)
