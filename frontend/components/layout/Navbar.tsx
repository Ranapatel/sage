'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { trackEvent } from '@/lib/analytics'
<<<<<<< Updated upstream
import { Menu, X, ArrowRight, LogOut } from 'lucide-react'
import UserMenu from './UserMenu'
=======
import { Menu, X, ArrowRight, LogOut, ChevronDown } from 'lucide-react'
>>>>>>> Stashed changes

export default function Navbar() {
  const { user, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <nav className="sticky top-0 z-[100] w-full border-b border-[#E8E0D8] bg-[#FFFBF7] px-6 py-4 flex items-center justify-between transition-all duration-200">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://res.cloudinary.com/dob5llmb2/image/upload/v1778407506/Primary.JPEG.Logo_1_o0h85v.png"
              alt="TripSage"
              width={34}
              height={34}
              className="rounded-lg shadow-sm w-[34px] h-[34px] object-contain"
            />
            <span className="font-display text-lg font-extrabold text-[#1A1A1A] tracking-tight hidden md:block">TripSage</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-[#6B6B6B]">
          <Link href="/#features" className="hover:text-[#EA580C] transition-colors duration-200">Features</Link>
          <Link href="/#destinations" className="hover:text-[#EA580C] transition-colors duration-200">Destinations</Link>
          <Link href="/blog" className="hover:text-[#EA580C] transition-colors duration-200">Blog</Link>
          <Link href="/visa-guide" className="hover:text-[#EA580C] transition-colors duration-200">Visa Guide</Link>
          
          {/* Support Dropdown */}
          <div className="relative group py-2">
            <button suppressHydrationWarning className="flex items-center gap-1 hover:text-[#EA580C] transition-colors duration-200 outline-none">
              Support <ChevronDown size={12} strokeWidth={1.5} />
            </button>
            <div className="absolute left-0 mt-1 w-36 bg-white border border-[#E8E0D8] rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-50 py-1">
              <Link href="/support" className="block px-4 py-2 hover:bg-[#FFFBF7] hover:text-[#EA580C] transition-colors">Support Center</Link>
              <Link href="/visa-guide" className="block px-4 py-2 hover:bg-[#FFFBF7] hover:text-[#EA580C] transition-colors">Visa Guide</Link>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
<<<<<<< Updated upstream
<<<<<<< HEAD
          {isLoggedIn && user ? (
=======
          {mounted && isLoggedIn && user ? (
>>>>>>> Stashed changes
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden sm:flex w-8 h-8 rounded-full bg-[#EA580C] items-center justify-center text-white text-xs font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
<<<<<<< Updated upstream
              <span className="text-sm font-semibold text-slate-900 hidden sm:block">{user.name}</span>
              <Link href="/plan" className="hidden md:flex btn-primary whitespace-nowrap text-sm py-2 px-4 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">Dashboard</Link>
              <button onClick={() => logout()} className="hidden sm:block text-slate-400 hover:text-red-400 transition-colors p-2" title="Logout"><LogOut size={18} /></button>
=======
          <div className="hidden sm:flex items-center gap-2 text-xs text-blue-600 font-medium">
            <span className="live-dot bg-blue-600"></span>
            <span>Real-time Engine</span>
          </div>
          
          <SignedIn>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hidden md:flex hover:text-blue-600 font-semibold transition-colors text-sm text-slate-600">Dashboard</Link>
              <UserMenu />
>>>>>>> staging
            </div>
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" className="hidden sm:flex btn-primary text-sm py-2 px-4 items-center justify-center rounded-xl font-bold">Sign In</Link>
            <Link href="/plan" onClick={() => trackEvent('plan_trip_click', { source: 'navbar' })} className="hidden md:flex bg-blue-600 text-white whitespace-nowrap text-sm py-2 px-5 items-center justify-center gap-2 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:opacity-90 transition-opacity">Plan Trip <ArrowRight size={14} /></Link>
          </SignedOut>
=======
              <span className="text-sm font-semibold text-[#1A1A1A] hidden sm:block">{user.name}</span>
              <Link href="/plan" className="hidden md:flex whitespace-nowrap text-sm py-2 px-4 items-center justify-center rounded-lg bg-[#EA580C] text-white font-bold hover:bg-[#C2410C] transition-all duration-200">Dashboard</Link>
              <button onClick={() => logout()} className="hidden sm:block text-[#6B6B6B] hover:text-red-500 transition-colors duration-200 p-2" title="Logout"><LogOut size={16} strokeWidth={1.5} /></button>
            </div>
          ) : (
            <>
              <Link href="/auth" className="hidden sm:flex text-sm py-2 px-4 items-center justify-center rounded-lg font-bold text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors duration-200">Sign In</Link>
              <Link href="/plan" onClick={() => trackEvent('plan_trip_click', { source: 'navbar' })} className="hidden md:flex bg-[#EA580C] text-white whitespace-nowrap text-sm py-2 px-5 items-center justify-center gap-2 rounded-lg font-bold shadow-md shadow-orange-500/10 hover:bg-[#C2410C] transition-all duration-200">Create my trip <ArrowRight size={14} strokeWidth={1.5} /></Link>
            </>
          )}
>>>>>>> Stashed changes
          
          <button className="md:hidden p-1.5 sm:p-2 text-[#1A1A1A]" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[9998] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[75%] bg-white z-[9999] shadow-2xl p-6 flex flex-col md:hidden"
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#57534E] hover:text-[#1C1917]">
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Home</Link>
                <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Features</Link>
                <Link href="/#destinations" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Destinations</Link>
                <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Support</Link>
                <Link href="/visa-guide" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Visa Guide</Link>
                <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Blog</Link>
                <div className="h-px bg-slate-100 my-4 mx-4"></div>
<<<<<<< Updated upstream
                <SignedIn>
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[60vh] pr-2">
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
                    
                    <div className="h-px bg-slate-100 my-2 mx-4"></div>
                    <button 
                      onClick={async () => { 
                        setMobileMenuOpen(false); 
                        const outToast = toast.loading('Signing out...');
                        await signOut(() => {
                          toast.success('Signed out successfully!', { id: outToast });
                          router.replace('/');
                        });
                      }} 
                      className="flex items-center text-left h-[46px] px-4 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl cursor-pointer bg-transparent border-none w-full"
                    >
                      Sign Out
                    </button>
=======
                {mounted && isLoggedIn && user ? (
                  <div className="flex flex-col gap-2">
                    <Link href="/plan" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-blue-600 hover:bg-blue-50 rounded-xl">Dashboard</Link>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center h-[52px] px-4 text-lg font-semibold text-red-500 hover:bg-red-50 rounded-xl text-left w-full">Logout</button>
>>>>>>> Stashed changes
                  </div>
                </SignedIn>
                <SignedOut>
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-blue-600 hover:bg-blue-50 rounded-xl">Sign In</Link>
                </SignedOut>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}



