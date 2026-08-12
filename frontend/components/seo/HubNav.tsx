'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, MapPin, FileCheck, Map, Wallet, ArrowRight } from 'lucide-react'

const HUB_PAGES = [
  {
    name: 'AI Trip Planner',
    href: '/ai-trip-planner',
    icon: Sparkles,
    desc: 'Instant personalized AI itineraries & smart planning',
    badge: 'Core Feature'
  },
  {
    name: 'Destinations',
    href: '/destinations',
    icon: MapPin,
    desc: 'Explore domestic & international travel spots',
    badge: 'Guides'
  },
  {
    name: 'Visa Requirements',
    href: '/visa',
    icon: FileCheck,
    desc: 'Visa-on-arrival, e-Visas & entry guidelines',
    badge: 'Essential'
  },
  {
    name: 'Itineraries',
    href: '/itineraries',
    icon: Map,
    desc: 'Curated 3-day, 7-day & 10-day travel routes',
    badge: 'Routes'
  },
  {
    name: 'Budget Planner',
    href: '/budget',
    icon: Wallet,
    desc: 'Cost estimation, flight & hotel budget tools',
    badge: 'Calculator'
  }
]

export default function HubNav() {
  const pathname = usePathname()

  return (
    <section className="py-16 px-6 bg-white border-t border-[#E8E0D8]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold text-[#EA580C] uppercase tracking-[0.2em] mb-2 block">
            Explore TripSage Hubs
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A] font-display">
            Everything You Need for Your Next Journey
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {HUB_PAGES.map((hub) => {
            const isActive = pathname === hub.href
            const IconComponent = hub.icon

            return (
              <Link
                key={hub.href}
                href={hub.href}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between group ${
                  isActive
                    ? 'bg-[#FFF4EE] border-[#EA580C] shadow-sm'
                    : 'bg-[#FFFBF7] border-[#E8E0D8] hover:border-[#EA580C]/50 hover:bg-white hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive
                          ? 'bg-[#EA580C] text-white'
                          : 'bg-orange-50 text-[#EA580C] group-hover:bg-[#EA580C] group-hover:text-white transition-colors'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#EA580C] text-white'
                          : 'bg-[#E8E0D8]/60 text-[#6B6B6B]'
                      }`}
                    >
                      {hub.badge}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[#1A1A1A] text-sm mb-1 group-hover:text-[#EA580C] transition-colors">
                    {hub.name}
                  </h3>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed font-medium line-clamp-2">
                    {hub.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E0D8]/60 flex items-center text-xs font-extrabold text-[#EA580C]">
                  <span>{isActive ? 'Current Page' : 'Explore Hub'}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
