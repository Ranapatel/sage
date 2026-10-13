'use client'

import React from 'react'
import { Layers, Wallet, MapPin, Sparkles } from 'lucide-react'

export default function DussehraProblemSection() {
  const cards = [
    {
      icon: Layers,
      title: 'Too many tabs. Too many decisions.',
      copy: 'Travel planning can mean researching transport, stays, activities and maps separately.',
    },
    {
      icon: Wallet,
      title: 'Your budget matters.',
      copy: 'Consider the costs of getting there, staying there and exploring the destination.',
    },
    {
      icon: MapPin,
      title: 'A list isn’t a complete itinerary.',
      copy: 'Organize places and activities into a more practical day-wise plan.',
    },
  ]

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto text-left">
      {/* Eyebrow and Heading */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#EA580C] text-[11px] font-bold tracking-wider uppercase mb-3">
          <Sparkles size={12} className="text-[#EA580C]" />
          <span>The Problem</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-[#1A1A1A] tracking-tight leading-tight mb-3">
          Your holiday shouldn't feel like another project.
        </h2>
        <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed max-w-2xl">
          Travel planning can be overwhelming. You have to research transport, stays, activities and maps separately.
        </p>
      </div>

      {/* 3 Benefit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-[#E8E0D8] p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FFF5ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] mb-5 group-hover:scale-105 transition-transform">
                <card.icon size={22} strokeWidth={2} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] mb-2 leading-snug">
                {card.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
                {card.copy}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Closing Statement */}
      <div className="text-center pt-2">
        <p className="inline-block text-xs sm:text-sm font-bold text-[#EA580C] tracking-wide bg-[#FFF5ED] px-4 py-2 rounded-full border border-[#FED7AA]/60">
          One starting point. A more organized way to plan your journey.
        </p>
      </div>
    </section>
  )
}
