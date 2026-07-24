/**
 * Cloudinary Configuration
 *
 * Configures the official Cloudinary SDK (v2) using environment variables.
 * Cloudinary is the single source of truth for image storage.
 */

import { v2 as cloudinary } from 'cloudinary'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret || cloudName === 'your_cloud_name') {
  console.warn('[Cloudinary] Missing configuration — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env')
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
})

export default cloudinary
