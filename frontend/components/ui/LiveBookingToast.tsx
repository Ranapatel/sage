'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'

interface BookingEvent {
  message: string
  time: string
}

const SAMPLE_EVENTS: BookingEvent[] = [
  { message: 'A traveler from Mumbai booked a bus to Goa', time: '2m ago' },
  { message: 'A traveler from Delhi booked a flight to Bengaluru', time: '5m ago' },
  { message: 'A traveler from Hyderabad booked a hotel in Ooty', time: '8m ago' },
  { message: 'A traveler from Pune booked a train to Lonavala', time: '12m ago' },
  { message: 'A traveler from Bangalore booked a cab to Mysore', time: '15m ago' },
  { message: 'A traveler from Chennai booked a flight to Bali', time: '18m ago' },
  { message: 'A traveler from Jaipur booked a bus to Udaipur', time: '22m ago' }
]

export default function LiveBookingToast() {
  const [currentEvent, setCurrentEvent] = useState<BookingEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    if (closed) return

    let index = 0
    
    // Initial delay before first toast
    const initialTimer = setTimeout(() => {
      setCurrentEvent(SAMPLE_EVENTS[0])
      setVisible(true)
    }, 3000)

    const cycleInterval = setInterval(() => {
      // Hide current toast
      setVisible(false)
      
      // Load next event and show after fade-out transition concludes
      setTimeout(() => {
        index = (index + 1) % SAMPLE_EVENTS.length
        setCurrentEvent(SAMPLE_EVENTS[index])
        setVisible(true)
      }, 500)

    }, 15000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(cycleInterval)
    }
  }, [closed])

  if (closed || !currentEvent) return null

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 max-w-sm bg-white border border-[#E8E0D8] rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex items-start gap-3 transition-all duration-500 ease-out transform ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-[#EA580C] shrink-0">
        <CheckCircle2 size={16} strokeWidth={2.5} />
      </div>
      
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-xs font-bold text-slate-800 leading-tight">
          {currentEvent.message}
        </p>
        <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 uppercase tracking-wide">
          Verified • {currentEvent.time}
        </span>
      </div>

      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => setClosed(true), 500)
        }}
        className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  )
}
