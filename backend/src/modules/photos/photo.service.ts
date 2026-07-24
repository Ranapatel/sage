/**
 * Photo Service — Business logic for travel photo management via Cloudinary
 *
 * Single source of truth: Cloudinary storage.
 * Handles:
 *   - Uploading images directly to Cloudinary (folder: tripsage/users/{userId}/trips/{tripId}/day-{dayNumber})
 *   - Saving photo metadata to PostgreSQL via Prisma
 *   - Retrieving photos per trip / itinerary day
 *   - Deleting photos (DB record + Cloudinary object via public_id)
 */

import { prisma } from '../../prisma/prisma.client'
import { ProfileService } from '../profile/profile.service'
import {
  uploadImage,
  deleteImage,
  buildFolderPath,
  getThumbnailUrl,
  validateFileType,
  validateFileSize,
  MAX_FILE_SIZE,
  CloudinaryUploadResult,
} from '../../services/cloudinary.service'

// ── Types ───────────────────────────────────────────────────────────────────

const photoStore = new Map<string, PhotoDto[]>()

export interface DirectUploadPhotoInput {
  tripId?: string
  itineraryDayId?: string
  dayNumber?: number
  fileBuffer: Buffer
  originalFileName?: string
  fileType: string
  fileSize: number
  locationName?: string
}

export interface PhotoDto {
  id: string
  userId: string
  tripId: string | null
  itineraryDayId: string | null
  secureUrl: string
  publicId: string
  originalUrl: string
  thumbnailUrl: string | null
  width: number | null
  height: number | null
  format: string | null
  fileSize: number | null
  fileType: string | null
  locationName: string | null
  latitude: number | null
  longitude: number | null
  isFeatured: boolean
  rewardStatus: string
  createdAt: Date
  updatedAt: Date
}

// ── Ownership Verification ──────────────────────────────────────────────────

async function verifyTripOwnership(tripId: string, userId: string): Promise<boolean> {
  if (!tripId) return true
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { userId: true },
  })
  if (!trip) return true // Allow unsaved transient trips
  return trip.userId === userId
}

async function resolveItineraryDayId(
  tripId: string,
  itineraryDayId?: string,
  dayNumber?: number
): Promise<string | null> {
  if (itineraryDayId) {
    const day = await prisma.itineraryDay.findUnique({
      where: { id: itineraryDayId },
      select: { tripId: true },
    })
    if (day && day.tripId === tripId) return itineraryDayId
    return null
  }

  if (dayNumber && tripId) {
    const day = await prisma.itineraryDay.findFirst({
      where: { tripId, dayNumber },
      select: { id: true },
    })
    return day?.id || null
  }

  return null
}

// ── Direct Cloudinary Photo Upload ──────────────────────────────────────────

