'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'

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
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<PersonalProfileData>({
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    country: '',
    city: '',
    language: ''
  })

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
    const saveToastId = toast.loading('Saving personal profile...')

    try {
      const token = await getToken()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      
      const payload = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        phoneNumber: formData.phoneNumber || null,
        gender: formData.gender || null,
        country: formData.country || null,
        city: formData.city || null,
        language: formData.language || null
      }

      const response = await axios.put(`${apiUrl}/api/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data?.success) {
        toast.success('Personal profile updated successfully!', { id: saveToastId })
        onSaveSuccess()
      } else {
        toast.error(response.data?.message || 'Failed to update profile', { id: saveToastId })
      }
    } catch (err: any) {
      console.error('Error updating personal profile:', err)
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile', { id: saveToastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 md:p-8 bg-slate-950/40 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          👤 Personal Information
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Manage your travel identity details used for bookings and verification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Phone Number */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={handleChange}
              placeholder="+1234567890"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth || ''}
              onChange={handleChange}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Other">Prefer not to say</option>
            </select>
          </div>

          {/* Preferred Language */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Preferred Language
            </label>
            <input
              type="text"
              name="language"
              value={formData.language || ''}
              onChange={handleChange}
              placeholder="English, Hindi, etc."
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Country */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country || ''}
              onChange={handleChange}
              placeholder="India"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* City */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
              placeholder="Mumbai"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            {loading ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  )
}
