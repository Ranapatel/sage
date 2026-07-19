'use client'

import React from 'react'
import Image from 'next/image'

interface ProfileHeaderProps {
  user: {
    firstName: string | null
    lastName: string | null
    email: string
    profileImage: string | null
  }
  stats: {
    tripsCreated: number
    countriesVisited: number
    memoriesUploaded: number
    walletBalance: number
  }
}

export default function ProfileHeader({ user, stats }: ProfileHeaderProps) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Traveler'

  const getTierLabel = (trips: number): string => {
    if (trips >= 15) return 'Globetrotter'
    if (trips >= 5)  return 'Adventurer'
    if (trips >= 1)  return 'Explorer'
    return 'New Explorer'
  }

  const tierLabel = getTierLabel(stats.tripsCreated)

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#E8E0D8] bg-white p-6 md:p-8 shadow-sm">
      {/* Background ambient warm glows */}
      <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-orange-500/5 blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* User identification */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-[#E8E0D8] shadow-sm">
            {user.profileImage ? (
              <Image
                src={user.profileImage}
                alt={fullName}
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#FFFBF7] text-2xl font-black text-[#EA580C]">
                {fullName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A1A] leading-tight">{fullName}</h1>
            <p className="text-slate-500 text-xs mt-1 font-medium">{user.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap justify-center sm:justify-start">
              {stats.tripsCreated > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                  Verified Member
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#EA580C] bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">
                {tierLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic statistics counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          {[
            { label: 'Trips', val: stats.tripsCreated, icon: '📅' },
            { label: 'Countries', val: stats.countriesVisited, icon: '🗺️' },
            { label: 'Memories', val: stats.memoriesUploaded, icon: '📷' },
            { label: 'Sage Points', val: stats.walletBalance, icon: '🪙' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-[#E8E0D8] bg-[#FFFBF7]/60 min-w-[80px] sm:min-w-[100px] hover:border-[#EA580C]/30 hover:bg-white transition-all shadow-sm"
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-lg font-black text-[#1A1A1A] tracking-tight">{item.val}</span>
              <span className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