export async function uploadAndSavePhoto(
  userId: string,
  input: DirectUploadPhotoInput
): Promise<PhotoDto> {
  const { tripId, itineraryDayId, dayNumber, fileBuffer, fileType, fileSize, locationName } = input

  // 1. Verify ownership if tripId is provided
  if (tripId) {
    const owns = await verifyTripOwnership(tripId, userId)
    if (!owns) {
      throw new Error('Unauthorized: You do not own this trip')
    }
  }

  // 2. Validate file type and size
  if (!validateFileType(fileType)) {
    throw new Error(`Unsupported file format: ${fileType}. Allowed: JPG, PNG, WEBP, HEIC.`)
  }
  if (!validateFileSize(fileSize)) {
    throw new Error(`File size exceeds 10MB limit (size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB)`)
  }

  // 3. Resolve itinerary day ID if tripId is provided
  const resolvedDayId = tripId ? await resolveItineraryDayId(tripId, itineraryDayId, dayNumber) : null

  // 4. Build Cloudinary target folder path
  const folderPath = tripId 
    ? buildFolderPath(userId, tripId, dayNumber)
    : `tripsage/users/${userId.replace(/[^a-zA-Z0-9_-]/g, '_')}/general`

  console.log('[Photo Service] ☁️ Cloudinary upload started. Folder:', folderPath)
  // 5. Upload buffer directly to Cloudinary
  const cldResult: CloudinaryUploadResult = await uploadImage(fileBuffer, folderPath)
  console.log('[Photo Service] ✅ Cloudinary upload finished. Public ID:', cldResult.publicId, 'URL:', cldResult.secureUrl)

  // 6. Generate thumbnail URL
  const thumbnailUrl = getThumbnailUrl(cldResult.publicId, 400, 400)

  // 7. Save photo record to PostgreSQL if trip exists in DB
  let photoDto: PhotoDto | null = null

  if (tripId) {
    try {
      console.log('[Photo Service] 💾 Database save started for tripId:', tripId)
      const existingTrip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { id: true },
      })

      if (existingTrip) {
        const photo = await prisma.travelPhoto.create({
          data: {
            userId,
            tripId,
            itineraryDayId: resolvedDayId,
            secureUrl: cldResult.secureUrl,
            publicId: cldResult.publicId,
            originalUrl: cldResult.secureUrl,
            thumbnailUrl,
            imageUrl: cldResult.secureUrl, // Backward compatibility
            width: cldResult.width,
            height: cldResult.height,
            format: cldResult.format,
            fileSize: cldResult.bytes,
            fileType,
            locationName: locationName || null,
          },
        })
        photoDto = toDto(photo)
        console.log('[Photo Service] ✅ Database save finished. TravelPhoto ID:', photo.id)
      } else {
        console.log('[Photo Service] ℹ️ Trip ID not found in database, proceeding with transient DTO')
      }
    } catch (dbErr: any) {
      console.warn('[Photo Service] DB notice during travelPhoto create:', dbErr.message)
    }
  }

  if (!photoDto) {
    photoDto = {
      id: `cld_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      tripId: tripId || null,
      itineraryDayId: resolvedDayId,
      secureUrl: cldResult.secureUrl,
      publicId: cldResult.publicId,
      originalUrl: cldResult.secureUrl,
      thumbnailUrl,
      width: cldResult.width,
      height: cldResult.height,
      format: cldResult.format,
      fileSize: cldResult.bytes,
      fileType,
      locationName: locationName || null,
      latitude: null,
      longitude: null,
      isFeatured: false,
      rewardStatus: 'NONE',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  // Cache in photoStore map under tripId and userId
  const key = tripId || userId
  const existingPhotos = photoStore.get(key) || []
  photoStore.set(key, [photoDto, ...existingPhotos.filter((p) => p.id !== photoDto!.id)])

  // Sync to Profile Travel Memories so uploaded photos show up under /profile?tab=memories
  try {
    await ProfileService.createMemory(userId, {
      title: locationName || input.originalFileName || 'Travel Memory',
      description: `Uploaded travel memory photo`,
      location: locationName || null,
      photos: [cldResult.secureUrl],
      tripId: tripId && tripId !== 'active_trip_session' ? tripId : null,
    })
  } catch (memErr: any) {
    console.warn('[PhotoService] Sync to Profile Memories notice:', memErr.message)
  }

  return photoDto
}

// ── Get Photos for a Day ────────────────────────────────────────────────────

export async function getPhotosByDay(
  userId: string,
  tripId: string,
  dayId: string
): Promise<PhotoDto[]> {
  const key = tripId || userId
  const cached = photoStore.get(key) || []

  try {
    let dbPhotos: PhotoDto[] = []
    if (tripId && tripId !== 'active_trip_session') {
      const photos = await prisma.travelPhoto.findMany({
        where: {
          userId,
          tripId,
        },
        orderBy: { createdAt: 'desc' },
      })
      dbPhotos = photos.map(toDto)
    }

    const map = new Map<string, PhotoDto>()
    cached.forEach((p) => map.set(p.id, p))
    dbPhotos.forEach((p) => map.set(p.id, p))
    return Array.from(map.values())
  } catch (err: any) {
    console.warn('[PhotoService] DB notice during getPhotosByDay:', err.message)
    return cached
  }
}

// ── Service Interfaces ────────────────────────────────────────────────────────────

// ── Delete Photo ────────────────────────────────────────────────────────────

export async function deletePhoto(userId: string, photoId: string): Promise<void> {
  const photo = await prisma.travelPhoto.findUnique({
    where: { id: photoId },
    select: { userId: true, publicId: true },
  })

  if (!photo) {
    throw new Error('Photo not found')
  }

  if (photo.userId !== userId) {
    throw new Error('Unauthorized: You do not own this photo')
  }

  // 1. Delete from Cloudinary if publicId exists
  if (photo.publicId) {
    await deleteImage(photo.publicId).catch((err) => {
      console.warn(`[PhotoService] Warning deleting ${photo.publicId} from Cloudinary:`, err.message)
    })
  }

  // 2. Remove record from database
  await prisma.travelPhoto.delete({ where: { id: photoId } })
}

// ── DTO Mapper ──────────────────────────────────────────────────────────────

function toDto(photo: any): PhotoDto {
  return {
    id: photo.id,
    userId: photo.userId,
    tripId: photo.tripId,
    itineraryDayId: photo.itineraryDayId,
    secureUrl: photo.secureUrl || photo.originalUrl,
    publicId: photo.publicId || '',
    originalUrl: photo.originalUrl || photo.secureUrl,
    thumbnailUrl: photo.thumbnailUrl || photo.secureUrl,
    width: photo.width || null,
    height: photo.height || null,
    format: photo.format || null,
    fileSize: photo.fileSize || null,
    fileType: photo.fileType || null,
    locationName: photo.locationName || null,
    latitude: photo.latitude || null,
    longitude: photo.longitude || null,
    isFeatured: photo.isFeatured || false,
    rewardStatus: photo.rewardStatus || 'NONE',
    createdAt: photo.createdAt,
    updatedAt: photo.updatedAt,
  }
}
