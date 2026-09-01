'use client'

import React, { useState, useEffect, startTransition } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Clock, Gift, Plane, X } from 'lucide-react'
import { isRakhiCampaignActive, getCampaignTimeRemaining } from '@/lib/campaignConfig'

interface RakhiEventCardProps {
  variant?: 'home' | 'plan' | 'compact'
  asModalOverlay?: boolean
  onClose?: () => void
}

export default function RakhiEventCard({
  variant = 'home',
  asModalOverlay = true,
  onClose
}: RakhiEventCardProps) {
  const [active, setActive] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 5, hours: 11, minutes: 46, seconds: 6, isExpired: false })

  useEffect(() => {
    startTransition(() => {
      setMounted(true)
      if (isRakhiCampaignActive()) {
        setActive(true)
        setTimeLeft(getCampaignTimeRemaining())
        if (typeof window !== 'undefined' && sessionStorage.getItem('tripsage_rakhi_card_dismissed')) {
          setDismissed(true)
        }
      }
    })

    const timer = setInterval(() => {
      const remaining = getCampaignTimeRemaining()
      setTimeLeft(remaining)
      if (remaining.isExpired) setActive(false)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Lock background scroll on mobile when modal overlay is active
  useEffect(() => {
    if (asModalOverlay && active && !dismissed && !timeLeft.isExpired) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [asModalOverlay, active, dismissed, timeLeft.isExpired])

  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setDismissed(true)
    document.body.style.overflow = ''
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tripsage_rakhi_card_dismissed', 'true')
    }
    if (onClose) onClose()
  }

  if (!active || timeLeft.isExpired || dismissed) return null

  // ── PLAN PAGE VARIANT ──
  if (variant === 'plan') {
    return (
      <div className="w-full my-6 rounded-3xl bg-gradient-to-r from-[#1B100B] via-[#28170D] to-[#1B100B] border border-[#C99A3D]/50 p-5 text-[#FFF4DF] relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-bl from-[#D9852E]/25 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D9852E] to-[#E6B84A] text-[#1B100B] flex items-center justify-center font-bold shadow-md shrink-0 border border-[#E6B84A]/60">
              <Plane size={22} className="rotate-45 text-[#1B100B]" />
            </div>
            <div className="text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7B241C] text-[#FFF4DF] text-[10px] font-bold uppercase tracking-wider border border-[#C99A3D]/40">
                <Sparkles size={11} className="text-[#E6B84A]" />
                <span>2X RAKHI EVENT (AUG 23–28)</span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-[#FFF4DF] mt-1 font-serif">
                Plan a sibling getaway & earn 400 Free Credits!
              </h4>
            </div>
          </div>
          <Link
            href="/raksha-bandhan"
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#D9852E] via-[#E6B84A] to-[#B72D24] hover:brightness-110 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 shrink-0 cursor-pointer border border-[#E6B84A]/60"
          >
            <span>Claim & Send Sibling Gift Pass 🎁 →</span>
          </Link>
        </div>
      </div>
    )
  }

  // ── HOMEPAGE CENTERED PROMOTIONAL EVENT SPOTLIGHT CARD (Fixed, Non-Moveable, Centered) ──
  const cardContent = (
    <div className="relative w-full max-w-[360px] sm:max-w-[620px] md:max-w-[760px] mx-auto font-body select-none">

      {/* ── Outer Warm Cream Background Frame with Subtle Ornamental Accents ── */}
      <div className="relative rounded-[26px] sm:rounded-[30px] bg-[#F6F0E3] p-3 sm:p-4 md:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.65)] border border-[#C99A3D]/40 overflow-hidden">

        {/* Top-Right Cancel / Close Button (X) */}
        <button
          onClick={handleDismiss}
          aria-label="Close Raksha Bandhan Event Card"
          className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1B100B]/85 hover:bg-[#1B100B] border border-[#C99A3D]/70 text-[#FFF4DF] hover:text-[#E6B84A] flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-md cursor-pointer z-40"
        >
          <X size={15} strokeWidth={2.5} />
        </button>

        {/* Background Indian Ornamental Mandalas */}
        <div className="absolute -top-10 -left-10 w-44 h-44 opacity-15 pointer-events-none text-[#C99A3D]">
          <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
            <circle cx="100" cy="100" r="85" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="65" />
            <polygon points="100,25 118,82 175,100 118,118 100,175 82,118 25,100 82,82" />
          </svg>
        </div>

        <div className="space-y-2.5 sm:space-y-3.5 relative z-10">

          {/* ── 1. Top Decorative Festive Header Banner (Centered, Single-Line, No Wrap) ── */}
          <div className="w-full flex items-center justify-center gap-2 sm:gap-3 px-7 sm:px-4">
            <div className="hidden xs:block h-[1px] flex-1 max-w-[50px] sm:max-w-[90px] bg-gradient-to-r from-transparent via-[#C99A3D]/60 to-[#C99A3D]" />
            
            <div className="relative px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-[#FBF5E9] via-[#F6F0E3] to-[#FBF5E9] border border-[#C99A3D]/80 shadow-xs flex items-center gap-1.5 shrink-0">
              <span className="text-[#C99A3D] text-[8px] sm:text-[9px]">✦</span>
              <span className="text-[8px] xs:text-[9px] sm:text-[10.5px] font-black tracking-wider sm:tracking-widest text-[#1B100B] uppercase font-serif whitespace-nowrap">
                🎁 RAKSHA BANDHAN FESTIVE SPECIAL (AUG 23 – 28)
              </span>
              <span className="text-[#C99A3D] text-[8px] sm:text-[9px]">✦</span>
            </div>

            <div className="hidden xs:block h-[1px] flex-1 max-w-[50px] sm:max-w-[90px] bg-gradient-to-l from-transparent via-[#C99A3D]/60 to-[#C99A3D]" />
          </div>

          {/* ── 2. The Main Promotional Event Card (Unified Composition) ── */}
          <div className="relative mx-auto w-full rounded-[20px] sm:rounded-[24px] bg-[#1B100B] border-2 border-[#E6B84A]/60 shadow-[0_15px_45px_rgba(201,154,61,0.2),0_10px_25px_rgba(0,0,0,0.6)] text-[#FFF4DF] overflow-hidden min-h-[290px] sm:min-h-[320px] flex flex-col justify-between p-3.5 sm:p-5 md:p-6">

            {/* Seamless Left Artwork Layer with Micro-Animations */}
            <div className="absolute inset-y-0 left-0 w-full lg:w-[54%] pointer-events-none z-0 overflow-hidden">
              <motion.div
                initial={{ scale: 0.98 }}
                animate={{ scale: [0.98, 1.01, 0.98] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full"
              >
                <img
                  src="/rakhi-travel-thread.jpg"
                  alt="Ornate Rakhi Travel Thread"
                  className="w-full h-full object-cover object-left opacity-90 mix-blend-lighten"
                />
              </motion.div>

              {/* Seamless gradient fade blending the artwork directly into the dark card surface */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1B100B]/40 to-[#1B100B]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B100B]/50 via-transparent to-[#1B100B]/40" />

              {/* Rakhi Jewel Glow */}
              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.15, 0.9] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-[33%] top-[56%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r from-[#10B981]/25 to-[#F59E0B]/25 rounded-full blur-lg pointer-events-none"
              />

              {/* Flight Jet Particle Trail */}
              <motion.div
                animate={{ x: [-2, 4, -2], y: [-2, 2, -2], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-[54%] top-[23%] w-20 h-10 pointer-events-none flex items-center justify-center"
              >
                <div className="w-12 h-1.5 bg-gradient-to-r from-[#F59E0B]/0 via-[#F59E0B]/40 to-[#FDE047]/80 rounded-full blur-[1px] rotate-[-15deg]" />
              </motion.div>
            </div>

            {/* ── Top Ribbon Badges (Inside Main Card) ── */}
            <div className="relative z-10 flex items-center justify-between gap-2 mb-2">
              {/* Left Top Badge */}
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1B100B]/85 backdrop-blur-sm border border-[#C99A3D]/50 text-[#E6B84A] text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider shadow-inner">
                <span className="text-[#E6B84A] text-[8.5px]">✣</span>
                <span>RAKSHA BANDHAN SPECIAL (AUG 23–28)</span>
              </div>

              {/* Right Top Badge */}
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1B100B]/85 backdrop-blur-sm border border-[#C99A3D]/50 text-[#FFF4DF] text-[8.5px] sm:text-[10px] font-bold shadow-inner">
                <Gift size={11} className="text-[#E6B84A]" />
                <span className="text-[#E6B84A] font-extrabold">2X REWARDS</span>
              </div>
            </div>

            {/* ── Main Content Grid (Aligned to Center-Right matching Reference) ── */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-center my-auto">

              {/* Left Spacer for Desktop (occupied by seamless visual Rakhi) */}
              <div className="hidden lg:block lg:col-span-5 pointer-events-none" />

              {/* Right Column: Headline, Description, Countdown & CTA */}
              <div className="lg:col-span-7 space-y-2 sm:space-y-2.5 text-left max-w-md lg:ml-auto">
                
                {/* Main Headline (2 Clean Lines) */}
                <div>
                  <h3 className="text-lg sm:text-2xl lg:text-[24px] font-bold text-[#FFF4DF] tracking-tight leading-[1.15] font-serif">
                    Gift Your Sibling a{' '}
                    <span className="bg-gradient-to-r from-[#E6B84A] via-[#D9852E] to-[#B72D24] bg-clip-text text-transparent">
                      Trip Memory
                    </span>
                  </h3>
                  
                  {/* Supporting Description with Gold Highlights */}
                  <p className="text-[10.5px] sm:text-xs text-[#D8C6A5] leading-relaxed mt-1 font-normal">
                    Celebrate Raksha Bandhan with an adventure. Send a Travel Gift Pass—they get <strong className="text-[#E6B84A] font-bold">200 Free Credits</strong> and you earn <strong className="text-[#E6B84A] font-bold">400 Credits</strong> automatically.
                  </p>
                </div>

                {/* ── Countdown Timer Section ── */}
                <div suppressHydrationWarning className="space-y-0.5 sm:space-y-1">
                  <div className="flex items-center gap-1 text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-widest text-[#C99A3D]">
                    <Clock size={10} className="text-[#E6B84A]" />
                    <span>OFFER ENDS IN:</span>
                  </div>

                  {/* 4 Compact Evenly Spaced Countdown Boxes */}
                  <div suppressHydrationWarning className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center max-w-[270px]">
                    {/* Days */}
                    <div suppressHydrationWarning className="py-1 px-1 rounded-lg bg-[#100906]/90 border border-[#C99A3D]/40 shadow-inner">
                      <span suppressHydrationWarning className="block text-xs sm:text-base font-bold text-[#FFF4DF] font-mono leading-none">
                        {mounted ? String(timeLeft.days).padStart(2, '0') : '05'}
                      </span>
                      <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-[#C99A3D] mt-0.5 block">
                        DAYS
                      </span>
                    </div>

                    {/* Hours */}
                    <div suppressHydrationWarning className="py-1 px-1 rounded-lg bg-[#100906]/90 border border-[#C99A3D]/40 shadow-inner">
                      <span suppressHydrationWarning className="block text-xs sm:text-base font-bold text-[#FFF4DF] font-mono leading-none">
                        {mounted ? String(timeLeft.hours).padStart(2, '0') : '11'}
                      </span>
                      <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-[#C99A3D] mt-0.5 block">
                        HOURS
                      </span>
                    </div>

                    {/* Mins */}
                    <div suppressHydrationWarning className="py-1 px-1 rounded-lg bg-[#100906]/90 border border-[#C99A3D]/40 shadow-inner">
                      <span suppressHydrationWarning className="block text-xs sm:text-base font-bold text-[#FFF4DF] font-mono leading-none">
                        {mounted ? String(timeLeft.minutes).padStart(2, '0') : '46'}
                      </span>
                      <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-[#C99A3D] mt-0.5 block">
                        MINS
                      </span>
                    </div>

                    {/* Secs */}
                    <div suppressHydrationWarning className="py-1 px-1 rounded-lg bg-[#100906]/90 border border-[#C99A3D]/40 shadow-inner">
                      <span suppressHydrationWarning className="block text-xs sm:text-base font-bold text-[#E6B84A] font-mono leading-none">
                        {mounted ? String(timeLeft.seconds).padStart(2, '0') : '06'}
                      </span>
                      <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-[#C99A3D] mt-0.5 block">
                        SECS
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Luxury Gradient CTA Button ── */}
                <div className="pt-0.5">
                  <Link
                    href="/raksha-bandhan"
                    className="w-full max-w-[300px] inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#D9852E] via-[#E6B84A] to-[#B72D24] hover:brightness-110 text-[#FFF4DF] font-bold text-xs shadow-[0_6px_16px_rgba(217,133,46,0.35)] border border-[#E6B84A]/70 active:scale-[0.98] transition-all duration-300 cursor-pointer"
                  >
                    <span>Claim & Send Sibling Gift Pass 🎁 →</span>
                  </Link>
                </div>

              </div>

            </div>

            <div className="h-0.5" />

          </div>

        </div>
      </div>
    </div>
  )

  // ── Render as Centered Modal Overlay on Homepage Load (Fixed & Non-Moveable on Mobile) ──
  if (asModalOverlay) {
    return (
      <AnimatePresence>
        {!dismissed && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-[3px] touch-none overflow-hidden"
            onClick={() => handleDismiss()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[360px] sm:max-w-[620px] md:max-w-[760px] my-auto"
            >
              {cardContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    )
  }

  // Inline fallback
  return cardContent
}
