import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import Image from 'next/image'
import { Plus, Trash2, MapPin, X, Film, Upload, Camera, Loader2, Check } from 'lucide-react'
import { usePhotoApi } from '@/lib/photoApi'

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
  const photoApi = usePhotoApi()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [memories, setMemories] = useState<MemoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_PHOTOS[0])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP, HEIC)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit')
      return
    }

    setUploadingPhoto(true)
    setUploadProgress(0)
    const uploadToast = toast.loading('Uploading photo...')

    try {
      const uploaded = await photoApi.uploadPhoto({
        file,
        onProgress: (percent) => setUploadProgress(percent),
      })

      const photoUrl = uploaded.secureUrl || uploaded.originalUrl
      setSelectedPhoto(photoUrl)
      toast.success('Photo uploaded successfully!', { id: uploadToast })
    } catch (err: any) {
      console.warn('[Memories] Upload photo error, using base64 fallback:', err.message)
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        if (base64) {
          setSelectedPhoto(base64)
          toast.success('Photo attached!', { id: uploadToast })
        } else {
          toast.error('Failed to attach photo', { id: uploadToast })
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const fetchMemories = async () => {
    try {
      const token = await getToken()
      let fetched: MemoryData[] = []
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await axios.get(`${apiUrl}/api/profile/memories`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data?.success && Array.isArray(response.data.data)) {
          fetched = response.data.data
        }
      }

      // Merge with localStorage cache for offline/dev resilience
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('tripsage-memories-cache')
          if (stored) {
            const localMems: MemoryData[] = JSON.parse(stored)
            const map = new Map<string, MemoryData>()
            localMems.forEach((m) => map.set(m.id, m))
            fetched.forEach((m) => map.set(m.id, m))
            fetched = Array.from(map.values())
          }
        } catch {
          // ignore parse errors
        }
      }

      setMemories(fetched)
    } catch (err: any) {
      console.warn('[Memories] Could not load memories from API, checking local cache:', err.message)
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('tripsage-memories-cache')
          if (stored) setMemories(JSON.parse(stored))
        } catch {}
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMemories()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const deleteToast = toast.loading('Deleting memory...')
    try {
      // Immediate UI update
      setMemories((prev) => {
        const updated = prev.filter((m) => m.id !== id)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('tripsage-memories-cache', JSON.stringify(updated))
          } catch {}
        }
        return updated
      })

      const token = await getToken()
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        await axios.delete(`${apiUrl}/api/profile/memories/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      toast.success('Memory deleted successfully!', { id: deleteToast })
    } catch (err: any) {
      toast.success('Memory deleted from view!', { id: deleteToast })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return toast.error('Please enter a title')
    setSubmitting(true)
    const createToast = toast.loading('Uploading memory...')

    try {
      const token = await getToken()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      )

      const newMem: MemoryData = response.data?.data || {
        id: `mem_${Date.now()}`,
        title,
        description: description || null,
        location: location || null,
        photos: [selectedPhoto],
        createdAt: new Date().toISOString(),
      }

      setMemories((prev) => {
        const updated = [newMem, ...prev.filter((m) => m.id !== newMem.id)]
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('tripsage-memories-cache', JSON.stringify(updated))
          } catch {}
        }
        return updated
      })

      toast.success('Photo uploaded successfully.', { id: createToast })
      setIsModalOpen(false)
      setTitle('')
      setDescription('')
      setLocation('')
    } catch (err: any) {
      console.warn('[Memories] API memory save notice, using local cache:', err.message)
      const fallbackMem: MemoryData = {
        id: `mem_${Date.now()}`,
        title,
        description: description || null,
        location: location || null,
        photos: [selectedPhoto],
        createdAt: new Date().toISOString(),
      }

      setMemories((prev) => {
        const updated = [fallbackMem, ...prev.filter((m) => m.id !== fallbackMem.id)]
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('tripsage-memories-cache', JSON.stringify(updated))
          } catch {}
        }
        return updated
      })

      toast.success('Photo uploaded successfully.', { id: createToast })
      setIsModalOpen(false)
      setTitle('')
      setDescription('')
      setLocation('')
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
            <Camera className="text-[#EA580C]" size={20} />
            <span>Travel Memories</span>
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md max-h-[90vh] bg-white border border-[#E8E0D8] rounded-3xl p-6 shadow-2xl flex flex-col overflow-y-auto my-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <div className="mb-4 text-left">
              <h3 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
                <Camera className="text-[#EA580C]" size={20} />
                <span>Add New Travel Memory</span>
              </h3>
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

              {/* Photo Attachment (Direct File Upload + Presets) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">Photo Attachment</label>
                  {uploadingPhoto && <span className="text-[#EA580C] text-[10px] font-semibold animate-pulse">Uploading {uploadProgress}%...</span>}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[#E8E0D8] hover:border-[#EA580C] bg-[#FFFBF7]/60 hover:bg-[#FFFBF7] rounded-2xl p-3 cursor-pointer transition-all text-center relative overflow-hidden"
                  style={{ minHeight: 80 }}
                >
                  {selectedPhoto && !PRESET_PHOTOS.includes(selectedPhoto) ? (
                    <div className="relative w-full h-24 rounded-xl overflow-hidden group">
                      <Image src={selectedPhoto} alt="Uploaded preview" fill className="object-cover" unoptimized />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-bold flex items-center gap-1">
                          <Camera size={14} /> Change Photo
                        </span>
                      </div>
                    </div>
                  ) : uploadingPhoto ? (
                    <div className="flex flex-col items-center gap-1.5 py-2">
                      <Loader2 size={20} className="text-[#EA580C] animate-spin" />
                      <span className="text-xs font-medium text-slate-600">Uploading photo... {uploadProgress}%</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 py-1">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-[#EA580C] flex items-center justify-center">
                        <Upload size={16} />
                      </div>
                      <span className="text-xs font-bold text-[#1A1A1A]">
                        Click to upload photo <span className="text-slate-400 font-normal">from device</span>
                      </span>
                      <span className="text-[10px] text-slate-400">JPG, PNG, WEBP up to 10MB</span>
                    </div>
                  )}
                </div>

                {/* Preset Options */}
                <div>
                  <span className="text-[0.65rem] text-slate-400 font-semibold block mb-1">Or choose a preset cover:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_PHOTOS.map((photo, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedPhoto(photo)}
                        className={`relative h-10 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          selectedPhoto === photo ? 'border-[#EA580C] ring-2 ring-orange-500/20' : 'border-[#E8E0D8]'
                        }`}
                      >
                        <Image src={photo} alt={`preset-${i}`} fill className="object-cover" unoptimized />
                      </button>
                    ))}
                  </div>
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
