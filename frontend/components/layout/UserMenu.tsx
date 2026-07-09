'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser, useClerk } from '@clerk/nextjs'
import { useAuthStore } from '@/store/authStore'
import { 
  Menu, User, Bookmark, Calendar, Image as ImageIcon, 
  Wallet, Users, Settings, HelpCircle, LogOut, Bell, Globe, History
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserMenuProps {
  onOpenNotifications?: () => void
}

export default function UserMenu({ onOpenNotifications }: UserMenuProps) {
  const router = useRouter()
  const { user: clerkUser, isSignedIn: isClerkSignedIn, isLoaded } = useUser()
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
        initial: (clerkUser.firstName || 'T').charAt(0).toUpperCase()
      }
    : isStoreLoggedIn && storeUser
      ? {
          name: storeUser.name,
          email: storeUser.email,
          imageUrl: null,
          initial: storeUser.name.charAt(0).toUpperCase()
        }
      : null

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsOpen(false)
    try {
      if (isClerkSignedIn) {
        await clerkSignOut()
      }
      if (isStoreLoggedIn) {
        storeLogout()
      }
      toast.success('Logged out successfully')
      router.push('/')
    } catch (err: any) {
      toast.error('Error logging out')
    }
  }

  const navigateTo = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 px-3 py-1.5 rounded-full cursor-pointer bg-white/95 backdrop-blur-sm select-none focus:outline-none"
      >
        <Menu size={16} className="text-slate-600" />
        
        {isSignedIn && user ? (
          user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover shadow-inner hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              {user.initial}
            </div>
          )
        ) : (
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shadow-inner">
            <User size={14} />
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2.5 w-64 bg-white/98 rounded-2xl shadow-xl border border-slate-100/90 py-2.5 z-[1000] focus:outline-none text-[13px] text-slate-700 font-medium font-body backdrop-blur-md"
          >
            {isSignedIn && user ? (
              <>
                {/* User Header */}
                <div className="px-4.5 py-2 mb-1.5 border-b border-slate-100/80 flex flex-col gap-0.5">
                  <span className="font-extrabold text-slate-800 text-[14px] truncate">{user.name}</span>
                  <span className="text-[11px] text-slate-400 font-normal truncate">{user.email}</span>
                </div>

                {/* Primary Group */}
                <button onClick={() => navigateTo('/dashboard')} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors">
                  <Calendar size={15} className="text-slate-400" />
                  Dashboard
                </button>
                <button onClick={() => navigateTo('/profile?tab=personal')} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors">
                  <User size={15} className="text-slate-400" />
                  Profile
                </button>
                <button onClick={() => navigateTo('/profile?tab=preferences')} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors">
                  <Settings size={15} className="text-slate-400" />
                  Preferences
                </button>
                <button onClick={() => navigateTo('/profile?tab=saved')} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors">
                  <Bookmark size={15} className="text-slate-400" />
                  Saved Content
                </button>
                <button onClick={() => navigateTo('/profile?tab=history')} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors">
                  <History size={15} className="text-slate-400" />
                  Trip History
                </button>
                <button onClick={() => navigateTo('/profile?tab=memories')} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors">
                  <ImageIcon size={15} className="text-slate-400" />
                  Memories
                </button>

                <div className="h-px bg-slate-100 my-1.5"></div>

                {/* Secondary Group */}
                {onOpenNotifications ? (
                  <button onClick={() => { setIsOpen(false); onOpenNotifications(); }} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors">
                    <Bell size={15} className="text-slate-400" />
                    Notifications
                  </button>
                ) : (
                  <button onClick={() => navigateTo('/profile?tab=overview')} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors">
                    <Bell size={15} className="text-slate-400" />
                    Notifications
                  </button>
                )}
                
                <button onClick={() => navigateTo('/profile?tab=settings')} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors">
                  <Settings size={15} className="text-slate-400" />
                  Account settings
                </button>
                
                <button onClick={() => { setIsOpen(false); toast('Currency selection is available in the dashboard header.'); }} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors">
                  <Globe size={15} className="text-slate-400" />
                  Languages & currency
                </button>
                
                <button onClick={() => navigateTo('/support')} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors">
                  <HelpCircle size={15} className="text-slate-400" />
                  Help Centre
                </button>

                <div className="h-px bg-slate-100 my-1.5"></div>

                {/* Sage Features */}
                <button onClick={() => navigateTo('/profile?tab=wallet')} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors">
                  <Wallet size={15} className="text-indigo-500" />
                  Sage Wallet
                </button>
                <button onClick={() => navigateTo('/profile?tab=referrals')} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors">
                  <Users size={15} className="text-indigo-500" />
                  Refer & Earn
                </button>

                <div className="h-px bg-slate-100 my-1.5"></div>

                {/* Logout */}
                <button onClick={handleLogout} className="w-full text-left px-4.5 py-2 hover:bg-red-50 text-red-500 flex items-center gap-2.5 transition-colors">
                  <LogOut size={15} className="text-red-400" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigateTo('/sign-in')} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 font-bold text-slate-800 transition-colors">
                  Log in
                </button>
                <button onClick={() => navigateTo('/sign-up')} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 text-slate-600 transition-colors">
                  Sign up
                </button>
                <div className="h-px bg-slate-100 my-1.5"></div>
                <button onClick={() => navigateTo('/support')} className="w-full text-left px-4.5 py-2 hover:bg-slate-50 text-slate-600 transition-colors">
                  Help Centre
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
