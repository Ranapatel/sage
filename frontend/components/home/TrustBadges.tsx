'use client'

import { Check } from 'lucide-react'

const BADGES = [
  'Real flight prices',
  'AI itinerary',
  'Free to use',
]

export default function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6">
      {BADGES.map(text => (
        <div key={text} className="flex items-center gap-2 text-sm text-[#64748B]">
          <span className="w-5 h-5 rounded-full bg-[#FFF7ED] flex items-center justify-center shrink-0">
            <Check size={12} className="text-[#EA580C]" strokeWidth={2.5} />
          </span>
          {text}
        </div>
      ))}
    </div>
  )
}
