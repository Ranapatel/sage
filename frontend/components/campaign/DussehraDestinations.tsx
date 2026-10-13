'use client'

import React from 'react'
import { Sparkles, ArrowRight, MapPin } from 'lucide-react'
import { DUSSEHRA_DESTINATIONS, type DestinationCardItem } from '@/lib/dussehraConfig'
import { trackEvent, analytics } from '@/lib/analytics'

interface Props {
  onSelectDestination: (dest: DestinationCardItem) => void
}

export default function DussehraDestinations({ onSelectDestination }: Props) {
  const handleDestinationClick = (dest: DestinationCardItem) => {
    trackEvent('destination_card_click', {
      campaign: 'dussehra_2026',
      destination: dest.name,
      tag: dest.tag,
    })

    analytics.destinationViewed({
      destinationName: dest.name,
      destinationCategory: dest.tag,
      source: 'dussehra_destinations_section',
    })

    onSelectDestination(dest)
  }

  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 max-w-6xl mx-auto text-left">
      {/* Eyebrow & Headline */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#EA580C] text-[11px] font-bold tracking-wider uppercase mb-3">
          <Sparkles size={12} className="text-[#EA580C]" />
          <span>Popular Destinations</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-[#1A1A1A] tracking-tight leading-tight">
          Where will your next adventure take you?
        </h2>
        <p className="text-sm sm:text-base text-[#6B6B6B] mt-2">
          Hand-picked destinations offering great weather, scenic beauty, and easy getaways this season.
        </p>
      </div>

      {/* 4 Responsive Destination Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {DUSSEHRA_DESTINATIONS.map((dest) => (
          <div
            key={dest.id}
            className="bg-white rounded-2xl border border-[#E8E0D8] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group"
          >
            {/* Destination Photo */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
              <img
                src={dest.img}
                alt={dest.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-xs text-[#EA580C] px-2.5 py-1 rounded-full shadow-xs">
                {dest.tag}
              </span>
            </div>

            {/* Destination Info & CTA */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg font-black text-[#1A1A1A] tracking-tight mb-1 flex items-center gap-1.5">
                  <MapPin size={16} className="text-[#EA580C]" />
                  <span>{dest.name}</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
                  {dest.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDestinationClick(dest)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FFF5ED] hover:bg-[#EA580C] text-[#EA580C] hover:text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer border border-[#FFEDD5] hover:border-transparent active:scale-98"
              >
                <span>Plan this trip</span>
                <ArrowRight size={13} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
