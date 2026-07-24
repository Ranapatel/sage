/**
 * Photo Routes — Express router for Cloudinary Photo Upload & Management API
 *
 * Routes:
 *   POST   /api/photos/upload                     → Direct Cloudinary Multipart upload
 *   POST   /api/photos/upload-url                 → Compatibility endpoint
 *   DELETE /api/photos/:photoId                      → Delete photo from Cloudinary & DB
 *   GET    /api/photos/trips/:tripId/days/:dayId/photos → Get photos for a day
 */

import { Router } from 'express'
import multer from 'multer'
import { authMiddleware } from '../../middleware/auth.middleware'
import {
  uploadPhotoHandler,
  generateUploadUrlHandler,
  getPhotosHandler,
  deletePhotoHandler,
} from './photo.controller'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
})

const router = Router()

// All photo routes require authentication
router.use(authMiddleware as any)

// POST /api/photos/upload — Direct Cloudinary Multipart Upload
router.post('/upload', upload.single('file'), uploadPhotoHandler as any)

// POST /api/photos/upload-url — Legacy compatibility
router.post('/upload-url', generateUploadUrlHandler as any)

// DELETE /api/photos/:photoId — Delete a photo
router.delete('/:photoId', deletePhotoHandler as any)

// GET /api/photos/trips/:tripId/days/:dayId/photos — Get photos for a day
router.get('/trips/:tripId/days/:dayId/photos', getPhotosHandler as any)

export default router
