'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { Camera, Upload, X, Trash2, ImageIcon, Loader2, AlertCircle, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePhotoApi, type Photo } from '@/lib/photoApi'
import { useRequireAuth } from '@/hooks/useRequireAuth'

// ─── Constants ──────────────────────────────────────────────────────────────

const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const UNSAVED_TRIP_ID = 'active_trip_session'
const MAX_RETRY_ATTEMPTS = 2

// ─── Types ──────────────────────────────────────────────────────────────────

interface UploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'processing' | 'done' | 'error'
  error?: string
}

interface TravelMemoriesProps {
  tripId: string
  itineraryDayId?: string
  dayNumber?: number
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function TravelMemories({
  tripId,
  itineraryDayId,
  dayNumber,
}: TravelMemoriesProps) {
  const { isSignedIn, getToken } = useAuth()
  const { requireAuth } = useRequireAuth()
  const photoApi = usePhotoApi()

  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<UploadProgress[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Unsaved trip detection ──────────────────────────────────────────────────

  const isUnsavedTrip = tripId === UNSAVED_TRIP_ID

  // ── Load photos ───────────────────────────────────────────────────────────

  const loadPhotos = useCallback(async () => {
    const dayIdentifier = itineraryDayId || (dayNumber !== undefined ? String(dayNumber) : null)
    const storageKey = `tripsage-day-photos-${tripId}-${dayIdentifier || 'general'}`

    let cached: Photo[] = []
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(storageKey)
        if (stored) cached = JSON.parse(stored)
      } catch {}
    }

    if (!tripId || !dayIdentifier || isUnsavedTrip) {
      setPhotos(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await photoApi.getPhotos(tripId, dayIdentifier)
      const combined = [...data]
      cached.forEach((c) => {
        if (!combined.some((p) => p.id === c.id)) combined.push(c)
      })
      setPhotos(combined)
    } catch (err: any) {
      setPhotos(cached)
    } finally {
      setLoading(false)
    }
  }, [tripId, itineraryDayId, dayNumber, isUnsavedTrip]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadPhotos()
  }, [tripId, itineraryDayId, dayNumber, isUnsavedTrip]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── File Validation ───────────────────────────────────────────────────────

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FORMATS.includes(file.type.toLowerCase())) {
      return `${file.name}: Unsupported format. Use JPG, PNG, WEBP, or HEIC.`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File exceeds 10MB limit.`
    }
    return null
  }

  // ── Retry helper for transient failures ────────────────────────────────────

  async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRY_ATTEMPTS): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn()
      } catch (err: any) {
        const isTransient = err.message?.includes('Network error') || err.message?.includes('fetch')
        if (attempt < retries && isTransient) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
          continue
        }
        throw err
      }
    }
    throw new Error('Upload failed after retries')
  }

  // ── Upload Flow ───────────────────────────────────────────────────────────

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      console.log('[TravelMemories] 📸 File(s) selected via file picker or dropzone:', files)
      requireAuth(async () => {
        console.log('[TravelMemories] 🚀 Entering handleFiles upload execution...')
        const fileArray = Array.from(files)
        if (fileArray.length === 0) {
          console.warn('[TravelMemories] ⚠️ No files to upload')
          return
        }

        // Single-pass validation — validate once, partition into valid/invalid
        const validFiles: File[] = []
        for (const file of fileArray) {
          console.log('[TravelMemories] 🔍 Validating file:', file.name, 'size:', file.size, 'type:', file.type)
          const error = validateFile(file)
          if (error) {
            console.error('[TravelMemories] ❌ Validation failed for file:', file.name, error)
            toast.error(error)
          } else {
            console.log('[TravelMemories] ✅ Validation passed for file:', file.name)
            validFiles.push(file)
          }
        }
        if (validFiles.length === 0) return

        // Upload each file
        for (const file of validFiles) {
          console.log('[TravelMemories] 📤 Starting upload process for:', file.name)
          const uploadToast = toast.loading(`Uploading ${file.name}...`)

          setUploading((prev) => [
            ...prev,
            { fileName: file.name, progress: 0, status: 'uploading' },
          ])

          try {
            let savedPhoto: Photo

            if (isUnsavedTrip) {
              console.log('[TravelMemories] ℹ️ Unsaved trip session — converting file to Data URI...')
              // Convert file to Data URI for immediate attach on unsaved trip session
              const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(file)
              })

              savedPhoto = {
                id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                userId: 'session_user',
                tripId: 'active_trip_session',
                itineraryDayId: itineraryDayId || null,
                publicId: `session_${Date.now()}`,
                originalUrl: dataUrl,
                secureUrl: dataUrl,
                thumbnailUrl: dataUrl,
                isFeatured: false,
                rewardStatus: 'NONE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            } else {
              console.log('[TravelMemories] 📦 FormData created, sending XHR request via photoApi.uploadPhoto for file:', file.name)
              // Upload directly to Cloudinary backend (reusing working photoApi.uploadPhoto)
              savedPhoto = await withRetry(() =>
                photoApi.uploadPhoto({
                  tripId,
                  itineraryDayId,
                  dayNumber,
                  file,
                  onProgress: (percent) => {
                    console.log(`[TravelMemories] ⏳ Upload progress for ${file.name}: ${percent}%`)
                    setUploading((prev) =>
                      prev.map((u) =>
                        u.fileName === file.name && u.status === 'uploading'
                          ? { ...u, progress: percent }
                          : u
                      )
                    )
                  },
                })
              )
            }

            console.log('[TravelMemories] ✅ Upload response received for file:', file.name, savedPhoto)
            const photoUrl = savedPhoto.secureUrl || savedPhoto.originalUrl

            // Reuse working Memory upload backend API so photo appears in User Profile -> Memories
            try {
              const token = await getToken()
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
              console.log('[TravelMemories] 🔄 Syncing photo to Profile Memories API...')
              await axios.post(
                `${apiUrl}/api/profile/memories`,
                {
                  title: file.name || 'Itinerary Memory',
                  description: `Uploaded for Day ${dayNumber || 1}`,
                  location: null,
                  photos: [photoUrl],
                  tripId: !isUnsavedTrip ? tripId : null,
                },
                {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
              )
              console.log('[TravelMemories] ✅ Profile Memories API sync complete')
            } catch (memApiErr: any) {
              console.warn('[TravelMemories] Memory API save notice:', memApiErr.message)
            }

            // Sync with local memories cache for instant visibility
            if (typeof window !== 'undefined') {
              try {
                const storedMemories = localStorage.getItem('tripsage-memories-cache')
                const existingMems = storedMemories ? JSON.parse(storedMemories) : []
                const newMem = {
                  id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                  title: file.name || 'Itinerary Memory',
                  description: `Uploaded for Day ${dayNumber || 1}`,
                  location: null,
                  photos: [photoUrl],
                  createdAt: new Date().toISOString(),
                }
                localStorage.setItem(
                  'tripsage-memories-cache',
                  JSON.stringify([newMem, ...existingMems.filter((m: any) => m.id !== newMem.id)])
                )
              } catch {}
            }

            // Add to photos list & sync with sessionStorage
            const dayIdentifier = itineraryDayId || (dayNumber !== undefined ? String(dayNumber) : null)
            const storageKey = `tripsage-day-photos-${tripId}-${dayIdentifier || 'general'}`

            setPhotos((prev) => {
              const updated = [savedPhoto, ...prev.filter((p) => p.id !== savedPhoto.id)]
              if (typeof window !== 'undefined') {
                try {
                  sessionStorage.setItem(storageKey, JSON.stringify(updated))
                } catch {}
              }
              return updated
            })

            // Mark as done
            setUploading((prev) =>
              prev.map((u) =>
                u.fileName === file.name ? { ...u, status: 'done', progress: 100 } : u
              )
            )

            toast.success('Photo uploaded successfully.', { id: uploadToast })
          } catch (err: any) {
            console.error('[TravelMemories] ❌ Backend upload error:', err)

            setUploading((prev) =>
              prev.map((u) =>
                u.fileName === file.name
                  ? { ...u, status: 'error', error: err.message || 'Upload failed' }
                  : u
              )
            )
            toast.error(err.message || 'Upload failed. Please try again.', { id: uploadToast })
          }
        }

        // Clear completed uploads after 4 seconds
        setTimeout(() => {
          setUploading((prev) => prev.filter((u) => u.status !== 'done'))
        }, 4000)
      })()
    },
    [tripId, itineraryDayId, dayNumber, isUnsavedTrip, photoApi, requireAuth]
  )

  // ── Drag & Drop ───────────────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  // ── Delete Photo ──────────────────────────────────────────────────────────

  const handleDelete = useCallback(
    (photoId: string) => {
      requireAuth(async () => {
        setDeletingId(photoId)
        try {
          await photoApi.deletePhoto(photoId)
          setPhotos((prev) => prev.filter((p) => p.id !== photoId))
          toast.success('Photo deleted')
        } catch (err: any) {
          toast.error(err.message || 'Failed to delete photo')
        } finally {
          setDeletingId(null)
        }
      })()
    },
    [photoApi, requireAuth]
  )

  // ── Don't render if no trip/day ───────────────────────────────────────────

  if (!tripId || (!itineraryDayId && !dayNumber)) {
    return null
  }

  return (
    <div className="mt-6">
      {/* ── Section Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-3">
        <Camera size={16} className="text-[#EA580C]" />
        <h3 className="text-sm font-bold text-[#1A1A1A]">Travel Memories</h3>
        {photos.length > 0 && (
          <span className="text-xs text-[#A1A1AA]">({photos.length})</span>
        )}
      </div>

      {/* ── Upload Area ────────────────────────────────────────────────────── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-200
          ${isDragOver
            ? 'border-[#EA580C] bg-[#FFF7ED]'
            : 'border-[#E8E0D8] bg-[#FFFFFF] hover:border-[#FED7AA] hover:bg-[#FFFBF7]'
          }
        `}
        style={{ minHeight: photos.length === 0 && uploading.length === 0 ? 80 : 48 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = '' // Reset for re-upload
          }}
        />

