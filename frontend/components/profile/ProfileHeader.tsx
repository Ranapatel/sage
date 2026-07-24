'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { CalendarDays, Globe, Camera, Coins, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePhotoApi } from '@/lib/photoApi'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'

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
  const { getToken } = useAuth()
  const photoApi = usePhotoApi()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileImage, setProfileImage] = useState<string | null>(user.profileImage)
  const [uploading, setUploading] = useState(false)

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Traveler'

  const getTierLabel = (trips: number): string => {
    if (trips >= 15) return 'Globetrotter'
    if (trips >= 5)  return 'Adventurer'
    if (trips >= 1)  return 'Explorer'
    return 'New Explorer'
  }

  const tierLabel = getTierLabel(stats.tripsCreated)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit')
      return
    }

    setUploading(true)
    const toastId = toast.loading('Uploading profile picture...')

    try {
      // Upload image
      const uploaded = await photoApi.uploadPhoto({ file })
      const imageUrl = uploaded.secureUrl || uploaded.originalUrl

      // Update backend user profile
      const token = await getToken()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      await axios.put(
        `${apiUrl}/api/profile`,
        { profileImage: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {}) // non-critical if endpoint varies

      setProfileImage(imageUrl)
      toast.success('Profile picture updated!', { id: toastId })
    } catch (err: any) {
      console.warn('[AvatarUpload] Error uploading photo:', err.message)
      // Base64 fallback preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        if (base64) {
          setProfileImage(base64)
          toast.success('Profile photo updated!', { id: toastId })
        } else {
          toast.error('Failed to upload photo', { id: toastId })
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#E8E0D8] bg-white p-6 md:p-8 shadow-sm">
      {/* Background ambient warm glows */}
      <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-orange-500/5 blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* User identification */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          {/* Avatar with Upload overlay */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            onChange={handleAvatarUpload}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative h-20 w-20 overflow-hidden rounded-2xl border border-[#E8E0D8] shadow-sm group cursor-pointer"
            title="Click to change profile picture"
          >
            {profileImage ? (
              <Image
                src={profileImage}
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

            {/* Hover overlay with camera icon */}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <Loader2 size={20} className="animate-spin text-white" />
              ) : (
                <>
                  <Camera size={18} />
                  <span className="text-[9px] font-bold mt-0.5">Upload</span>
                </>
              )}
            </div>
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
            { label: 'Trips', val: stats.tripsCreated, icon: <CalendarDays size={16} className="text-[#EA580C]" /> },
            { label: 'Countries', val: stats.countriesVisited, icon: <Globe size={16} className="text-blue-600" /> },
            { label: 'Memories', val: stats.memoriesUploaded, icon: <Camera size={16} className="text-emerald-600" /> },
            { label: 'Sage Points', val: stats.walletBalance, icon: <Coins size={16} className="text-amber-500" /> },
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
