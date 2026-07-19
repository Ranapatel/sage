/**
 * Photo API Client — Frontend API layer for travel photos
 *
 * Uses Clerk's getToken() for authenticated requests to the backend.
 * Matches the existing apiClient pattern used by other TripSage components.
 */

import { useAuth } from '@clerk/nextjs'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Photo {
  id: string
  tripId: string
  itineraryDayId: string | null
  originalUrl: string
  thumbnailUrl: string | null
  fileSize: number | null
  fileType: string | null
  locationName: string | null
  latitude: number | null
  longitude: number | null
  isFeatured: boolean
  rewardStatus: string
  createdAt: string
  updatedAt: string
}

export interface UploadUrlResponse {
  uploadUrl: string
  fileKey: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

// ─── Photo API Hook ─────────────────────────────────────────────────────────

export function usePhotoApi() {
  const { getToken } = useAuth()

  async function getHeaders(): Promise<HeadersInit> {
    const token = await getToken()
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  // Generate presigned upload URL
  async function generateUploadUrl(params: {
    tripId: string
    itineraryDayId?: string
    dayNumber?: number
    fileName: string
    fileType: string
    fileSize: number
  }): Promise<UploadUrlResponse> {
    const res = await fetch(`${API_BASE}/api/photos/upload-url`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(params),
    })
    const json: ApiResponse<UploadUrlResponse> = await res.json()
    if (!json.success) throw new Error(json.message || 'Failed to generate upload URL')
    return json.data
  }

  // Upload file directly to R2 via presigned URL
  async function uploadToR2(
    uploadUrl: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', uploadUrl, true)
      xhr.setRequestHeader('Content-Type', file.type)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve()
        else reject(new Error(`Upload failed: ${xhr.statusText}`))
      }

      xhr.onerror = () => reject(new Error('Network error during upload'))
      xhr.send(file)
    })
  }

  // Save photo record (triggers backend image processing)
  async function savePhoto(params: {
    tripId: string
    itineraryDayId?: string
    dayNumber?: number
    fileKey: string
    metadata?: {
      fileName?: string
      fileType?: string
      locationName?: string
    }
  }): Promise<Photo> {
    const res = await fetch(`${API_BASE}/api/photos`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(params),
    })
    const json: ApiResponse<Photo> = await res.json()
    if (!json.success) throw new Error(json.message || 'Failed to save photo')
    return json.data
  }

  // Get photos for an itinerary day
  async function getPhotos(tripId: string, dayId: string): Promise<Photo[]> {
    const res = await fetch(
      `${API_BASE}/api/trips/${tripId}/days/${dayId}/photos`,
      { headers: await getHeaders() }
    )
    const json: ApiResponse<Photo[]> = await res.json()
    if (!json.success) throw new Error(json.message || 'Failed to fetch photos')
    return json.data
  }

  // Delete a photo
  async function deletePhoto(photoId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/photos/${photoId}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    })
    const json: ApiResponse<null> = await res.json()
    if (!json.success) throw new Error(json.message || 'Failed to delete photo')
  }

  return {
    generateUploadUrl,
    uploadToR2,
    savePhoto,
    getPhotos,
    deletePhoto,
  }
}
