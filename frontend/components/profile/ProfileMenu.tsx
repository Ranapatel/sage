'use client'

import React from 'react'
import {
  User,
  Sliders,
  Bookmark,
  Calendar,
  Image as ImageIcon,
  Wallet,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'

export type ProfileTab =
  | 'overview'
  | 'personal'
  | 'preferences'
  | 'saved'
  | 'history'
  | 'memories'
  | 'wallet'
  | 'referrals'
  | 'settings'

interface ProfileMenuProps {
  activeTab: ProfileTab
  onTabChange: (tab: ProfileTab) => void
  onSupportClick: () => void
  onSignOutClick: () => void
}

const sections = [
  {
    label: 'Overview',
    items: [
      { id: 'overview' as ProfileTab, label: 'Overview Dashboard', icon: LayoutDashboard, accent: 'text-slate-500' },
    ],
  },
  {
    label: 'My Profile',
    items: [
      { id: 'personal' as ProfileTab, label: 'Personal Profile', icon: User, accent: 'text-slate-500' },
      { id: 'preferences' as ProfileTab, label: 'Travel Preferences', icon: Sliders, accent: 'text-slate-500' },
    ],
  },
  {
    label: 'Activity',
    items: [
      { id: 'saved' as ProfileTab, label: 'Saved Content', icon: Bookmark, accent: 'text-slate-500' },
      { id: 'history' as ProfileTab, label: 'Trip History', icon: Calendar, accent: 'text-slate-500' },
      { id: 'memories' as ProfileTab, label: 'Memories', icon: ImageIcon, accent: 'text-slate-500' },
    ],
  },
  {
    label: 'Rewards',
    items: [
      { id: 'wallet' as ProfileTab, label: 'Sage Wallet', icon: Wallet, accent: 'text-slate-500' },
      { id: 'referrals' as ProfileTab, label: 'Refer & Earn', icon: Users, accent: 'text-slate-500' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'settings' as ProfileTab, label: 'Account Settings', icon: Settings, accent: 'text-slate-500' },
    ],
  },
]

export default function ProfileMenu({
  activeTab,
  onTabChange,
  onSupportClick,
  onSignOutClick,
}: ProfileMenuProps) {
  return (
    <div className="flex flex-col w-full bg-white border border-[#E8E0D8] rounded-3xl overflow-hidden shadow-sm">

      {/* Header label */}
      <div className="px-5 pt-4 pb-3 border-b border-[#E8E0D8]">
        <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.15em]">
          Profile Settings
        </p>
      </div>

      {/* Scrollable nav area */}
      <div className="flex flex-col py-2 px-2">
        {sections.map((section, si) => (
          <div key={section.label} className={si > 0 ? 'mt-1' : ''}>
            {/* Section label */}
            <div className="px-3 py-1.5">
              <p className="text-[0.58rem] font-black text-slate-400 uppercase tracking-[0.12em]">
                {section.label}
              </p>
            </div>

            {/* Items */}
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer group ${
                    isActive
                      ? 'bg-[#EA580C] text-white shadow-md shadow-orange-500/10'
                      : 'text-slate-600 hover:text-[#1A1A1A] hover:bg-[#FFFBF7]'
                  }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-white/80 rounded-full" />
                  )}

                  <Icon
                    size={15}
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  />
                  <span className="truncate leading-none">{item.label}</span>

                  {/* Active dot */}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                  )}
                </button>
              )
            })}

            {/* Section divider */}
            {si < sections.length - 1 && (
              <div className="mx-3 my-2 h-px bg-[#E8E0D8]" />
            )}
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div className="mt-auto border-t border-[#E8E0D8] px-2 py-2 space-y-0.5">
        <button
          onClick={onSupportClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#1A1A1A] hover:bg-[#FFFBF7] transition-all duration-200 cursor-pointer group"
        >
          <HelpCircle size={15} className="flex-shrink-0 text-slate-500 group-hover:text-slate-700 transition-colors" />
          Help & Support
        </button>

        <button
          onClick={onSignOutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer group"
        >
          <LogOut size={15} className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
