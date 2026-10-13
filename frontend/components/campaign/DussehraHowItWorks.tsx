'use client'

import React, { useState } from 'react'
import { Sparkles, ArrowRight, Plane, Bus, Hotel, MapPin, CheckCircle2 } from 'lucide-react'

interface Props {
  onBuildTripClick?: () => void
}

export default function DussehraHowItWorks({ onBuildTripClick }: Props) {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'flights' | 'hotels' | 'activities'>('itinerary')

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto bg-[#FDFBF7] rounded-3xl border border-[#E8E0D8]/80 my-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: 3 Steps & CTA */}
        <div className="lg:col-span-5 text-left space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#EA580C] text-[11px] font-bold tracking-wider uppercase mb-3">
              <Sparkles size={12} className="text-[#EA580C]" />
              <span>How It Works</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-[#1A1A1A] tracking-tight leading-tight">
              From travel idea to itinerary in three steps.
            </h2>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm shadow-orange-500/20">
                1
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1A1A1A]">Tell us about your trip.</h3>
                <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
                  Enter your destination, dates, starting point and budget.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm shadow-orange-500/20">
                2
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1A1A1A]">Generate your itinerary.</h3>
                <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
                  TripSage creates a suggested plan using the information and data sources available.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm shadow-orange-500/20">
                3
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1A1A1A]">Explore your options.</h3>
                <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
                  Review your itinerary, available transport or accommodation options, and booking links where supported.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onBuildTripClick}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm sm:text-base py-3 px-7 rounded-xl flex items-center gap-2 shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>Build My Dussehra Trip</span>
              <ArrowRight size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Right Column: Real Product Mockup Showcase */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Itinerary Overview */}
          <div className="bg-white rounded-2xl border border-[#E8E0D8] p-4 shadow-sm text-left space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#E8E0D8]/60">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                <span className="font-extrabold text-xs text-[#1A1A1A]">TripSage Itinerary</span>
              </div>
              <span className="text-[10px] font-bold text-[#EA580C] bg-[#FFF5ED] px-2 py-0.5 rounded-full">
                4-Day Plan
              </span>
            </div>

            <div>
              <p className="text-sm font-extrabold text-[#1A1A1A]">Your Trip to Goa</p>
              <p className="text-[11px] text-[#6B6B6B]">Oct 20 – Oct 24 · 2 Travelers</p>
            </div>

            {/* Destination Picture */}
            <div className="relative h-28 w-full rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80&auto=format&fit=crop"
                alt="Goa beach"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-2 text-[11px] font-bold text-white drop-shadow">
                North Goa Coastal Trail
              </span>
            </div>

            {/* Mini Tabs */}
            <div className="flex items-center gap-1 text-[11px] font-semibold border-b border-[#E8E0D8]/60 pb-1">
              {(['itinerary', 'flights', 'hotels', 'activities'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize px-2 py-0.5 rounded ${
                    activeTab === tab ? 'text-[#EA580C] font-bold bg-[#FFF5ED]' : 'text-[#6B6B6B]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Day Schedule Snippet */}
            <div className="space-y-2 text-xs">
              <p className="text-[11px] font-bold text-[#EA580C]">Day 1 — Oct 20</p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2 bg-[#FFFBF7] p-2 rounded-lg border border-[#E8E0D8]/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EA580C] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-[#1A1A1A] text-[11px]">Calangute Beach</p>
                    <p className="text-[10px] text-[#6B6B6B]">Morning · Relaxing stroll · Free</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-[#FFFBF7] p-2 rounded-lg border border-[#E8E0D8]/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EA580C] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-[#1A1A1A] text-[11px]">Baga Beach Watersports</p>
                    <p className="text-[10px] text-[#6B6B6B]">Afternoon · Parasailing · ₹1,200</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-[#FFFBF7] p-2 rounded-lg border border-[#E8E0D8]/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EA580C] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-[#1A1A1A] text-[11px]">Sunset at Curlies Cafe</p>
                    <p className="text-[10px] text-[#6B6B6B]">Evening · Coastal dinner · ₹800</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Transport & Stay Connections */}
          <div className="bg-white rounded-2xl border border-[#E8E0D8] p-4 shadow-sm text-left space-y-3 flex flex-col justify-between">
            <div>
              {/* Route preview graphic */}
              <div className="bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#1A1A1A] mb-1">
                  <span>HYD (Hyderabad)</span>
                  <span className="text-[#EA580C]">➔</span>
                  <span>GOI (Goa)</span>
                </div>
                <p className="text-[10px] text-[#6B6B6B]">Fastest option: 1h 25m non-stop flight</p>
              </div>

              {/* Transport Options */}
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-2">Transport Options</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between bg-[#FFFBF7] p-2.5 rounded-xl border border-[#E8E0D8]/60 text-xs">
                  <div className="flex items-center gap-2">
                    <Plane size={15} className="text-[#EA580C]" />
                    <div>
                      <p className="font-bold text-[#1A1A1A]">Direct Flight</p>
                      <p className="text-[10px] text-[#6B6B6B]">₹5,450 · 1h 25m</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#EA580C] bg-orange-100/60 px-2 py-0.5 rounded">
                    Compare
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#FFFBF7] p-2.5 rounded-xl border border-[#E8E0D8]/60 text-xs">
                  <div className="flex items-center gap-2">
                    <Bus size={15} className="text-[#EA580C]" />
                    <div>
                      <p className="font-bold text-[#1A1A1A]">AC Sleeper Bus</p>
                      <p className="text-[10px] text-[#6B6B6B]">₹1,200 · 12h 30m</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#EA580C] bg-orange-100/60 px-2 py-0.5 rounded">
                    Compare
                  </span>
                </div>
              </div>

              {/* Hotel Preview */}
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-2">Verified Stays</p>
              <div className="flex items-center gap-2.5 bg-[#FFFBF7] p-2 rounded-xl border border-[#E8E0D8]/60 text-xs">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80&auto=format&fit=crop"
                  alt="Hotel Stay"
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1A1A1A] truncate">Sea View Boutique Stay</p>
                  <p className="text-[10px] text-[#6B6B6B]">Calangute Beach · 4.4 ★</p>
                  <p className="text-[10px] font-bold text-[#EA580C]">₹3,200 / night</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E8E0D8]/60 flex items-center justify-between text-[10px] text-[#9CA3AF]">
              <span>Real-time availability</span>
              <span className="flex items-center gap-1 text-[#16A34A] font-bold">
                <CheckCircle2 size={11} /> Verified APIs
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
