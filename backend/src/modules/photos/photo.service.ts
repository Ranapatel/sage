/**
 * Photo Service — Business logic for travel photo management
 *
 * Handles:
 *   - Generating presigned upload URLs
 *   - Processing uploaded images (WEBP conversion + thumbnails via Sharp)
 *   - Saving photo records to PostgreSQL via Prisma
 *   - Retrieving photos per itinerary day
 *   - Deleting photos (DB record + R2 objects)
 */

import { prisma } from '../../prisma/prisma.client'
import {
  generateFileKey,
  generateUploadUrl,
  getObject,
  putObject,
  deleteObject,
  getPublicUrl,
  extractFileKeyFromUrl,
  validateFileType,
  validateFileSize,
  MAX_FILE_SIZE,
} from '../../services/r2Service'
import { processImage, extractGpsData } from '../../services/imageProcessingService'

// ── Types ───────────────────────────────────────────────────────────────────

export interface CreatePhotoInput {
  tripId: string
  itineraryDayId?: string
  dayNumber?: number
  fileKey: string
  originalFileName?: string
  fileType?: string
  locationName?: string
}

export interface PhotoDto {
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
  createdAt: Date
  updatedAt: Date
}

// ── Ownership Verification ──────────────────────────────────────────────────

async function verifyTripOwnership(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { userId: true },
  })
  return trip?.userId === userId
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

  if (dayNumber) {
    const day = await prisma.itineraryDay.findFirst({
      where: { tripId, dayNumber },
      select: { id: true },
    })
    return day?.id || null
  }

  return null
}

// ── Generate Upload URL ─────────────────────────────────────────────────────

export async function generatePhotoUploadUrl(
  userId: string,
  tripId: string,
  itineraryDayId: string | undefined,
  dayNumber: number | undefined,
  fileName: string,
  fileType: string,
  fileSize: number
) {
  // Verify ownership
  const owns = await verifyTripOwnership(tripId, userId)
  if (!owns) {
    throw new Error('Unauthorized: You do not own this trip')
  }

  // Validate file type and size
  if (!validateFileType(fileType)) {
    throw new Error(`Unsupported file type: ${fileType}`)
  }
  if (!validateFileSize(fileSize)) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`)
  }

  // Resolve itineraryDayId
  const resolvedDayId = await resolveItineraryDayId(tripId, itineraryDayId, dayNumber)
  if (!resolvedDayId) {
    throw new Error('Itinerary day not found for this trip')
  }

  // Determine file extension from type
  const ext = fileType.split('/')[1] || 'jpg'
  const fileKey = generateFileKey(userId, tripId, resolvedDayId, ext)

  const result = await generateUploadUrl(fileKey, fileType, fileSize)

  return {
    uploadUrl: result.uploadUrl,
    fileKey: result.fileKey,
  }
}

// ── Save Photo Record (with image processing) ───────────────────────────────

export async function savePhoto(
  userId: string,
  input: CreatePhotoInput
): Promise<PhotoDto> {
  const { tripId, fileKey, itineraryDayId, dayNumber } = input

  // Verify ownership
  const owns = await verifyTripOwnership(tripId, userId)
  if (!owns) {
    throw new Error('Unauthorized: You do not own this trip')
  }

  // Resolve itineraryDayId
  const resolvedDayId = await resolveItineraryDayId(tripId, itineraryDayId, dayNumber)
  if (!resolvedDayId) {
    throw new Error('Itinerary day not found for this trip')
  }

  // Download original from R2
  const originalBuffer = await getObject(fileKey)

  // Process image: convert to WEBP + generate thumbnail
  const processed = await processImage(originalBuffer)

  // Extract GPS data from EXIF (best-effort)
  const gps = await extractGpsData(originalBuffer)

  // Generate keys for processed images
  const webpKey = fileKey.replace(/\.[^.]+$/, '.webp')
  const thumbKey = webpKey.replace(/\.webp$/, '_thumb.webp')

  // Upload processed WEBP and thumbnail to R2
  await putObject(webpKey, processed.webpBuffer, 'image/webp')
  await putObject(thumbKey, processed.thumbnailBuffer, 'image/webp')

  // Delete the original uploaded file (keep only processed versions)
  await deleteObject(fileKey)

  // Generate public URLs
  const originalUrl = getPublicUrl(webpKey)
  const thumbnailUrl = getPublicUrl(thumbKey)

  // Save to database
  const photo = await prisma.travelPhoto.create({
    data: {
      userId,
      tripId,
      itineraryDayId: resolvedDayId,
      originalUrl,
      thumbnailUrl,
      imageUrl: originalUrl, // Backward compat
      fileSize: processed.webpSize,
      fileType: 'image/webp',
      locationName: input.locationName || null,
      latitude: gps.latitude || null,
      longitude: gps.longitude || null,
    },
  })

  return toDto(photo)
}

// ── Get Photos for a Day ────────────────────────────────────────────────────

export async function getPhotosByDay(
  userId: string,
  tripId: string,
  dayId: string
): Promise<PhotoDto[]> {
  // Verify ownership
  const owns = await verifyTripOwnership(tripId, userId)
  if (!owns) {
    throw new Error('Unauthorized: You do not own this trip')
  }

  const photos = await prisma.travelPhoto.findMany({
    where: {
      tripId,
      itineraryDayId: dayId,
      userId,
    },
    orderBy: { createdAt: 'desc' },
  })

  return photos.map(toDto)
}

// ── Delete Photo ────────────────────────────────────────────────────────────

export async function deletePhoto(userId: string, photoId: string): Promise<void> {
  const photo = await prisma.travelPhoto.findUnique({
    where: { id: photoId },
    select: { userId: true, originalUrl: true, thumbnailUrl: true },
  })

  if (!photo) {
    throw new Error('Photo not found')
  }

  if (photo.userId !== userId) {
    throw new Error('Unauthorized: You do not own this photo')
  }

  // Delete from R2
  const originalKey = extractFileKeyFromUrl(photo.originalUrl)
  const thumbKey = extractFileKeyFromUrl(photo.thumbnailUrl || '')

  if (originalKey) await deleteObject(originalKey).catch(() => {})
  if (thumbKey) await deleteObject(thumbKey).catch(() => {})

  // Delete from database
  await prisma.travelPhoto.delete({ where: { id: photoId } })
}

// ── DTO Mapper ──────────────────────────────────────────────────────────────

function toDto(photo: any): PhotoDto {
  return {
    id: photo.id,
    tripId: photo.tripId,
    itineraryDayId: photo.itineraryDayId,
    originalUrl: photo.originalUrl,
    thumbnailUrl: photo.thumbnailUrl,
    fileSize: photo.fileSize,
    fileType: photo.fileType,
    locationName: photo.locationName,
    latitude: photo.latitude,
    longitude: photo.longitude,
    isFeatured: photo.isFeatured,
    rewardStatus: photo.rewardStatus,
    createdAt: photo.createdAt,
    updatedAt: photo.updatedAt,
  }
}
