'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Compass, 
  Calendar, 
  Image as ImageIcon, 
  Wallet,
  Bookmark,
  Sliders,
  Users,
  Settings,
  ArrowRight,
  TrendingUp,
  MapPin,
} from 'lucide-react'
import { ProfileTab } from './ProfileMenu'

interface OverviewDashboardProps {
  stats: {
    tripsCreated: number
    countriesVisited: number
    memoriesUploaded: number
    walletBalance: number
  }
  onTabChange: (tab: ProfileTab) => void
}

const quickActions = [
  {
    tab: 'personal' as ProfileTab,
    icon: Compass,
    label: 'Personal Profile',
    desc: 'Update your travel identity, phone number, and country.',
    iconColor: 'text-[#EA580C]',
    badgeBg: 'bg-orange-50 border-orange-100',
  },
  {
    tab: 'preferences' as ProfileTab,
    icon: Sliders,
    label: 'Travel Preferences',
    desc: 'Set your travel style, budget range, and food preferences.',
    iconColor: 'text-[#EA580C]',
    badgeBg: 'bg-orange-50 border-orange-100',
  },
  {
    tab: 'history' as ProfileTab,
    icon: Calendar,
    label: 'Trip History',
    desc: 'Browse your generated itineraries and past adventures.',
    iconColor: 'text-[#EA580C]',
    badgeBg: 'bg-orange-50 border-orange-100',
  },
  {
    tab: 'saved' as ProfileTab,
    icon: Bookmark,
    label: 'Saved Content',
    desc: 'Access bookmarked flights, hotels, and activities.',
    iconColor: 'text-[#EA580C]',
    badgeBg: 'bg-orange-50 border-orange-100',
  },
  {
    tab: 'memories' as ProfileTab,
    icon: ImageIcon,
    label: 'Memories',
    desc: 'Upload and revisit your travel photo collections.',
    iconColor: 'text-[#EA580C]',
    badgeBg: 'bg-orange-50 border-orange-100',
  },
  {
    tab: 'wallet' as ProfileTab,
    icon: Wallet,
    label: 'Sage Wallet',
    desc: 'View your Sage Points balance and transaction history.',
    iconColor: 'text-[#EA580C]',
    badgeBg: 'bg-orange-50 border-orange-100',
  },
  {
    tab: 'referrals' as ProfileTab,
    icon: Users,
    label: 'Refer & Earn',
    desc: 'Invite friends and earn 100 Sage Points per referral.',
    iconColor: 'text-[#EA580C]',
    badgeBg: 'bg-orange-50 border-orange-100',
  },
  {
    tab: 'settings' as ProfileTab,
    icon: Settings,
    label: 'Account Settings',
    desc: 'Change name, security, language, currency, and notifications.',
    iconColor: 'text-[#EA580C]',
    badgeBg: 'bg-orange-50 border-orange-100',
  },
]

export default function OverviewDashboard({ stats, onTabChange }: OverviewDashboardProps) {
  const statCards = [
    { label: 'Trips Created', value: stats.tripsCreated, icon: '📅' },
    { label: 'Countries', value: stats.countriesVisited, icon: '🗺️' },
    { label: 'Memories', value: stats.memoriesUploaded, icon: '📷' },
    { label: 'Sage Points', value: stats.walletBalance.toLocaleString(), icon: '🪙' },
  ]

  return (
    <div className="space-y-8">

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-3xl border border-[#E8E0D8] bg-white shadow-sm"
          >
            <span className="text-2xl mb-2">{s.icon}</span>
            <span className="text-2xl font-black text-[#1A1A1A]">{s.value}</span>
            <span className="text-[0.6rem] text-slate-400 font-bold uppercase tracking-widest mt-1 text-center">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Plan CTA Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E8E0D8] bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-white p-6 md:p-8 shadow-sm">
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <span className="text-[10px] font-black text-[#EA580C] uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <TrendingUp size={12} /> AI Trip Planner
            </span>
            <h3 className="text-xl font-black text-[#1A1A1A] leading-snug">
              Ready for your next adventure?
            </h3>
            <p className="text-slate-500 text-xs mt-1 max-w-md">
              Generate a full AI itinerary, compare flights, find the best hotels, and book activities — all in one place.
            </p>
          </div>
          <Link
            href="/plan"
            className="flex items-center gap-2 px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/10 whitespace-nowrap shrink-0 transition-all active:scale-[0.98] cursor-pointer"
          >
            <MapPin size={15} />
            Plan a Trip
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-1">
          Quick Access
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.tab}
                onClick={() => onTabChange(action.tab)}
                className="group flex items-start gap-4 p-5 rounded-2xl border border-[#E8E0D8] bg-white text-left hover:border-[#EA580C]/40 hover:bg-[#FFFBF7] transition-all duration-200 cursor-pointer shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${action.badgeBg}`}>
                  <Icon size={18} className={action.iconColor} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-[#1A1A1A] group-hover:text-[#EA580C] flex items-center gap-1.5 transition-colors">
                    {action.label}
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0" />
                  </p>
                  <p className="text-[0.65rem] text-slate-500 mt-0.5 leading-relaxed">
                    {action.desc}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
