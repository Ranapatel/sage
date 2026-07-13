/**
 * Photo Routes — Express router for travel photo API endpoints
 *
 * Mounted at /api/photos and /api/trips in index.js
 *
 * Routes:
 *   POST   /api/photos/upload-url                    → Generate presigned upload URL
 *   POST   /api/photos                               → Save photo record (with image processing)
 *   DELETE /api/photos/:photoId                      → Delete a photo
 *   GET    /api/trips/:tripId/days/:dayId/photos     → Get photos for a day
 */

import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import {
  generateUploadUrlHandler,
  savePhotoHandler,
  getPhotosHandler,
  deletePhotoHandler,
} from './photo.controller'

const router = Router()

// All photo routes require authentication
router.use(authMiddleware as any)

// POST /api/photos/upload-url — Generate presigned upload URL
router.post('/upload-url', generateUploadUrlHandler as any)

// POST /api/photos — Save photo record (downloads from R2, processes, saves)
router.post('/', savePhotoHandler as any)

// DELETE /api/photos/:photoId — Delete a photo
router.delete('/:photoId', deletePhotoHandler as any)

// GET /api/photos/trips/:tripId/days/:dayId — Get photos for a day
// Also accessible via /api/trips/:tripId/days/:dayId/photos (mounted in index.js)
router.get('/trips/:tripId/days/:dayId/photos', getPhotosHandler as any)

export default router
