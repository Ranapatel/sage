'use client'

import React from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

interface Props {
  onPlanTripClick: () => void
}

export default function DussehraFinalCTA({ onPlanTripClick }: Props) {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EA580C] text-white text-center">
      {/* Decorative mountain silhouettes in background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none flex items-end">
        <svg viewBox="0 0 1200 200" className="w-full text-white fill-current" preserveAspectRatio="none">
          <polygon points="0,200 150,110 300,180 450,70 650,190 850,90 1050,160 1200,80 1200,200" />
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 text-white text-[11px] font-black tracking-widest uppercase">
          <Sparkles size={12} className="text-amber-300" />
          <span>The Great Dussehra Escape</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
          Your next adventure is waiting.
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-orange-100 font-medium max-w-2xl mx-auto leading-relaxed">
          Tell TripSage where you want to go, when you want to travel and what you want to spend.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onPlanTripClick}
            className="inline-flex items-center gap-2 bg-white hover:bg-orange-50 text-[#EA580C] font-black text-sm sm:text-base py-3.5 px-8 rounded-xl shadow-xl shadow-black/15 active:scale-95 transition-all cursor-pointer"
          >
            <span>Plan My Trip</span>
            <ArrowRight size={17} strokeWidth={2.4} />
          </button>
        </div>

        <p className="text-xs text-orange-200/90 font-medium">
          No sign-up required to draft a plan
        </p>
      </div>
    </section>
  )
}
