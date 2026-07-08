'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { trackEvent } from '@/lib/analytics'
import { Menu, X, ArrowRight, LogOut } from 'lucide-react'
import UserMenu from './UserMenu'

export default function Navbar() {
  const { user, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="glass sticky top-0 z-[100] px-3 sm:px-6 py-4 flex items-center justify-between border-b border-gray-100/50 shadow-sm bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dob5llmb2/image/upload/v1778407506/Primary.JPEG.Logo_1_o0h85v.png"
              alt="TripSage"
              width={38}
              height={38}
              className="rounded-xl shadow-sm w-[38px] h-[38px] object-contain"
            />
            <span className="font-display text-xl font-extrabold text-slate-900 tracking-tight hidden md:block">TripSage</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-slate-500">
          <Link href="/#features" className="hover:text-blue-600 transition-colors">Features</Link>
          <Link href="/#destinations" className="hover:text-blue-600 transition-colors">Destinations</Link>
          <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          <Link href="/support" className="hover:text-blue-600 transition-colors">Support</Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
<<<<<<< HEAD
          {isLoggedIn && user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden sm:flex w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 items-center justify-center text-white text-xs font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
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
          
          <button className="md:hidden p-1.5 sm:p-2 text-slate-900" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={28} />
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
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-slate-900">
                  <X size={28} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Home</Link>
                <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Features</Link>
                <Link href="/#destinations" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Destinations</Link>
                <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Support</Link>
                <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Blog</Link>
                <div className="h-px bg-slate-100 my-4 mx-4"></div>
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



