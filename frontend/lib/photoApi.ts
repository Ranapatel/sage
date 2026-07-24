/**
 * Photo API Client — Frontend API layer for Cloudinary Travel Photos
 *
 * Direct multipart upload to backend Cloudinary upload endpoint.
 * Uses Clerk's getToken() for authenticated requests to the backend.
 */

import { useAuth } from '@clerk/nextjs'
import { useMemo } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Photo {
  id: string
  userId: string
  tripId: string
  itineraryDayId: string | null
  secureUrl: string
  publicId: string
  originalUrl: string
  thumbnailUrl: string | null
  width?: number | null
  height?: number | null
  format?: string | null
  fileSize?: number | null
  fileType?: string | null
  locationName?: string | null
  latitude?: number | null
  longitude?: number | null
  isFeatured: boolean
  rewardStatus: string
  createdAt: string
  updatedAt: string
}

export interface UploadPhotoParams {
  tripId?: string
  itineraryDayId?: string
  dayNumber?: number
  file: File
  locationName?: string
  onProgress?: (percent: number) => void
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

// ─── Photo API Hook ─────────────────────────────────────────────────────────

export function usePhotoApi() {
  const { getToken } = useAuth()

  async function getHeaders(): Promise<Record<string, string>> {
    const token = await getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  /**
   * Uploads an image directly to the Cloudinary backend endpoint.
   * Supports upload progress tracking.
   */
  async function uploadPhoto(params: UploadPhotoParams): Promise<Photo> {
    const token = await getToken()
    const formData = new FormData()
    formData.append('file', params.file)
    if (params.tripId) formData.append('tripId', params.tripId)
    if (params.itineraryDayId) formData.append('itineraryDayId', params.itineraryDayId)
    if (params.dayNumber) formData.append('dayNumber', params.dayNumber.toString())
    if (params.locationName) formData.append('locationName', params.locationName)

    console.log('[photoApi] 📦 Creating FormData and dispatching XHR POST to:', `${API_BASE}/api/photos/upload`, 'File:', params.file.name)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_BASE}/api/photos/upload`, true)
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && params.onProgress) {
          params.onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      xhr.onload = () => {
        console.log('[photoApi] 📥 XHR response received. Status:', xhr.status, 'Response:', xhr.responseText)
        try {
          const response: ApiResponse<Photo> = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300 && response.success) {
            resolve(response.data)
          } else {
            reject(new Error(response.message || `Upload failed with status ${xhr.status}`))
          }
        } catch (err) {
          reject(new Error('Invalid response from photo upload server'))
        }
      }

      xhr.onerror = () => {
        console.error('[photoApi] ❌ Network error during photo upload XHR')
        reject(new Error('Network error during photo upload'))
      }
      xhr.send(formData)
    })
  }

  /**
   * Backwards compatible presigned upload URL generator stub.
   */
  async function generateUploadUrl(params: any) {
    const res = await fetch(`${API_BASE}/api/photos/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getHeaders()),
      },
      body: JSON.stringify(params),
    })
    const json = await res.json()
    return json.data
  }

  /**
   * Fetches photos for an itinerary day.
   */
  async function getPhotos(tripId: string, dayId: string): Promise<Photo[]> {
    try {
      const headers = await getHeaders()
      const res = await fetch(
        `${API_BASE}/api/trips/${tripId}/days/${dayId}/photos`,
        { headers }
      )
      if (!res.ok) {
        return []
      }
      const json: ApiResponse<Photo[]> = await res.json()
      if (!json.success) return []
      return json.data || []
    } catch (err: any) {
      return []
    }
  }

  /**
   * Deletes a photo from Cloudinary & database.
   */
  async function deletePhoto(photoId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/photos/${photoId}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    })
    const json: ApiResponse<null> = await res.json()
    if (!json.success) throw new Error(json.message || 'Failed to delete photo')
  }

  return useMemo(
    () => ({
      uploadPhoto,
      generateUploadUrl,
      getPhotos,
      deletePhoto,
    }),
    [getToken] // eslint-disable-line react-hooks/exhaustive-deps
  )
}
