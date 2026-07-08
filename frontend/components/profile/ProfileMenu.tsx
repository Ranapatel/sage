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
  LayoutDashboard
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

export default function ProfileMenu({
  activeTab,
  onTabChange,
  onSupportClick,
  onSignOutClick
}: ProfileMenuProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'personal', label: 'Personal Profile', icon: User },
    { id: 'preferences', label: 'Travel Preferences', icon: Sliders },
    { id: 'saved', label: 'Saved Content', icon: Bookmark },
    { id: 'history', label: 'Trip History', icon: Calendar },
    { id: 'memories', label: 'Memories', icon: ImageIcon },
    { id: 'wallet', label: 'Sage Wallet', icon: Wallet },
    { id: 'referrals', label: 'Referrals', icon: Users },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ] as const

  return (
    <div className="flex flex-col gap-1 w-full bg-slate-950/40 border border-slate-800 p-4 rounded-3xl backdrop-blur-md shadow-lg">
      <div className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">
        Profile Settings
      </div>

      {/* Main navigation tabs */}
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 relative group cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-full"></span>
            )}
            <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200 transition-colors'} />
            <span>{item.label}</span>
          </button>
        )
      })}

      <div className="border-t border-slate-800/80 my-3"></div>

      {/* External / action buttons */}
      <button
        onClick={onSupportClick}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-all duration-300 cursor-pointer"
      >
        <HelpCircle size={16} />
        <span>Help & Support</span>
      </button>

      <button
        onClick={onSignOutClick}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 cursor-pointer"
      >
        <LogOut size={16} />
        <span>Sign Out</span>
      </button>
    </div>
  )
}
