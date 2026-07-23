'use client'

import { Plane } from 'lucide-react'

interface Props {
  tripContext: any
}

export default function ReturnBookingTab({ tripContext }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title text-xl">Return Journey</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {tripContext.destination} → {tripContext.startLocation || 'Home'}
            {tripContext.endDate && ` · ${tripContext.endDate}`}
          </p>
        </div>
      </div>

      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-12 flex flex-col items-center gap-4 text-center my-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100/80 border border-amber-300/60 flex items-center justify-center text-amber-700">
          <Plane size={26} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[17px] font-bold text-slate-800 mb-1.5">Return Journey Flights</p>
          <p className="text-[14px] text-slate-600 leading-relaxed max-w-md">
            Select your outbound flight first to auto-apply return flight discounts.
          </p>
        </div>
      </div>
    </div>
  )
}
