'use client'

import React, { memo } from 'react'
import { useTripStore } from '@/store/tripStore'
import { Bus, Shield } from 'lucide-react'
import BookingButton from '../BookingButton'

function BusesTab() {
  const { buses, busSearchUrl, loading, tripContext } = useTripStore()

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-32 bg-[var(--border)] rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!buses || buses.length === 0) {
    const fallbackUrl = busSearchUrl || "https://www.makemytrip.com/bus-tickets/";
    return (
      <div className="space-y-6">
        {/* Branded Header */}
        <div className="glass rounded-2xl border border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-red-500 flex items-center justify-center shadow-md shadow-blue-600/20">
                    <Bus size={18} className="text-white" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                    Bus Bookings
                  </h3>
                </div>
                <p className="text-xs font-bold text-blue-700/80 mt-2 flex items-center gap-1.5">
                  <Shield size={11} className="text-blue-600" />
                  Routed via MakeMyTrip
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Live routes &bull; Instant availability &bull; Official Deep Links
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prominent MMT Card */}
        <div className="glass p-8 border border-slate-200/60 rounded-2xl bg-white shadow-md text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-600">
            <Bus size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-black text-slate-800">Book Buses on MakeMyTrip</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              We have generated a direct listing search for your route from <span className="font-extrabold text-slate-700">{tripContext.startLocation || 'your origin'}</span> to <span className="font-extrabold text-slate-700">{tripContext.destination || 'your destination'}</span> on MakeMyTrip.
            </p>
          </div>
          <div className="max-w-xs mx-auto">
            <BookingButton
              label="Book on MakeMyTrip"
              icon="bus"
              url={fallbackUrl}
              provider="makemytrip"
            />
          </div>
        </div>
      </div>
    )
  }

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
              <BookingButton
                label="Book on MakeMyTrip"
                icon="bus"
                url={bus.bookingLink || busSearchUrl || ''}
                provider="makemytrip"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(BusesTab)
