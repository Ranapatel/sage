'use client'

import React, { useState, useEffect, startTransition } from 'react'
import Link from 'next/link'
import { Clock, Flame, ArrowRight, X } from 'lucide-react'
import { isRakhiCampaignActive, getCampaignTimeRemaining } from '@/lib/campaignConfig'

export default function RakhiCampaignBanner() {
  const [active, setActive] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true })

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('rakhi_banner_dismissed') === 'true'
    if (!isDismissed && isRakhiCampaignActive()) {
      startTransition(() => {
        setActive(true)
        setTimeLeft(getCampaignTimeRemaining())
      })
    }

    const timer = setInterval(() => {
      const remaining = getCampaignTimeRemaining()
      setTimeLeft(remaining)
      if (remaining.isExpired) setActive(false)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDismissed(true)
    sessionStorage.setItem('rakhi_banner_dismissed', 'true')
  }

  if (!active || dismissed || timeLeft.isExpired) return null

  return (
    <div className="relative z-40 w-full bg-gradient-to-r from-[#0C0C0F] via-[#1C120B] to-[#0C0C0F] border-b border-[#F59E0B]/30 text-white font-body overflow-hidden shadow-xs">
      {/* Ambient gold glow */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 relative z-10">

        {/* Left: Tag + Headline */}
        <Link href="/raksha-bandhan" className="flex items-center gap-2 sm:gap-3 min-w-0 group cursor-pointer">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EA580C] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm shrink-0">
            <Flame size={12} className="text-yellow-200 animate-pulse" />
            <span>2X RAKHI SPECIAL</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">
            <span className="hidden md:inline">Gift your sibling a trip memory • </span>
            <span className="text-[#F59E0B] font-black">Earn 400 Credits</span>
            <span className="text-slate-400 text-xs hidden sm:inline"> (Aug 23 – 28)</span>
          </p>
        </Link>

        {/* Center / Right: Live Countdown + Action Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Countdown Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono font-bold text-slate-300">
            <Clock size={12} className="text-[#F59E0B]" />
            <span>Ends in:</span>
            <span className="text-white font-black">
              {String(timeLeft.days).padStart(2, '0')}d : {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>

          {/* Send Sibling Gift Button */}
          <Link
            href="/raksha-bandhan"
            className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#EA580C] via-[#F59E0B] to-[#EA580C] hover:opacity-95 text-white font-extrabold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span>Send Sibling Gift 🎀</span>
            <ArrowRight size={13} className="hidden sm:inline" />
          </Link>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
