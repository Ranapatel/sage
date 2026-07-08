'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'

interface TravelPreferenceData {
  travelStyle: string | null
  budgetRange: string | null
  interests: string[]
  foodPreference: string[]
  accommodationPreference: string | null
  tripDuration: string | null
}

interface TravelPreferencesProps {
  initialData: TravelPreferenceData | null
  onSaveSuccess: () => void
}

const INTERESTS_OPTIONS = [
  'Adventure',
  'Beaches',
  'Heritage',
  'Nature',
  'Culinary',
  'Wellness',
  'Shopping',
  'Nightlife',
  'Wildlife',
  'Photography'
]

const FOOD_OPTIONS = [
  'Veg',
  'Non-Veg',
  'Vegan',
  'Gluten-Free',
  'Halal',
  'Kosher',
  'Spicy',
  'Non-Spicy'
]

export default function TravelPreferences({ initialData, onSaveSuccess }: TravelPreferencesProps) {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TravelPreferenceData>({
    travelStyle: '',
    budgetRange: '',
    interests: [],
    foodPreference: [],
    accommodationPreference: '',
    tripDuration: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        travelStyle: initialData.travelStyle || '',
        budgetRange: initialData.budgetRange || '',
        interests: initialData.interests || [],
        foodPreference: initialData.foodPreference || [],
        accommodationPreference: initialData.accommodationPreference || '',
        tripDuration: initialData.tripDuration || ''
      })
    }
  }, [initialData])

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest]
      return { ...prev, interests }
    })
  }

  const handleFoodToggle = (food: string) => {
    setFormData((prev) => {
      const foodPreference = prev.foodPreference.includes(food)
        ? prev.foodPreference.filter((f) => f !== food)
        : [...prev.foodPreference, food]
      return { ...prev, foodPreference }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const saveToastId = toast.loading('Saving travel preferences...')

    try {
      const token = await getToken()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

      const payload = {
        travelStyle: formData.travelStyle || null,
        budgetRange: formData.budgetRange || null,
        interests: formData.interests,
        foodPreference: formData.foodPreference,
        accommodationPreference: formData.accommodationPreference || null,
        tripDuration: formData.tripDuration || null
      }

      const response = await axios.put(`${apiUrl}/api/profile/preferences`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data?.success) {
        toast.success('Travel preferences saved successfully!', { id: saveToastId })
        onSaveSuccess()
      } else {
        toast.error(response.data?.message || 'Failed to update preferences', { id: saveToastId })
      }
    } catch (err: any) {
      console.error('Error saving preferences:', err)
      toast.error(err.response?.data?.message || err.message || 'Failed to save preferences', { id: saveToastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 md:p-8 bg-slate-950/40 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          ⚙️ Travel Preferences
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Customize your recommendations and trip generation options.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Travel Style */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Travel Style
            </label>
            <select
              name="travelStyle"
              value={formData.travelStyle || ''}
              onChange={handleSelectChange}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="">Choose a style</option>
              <option value="adventure">🎒 Adventure & Backpacker</option>
              <option value="luxury">💎 Luxury & Premium</option>
              <option value="budget">💰 Budget Friendly</option>
              <option value="family">👨‍👩‍👧‍👦 Family Vacation</option>
              <option value="romantic">❤️ Romantic & Honeymoon</option>
              <option value="cultural">🏛️ Cultural & Historical</option>
              <option value="relaxation">🏖️ Relaxation & Leisure</option>
            </select>
          </div>

          {/* Budget Range */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Budget Range
            </label>
            <select
              name="budgetRange"
              value={formData.budgetRange || ''}
              onChange={handleSelectChange}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="">Select budget tier</option>
              <option value="low">Budget (Low)</option>
              <option value="medium">Standard (Medium)</option>
              <option value="high">Premium (High)</option>
            </select>
          </div>

          {/* Accommodation preference */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Preferred Accommodation
            </label>
            <select
              name="accommodationPreference"
              value={formData.accommodationPreference || ''}
              onChange={handleSelectChange}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="">Select accommodation</option>
              <option value="hotel">🏨 Hotel</option>
              <option value="resort">🌴 Resort</option>
              <option value="hostel">🎒 Hostel</option>
              <option value="homestay">🏡 Homestay/Villa</option>
              <option value="camp">⛺ Camp/Glamping</option>
            </select>
          </div>

          {/* Trip Duration Preference */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
              Typical Trip Duration
            </label>
            <select
              name="tripDuration"
              value={formData.tripDuration || ''}
              onChange={handleSelectChange}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="">Select typical duration</option>
              <option value="weekend">Weekend (2-3 Days)</option>
              <option value="short">Short Trip (4-6 Days)</option>
              <option value="medium">Standard (1 Week)</option>
              <option value="long">Long Vacation (2+ Weeks)</option>
            </select>
          </div>
        </div>

        {/* Interests Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
            Interests & Travel Themes
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {INTERESTS_OPTIONS.map((interest) => {
              const selected = formData.interests.includes(interest)
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    selected
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {interest}
                </button>
              )
            })}
          </div>
        </div>

        {/* Food Preferences Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
            Dietary & Food Preferences
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {FOOD_OPTIONS.map((food) => {
              const selected = formData.foodPreference.includes(food)
              return (
                <button
                  key={food}
                  type="button"
                  onClick={() => handleFoodToggle(food)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    selected
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {food}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800/80">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            {loading ? 'Saving Preferences...' : 'Save Travel Preferences'}
          </button>
        </div>
      </form>
    </div>
  )
}
