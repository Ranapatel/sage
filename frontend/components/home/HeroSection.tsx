'use client'

import { Sparkles, Search, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import Earth3DBackground from './Earth3DBackground'

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-[#0F172A] py-16 lg:py-24"
    >
      {/* Ambient background glow effects */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(circle 800px at 20% 30%, rgba(242,101,34,0.08) 0%, transparent 70%)',
            'radial-gradient(circle 700px at 80% 60%, rgba(99,102,241,0.06) 0%, transparent 70%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      {/* Top/Bottom edge vignettes */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, #0F172A 0%, transparent 15%, transparent 85%, #0F172A 100%)',
        }}
        aria-hidden="true"
      />

      {/* Main 2-Column Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Column (55% width -> 7 grid columns) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          
          {/* Live Badge */}
          <div className="flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 bg-white/5 backdrop-blur-md shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span
              className="font-semibold text-xs tracking-wider text-white/80 uppercase"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Sage Intelligence • Active
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="font-bold text-white text-4xl sm:text-5xl lg:text-6xl leading-[1.12] tracking-tight mt-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Plan Your Entire Trip in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F26522] via-[#FF8A50] to-[#F26522]">
              30 Seconds
            </span>
            <br className="hidden sm:inline" /> — Not 30 Tabs.
          </h1>

          {/* Subheadline */}
          <p
            className="text-base sm:text-lg text-[#94A3B8] leading-relaxed mt-5 max-w-xl"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            TripSage reads 10,000+ travel blogs, reviews, and live prices to build your 
            personalized itinerary with exact costs in ₹, visa requirements, and booking links.
          </p>

          {/* Feature Pill Tags */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center gap-2 border border-[#F26522]/30 bg-[#F26522]/10 rounded-full px-3.5 py-1.5 text-[#F26522] text-xs font-semibold">
              <Sparkles size={14} className="shrink-0" />
              Indian Visa Assured
            </div>
            <div className="flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-3.5 py-1.5 text-slate-300 text-xs font-medium">
              <Zap size={14} className="text-amber-400 shrink-0" />
              Real-time ₹ Prices
            </div>
            <div className="flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-3.5 py-1.5 text-slate-300 text-xs font-medium">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              Zero Hassle Itineraries
            </div>
          </div>

          {/* AI Search Box */}
          <div className="w-full max-w-xl mt-8 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl shadow-[#F26522]/10 border border-white/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-3 flex-1 px-3 py-2">
              <Search
                className="text-[#64748B] shrink-0"
                style={{ width: '20px', height: '20px' }}
                strokeWidth={2}
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="e.g. Mumbai → Dubai, 4 nights, ₹45,000"
                className="w-full bg-transparent outline-none text-base text-[#1E293B] placeholder:text-[#64748B]/60"
                style={{ fontFamily: "'Inter', sans-serif" }}
                aria-label="Trip search"
              />
            </div>

            <button
              onClick={() => console.log('Plan trip triggered')}
              className="bg-[#F26522] hover:bg-[#E55A1A] active:scale-[0.98] transition-all duration-200 text-white rounded-xl px-6 py-3 font-semibold text-sm shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              style={{ fontFamily: "'Inter', sans-serif" }}
              type="button"
            >
              Plan with AI
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Microcopy */}
          <p
            className="text-white/40 text-xs mt-4 flex items-center gap-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <span>No credit card required</span>
            <span>•</span>
            <span>Free during beta</span>
            <span>•</span>
            <span>Instant PDF Export</span>
          </p>

        </div>

        {/* Right Column (45% width -> 5 grid columns) */}
        <div className="lg:col-span-5 relative w-full h-[380px] sm:h-[480px] lg:h-[540px] flex items-center justify-center">
          {/* Subtle glowing backlight behind globe */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#F26522]/20 via-indigo-500/10 to-transparent blur-3xl rounded-full transform scale-90 pointer-events-none" />

          {/* 3D Interactive/Animated Earth Background container */}
          <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-sm shadow-2xl">
            <Earth3DBackground />

            {/* Overlay status badge on globe */}
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-between pointer-events-none z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F26522] animate-ping" />
                <span className="text-xs text-white/90 font-medium">Global AI Network active</span>
              </div>
              <span className="text-[11px] text-white/50">10k+ routes tracked</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
