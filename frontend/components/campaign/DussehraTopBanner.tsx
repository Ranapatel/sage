'use client'

import React, { useState, useEffect, startTransition } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, X } from 'lucide-react'
import { getCampaignStatus, getContextualCopy } from '@/lib/dussehraConfig'

export default function DussehraTopBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem('dussehra_banner_dismissed') === 'true'
      if (!isDismissed && getCampaignStatus() !== 'post_festival') {
        startTransition(() => {
          setVisible(true)
        })
      }
    } catch {
      startTransition(() => {
        setVisible(true)
      })
    }
  }, [])

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setVisible(false)
    try {
      sessionStorage.setItem('dussehra_banner_dismissed', 'true')
    } catch {}
  }

  if (!visible) return null

  const copy = getContextualCopy(getCampaignStatus())

  return (
    <div className="relative z-40 w-full bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#C2410C] text-white font-body overflow-hidden shadow-xs border-b border-orange-400/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2 sm:gap-4 relative z-10 text-xs sm:text-sm">
        
        {/* Banner Clickable Area */}
        <Link
          href="/dussehra"
          className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 group cursor-pointer"
        >
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[#EA580C] text-[10px] font-black uppercase tracking-wider shrink-0 shadow-2xs">
            <Sparkles size={11} className="text-[#EA580C]" />
            <span>FESTIVE EVENT</span>
          </div>

          <p className="font-bold text-white truncate group-hover:text-orange-100 transition-colors">
            <span className="font-extrabold">The Great Dussehra Escape:</span>{' '}
            <span className="hidden sm:inline font-medium text-orange-50">
              Burn your boring plans. Plan your next adventure.
            </span>
          </p>
        </Link>

        {/* CTA + Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dussehra"
            className="hidden xs:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#EA580C] font-extrabold text-[11px] transition-all shrink-0 active:scale-95"
          >
            <span>Explore Event</span>
            <ArrowRight size={12} strokeWidth={2.4} />
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss Dussehra banner"
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-black/10 transition-colors"
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

      </div>
    </div>
  )
}
