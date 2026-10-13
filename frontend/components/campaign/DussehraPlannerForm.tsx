'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, SignUpButton, SignInButton } from '@clerk/nextjs'
import LocationAutocomplete from '@/components/ui/LocationAutocomplete'
import { trackEvent, analytics } from '@/lib/analytics'
import {
  MapPin, Calendar, Users, Compass, ArrowRightLeft,
  ArrowRight, AlertCircle, Sparkles, X, CheckCircle2, Lock
} from 'lucide-react'

export interface DussehraPlannerFormProps {
  initialDestination?: string
  initialOrigin?: string
  initialBudget?: string
  onPlanStarted?: () => void
  className?: string
}

export default function DussehraPlannerForm({
  initialDestination = '',
  initialOrigin = 'Hyderabad',
  initialBudget = '15000',
  onPlanStarted,
  className = '',
}: DussehraPlannerFormProps) {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()

  // Form State
  const [to, setTo] = useState(initialDestination)
  const [from, setFrom] = useState(initialOrigin)
  const [startDate, setStartDate] = useState('2026-10-20')
  const [endDate, setEndDate] = useState('2026-10-24')
  const [budget, setBudget] = useState(initialBudget)
  const [budgetScope, setBudgetScope] = useState<'per_person' | 'total'>('per_person')
  const [travelers, setTravelers] = useState('2')
  const [travelStyle, setTravelStyle] = useState('balanced')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formStarted, setFormStarted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Track initial interaction
  const handleFieldFocus = () => {
    if (!formStarted) {
      setFormStarted(true)
      onPlanStarted?.()
      trackEvent('trip_form_start', {
        campaign: 'dussehra_2026',
        source: 'dussehra_hero_planner',
      })
    }
  }

  // Swap From and To
  const handleSwap = () => {
    const temp = from
    setFrom(to)
    setTo(temp)
  }

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!to.trim()) {
      setError('Please choose a destination for your trip.')
      return
    }

    if (!from.trim()) {
      setError('Please provide your departure city.')
      return
    }

    if (!startDate) {
      setError('Please choose a travel departure date.')
      return
    }

    if (endDate && new Date(endDate) < new Date(startDate)) {
      setError('Return date cannot be earlier than departure date.')
      return
    }

    const numBudget = Number(budget)
    if (isNaN(numBudget) || numBudget <= 0) {
      setError('Please enter a valid budget amount in INR.')
      return
    }

    const numTravelers = parseInt(travelers) || 1
    // Calculate total trip budget for the system if per_person is selected
    const totalBudget = budgetScope === 'per_person' ? numBudget * numTravelers : numBudget

    // Analytics
    trackEvent('trip_form_submit', {
      campaign: 'dussehra_2026',
      source: 'dussehra_hero_planner',
      destination: to,
      travelers: numTravelers,
      budget: totalBudget,
      budget_scope: budgetScope,
      travel_style: travelStyle,
      is_authenticated: Boolean(isSignedIn),
    })

    analytics.plannerStarted({
      source: 'dussehra_campaign',
      hasDates: Boolean(startDate),
      budget: totalBudget,
      travelers: numTravelers,
    })

    const payload = {
      from,
      to,
      startDate,
      endDate,
      budget: String(totalBudget),
      budgetScope,
      budgetPerPerson: budgetScope === 'per_person' ? String(numBudget) : String(Math.round(totalBudget / numTravelers)),
      travelers: String(numTravelers),
      style: travelStyle,
      currency: 'INR',
      campaign: 'dussehra-2026',
    }

    // Persist payload so the planner picks it up after signup/login or directly
    sessionStorage.setItem('tripContext', JSON.stringify(payload))

    // Requirement: Only for this landing page, prompt user to sign up before viewing generated trip
    if (isLoaded && isSignedIn) {
      setLoading(true)
      setTimeout(() => {
        router.push('/plan')
      }, 400)
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <>
      <div className={`bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[#E8E0D8] shadow-2xl p-4 sm:p-6 w-full max-w-lg transition-all ${className}`}>
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left" noValidate>
          {/* Row 1: Destination and Starting Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
            {/* Destination */}
            <div>
              <label htmlFor="dussehra-destination" className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">
                Destination
              </label>
              <div className="relative" onFocus={handleFieldFocus}>
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EA580C] pointer-events-none z-10" />
                <LocationAutocomplete
                  value={to}
                  onChange={val => setTo(val)}
                  placeholder="e.g. Goa, Manali, Bali..."
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none min-h-[44px]"
                />
              </div>
            </div>

            {/* Starting Location with Swap Button */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="dussehra-origin" className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                  Starting location
                </label>
                <button
                  type="button"
                  onClick={handleSwap}
                  aria-label="Swap departure and destination"
                  className="text-[#6B6B6B] hover:text-[#EA580C] transition-colors p-0.5 rounded cursor-pointer"
                  title="Swap origin and destination"
                >
                  <ArrowRightLeft size={13} strokeWidth={2} />
                </button>
              </div>
              <div className="relative" onFocus={handleFieldFocus}>
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none z-10" />
                <LocationAutocomplete
                  value={from}
                  onChange={val => setFrom(val)}
                  placeholder="e.g. Hyderabad, Delhi..."
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Travel Dates & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Travel Dates */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">
                Travel dates
              </label>
              <div className="flex items-center bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-2.5 py-1.5 min-h-[44px]">
                <Calendar size={15} className="text-[#EA580C] shrink-0 mr-1.5" />
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1A1A1A] w-full">
                  <input
                    type="date"
                    aria-label="Travel departure date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    onFocus={handleFieldFocus}
                    className="bg-transparent border-none outline-none text-xs sm:text-xs font-semibold text-[#1A1A1A] p-0 w-[110px]"
                    required
                  />
                  <span className="text-[#9CA3AF]">–</span>
                  <input
                    type="date"
                    aria-label="Travel return date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    onFocus={handleFieldFocus}
                    className="bg-transparent border-none outline-none text-xs sm:text-xs font-semibold text-[#1A1A1A] p-0 w-[110px]"
                  />
                </div>
              </div>
            </div>

            {/* Budget with Scope Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="dussehra-budget" className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                  Budget (INR)
                </label>
                <select
                  aria-label="Budget scope"
                  value={budgetScope}
                  onChange={e => setBudgetScope(e.target.value as any)}
                  className="bg-transparent text-[11px] font-bold text-[#EA580C] border-none outline-none cursor-pointer p-0"
                >
                  <option value="per_person">Per person</option>
                  <option value="total">Total trip</option>
                </select>
              </div>
              <div className="flex items-center bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3 py-1.5 min-h-[44px]">
                <span className="text-sm font-bold text-[#EA580C] mr-1.5">₹</span>
                <input
                  id="dussehra-budget"
                  type="number"
                  min="1000"
                  step="500"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  onFocus={handleFieldFocus}
                  placeholder="15000"
                  className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-[#1A1A1A] placeholder:text-[#9CA3AF]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 3: Travelers & Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Travelers */}
            <div>
              <label htmlFor="dussehra-travelers" className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">
                Travelers
              </label>
              <div className="relative" onFocus={handleFieldFocus}>
                <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                <select
                  id="dussehra-travelers"
                  value={travelers}
                  onChange={e => setTravelers(e.target.value)}
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold text-[#1A1A1A] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none min-h-[44px] cursor-pointer appearance-none"
                >
                  <option value="1">1 Solo Traveler</option>
                  <option value="2">2 Adults (Couple / Friends)</option>
                  <option value="3">3 Travelers (Small Group)</option>
                  <option value="4">4 Travelers (Family / Squad)</option>
                  <option value="5">5 Travelers</option>
                  <option value="6">6+ Travelers</option>
                </select>
              </div>
            </div>

            {/* Travel Style */}
            <div>
              <label htmlFor="dussehra-style" className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">
                Travel style
              </label>
              <div className="relative" onFocus={handleFieldFocus}>
                <Compass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                <select
                  id="dussehra-style"
                  value={travelStyle}
                  onChange={e => setTravelStyle(e.target.value)}
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold text-[#1A1A1A] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none min-h-[44px] cursor-pointer appearance-none"
                >
                  <option value="balanced">Balanced (Smart Value)</option>
                  <option value="budget">Budget-Conscious</option>
                  <option value="adventure">Adventure & Outdoor</option>
                  <option value="luxury">Luxury & Premium</option>
                  <option value="family">Family-Friendly</option>
                  <option value="romantic">Romantic Escape</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold animate-fade-in" role="alert">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary CTA Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#C2410C] hover:to-[#EA580C] text-white font-extrabold text-sm sm:text-base py-3 sm:py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all cursor-pointer min-h-[48px]"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Opening Your Trip Plan...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-white" />
                <span>Generate Trip</span>
                <ArrowRight size={16} strokeWidth={2.2} />
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-[#9CA3AF] font-medium pt-0.5">
            Start planning for free · Transparent partner rates · No hidden charges
          </p>
        </form>
      </div>

      {/* ── Landing Page Only: Sign-Up Modal Gate to Unlock & View Generated Trip ── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-[#E8E0D8] rounded-3xl shadow-2xl p-6 sm:p-7 text-center space-y-5">
            
            {/* Close Modal Button */}
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} strokeWidth={2} />
            </button>

            {/* Festive Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
              <Sparkles size={28} className="text-white" />
            </div>

            {/* Header */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-[#EA580C] text-[10px] font-black uppercase tracking-wider">
                <span>🏹</span>
                <span>Itinerary Ready</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-display text-[#1A1A1A] tracking-tight">
                Your Trip to {to || 'Your Destination'} is Ready!
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
                Sign up in 10 seconds to unlock your day-wise itinerary, compare live flights and hotels, and view map routes.
              </p>
            </div>

            {/* Trip Summary Chip */}
            <div className="p-3 bg-[#FFFBF7] rounded-2xl border border-[#E8E0D8] text-left text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#1A1A1A]">
                <span>{from} ➔ {to}</span>
                <span className="text-[#EA580C]">₹{budget} {budgetScope === 'per_person' ? '/person' : 'total'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#6B6B6B]">
                <span>{startDate} to {endDate || 'Open'}</span>
                <span>{travelers} {parseInt(travelers) === 1 ? 'Traveler' : 'Travelers'} · {travelStyle}</span>
              </div>
            </div>

            {/* Action Buttons: Clerk SignUp & SignIn */}
            <div className="space-y-2.5 pt-1">
              <SignUpButton mode="modal" fallbackRedirectUrl="/plan">
                <button
                  type="button"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EA580C] hover:opacity-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-98 transition-all cursor-pointer"
                >
                  <Lock size={15} />
                  <span>Sign Up to View Trip</span>
                  <ArrowRight size={15} strokeWidth={2.4} />
                </button>
              </SignUpButton>

              <div className="text-xs text-[#6B6B6B] flex items-center justify-center gap-1 pt-1">
                <span>Already have an account?</span>
                <SignInButton mode="modal" fallbackRedirectUrl="/plan">
                  <button
                    type="button"
                    className="font-extrabold text-[#EA580C] hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    Sign In
                  </button>
                </SignInButton>
              </div>

              {/* Direct Link Fallback */}
              <div className="pt-1">
                <Link
                  href="/sign-up?redirect_url=/plan"
                  className="text-[11px] text-[#9CA3AF] hover:text-[#6B6B6B] transition-colors"
                >
                  Continue via standard sign-up page →
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#16A34A] font-bold">
              <CheckCircle2 size={13} />
              <span>100% Free · Saved to your personal dashboard</span>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
