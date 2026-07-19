'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser, useClerk } from '@clerk/nextjs'
import { useAuthStore } from '@/store/authStore'
import {
  Menu, User, Bookmark, Calendar, Image as ImageIcon,
  Wallet, Users, Settings, HelpCircle, LogOut, Globe,
  ChevronRight, Sliders, MapPin, Shield, LayoutDashboard
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function UserMenu() {
  const router = useRouter()
  const pathname = usePathname()
  const { user: clerkUser, isSignedIn: isClerkSignedIn } = useUser()
  const { signOut: clerkSignOut } = useClerk()
  const { user: storeUser, isLoggedIn: isStoreLoggedIn, logout: storeLogout } = useAuthStore()

  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isSignedIn = isClerkSignedIn || isStoreLoggedIn

  const user = isClerkSignedIn && clerkUser
    ? {
        name: clerkUser.fullName || clerkUser.firstName || 'Traveler',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        imageUrl: clerkUser.imageUrl,
        initial: (clerkUser.firstName || 'T').charAt(0).toUpperCase(),
        verified: true,
      }
    : isStoreLoggedIn && storeUser
      ? {
          name: storeUser.name,
          email: storeUser.email,
          imageUrl: null,
          initial: storeUser.name.charAt(0).toUpperCase(),
          verified: false,
        }
      : null

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  // Close on route change
  useEffect(() => { setIsOpen(false) }, [pathname])

  const handleLogout = async () => {
    setIsOpen(false)
    try {
      if (isClerkSignedIn) await clerkSignOut()
      if (isStoreLoggedIn) storeLogout()
      toast.success('Signed out successfully')
      router.push('/')
    } catch {
      toast.error('Error signing out')
    }
  }

  const go = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  const sections = [
    {
      label: 'Travel',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', accent: 'text-slate-500' },
        { icon: MapPin, label: 'Plan a Trip', path: '/plan', accent: 'text-slate-500' },
      ],
    },
    {
      label: 'My Profile',
      items: [
        { icon: User, label: 'Personal Profile', path: '/profile?tab=personal', accent: 'text-slate-500' },
        { icon: Sliders, label: 'Travel Preferences', path: '/profile?tab=preferences', accent: 'text-slate-500' },
        { icon: Bookmark, label: 'Saved Content', path: '/profile?tab=saved', accent: 'text-slate-500' },
        { icon: Calendar, label: 'Trip History', path: '/profile?tab=history', accent: 'text-slate-500' },
        { icon: ImageIcon, label: 'Memories', path: '/profile?tab=memories', accent: 'text-slate-500' },
      ],
    },
    {
      label: 'Rewards',
      items: [
        { icon: Wallet, label: 'Sage Wallet', path: '/profile?tab=wallet', accent: 'text-slate-500', badge: 'Points' },
        { icon: Users, label: 'Refer & Earn', path: '/profile?tab=referrals', accent: 'text-slate-500' },
      ],
    },
    {
      label: 'Settings',
      items: [
        { icon: Settings, label: 'Account Settings', path: '/profile?tab=settings', accent: 'text-slate-500' },
        { icon: Globe, label: 'Language & Currency', path: '/profile?tab=settings', accent: 'text-slate-500' },
        { icon: HelpCircle, label: 'Help Centre', path: '/support', accent: 'text-slate-500' },
      ],
    },
  ]

  return (
    <div className="relative inline-block text-left" ref={menuRef}>

      {/* ── Trigger Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-2.5 border transition-all duration-200 px-2.5 py-1.5 rounded-full cursor-pointer bg-white select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] ${
          isOpen
            ? 'border-slate-300 shadow-lg'
            : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
        }`}
      >
        <Menu size={16} strokeWidth={1.5} className={`transition-colors ${isOpen ? 'text-[#1C1917]' : 'text-[#57534E]'}`} />

        {isSignedIn && user ? (
          user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-xs shadow">
              {user.initial}
            </div>
          )
        ) : (
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <User size={16} strokeWidth={1.5} className="text-[#57534E]" />
          </div>
        )}
      </button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-[280px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[1000] focus:outline-none"
            role="menu"
          >
            {isSignedIn && user ? (
              <>
                {/* ── User Header ── */}
                <div className="bg-gradient-to-br from-slate-50 to-white px-4 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-base shadow-md flex-shrink-0">
                        {user.initial}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-slate-900 text-sm truncate leading-tight">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                      {user.verified && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                          <Shield size={12} strokeWidth={1.5} className="text-green-700" />
                          Verified
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => go('/profile')}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
                      title="View full profile"
                    >
                      <ChevronRight size={16} strokeWidth={1.5} className="text-[#57534E]" />
                    </button>
                  </div>
                </div>

                {/* ── Sections ── */}
                <div className="max-h-[420px] overflow-y-auto overscroll-contain py-1">
                  {sections.map((section, si) => (
                    <div key={section.label}>
                      {si > 0 && <div className="mx-3 my-1 h-px bg-slate-100" />}
                      <div className="px-3 pt-2 pb-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                          {section.label}
                        </p>
                      </div>
                      {section.items.map((item) => {
                        const Icon = item.icon
                        const isCurrentPage = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path.split('?')[0]))
                        return (
                          <button
                            key={item.path + item.label}
                            role="menuitem"
                            onClick={() => go(item.path)}
                            className="w-full text-left px-3 py-0.5 group cursor-pointer"
                          >
                            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                              isCurrentPage
                                ? 'bg-slate-100/70 text-[#1C1917]'
                                : 'text-[#57534E] hover:bg-slate-50 hover:text-[#1C1917]'
                            }`}>
                              <Icon
                                size={16}
                                strokeWidth={1.5}
                                className={`flex-shrink-0 transition-colors ${
                                  isCurrentPage ? 'text-[#1C1917]' : 'text-[#57534E] group-hover:text-[#1C1917]'
                                }`}
                              />
                              <span className={`flex-1 text-[13px] font-semibold leading-none ${
                                isCurrentPage ? 'text-[#1C1917]' : ''
                              }`}>
                                {item.label}
                              </span>
                              {(item as any).badge && (
                                <span className="text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                                  {(item as any).badge}
                                </span>
                              )}
                              {isCurrentPage && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[#1C1917] flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>

                {/* ── Sign Out ── */}
                <div className="border-t border-slate-100 p-2">
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 cursor-pointer group"
                  >
                    <LogOut size={16} strokeWidth={1.5} className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform text-red-500" />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* ── Signed-out state ── */}
                <div className="p-4 border-b border-slate-100">
                  <p className="text-sm font-extrabold text-slate-900">Welcome to TripSage</p>
                  <p className="text-xs text-slate-400 mt-0.5">Sign in to unlock your personal travel experience.</p>
                </div>
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => go('/sign-in')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => go('/sign-up')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm rounded-xl transition-all cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
                <div className="px-4 py-3 border-t border-slate-100">
                  <button
                    onClick={() => go('/support')}
                    className="flex items-center gap-2 text-[12px] text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <HelpCircle size={16} strokeWidth={1.5} className="text-[#57534E]" />
                    Help Centre
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
