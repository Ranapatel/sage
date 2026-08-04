'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'react-hot-toast' // Note: actually axios should be imported, wait, let's look at lines 4-6
import axiosInstance from 'axios'
import { useAuth, useUser } from '@clerk/nextjs'
import { useAuthStore } from '@/store/authStore'
import { User, Mail, Phone, Calendar, Globe, MapPin, Sparkles, Lock, ShieldCheck } from 'lucide-react'

interface PersonalProfileData {
  phoneNumber: string | null
  dateOfBirth: string | null
  gender: string | null
  country: string | null
  city: string | null
  language: string | null
}

interface PersonalProfileProps {
  initialData: PersonalProfileData | null
  onSaveSuccess: () => void
}

export default function PersonalProfile({ initialData, onSaveSuccess }: PersonalProfileProps) {
  const { getToken } = useAuth()
  const { user: clerkUser } = useUser()
  const { user: storeUser } = useAuthStore()

  const [loading, setLoading] = useState(false)

  // Clerk User Fields (First/Last name)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  // Backend Profile Fields
  const [formData, setFormData] = useState<PersonalProfileData>({
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    country: '',
    city: '',
    language: ''
  })

  // Synchronize state when initial data or Clerk user loads
  useEffect(() => {
    if (clerkUser) {
      setFirstName(clerkUser.firstName || '')
      setLastName(clerkUser.lastName || '')
    } else if (storeUser) {
      const parts = storeUser.name.split(' ')
      setFirstName(parts[0] || '')
      setLastName(parts.slice(1).join(' ') || '')
    }
  }, [clerkUser, storeUser])

  useEffect(() => {
    if (initialData) {
      setFormData({
        phoneNumber: initialData.phoneNumber || '',
        dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().slice(0, 10) : '',
        gender: initialData.gender || '',
        country: initialData.country || '',
        city: initialData.city || '',
        language: initialData.language || ''
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const saveToastId = toast.loading('Updating your personal profile...')

    try {
      // 1. Update Clerk Profile (First Name & Last Name) if logged in via Clerk
      let clerkUpdatePromise: Promise<any> = Promise.resolve()
      if (clerkUser) {
        clerkUpdatePromise = clerkUser.update({
          firstName: firstName.trim(),
          lastName: lastName.trim()
        })
      }

      // 2. Update Backend Database (Profile settings)
      const token = clerkUser ? await getToken() : 'mock-store-token'
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      
      const payload = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        phoneNumber: formData.phoneNumber || null,
        gender: formData.gender || null,
        country: formData.country || null,
        city: formData.city || null,
        language: formData.language || null
      }

      const backendUpdatePromise = axiosInstance.put(`${apiUrl}/api/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Execute both updates in parallel
      const results = await Promise.allSettled([clerkUpdatePromise, backendUpdatePromise])
      
      const clerkFailed = results[0].status === 'rejected'
      const backendFailed = results[1].status === 'rejected'

      if (clerkFailed && backendFailed) {
        throw new Error('Failed to update both authentication and database profiles.')
      } else if (clerkFailed) {
        toast.error('Saved details, but failed to update name in Clerk.', { id: saveToastId })
      } else if (backendFailed) {
        toast.error('Failed to update database profile details.', { id: saveToastId })
      } else {
        toast.success('Personal profile updated successfully!', { id: saveToastId })
      }

      onSaveSuccess()
    } catch (err: any) {
      console.error('Error updating personal profile:', err)
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile', { id: saveToastId })
    } finally {
      setLoading(false)
    }
  }

  // Get active user email & image
  const displayEmail = clerkUser?.primaryEmailAddress?.emailAddress || storeUser?.email || ''
  const displayAvatar = clerkUser?.imageUrl || null
  const displayInitial = (firstName || 'T').charAt(0).toUpperCase()
  const memberSince = clerkUser?.createdAt ? new Date(clerkUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'July 2026'

  const inputClass =
    'w-full bg-white border border-[#E8E0D8] rounded-2xl px-4 py-3 text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#EA580C] transition-colors'

  return (
    <div className="card p-6 md:p-8 bg-white border border-[#E8E0D8] rounded-3xl relative overflow-hidden shadow-sm">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── Profile Identity Header ── */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 mb-6 border-b border-[#E8E0D8]">
        {displayAvatar ? (
          <img
            src={displayAvatar}
            alt={firstName}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-[#EA580C]/10 shadow"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-3xl shadow">
            {displayInitial}
          </div>
        )}
        
        <div className="text-center sm:text-left min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-black text-[#1A1A1A] leading-tight">
              {firstName} {lastName}
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
              <ShieldCheck size={11} /> Verified Member
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">{displayEmail}</p>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-2">
            Member since: {memberSince}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ── Section 1: Account Identity (Clerk Linked) ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[#EA580C]"><User size={16} /></span>
            <h3 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest">Account Identity</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className={inputClass}
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className={inputClass}
                required
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={displayEmail}
                  disabled
                  className="w-full bg-slate-50 border border-[#E8E0D8]/60 rounded-2xl px-4 py-3 text-xs font-medium text-slate-400 cursor-not-allowed"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                  <Lock size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Managed by Clerk</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E8E0D8] my-4" />

        {/* ── Section 2: Contact & Location ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[#EA580C]"><MapPin size={16} /></span>
            <h3 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest">Contact & Location</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone Number */}
            <div className="flex flex-col gap-2">
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleChange}
                placeholder="+1 (555) 019-2834"
                className={inputClass}
              />
            </div>

            {/* Country */}
            <div className="flex flex-col gap-2">
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country || ''}
                onChange={handleChange}
                placeholder="United States, India, etc."
                className={inputClass}
              />
            </div>

            {/* City */}
            <div className="flex flex-col gap-2">
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                placeholder="New York, Mumbai, etc."
                className={inputClass}
              />
            </div>

            {/* Language */}
            <div className="flex flex-col gap-2">
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
                Preferred Language
              </label>
              <input
                type="text"
                name="language"
                value={formData.language || ''}
                onChange={handleChange}
                placeholder="English, Spanish, Hindi..."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-[#E8E0D8] my-4" />

        {/* ── Section 3: Personal Details ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[#EA580C]"><Calendar size={16} /></span>
            <h3 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest">Personal Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="flex flex-col gap-2">
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth || ''}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-2">
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className={inputClass + ' cursor-pointer'}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8E0D8]">
          <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
            <Sparkles size={11} className="text-[#EA580C]" />
            Last updated just now
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white font-bold text-xs rounded-2xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            {loading ? 'Saving details...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  )
}
