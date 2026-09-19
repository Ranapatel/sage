'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useClerk } from '@clerk/nextjs'
import { useAuthStore } from '@/store/authStore'
import { useRouter, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import { trackEvent } from '@/lib/analytics'
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react'
import UserMenu from './UserMenu'
import { useNavAuth } from '@/hooks/useNavAuth'
import RakhiCampaignBanner from '@/components/campaign/RakhiCampaignBanner'

// ─── Auth skeleton: a fixed-size grey pill shown while Clerk loads ───────────
// This prevents layout shift AND stops wrong icons flashing in
function AuthSkeleton() {
  return <div className="w-[72px] h-[36px] rounded-full bg-slate-100 animate-pulse" />
}

export default function Navbar() {
  const { isLoaded, isSignedIn } = useNavAuth()
  const { signOut } = useClerk()
  const { logout: storeLogout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-30 w-full border-b border-[#E8E0D8]/70 bg-[#FFFBF7]/90 backdrop-blur-md px-3 sm:px-4 md:px-6 py-2.5 md:py-4 flex items-center justify-between transition-all duration-200">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center gap-2 min-h-[40px] py-1 shrink-0 active:scale-95 transition-transform">
            <img
              src="/logo.png"
              alt="TripSage"
              width={34}
              height={34}
              className="rounded-lg shadow-2xs w-[28px] sm:w-[34px] h-[28px] sm:h-[34px] object-contain shrink-0"
            />
            <span
              className="font-display text-base sm:text-lg font-extrabold text-[#1A1A1A] tracking-tight shrink-0 select-none"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              TripSage
            </span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-7 text-[13px] font-semibold text-[#6B6B6B]">
          <Link href="/ai-trip-planner" className="hover:text-[#EA580C] transition-colors duration-200 py-2">AI Planner</Link>
          <Link href="/destinations" className="hover:text-[#EA580C] transition-colors duration-200 py-2">Destinations</Link>
          <Link href="/itineraries" className="hover:text-[#EA580C] transition-colors duration-200 py-2">Itineraries</Link>
          <Link href="/visa" className="hover:text-[#EA580C] transition-colors duration-200 py-2">Visa</Link>
          <Link href="/budget" className="hover:text-[#EA580C] transition-colors duration-200 py-2">Budget</Link>
          <Link href="/blog" className="hover:text-[#EA580C] transition-colors duration-200 py-2">Blog</Link>
          <Link href="/academy" className="hover:text-[#EA580C] transition-colors duration-200 py-2 flex items-center gap-1.5 group">
            <span>Academy</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#EA580C] text-white text-[10px] font-extrabold tracking-wide uppercase shadow-[0_2px_6px_rgba(234,88,12,0.35)] group-hover:scale-105 transition-transform">
              🔥 NEW
            </span>
          </Link>
          <div className="relative group py-2">
            <Link href="/support" className="flex items-center gap-1 hover:text-[#EA580C] transition-colors duration-200 outline-none">
              Support <ChevronDown size={16} strokeWidth={1.5} className="text-[#57534E] group-hover:text-[#1C1917] transition-colors" />
            </Link>
            <div className="absolute left-0 mt-1 w-44 bg-white border border-[#E8E0D8] rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-50 py-1.5 text-xs font-semibold">
              <Link href="/support" className="block px-4 py-2.5 hover:bg-[#FFFBF7] hover:text-[#EA580C] transition-colors">Help & Support</Link>
              <Link href="/support#contact" className="block px-4 py-2.5 hover:bg-[#FFFBF7] hover:text-[#EA580C] transition-colors">Contact Support</Link>
              <Link href="/terms-and-conditions" className="block px-4 py-2.5 hover:bg-[#FFFBF7] hover:text-[#EA580C] transition-colors">Terms & Privacy</Link>
            </div>
          </div>
        </div>

        {/* ── Desktop Right ── */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoaded ? (
            // While Clerk is resolving: show skeleton so nothing jumps
            <AuthSkeleton />
          ) : isSignedIn ? (
            <div className="flex items-center gap-3">
              {!isHomePage && (
                <Link
                  href="/plan"
                  onClick={() => trackEvent('plan_trip_click', { source: 'navbar' })}
                  className="bg-[#EA580C] text-white whitespace-nowrap text-xs py-2.5 px-4 items-center justify-center gap-1.5 rounded-full font-extrabold shadow-2xs hover:bg-[#C2410C] transition-all duration-200 min-h-[44px] flex"
                >
                  <span>+ Plan a trip</span>
                </Link>
              )}
              <UserMenu />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="text-sm py-2 px-4 items-center justify-center rounded-lg font-bold text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors duration-200 min-h-[44px] flex"
              >
                Sign In
              </Link>
              {!isHomePage && (
                <Link
                  href="/plan"
                  onClick={() => trackEvent('plan_trip_click', { source: 'navbar' })}
                  className="bg-[#EA580C] text-white whitespace-nowrap text-xs py-2.5 px-4 items-center justify-center gap-1.5 rounded-full font-extrabold shadow-2xs hover:bg-[#C2410C] transition-all duration-200 min-h-[44px] flex"
                >
                  <span>Plan a trip</span> <ArrowRight size={14} strokeWidth={2} className="text-white" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── Mobile Right ── */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          {/* Direct Mobile Academy Pill — compact on small screens */}
          <Link
            href="/academy"
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold transition-all active:scale-95 shadow-2xs shrink-0 ${
              pathname === '/academy'
                ? 'bg-orange-100 border-[#EA580C] text-[#EA580C]'
                : 'bg-orange-50/90 border-orange-200 text-[#EA580C] hover:bg-orange-100'
            }`}
          >
            <span className="font-extrabold text-[11px] tracking-tight">Academy</span>
            <span className="text-[9px] font-black uppercase tracking-wider bg-[#EA580C] text-white px-1 py-0.5 rounded leading-none">
              Free
            </span>
          </Link>

          {!isLoaded ? (
            // Skeleton prevents layout shift while Clerk loads
            <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse shrink-0" />
          ) : isSignedIn ? (
            // Signed in: show avatar/initial via UserMenu
            <div className="shrink-0">
              <UserMenu />
            </div>
          ) : (
            // Signed out: Sign In always visible
            <Link
              href="/sign-in"
              className="flex items-center px-2.5 py-1.5 text-[11px] font-bold text-[#EA580C] border border-[#EA580C]/40 rounded-full hover:bg-[#EA580C]/5 transition-all active:scale-95 shrink-0 whitespace-nowrap"
            >
              Sign In
            </Link>
          )}

          {/* Hamburger button — opens mobile navigation drawer */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="flex items-center justify-center w-[36px] h-[36px] rounded-full border border-[#E8E0D8] bg-white hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <Menu size={16} strokeWidth={2} className="text-[#1A1A1A]" />
          </button>
        </div>
      </nav>

      {/* ── Mobile Drawer (X lives ONLY inside here) ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[9998] md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[75%] bg-white z-[9999] shadow-2xl p-6 flex flex-col md:hidden"
            >
              {/* Close button — X stays inside drawer, never outside */}
              <div className="flex justify-between items-center mb-5">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  aria-label="Close menu"
                >
                  <X size={16} strokeWidth={2} className="text-[#1C1917]" />
                </button>
              </div>

              <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
                {/* 🌟 Featured Academy Card in Mobile Menu */}
                <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-b from-[#FFF9F5] to-[#FFF4EC] border border-orange-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20 text-lg">
                      🎓
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-xs font-black text-[#1A1A1A] tracking-tight truncate">
                          TripSage Academy
                        </h3>
                        <span className="px-1.5 py-0.5 rounded-md bg-[#EA580C] text-white text-[9px] font-black uppercase tracking-wider shrink-0 leading-none">
                          FREE
                        </span>
                      </div>
                      <p className="text-[11px] text-[#78716C] font-medium leading-tight mt-1 truncate">
                        5-Episode Masterclass on AGI
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/academy"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2 px-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all"
                  >
                    <span>Enroll for Free</span>
                    <ArrowRight size={13} strokeWidth={2.5} />
                  </Link>
                </div>

                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[44px] px-4 text-base font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Home</Link>
                <Link href="/ai-trip-planner" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[44px] px-4 text-base font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">AI Trip Planner</Link>
                <Link href="/destinations" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[44px] px-4 text-base font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Destinations</Link>
                <Link href="/itineraries" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[44px] px-4 text-base font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Itineraries</Link>
                <Link href="/visa" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[44px] px-4 text-base font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Visa Requirements</Link>
                <Link href="/budget" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[44px] px-4 text-base font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Budget Planner</Link>
                <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[44px] px-4 text-base font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Blog</Link>
                <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[44px] px-4 text-base font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Support</Link>

                <div className="h-px bg-slate-100 my-3 mx-4" />

                {/* Auth section — gated on isLoaded to avoid flash */}
                {!isLoaded ? (
                  <div className="px-4 space-y-2">
                    <div className="h-[46px] rounded-xl bg-slate-100 animate-pulse" />
                    <div className="h-[46px] rounded-xl bg-slate-100 animate-pulse" />
                  </div>
                ) : isSignedIn ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mt-2 mb-1">Navigation</span>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[46px] px-4 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl">Dashboard</Link>

                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mt-3 mb-1">Travel Profile</span>
                    <Link href="/profile?tab=personal" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[46px] px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">Personal Profile</Link>
                    <Link href="/profile?tab=preferences" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[46px] px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">Travel Preferences</Link>
                    <Link href="/profile?tab=saved" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[46px] px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">Saved Content</Link>
                    <Link href="/profile?tab=history" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[46px] px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">Trip History</Link>
                    <Link href="/profile?tab=memories" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[46px] px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">Memories</Link>

                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mt-3 mb-1">Rewards & Settings</span>
                    <Link href="/profile?tab=wallet" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[46px] px-4 text-sm font-semibold text-indigo-600 hover:bg-indigo-50/50 rounded-xl">Sage Wallet</Link>
                    <Link href="/profile?tab=referrals" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[46px] px-4 text-sm font-semibold text-indigo-600 hover:bg-indigo-50/50 rounded-xl">Refer & Earn</Link>
                    <Link href="/profile?tab=settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[46px] px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">Account Settings</Link>

                    <div className="h-px bg-slate-100 my-2 mx-4" />
                    <button
                      onClick={async () => {
                        setMobileMenuOpen(false)
                        const t = toast.loading('Signing out...')
                        try {
                          await signOut()
                          storeLogout()
                          toast.success('Signed out!', { id: t })
                          router.replace('/')
                        } catch {
                          toast.error('Error signing out', { id: t })
                        }
                      }}
                      className="flex items-center text-left h-[46px] px-4 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl cursor-pointer bg-transparent border-none w-full"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center h-[52px] px-4 text-lg font-semibold text-[#EA580C] hover:bg-orange-50 rounded-xl"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
