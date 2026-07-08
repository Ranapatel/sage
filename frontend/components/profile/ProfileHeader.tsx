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

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl">
      {/* Background ambient glows */}
      <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* User identification */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-blue-500/50 shadow-lg shadow-blue-500/20">
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
              <div className="flex h-full w-full items-center justify-center bg-slate-800 text-2xl font-black text-blue-500">
                {fullName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white leading-tight">{fullName}</h1>
            <p className="text-slate-400 text-xs mt-1 font-medium">{user.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap justify-center sm:justify-start">
              <span className="badge badge-green text-[0.65rem] font-bold">Verified Member</span>
              <span className="badge badge-amber text-[0.65rem] font-bold">Explorer Tier</span>
            </div>
          </div>
        </div>

        {/* Dynamic statistics counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          {[
            { label: 'Trips', val: stats.tripsCreated, icon: '📅', color: 'from-blue-600/20 to-blue-900/10 border-blue-500/20' },
            { label: 'Countries', val: stats.countriesVisited, icon: '🗺️', color: 'from-indigo-600/20 to-indigo-900/10 border-indigo-500/20' },
            { label: 'Memories', val: stats.memoriesUploaded, icon: '📷', color: 'from-purple-600/20 to-purple-900/10 border-purple-500/20' },
            { label: 'Sage Points', val: stats.walletBalance, icon: '🪙', color: 'from-amber-600/20 to-amber-900/10 border-amber-500/20' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border bg-gradient-to-b ${item.color} min-w-[80px] sm:min-w-[100px] shadow-md`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-lg font-black text-white tracking-tight">{item.val}</span>
              <span className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
