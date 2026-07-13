/**
 * Photo Controller — Request handlers for photo API endpoints
 *
 * Endpoints:
 *   POST /api/photos/upload-url          → Generate presigned upload URL
 *   POST /api/photos                     → Save photo record (with image processing)
 *   GET  /api/trips/:tripId/days/:dayId/photos → Get photos for a day
 *   DELETE /api/photos/:photoId          → Delete a photo
 */

import { Response } from 'express'
import { AuthenticatedRequest } from '../../middleware/auth.middleware'
import {
  generatePhotoUploadUrl,
  savePhoto,
  getPhotosByDay,
  deletePhoto,
} from './photo.service'

// ── POST /api/photos/upload-url ─────────────────────────────────────────────

export async function generateUploadUrlHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { tripId, itineraryDayId, dayNumber, fileName, fileType, fileSize } = req.body

    if (!tripId || !fileName || !fileType || !fileSize) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tripId, fileName, fileType, fileSize',
      })
    }

    if (!itineraryDayId && !dayNumber) {
      return res.status(400).json({
        success: false,
        message: 'Either itineraryDayId or dayNumber is required',
      })
    }

    const result = await generatePhotoUploadUrl(
      req.user!.id,
      tripId,
      itineraryDayId,
      dayNumber,
      fileName,
      fileType,
      fileSize
    )

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (err: any) {
    if (err.message.startsWith('Unauthorized')) {
      return res.status(403).json({ success: false, message: err.message })
    }
    return res.status(500).json({ success: false, message: err.message })
  }
}

// ── POST /api/photos ────────────────────────────────────────────────────────

export async function savePhotoHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { tripId, itineraryDayId, dayNumber, fileKey, metadata } = req.body

    if (!tripId || !fileKey) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tripId, fileKey',
      })
    }

    const photo = await savePhoto(req.user!.id, {
      tripId,
      itineraryDayId,
      dayNumber,
      fileKey,
      originalFileName: metadata?.fileName,
      fileType: metadata?.fileType,
      locationName: metadata?.locationName,
    })

    return res.status(201).json({
      success: true,
      data: photo,
    })
  } catch (err: any) {
    if (err.message.startsWith('Unauthorized')) {
      return res.status(403).json({ success: false, message: err.message })
    }
    console.error('[Photo Controller] Save error:', err.message)
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

    const photos = await getPhotosByDay(req.user!.id, tripId, dayId)

    return res.status(200).json({
      success: true,
      data: photos,
    })
  } catch (err: any) {
    if (err.message.startsWith('Unauthorized')) {
      return res.status(403).json({ success: false, message: err.message })
    }
    return res.status(500).json({ success: false, message: err.message })
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
      message: 'Photo deleted successfully',
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
