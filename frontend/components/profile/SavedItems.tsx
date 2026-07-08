'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import { Trash2, ExternalLink, HeartCrack } from 'lucide-react'

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await axios.get(`${apiUrl}/api/profile/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data?.success) {
        setItems(response.data.data)
      }
    } catch (err: any) {
      console.error('Error fetching saved items:', err)
      toast.error('Failed to load saved content.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSavedItems()
  }, [])

  const handleDelete = async (id: string) => {
    const delToast = toast.loading('Removing bookmark...')
    try {
      const token = await getToken()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await axios.delete(`${apiUrl}/api/profile/saved/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data?.success) {
        toast.success('Bookmark removed!', { id: delToast })
        setItems((prev) => prev.filter((item) => item.id !== id))
      } else {
        toast.error(response.data?.message || 'Failed to remove bookmark.', { id: delToast })
      }
    } catch (err: any) {
      console.error('Error removing saved item:', err)
      toast.error(err.response?.data?.message || err.message || 'Failed to remove bookmark.', { id: delToast })
    }
  }

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'hotel':
        return { label: 'Hotel', icon: '🏨', color: 'badge-green', link: '/plan' }
      case 'destination':
        return { label: 'Destination', icon: '🗺️', color: 'badge-amber', link: '/' }
      case 'activity':
        return { label: 'Activity', icon: '⚡', color: 'badge-red', link: '/plan' }
      case 'itinerary':
        return { label: 'Itinerary', icon: '📅', color: 'badge-green', link: '/plan' }
      case 'restaurant':
        return { label: 'Restaurant', icon: '🍽️', color: 'badge-amber', link: '/plan' }
      default:
        return { label: 'Item', icon: '📍', color: 'badge-green', link: '/' }
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
      <div className="card p-12 text-center bg-slate-950/40 border border-slate-800 rounded-3xl">
        <div className="text-5xl mb-4">🤍</div>
        <h3 className="font-bold text-white mb-2">No bookmarks saved yet</h3>
        <p className="text-slate-400 text-xs max-w-sm mx-auto">
          Explore destinations, flight packages, and hotel rate structures to save them to your account.
        </p>
      </div>
    )
  }

  return (
    <div className="card p-6 md:p-8 bg-slate-950/40 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl space-y-6">
      <div>
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          💖 Saved Content
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Access your catalog of bookmarked flights, hotels, activities, and itineraries.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => {
          const config = getTypeConfig(item.type)
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700/80 transition-all duration-300 shadow-md group"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
                  {config.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white capitalize leading-tight">
                      {item.referenceId.replace(/_/g, ' ')}
                    </span>
                    <span className={`badge ${config.color} text-[0.6rem] font-black uppercase tracking-wider`}>
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
                  className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="View details"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center justify-center p-2 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all cursor-pointer"
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
