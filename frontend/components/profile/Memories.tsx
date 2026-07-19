'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import Image from 'next/image'
import { Plus, Trash2, MapPin, X, Film } from 'lucide-react'

interface MemoryData {
  id: string
  title: string
  description: string | null
  photos: string[]
  location: string | null
  createdAt: string
  trip?: {
    title: string
  } | null
}

const PRESET_PHOTOS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60'
]

export default function Memories() {
  const { getToken } = useAuth()
  const [memories, setMemories] = useState<MemoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_PHOTOS[0])
  const [submitting, setSubmitting] = useState(false)

  const fetchMemories = async () => {
    try {
      const token = await getToken()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await axios.get(`${apiUrl}/api/profile/memories`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data?.success) {
        setMemories(response.data.data)
      }
    } catch (err: any) {
      console.error('Error fetching memories:', err)
      toast.error('Failed to load memories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMemories()
  }, [])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering active photo click
    const deleteToast = toast.loading('Deleting memory...')
    try {
      const token = await getToken()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await axios.delete(`${apiUrl}/api/profile/memories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data?.success) {
        toast.success('Memory deleted successfully!', { id: deleteToast })
        fetchMemories()
      } else {
        toast.error(response.data?.message || 'Failed to delete memory.', { id: deleteToast })
      }
    } catch (err: any) {
      console.error('Error deleting memory:', err)
      toast.error(err.response?.data?.message || err.message || 'Failed to delete memory.', { id: deleteToast })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return toast.error('Please enter a title')
    setSubmitting(true)
    const createToast = toast.loading('Uploading memory...')

    try {
      const token = await getToken()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

      const response = await axios.post(
        `${apiUrl}/api/profile/memories`,
        {
          title,
          description: description || null,
          location: location || null,
          photos: [selectedPhoto],
          tripId: null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data?.success) {
        toast.success('Memory uploaded successfully!', { id: createToast })
        setIsModalOpen(false)
        setTitle('')
        setDescription('')
        setLocation('')
        fetchMemories()
      } else {
        toast.error(response.data?.message || 'Failed to upload memory.', { id: createToast })
      }
    } catch (err: any) {
      console.error('Error creating memory:', err)
      toast.error(err.response?.data?.message || err.message || 'Failed to upload memory.', { id: createToast })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="shimmer h-48 rounded-3xl"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="card p-6 md:p-8 bg-white border border-[#E8E0D8] rounded-3xl relative overflow-hidden shadow-sm space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
            📷 Travel Memories
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Capture, organize, and store your favorite moments from your journeys.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-xl shadow transition-transform active:scale-[0.98] cursor-pointer"
        >
          <Plus size={14} /> Add Memory
        </button>
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#E8E0D8] rounded-2xl bg-[#FFFBF7]/40">
          <Film className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No memories recorded</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-xs mx-auto">
            Upload images and share travel captions to keep a digital log of your wanderlust.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((memory) => {
            const hasPhoto = memory.photos && memory.photos.length > 0
            const photoUrl = hasPhoto ? memory.photos[0] : PRESET_PHOTOS[0]
            
            return (
              <div
                key={memory.id}
                onClick={() => setActivePhotoUrl(photoUrl)}
                className="group relative h-48 rounded-2xl overflow-hidden border border-[#E8E0D8] bg-slate-50 cursor-pointer shadow-sm"
              >
                <Image
                  src={photoUrl}
                  alt={memory.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/30 to-transparent flex flex-col justify-end p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-black text-white leading-tight truncate">
                      {memory.title}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(memory.id, e)}
                      className="p-1.5 rounded-lg bg-red-900/80 hover:bg-red-800 border border-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  
                  {memory.location && (
                    <div className="flex items-center gap-1 mt-1 text-[0.65rem] text-slate-200">
                      <MapPin size={10} className="text-[#EA580C]" />
                      <span>{memory.location}</span>
                    </div>
                  )}

                  {memory.description && (
                    <p className="text-[0.65rem] text-slate-300 mt-1 line-clamp-1 italic">
                      "{memory.description}"
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload Memory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white border border-[#E8E0D8] rounded-3xl p-6 shadow-2xl flex flex-col">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <div className="mb-4 text-left">
              <h3 className="text-lg font-black text-[#1A1A1A]">📸 Add New Travel Memory</h3>
              <p className="text-slate-500 text-xs mt-0.5">Save a moment from your trip.</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">Memory Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scuba diving in Maldives"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-[#E8E0D8] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Grand Island, Goa"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-[#E8E0D8] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">Caption/Description</label>
                <input
                  type="text"
                  placeholder="What was special about this moment?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-[#E8E0D8] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              {/* Photo Preset Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">Choose Card Photo</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_PHOTOS.map((photo, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedPhoto(photo)}
                      className={`relative h-12 rounded-lg overflow-hidden border-2 cursor-pointer ${
                        selectedPhoto === photo ? 'border-[#EA580C]' : 'border-[#E8E0D8]'
                      }`}
                    >
                      <Image src={photo} alt={`preset-${i}`} fill className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-[#FFFBF7] border border-[#E8E0D8] text-slate-700 font-bold text-xs rounded-xl hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-xl shadow shadow-orange-500/10 disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Upload Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhotoUrl && (
        <div
          onClick={() => setActivePhotoUrl(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md cursor-zoom-out p-4"
        >
          <div className="relative w-full max-w-4xl h-[70vh]">
            <Image
              src={activePhotoUrl}
              alt="Memory Lightbox"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  )
}
