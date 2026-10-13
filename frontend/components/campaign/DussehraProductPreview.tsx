'use client'

import React from 'react'
import { Sparkles, ArrowRight, Calendar, Compass, Map, ExternalLink } from 'lucide-react'

interface Props {
  onSeeHowItWorksClick?: () => void
}

export default function DussehraProductPreview({ onSeeHowItWorksClick }: Props) {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 max-w-6xl mx-auto text-left">
      {/* Eyebrow & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#EA580C] text-[11px] font-bold tracking-wider uppercase mb-3">
            <Sparkles size={12} className="text-[#EA580C]" />
            <span>Real Product Preview</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-[#1A1A1A] tracking-tight leading-tight">
            Explore your trip, your way.
          </h2>
          <p className="text-sm sm:text-base text-[#6B6B6B] mt-2 max-w-2xl">
            Get a complete travel plan with day-wise itinerary, real places, transport options, accommodations, activities and maps.
          </p>
        </div>

        {onSeeHowItWorksClick && (
          <button
            type="button"
            onClick={onSeeHowItWorksClick}
            className="text-xs sm:text-sm font-bold text-[#EA580C] hover:text-[#C2410C] flex items-center gap-1.5 transition-colors self-start md:self-end group cursor-pointer"
          >
            <span>See how it works</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* 3 Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Day-wise Itinerary */}
        <div className="bg-white rounded-2xl border border-[#E8E0D8] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="bg-[#FFFBF7] rounded-xl border border-[#E8E0D8] p-3 mb-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#1A1A1A]">
                <span>Day 1 — Morning Arrival</span>
                <span className="text-[#EA580C]">9:30 AM</span>
              </div>
              <div className="text-[10px] text-[#6B6B6B] bg-white p-2 rounded-lg border border-[#E8E0D8]/60 space-y-1">
                <p className="font-semibold text-[#1A1A1A]">Airport transfer to hotel & check-in</p>
                <p className="text-[#9CA3AF]">Estimated travel time: 45 min</p>
              </div>
              <div className="text-[10px] text-[#6B6B6B] bg-white p-2 rounded-lg border border-[#E8E0D8]/60 space-y-1">
                <p className="font-semibold text-[#1A1A1A]">Old Goa heritage walk & cathedral visit</p>
                <p className="text-[#9CA3AF]">Afternoon · 2 hours duration</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-[#FFF5ED] text-[#EA580C] flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Day-wise itinerary</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
              Your plan, organized day by day with activities, estimated timings and local suggestions.
            </p>
          </div>
        </div>

        {/* Card 2: Accommodation & Transport */}
        <div className="bg-white rounded-2xl border border-[#E8E0D8] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="bg-[#FFFBF7] rounded-xl border border-[#E8E0D8] p-3 mb-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative rounded-lg overflow-hidden h-20">
                  <img
                    src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&q=80&auto=format&fit=crop"
                    alt="Resort Stay"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded font-bold">
                    Resort
                  </span>
                </div>
                <div className="relative rounded-lg overflow-hidden h-20">
                  <img
                    src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&q=80&auto=format&fit=crop"
                    alt="Transit"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded font-bold">
                    Bus / Rail
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#6B6B6B] px-1">
                <span className="font-semibold text-[#1A1A1A]">Direct Partner Links</span>
                <span className="text-[#EA580C] font-bold">Instant Search</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-[#FFF5ED] text-[#EA580C] flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Accommodation & transport</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
              Real options with photos, transparent rates, and direct booking provider links where available.
            </p>
          </div>
        </div>

        {/* Card 3: Places & Activities */}
        <div className="bg-white rounded-2xl border border-[#E8E0D8] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="bg-[#FFFBF7] rounded-xl border border-[#E8E0D8] p-3 mb-4 space-y-2">
              <div className="bg-[#EAE4DC]/50 rounded-lg h-20 p-2 flex flex-col justify-between border border-[#E8E0D8]">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#1A1A1A]">
                  <span className="flex items-center gap-1">
                    <Map size={11} className="text-[#EA580C]" /> Map Route View
                  </span>
                  <span className="text-[9px] bg-white px-1.5 py-0.5 rounded text-[#6B6B6B]">3 Stops</span>
                </div>
                <div className="flex items-center justify-around">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] shadow-xs" />
                  <div className="h-[2px] flex-1 bg-[#EA580C]/40 mx-1" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] shadow-xs" />
                  <div className="h-[2px] flex-1 bg-[#EA580C]/40 mx-1" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] shadow-xs" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#6B6B6B] px-1">
                <span>Cafes · Attractions · Beaches</span>
                <span className="text-[#16A34A] font-bold">Local Verified</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-[#FFF5ED] text-[#EA580C] flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Places & activities</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
              Discover top restaurants, must-visit sights, and local hidden gems organized visually on your map.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Mandatory Disclosure */}
      <p className="text-xs text-[#9CA3AF] text-center italic">
        * Prices and availability may change. Confirm final details with the booking provider.
      </p>
    </section>
  )
}
