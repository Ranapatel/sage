'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import { Trash2, ExternalLink, Heart, Building2, Compass, Zap, CalendarDays, Utensils, MapPin, Bookmark } from 'lucide-react'

import { getLocalBookmarks, removeBookmark } from '@/lib/bookmarkUtils'

interface SavedItemData {
  id: string
  type: string
  referenceId: string
  createdAt: string
}

export default function SavedItems() {
  const { getToken } = useAuth()
  const [items, setItems] = useState<SavedItemData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSavedItems = async () => {
    try {
      const token = await getToken()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      let apiItems: SavedItemData[] = []
      try {
        const response = await axios.get(`${apiUrl}/api/profile/saved`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data?.success && Array.isArray(response.data.data)) {
          apiItems = response.data.data
        }
      } catch (err) {
        console.warn('API saved items fetch warning:', err)
      }

      const localItems = getLocalBookmarks()

      const mergedMap = new Map<string, SavedItemData>()
      apiItems.forEach(item => mergedMap.set(item.referenceId, item))
      localItems.forEach(item => {
        if (!mergedMap.has(item.referenceId)) {
          mergedMap.set(item.referenceId, item)
        }
      })

      setItems(Array.from(mergedMap.values()))
    } catch (err: any) {
      console.error('Error fetching saved items:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      await fetchSavedItems()
    }
    load()
  }, [])

  const handleDelete = async (id: string, referenceId: string) => {
    const delToast = toast.loading('Removing bookmark...')
    try {
      const token = await getToken()
      await removeBookmark(id, referenceId, token)
      toast.success('Bookmark removed!', { id: delToast })
      setItems((prev) => prev.filter((item) => item.id !== id && item.referenceId !== referenceId))
    } catch (err: any) {
      console.error('Error removing saved item:', err)
      toast.error('Failed to remove bookmark.', { id: delToast })
    }
  }

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'hotel':
        return { label: 'Hotel', icon: <Building2 size={14} className="text-emerald-600" />, badgeClass: 'text-green-700 bg-green-50 border-green-200', link: '/plan' }
      case 'destination':
        return { label: 'Destination', icon: <Compass size={14} className="text-[#EA580C]" />, badgeClass: 'text-[#EA580C] bg-orange-50 border-orange-200', link: '/' }
      case 'activity':
        return { label: 'Activity', icon: <Zap size={14} className="text-red-600" />, badgeClass: 'text-red-700 bg-red-50 border-red-200', link: '/plan' }
      case 'itinerary':
        return { label: 'Itinerary', icon: <CalendarDays size={14} className="text-emerald-600" />, badgeClass: 'text-green-700 bg-green-50 border-green-200', link: '/plan' }
      case 'restaurant':
        return { label: 'Restaurant', icon: <Utensils size={14} className="text-[#EA580C]" />, badgeClass: 'text-[#EA580C] bg-orange-50 border-orange-200', link: '/plan' }
      default:
        return { label: 'Item', icon: <MapPin size={14} className="text-emerald-600" />, badgeClass: 'text-green-700 bg-green-50 border-green-200', link: '/' }
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="shimmer h-20 w-full rounded-2xl"></div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="card p-12 text-center bg-white border border-[#E8E0D8] rounded-3xl">
        <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-bold text-[#1A1A1A] mb-2">No bookmarks saved yet</h3>
        <p className="text-slate-500 text-xs mb-6 max-w-sm mx-auto">
          Explore destinations, flight packages, and hotel rate structures to save them to your account.
        </p>
      </div>
    )
  }

  return (
    <div className="card p-6 md:p-8 bg-white border border-[#E8E0D8] rounded-3xl relative overflow-hidden shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
          <Bookmark className="text-[#EA580C]" size={20} />
          <span>Saved Content</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Access your catalog of bookmarked flights, hotels, activities, and itineraries.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => {
          const config = getTypeConfig(item.type)
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-[#E8E0D8] bg-[#FFFBF7]/40 hover:border-[#EA580C]/40 hover:bg-white transition-all duration-300 shadow-sm group"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl bg-white border border-[#E8E0D8] p-3 rounded-xl shadow-sm">
                  {config.icon}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#1A1A1A] capitalize leading-tight">
                      {item.referenceId.replace(/_/g, ' ')}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="text-[0.65rem] text-slate-500 mt-1">
                    Bookmarked on {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={config.link}
                  className="flex items-center justify-center p-2 rounded-xl bg-[#FFFBF7] border border-[#E8E0D8] text-slate-600 hover:text-[#EA580C] hover:border-[#EA580C]/40 transition-all cursor-pointer shadow-sm"
                  title="View details"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => handleDelete(item.id, item.referenceId)}
                  className="flex items-center justify-center p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-all cursor-pointer shadow-sm"
                  title="Remove bookmark"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
