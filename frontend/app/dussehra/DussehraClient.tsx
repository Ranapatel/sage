'use client'

import React, { useState, useRef, useEffect, startTransition } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Compass, Shield, Flame } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DussehraPlannerForm from '@/components/campaign/DussehraPlannerForm'
import DussehraProblemSection from '@/components/campaign/DussehraProblemSection'
import DussehraHowItWorks from '@/components/campaign/DussehraHowItWorks'
import DussehraProductPreview from '@/components/campaign/DussehraProductPreview'
import DussehraDestinations from '@/components/campaign/DussehraDestinations'
import DussehraBanner from '@/components/campaign/DussehraBanner'
import DussehraFAQTrust from '@/components/campaign/DussehraFAQTrust'
import DussehraFinalCTA from '@/components/campaign/DussehraFinalCTA'
import {
  getContextualCopy,
  getCampaignStatus,
  type DestinationCardItem,
  DUSSEHRA_CAMPAIGN
} from '@/lib/dussehraConfig'
import { trackEvent, analytics } from '@/lib/analytics'

export default function DussehraClient() {
  const [status, setStatus] = useState<'upcoming' | 'active' | 'post_festival'>('active')
  const plannerRef = useRef<HTMLDivElement>(null)
  const [selectedDestination, setSelectedDestination] = useState<string>('')
  const [selectedBudget, setSelectedBudget] = useState<string>('15000')

  useEffect(() => {
    startTransition(() => {
      const currentStatus = getCampaignStatus()
      setStatus(currentStatus)
    })

    // Track campaign landing view with UTM parameters
    const utmParams = analytics.getUtmParams()
    trackEvent('campaign_landing_view', {
      campaign: DUSSEHRA_CAMPAIGN.id,
      campaign_name: DUSSEHRA_CAMPAIGN.name,
      status: getCampaignStatus(),
      ...utmParams,
    })
  }, [])

  const copy = getContextualCopy(status)

  const scrollToPlanner = (dest?: string, budget?: string) => {
    if (dest) setSelectedDestination(dest)
    if (budget) setSelectedBudget(budget)

    if (plannerRef.current) {
      plannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const input = plannerRef.current.querySelector('input')
      if (input) {
        setTimeout(() => input.focus(), 500)
      }
    }
  }

  const handleDestinationSelect = (dest: DestinationCardItem) => {
    scrollToPlanner(dest.name, dest.defaultBudget)
  }

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#1A1A1A] font-body selection:bg-orange-500/20 selection:text-[#EA580C] antialiased w-full max-w-full overflow-x-hidden relative">
      <Navbar />

      {/* ─── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
        
        {/* Subtle Decorative Lord Rama Bow & Arrow Ambient Vector in Background */}
        <div className="absolute top-12 left-0 w-72 h-72 opacity-5 pointer-events-none text-[#EA580C] select-none">
          <svg viewBox="0 0 200 200" className="w-full h-full fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M50,150 C60,130 70,100 65,80 C60,60 70,40 90,35 C85,45 85,60 95,75 C105,90 95,110 80,130 Z" />
            <path d="M95,20 C130,50 140,100 100,155" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
            <line x1="70" y1="90" x2="175" y2="90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <polygon points="175,90 160,84 164,90 160,96" />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Hero Column: Copy & Value Proposition (5-6 cols) */}
          <div className="lg:col-span-6 text-left space-y-6 z-10">
            {/* Campaign Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF5ED] border border-[#FED7AA] shadow-2xs">
              <Sparkles size={13} className="text-[#EA580C]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#EA580C]">
                {copy.badgeText}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-black font-display text-[#1A1A1A] tracking-tight leading-[1.08]">
              Burn your boring plans. <br />
              <span className="bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#C2410C] bg-clip-text text-transparent">
                Plan your next adventure.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base md:text-lg text-[#6B6B6B] leading-relaxed font-normal max-w-xl">
              {copy.supportingText}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => scrollToPlanner()}
                className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm sm:text-base py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer min-h-[48px]"
              >
                <span>Plan My Trip</span>
                <ArrowRight size={16} strokeWidth={2.2} />
              </button>

              <Link
                href="/destinations"
                className="bg-white hover:bg-[#FFFBF7] text-[#1A1A1A] hover:text-[#EA580C] border border-[#E8E0D8] font-bold text-sm sm:text-base py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 min-h-[48px]"
              >
                <Compass size={16} className="text-[#EA580C]" />
                <span>Explore Destinations</span>
              </Link>
            </div>

            {/* Supporting Note */}
            <div className="flex items-center gap-2 text-xs text-[#6B6B6B] font-medium pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              <span>Start planning for free · Transparent partner rates · No card required</span>
            </div>
          </div>

          {/* Right Hero Column: Scenic Visual + Floating Planner Form (6-7 cols) */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            
            {/* Scenic Destination Travel Background Frame */}
            <div className="relative w-full rounded-3xl overflow-hidden border border-[#E8E0D8] shadow-xl p-3 sm:p-5 bg-gradient-to-br from-orange-100/40 via-[#FFF5ED] to-[#FFFBF7]">
              
              {/* Background Photo with warm sunset lighting */}
              <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=85&auto=format&fit=crop"
                  alt="Scenic mountain lake at golden sunset"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Floating "New Places, Bigger Dreams" typographic banner on image */}
                <div className="absolute top-4 right-4 text-right bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/20">
                  <p className="text-[11px] font-black uppercase tracking-wider text-orange-200">
                    New Places
                  </p>
                  <p className="text-xs font-black text-white">
                    Bigger Dreams
                  </p>
                </div>
              </div>

              {/* Floating Compact Trip Planner Form */}
              <div ref={plannerRef} className="-mt-36 sm:-mt-48 relative z-20">
                <DussehraPlannerForm
                  key={`${selectedDestination}-${selectedBudget}`}
                  initialDestination={selectedDestination}
                  initialBudget={selectedBudget}
                />
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─── SECTION 2: THE PROBLEM & SOLUTION ─────────────────────────────────── */}
      <DussehraProblemSection />

      {/* ─── SECTION 3: HOW IT WORKS & LIVE PRODUCT PREVIEW ────────────────────── */}
      <DussehraHowItWorks onBuildTripClick={() => scrollToPlanner()} />

      {/* ─── SECTION 4: REAL PRODUCT PREVIEW ───────────────────────────────────── */}
      <DussehraProductPreview onSeeHowItWorksClick={() => scrollToPlanner()} />

      {/* ─── SECTION 5: POPULAR DESTINATIONS ───────────────────────────────────── */}
      <DussehraDestinations onSelectDestination={handleDestinationSelect} />

      {/* ─── SECTION 6: DUSSEHRA CAMPAIGN BANNER ───────────────────────────────── */}
      <DussehraBanner onPlanTripClick={() => scrollToPlanner()} />

      {/* ─── SECTION 7: FAQ & TRUST BADGES ─────────────────────────────────────── */}
      <DussehraFAQTrust />

      {/* ─── SECTION 8: FINAL CTA BANNER ───────────────────────────────────────── */}
      <DussehraFinalCTA onPlanTripClick={() => scrollToPlanner()} />

      {/* ─── FOOTER ────────────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}
