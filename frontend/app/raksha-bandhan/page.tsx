'use client'

import React, { useState, useEffect, startTransition } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth, SignInButton, SignUpButton } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  Sparkles, Gift, Share2, Copy, Check, Clock, Flame, ArrowRight,
  ShieldCheck, Heart, Plane, Coins, Users, Compass, ExternalLink, MapPin
} from 'lucide-react'
import {
  isRakhiCampaignActive,
  getCampaignTimeRemaining,
  getFestiveSharePayload,
  RAKHI_CAMPAIGN
} from '@/lib/campaignConfig'

export default function RakshaBandhanEventPage() {
  const { isSignedIn, isLoaded, userId } = useAuth()
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 5, hours: 13, minutes: 40, seconds: 0, isExpired: false })
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([])

  const sharePayload = getFestiveSharePayload(userId)

  // ── Live Countdown Clock (client-side only to prevent hydration mismatch) ──
  useEffect(() => {
    startTransition(() => {
      setMounted(true)
      setTimeLeft(getCampaignTimeRemaining())
    })

    const timer = setInterval(() => {
      setTimeLeft(getCampaignTimeRemaining())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // ── Universal Native Share Action ───────────────────────────────────────────
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: '🎁 Sibling Travel Gift Pass — TripSage',
          text: sharePayload.message,
          url: sharePayload.referralUrl
        })
        toast.success('Thanks for sharing the gift of travel!')
      } catch {
        // User cancelled or unsupported
      }
    } else {
      // Desktop fallback: Open WhatsApp Web or copy link
      window.open(sharePayload.platforms.whatsapp, '_blank')
    }
  }

  // ── Copy Link with Festive Confetti ─────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(sharePayload.referralUrl)
    setCopied(true)
    toast.success('Gift link copied! Share with your sibling.', {
      icon: '🎁',
      style: {
        borderRadius: '16px',
        background: '#18181B',
        color: '#FFFFFF',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        fontWeight: 'bold',
        fontSize: '13px'
      }
    })

    const newParticles = Array.from({ length: 24 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 220,
      y: (Math.random() - 0.5) * 220,
      color: ['#F59E0B', '#EA580C', '#E11D48', '#FDE047', '#38BDF8'][Math.floor(Math.random() * 5)]
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 900)
    setTimeout(() => setCopied(false), 2500)
  }

  const siblingTripPicks = [
    {
      title: 'Goa Beach Escape',
      desc: 'Sun, scooty rides, shacks & sunsets.',
      duration: '4 Days',
      tag: 'Sibling Favorite',
      img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80',
      dest: 'Goa'
    },
    {
      title: 'Manali Mountain Trail',
      desc: 'Snow peaks, cafes & riverside rafting.',
      duration: '5 Days',
      tag: 'Adventure',
      img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80',
      dest: 'Manali'
    },
    {
      title: 'Bali Tropical Getaway',
      desc: 'Private pool villas & Nusa Penida cliffs.',
      duration: '6 Days',
      tag: 'International',
      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
      dest: 'Bali'
    },
    {
      title: 'Dubai City & Desert',
      desc: 'Burj Khalifa, shopping & desert safari.',
      duration: '5 Days',
      tag: 'International',
      img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
      dest: 'Dubai'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-slate-200 font-body selection:bg-orange-500/25 selection:text-[#F59E0B] relative overflow-x-hidden">
      <Navbar />

      {/* ── AMBIENT RADIAL LIGHTING (Apple Keynote Style) ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[#EA580C]/20 via-[#F59E0B]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#E11D48]/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 max-w-5xl mx-auto text-center z-10 space-y-6">

        {/* Festive Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#18181C] border border-[#F59E0B]/40 shadow-xl backdrop-blur-md">
          <Flame size={14} className="text-[#EA580C] animate-pulse" />
          <span className="text-xs font-black text-[#F59E0B] uppercase tracking-wider">
            Official Raksha Bandhan 2X Special (Aug 23 – Aug 28)
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Gift Your Sibling a <span className="bg-gradient-to-r from-[#EA580C] via-[#F59E0B] to-[#FDE047] bg-clip-text text-transparent">Trip Memory</span>.
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
          Celebrate Raksha Bandhan by planning your next adventure together. Send your brother or sister a Travel Gift Pass—they receive <strong className="text-[#F59E0B]">200 Free Credits</strong> on sign-up, and you earn <strong className="text-[#F59E0B]">400 Credits</strong> automatically.
        </p>

        {/* Live Countdown Timer Bar */}
        <div suppressHydrationWarning className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#141418]/90 border border-white/10 shadow-lg text-xs sm:text-sm font-mono font-bold text-slate-300">
          <Clock size={16} className="text-[#F59E0B]" />
          <span>Offer Ends In:</span>
          <span suppressHydrationWarning className="text-white font-black px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 text-amber-300">
            {mounted
              ? `${String(timeLeft.days).padStart(2, '0')}d : ${String(timeLeft.hours).padStart(2, '0')}h : ${String(timeLeft.minutes).padStart(2, '0')}m : ${String(timeLeft.seconds).padStart(2, '0')}s`
              : '05d : 13h : 40m : 00s'}
          </span>
        </div>
      </section>

      {/* ── THE INTERACTIVE SIBLING TRAVEL GIFT CARD ── */}
      <section className="max-w-4xl mx-auto px-4 pb-20 relative z-10">
        <div className="rounded-[32px] bg-gradient-to-b from-[#141418] via-[#101013] to-[#141418] border border-[#F59E0B]/35 shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden">

          {/* Luxury Royal Rakhi & Travel Pass Header */}
          <div className="relative h-60 sm:h-72 md:h-80 w-full overflow-hidden bg-[#0A0503] border-b border-[#F59E0B]/40">
            <img
              src="/rakhi-travel-thread.jpg"
              alt="Royal Ornate Rakhi with Airplane, Train and Bus Travel Thread"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140B07] via-[#140B07]/20 to-transparent" />
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#F59E0B]/50 text-xs font-black text-[#FDE047] uppercase tracking-wider shadow-md">
              <Sparkles size={13} className="text-[#EA580C]" />
              <span>OFFICIAL SIBLING TRAVEL PASS #2026</span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-display text-white tracking-tight drop-shadow-md">
                  Gift a Journey. <span className="text-[#FBBF24]">Claim 2X Credits.</span>
                </h2>
                <p className="text-xs text-amber-200/90 font-semibold mt-0.5">
                  Valid for flights, hotels, trains, buses, and custom AI trip itineraries.
                </p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 md:p-10 space-y-8">

            {/* ── 1. PRIMARY ACTION: SHARE CONTROLS OR SIGN-IN GATE (Directly Under Image) ── */}
            {isLoaded && !isSignedIn ? (
              /* ── Signed Out State: Luxury Auth Gate ── */
              <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1C1226] via-[#2A131A] to-[#120B20] border-2 border-[#F59E0B]/50 text-center space-y-5 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#EA580C]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
                
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EA580C] to-[#F59E0B] text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
                  <Gift size={28} className="text-white" />
                </div>

                <div className="space-y-1.5 max-w-lg mx-auto">
                  <h3 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
                    Sign In to Unlock Your Sibling Gift Pass
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                    Sign in or create an account in 10 seconds to generate your personal Raksha Bandhan gift link and start gifting credits!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <SignInButton mode="modal" fallbackRedirectUrl="/raksha-bandhan">
                    <button className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#EA580C] via-[#F59E0B] to-[#EA580C] hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-orange-500/25 active:scale-95 transition-all cursor-pointer">
                      Sign In to Send Gift Link 🎁
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal" fallbackRedirectUrl="/raksha-bandhan">
                    <button className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer">
                      New to TripSage? Create Account
                    </button>
                  </SignUpButton>
                </div>
              </div>
            ) : (
              /* ── Signed In State: Pro-Level Share Controls ── */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#1C1226]/80 border border-[#F59E0B]/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs">
                      🎁
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-white">Your Sibling Gift Pass is Live!</p>
                      <p className="text-[11px] text-amber-200/80">Share across any app on your phone or desktop</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#EA580C] text-white uppercase tracking-wider">
                    2X REWARDS
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  {/* Link Input */}
                  <div className="flex items-center gap-2 flex-1 bg-black/60 border border-white/15 rounded-2xl px-4 py-3.5 focus-within:border-[#F59E0B]/60 transition-colors">
                    <span className="text-xs font-mono text-slate-200 truncate flex-1 select-all font-semibold">
                      {sharePayload.referralUrl}
                    </span>
                  </div>

                  {/* Copy Link Button */}
                  <button
                    onClick={handleCopy}
                    className="relative px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 cursor-pointer"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>

                    {/* Particle confetti */}
                    {particles.map((p) => (
                      <motion.span
                        key={p.id}
                        initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                        animate={{ opacity: 0, scale: 1.5, x: p.x, y: p.y }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="absolute w-2 h-2 rounded-full pointer-events-none"
                        style={{ backgroundColor: p.color }}
                      />
                    ))}
                  </button>

                  {/* Primary Universal Share Button */}
                  <button
                    onClick={handleShare}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#EA580C] via-[#F59E0B] to-[#EA580C] hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-orange-500/25 active:scale-95 transition-all shrink-0 cursor-pointer"
                  >
                    <Share2 size={16} />
                    <span>Share Gift Pass 🎁</span>
                  </button>
                </div>

                <p className="text-[11px] text-center text-slate-400 font-medium">
                  Tapping <strong>Share Gift Pass</strong> opens your native device share menu (WhatsApp, Instagram, Telegram, SMS, Mail, AirDrop, etc.).
                </p>
              </div>
            )}

            {/* ── 2. 2X DOUBLE REWARDS SPLIT CARDS (Below the Share Controls) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-white/[0.03] to-transparent border border-[#F59E0B]/30 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#F59E0B] uppercase tracking-wider">You Earn</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#EA580C] text-white uppercase">2X BONUS</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white font-display">400</span>
                  <span className="text-sm font-bold text-amber-200">Sage Credits</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Added to your wallet as soon as your sibling creates their account.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-white/[0.03] to-transparent border border-rose-500/30 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-rose-300 uppercase tracking-wider">Sibling Receives</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-600 text-white uppercase">2X GIFT</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white font-display">200</span>
                  <span className="text-sm font-bold text-rose-200">Sage Credits</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Instant welcome credit bonus gifted to their travel wallet on sign-up.
                </p>
              </div>
            </div>

            {/* 3 Step Visual Flow */}
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 text-center">
                How the Rakhi 2X Gift Pass Works:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1 text-left">
                  <span className="w-7 h-7 rounded-lg bg-[#EA580C]/20 border border-[#EA580C]/40 text-[#EA580C] text-xs font-black flex items-center justify-center mb-2">
                    01
                  </span>
                  <h5 className="text-sm font-extrabold text-white">Share Gift Pass</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Send your personalized gift link to your brother or sister on WhatsApp or any app.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1 text-left">
                  <span className="w-7 h-7 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] text-xs font-black flex items-center justify-center mb-2">
                    02
                  </span>
                  <h5 className="text-sm font-extrabold text-white">Sibling Signs Up</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    They open your link and complete sign-up during the festive week (Aug 23–28).
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1 text-left">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black flex items-center justify-center mb-2">
                    03
                  </span>
                  <h5 className="text-sm font-extrabold text-white">Both Earn 2X</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    They get 200 Credits immediately. You receive 400 Credits in your TripSage wallet.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SIBLING TRIPS INSPIRATION SECTION ── */}
      <section className="max-w-5xl mx-auto px-4 pb-24 relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold text-[#F59E0B] uppercase tracking-widest">
            Plan Together with Your Bonus Credits
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight">
            Popular Sibling Getaways
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Ready to turn your credits into memories? Launch our AI planner to create day-by-day itineraries in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {siblingTripPicks.map((trip) => (
            <Link
              key={trip.title}
              href={`/plan`}
              className="group rounded-2xl bg-[#141418] border border-white/10 hover:border-[#F59E0B]/50 overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-40 overflow-hidden bg-[#18181C]">
                <img
                  src={trip.img}
                  alt={trip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-[#F59E0B] border border-white/10">
                  {trip.tag}
                </span>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {trip.duration} Trip
                  </div>
                  <h4 className="text-sm font-extrabold text-white group-hover:text-[#F59E0B] transition-colors">
                    {trip.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {trip.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-[#EA580C]">
                  <span>Plan on TripSage</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
