'use client'

import React from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { getContextualCopy, getCampaignStatus } from '@/lib/dussehraConfig'

interface Props {
  onPlanTripClick?: () => void
}

export default function DussehraBanner({ onPlanTripClick }: Props) {
  const status = getCampaignStatus()
  const copy = getContextualCopy(status)

  return (
    <section className="py-8 px-4 sm:px-6 max-w-6xl mx-auto my-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#C2410C] text-white p-8 sm:p-12 md:p-14 shadow-2xl border border-orange-400/30">
        
        {/* Subtle Decorative Bow & Arrow Vector Motif (Lord Rama Silhouette) */}
        <div className="absolute -left-6 bottom-0 top-0 w-64 md:w-80 opacity-20 pointer-events-none flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full text-white fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Elegant silhouette archer drawing bow */}
            <path d="M40,160 C50,140 60,110 55,90 C50,70 60,50 80,45 C75,55 75,70 85,85 C95,100 85,120 70,140 Z" opacity="0.6"/>
            {/* The Bow */}
            <path d="M85,30 C120,60 130,110 90,165" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <line x1="85" y1="30" x2="90" y2="165" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
            {/* The Arrow */}
            <line x1="60" y1="100" x2="165" y2="100" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            <polygon points="165,100 150,94 154,100 150,106" fill="currentColor"/>
          </svg>
        </div>

        {/* Temple & Mountain Silhouettes along bottom */}
        <div className="absolute right-0 bottom-0 w-80 md:w-96 opacity-15 pointer-events-none">
          <svg viewBox="0 0 300 100" className="w-full h-full text-white fill-current" xmlns="http://www.w3.org/2000/svg">
            <polygon points="200,100 220,50 240,100" />
            <polygon points="230,100 250,30 270,100" />
            <polygon points="260,100 275,60 290,100" />
            <circle cx="250" cy="25" r="4" />
          </svg>
        </div>

        {/* Right side floating tagline */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 text-right opacity-80 pointer-events-none">
          <p className="font-display font-black text-2xl tracking-tighter text-orange-100/90 leading-tight">
            New Places<br />Bigger Dreams
          </p>
        </div>

        {/* Banner Content */}
        <div className="relative z-10 max-w-2xl text-left space-y-4">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 border border-white/30 text-orange-100 text-[11px] font-black tracking-widest uppercase">
            <Sparkles size={12} className="text-amber-300" />
            <span>{copy.bannerEyebrow}</span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
            {copy.bannerHeadline}
          </h2>

          {/* Body */}
          <p className="text-xs sm:text-sm md:text-base text-orange-50 font-medium leading-relaxed max-w-xl">
            {copy.bannerBody}
          </p>

          {/* CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onPlanTripClick}
              className="bg-white hover:bg-orange-50 text-[#EA580C] font-black text-xs sm:text-sm py-3 px-7 rounded-xl flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95 transition-all cursor-pointer"
            >
              <span>Plan My Trip</span>
              <ArrowRight size={15} strokeWidth={2.4} />
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