        <div className="flex items-center justify-center gap-2 py-3 px-4">
          {photos.length === 0 && uploading.length === 0 ? (
            <>
              <Upload size={18} className="text-[#EA580C]" />
              <span className="text-sm text-[#6B6B6B]">
                <span className="font-semibold text-[#EA580C]">Upload Photos</span>
                {' '}or drag & drop
              </span>
              <span className="text-[10px] text-[#A1A1AA] hidden sm:inline">
                JPG, PNG, WEBP, HEIC · max 10MB
              </span>
            </>
          ) : (
            <>
              <Upload size={14} className="text-[#EA580C]" />
              <span className="text-xs text-[#6B6B6B]">Add more photos</span>
            </>
          )}
        </div>
      </div>

      {/* ── Upload Progress ────────────────────────────────────────────────── */}
      {uploading.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploading.map((u, i) => (
            <div
              key={`${u.fileName}-${i}`}
              className="flex items-center gap-3 p-2.5 rounded-lg"
              style={{ background: '#FFFBF7', border: '1px solid #E8E0D8' }}
            >
              <div className="flex-shrink-0">
                {u.status === 'uploading' && (
                  <Loader2 size={16} className="text-[#EA580C] animate-spin" />
                )}
                {u.status === 'processing' && (
                  <Loader2 size={16} className="text-blue-500 animate-spin" />
                )}
                {u.status === 'done' && <Check size={16} className="text-green-500" />}
                {u.status === 'error' && <AlertCircle size={16} className="text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#1A1A1A] truncate">{u.fileName}</p>
                {u.status === 'uploading' && (
                  <div className="mt-1 h-1 rounded-full bg-[#E8E0D8] overflow-hidden">
                    <div
                      className="h-full bg-[#EA580C] transition-all duration-300"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                )}
                {u.status === 'processing' && (
                  <p className="text-[10px] text-blue-500 mt-0.5">Processing image...</p>
                )}
                {u.status === 'error' && (
                  <p className="text-[10px] text-red-500 mt-0.5">{u.error}</p>
                )}
              </div>
              {u.status === 'uploading' && (
                <span className="text-[10px] font-semibold text-[#6B6B6B]">{u.progress}%</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Photo Grid ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg animate-pulse"
              style={{ background: '#F0EBE4' }}
            />
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer"
              style={{ background: '#F0EBE4' }}
              onClick={() => setLightboxPhoto(photo)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnailUrl || photo.secureUrl || photo.originalUrl}
                alt={photo.locationName || 'Travel photo'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              {/* Delete button overlay */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(photo.id)
                }}
                disabled={deletingId === photo.id}
                className="absolute top-1 right-1 p-1.5 rounded-full bg-black/60 text-white
                  opacity-0 group-hover:opacity-100 transition-opacity
                  hover:bg-red-500 disabled:opacity-50"
                title="Delete photo"
              >
                {deletingId === photo.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Trash2 size={12} />
                )}
              </button>
              {/* Featured badge */}
              {photo.isFeatured && (
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full bg-[#EA580C] text-white text-[8px] font-bold">
                  Featured
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* ── Empty State ────────────────────────────────────────────────────── */}
      {!loading && photos.length === 0 && uploading.length === 0 && (
        <div className="mt-2 flex items-center gap-2 text-[#A1A1AA]">
          <ImageIcon size={14} />
          <p className="text-xs">
            {isUnsavedTrip
              ? 'Save your trip to start uploading travel memories!'
              : 'No photos yet. Upload to capture your travel memories!'}
          </p>
        </div>
      )}

      {/* ── Lightbox ───────────────────────────────────────────────────────── */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setLightboxPhoto(null)}
          >
            <X size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxPhoto.originalUrl}
            alt={lightboxPhoto.locationName || 'Travel photo'}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {lightboxPhoto.locationName && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-lg">
              {lightboxPhoto.locationName}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
