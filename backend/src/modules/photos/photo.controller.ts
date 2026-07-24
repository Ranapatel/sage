/**
 * Photo Controller — Request handlers for Cloudinary Photo Management API
 *
 * Endpoints:
 *   POST /api/photos/upload                     → Upload photo directly to Cloudinary (Multipart)
 *   POST /api/photos/upload-url                 → Compatibility endpoint
 *   GET  /api/trips/:tripId/days/:dayId/photos  → Get photos for an itinerary day
 *   DELETE /api/photos/:photoId                 → Delete a photo from Cloudinary & DB
 */

import { Response } from 'express'
import { AuthenticatedRequest } from '../../middleware/auth.middleware'
import {
  uploadAndSavePhoto,
  getPhotosByDay,
  deletePhoto,
} from './photo.service'

// ── POST /api/photos/upload ──────────────────────────────────────────────────

export async function uploadPhotoHandler(req: AuthenticatedRequest, res: Response) {
  try {
    console.log('[Photo Controller] 📥 Endpoint hit: POST /api/photos/upload')
    console.log('[Photo Controller] 🔑 User authenticated:', req.user?.id)

    const file = req.file
    const { tripId, itineraryDayId, dayNumber, locationName } = req.body

    if (!file) {
      console.warn('[Photo Controller] ⚠️ Missing file payload in request')
      return res.status(400).json({
        success: false,
        message: 'No image file provided in multipart upload (field name: "file")',
      })
    }

    console.log(`[Photo Controller] 📄 File received: "${file.originalname}" (${file.size} bytes, type: ${file.mimetype})`)

    const photo = await uploadAndSavePhoto(req.user!.id, {
      tripId: tripId || undefined,
      itineraryDayId: itineraryDayId || undefined,
      dayNumber: dayNumber ? parseInt(dayNumber, 10) : undefined,
      fileBuffer: file.buffer,
      originalFileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      locationName,
    })

    console.log('[Photo Controller] ✅ Returning 201 success response with photo data:', photo.id)
    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully to Cloudinary',
      data: photo,
    })
  } catch (err: any) {
    if (err.message.startsWith('Unauthorized')) {
      console.warn('[Photo Controller] ❌ Unauthorized error:', err.message)
      return res.status(403).json({ success: false, message: err.message })
    }
    console.warn('[Photo Controller] ❌ Upload controller error:', err.message)
    return res.status(400).json({ success: false, message: err.message })
  }
}

// ── POST /api/photos/upload-url (Backwards Compatibility) ───────────────────

export async function generateUploadUrlHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { tripId } = req.body
    if (!tripId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: tripId',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Direct Cloudinary multipart upload is enabled. POST file to /api/photos/upload.',
      data: {
        uploadUrl: '/api/photos/upload',
        fileKey: `cloudinary_direct_${Date.now()}`,
      },
    })
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

// ── GET /api/trips/:tripId/days/:dayId/photos ───────────────────────────────

export async function getPhotosHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { tripId, dayId } = req.params

    if (!tripId || !dayId) {
      return res.status(400).json({
        success: false,
        message: 'tripId and dayId are required',
      })
    }

    const userId = req.user?.id
    if (!userId) {
      return res.status(200).json({
        success: true,
        data: [],
      })
    }

    const photos = await getPhotosByDay(userId, tripId, dayId)

    return res.status(200).json({
      success: true,
      data: photos,
    })
  } catch (err: any) {
    if (err.message?.startsWith('Unauthorized')) {
      return res.status(403).json({ success: false, message: err.message })
    }
    return res.status(200).json({ success: true, data: [] })
  }
}

// ── DELETE /api/photos/:photoId ─────────────────────────────────────────────

export async function deletePhotoHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { photoId } = req.params

    if (!photoId) {
      return res.status(400).json({
        success: false,
        message: 'photoId is required',
      })
    }

    await deletePhoto(req.user!.id, photoId)

    return res.status(200).json({
      success: true,
      message: 'Photo deleted successfully from Cloudinary & database',
    })
  } catch (err: any) {
    if (err.message === 'Photo not found') {
      return res.status(404).json({ success: false, message: err.message })
    }
    if (err.message.startsWith('Unauthorized')) {
      return res.status(403).json({ success: false, message: err.message })
    }
    return res.status(500).json({ success: false, message: err.message })
  }
}
