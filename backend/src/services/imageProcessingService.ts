/**
 * Image Processing Service
 *
 * Uses Sharp to:
 *   - Convert images to WEBP format for smaller file sizes
 *   - Generate thumbnails (max 300x300)
 *   - Optimize file size with quality settings
 *
 * Flow:
 *   1. Client uploads original to R2 via presigned URL
 *   2. Backend downloads original from R2
 *   3. Backend converts to WEBP + generates thumbnail
 *   4. Backend uploads both to R2
 *   5. Backend stores URLs in PostgreSQL
 */

import sharp from 'sharp'

// ── Processing Config ───────────────────────────────────────────────────────

const WEBP_QUALITY = 82          // Good balance of quality vs size
const THUMBNAIL_MAX_WIDTH = 300  // px
const THUMBNAIL_MAX_HEIGHT = 300 // px
const THUMBNAIL_QUALITY = 75     // Slightly lower quality for thumbnails
const MAX_IMAGE_WIDTH = 2048     // Cap original at 2048px wide

// ── Types ───────────────────────────────────────────────────────────────────

export interface ProcessedImageResult {
  webpBuffer: Buffer
  thumbnailBuffer: Buffer
  width: number
  height: number
  originalSize: number
  webpSize: number
  thumbnailSize: number
}

// ── Process Image ───────────────────────────────────────────────────────────

/**
 * Converts an image buffer to WEBP and generates a thumbnail.
 * Handles JPEG, PNG, WEBP, and HEIC inputs.
 */
export async function processImage(inputBuffer: Buffer): Promise<ProcessedImageResult> {
  // Create a Sharp instance — sharp auto-detects format from buffer
  let image = sharp(inputBuffer, { failOn: 'none' })

  // Get metadata
  const metadata = await image.metadata()
  const originalWidth = metadata.width || 0
  const originalHeight = metadata.height || 0

  // Convert to WEBP — cap at MAX_IMAGE_WIDTH for large photos
  const webpResizeOptions =
    originalWidth > MAX_IMAGE_WIDTH
      ? { width: MAX_IMAGE_WIDTH, withoutEnlargement: true }
      : undefined

  const webpBuffer = await image
    .clone()
    .resize(webpResizeOptions)
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()

  // Generate thumbnail — cover crop to square-ish aspect ratio
  const thumbnailBuffer = await image
    .clone()
    .resize(THUMBNAIL_MAX_WIDTH, THUMBNAIL_MAX_HEIGHT, {
      fit: 'cover',
      position: sharp.strategy.attention, // Smart crop to interesting area
    })
    .webp({ quality: THUMBNAIL_QUALITY })
    .toBuffer()

  // Get final dimensions
  const webpMeta = await sharp(webpBuffer).metadata()

  return {
    webpBuffer,
    thumbnailBuffer,
    width: webpMeta.width || originalWidth,
    height: webpMeta.height || originalHeight,
    originalSize: inputBuffer.length,
    webpSize: webpBuffer.length,
    thumbnailSize: thumbnailBuffer.length,
  }
}

// ── Extract EXIF GPS data ───────────────────────────────────────────────────

export interface GpsData {
  latitude?: number
  longitude?: number
}

export async function extractGpsData(inputBuffer: Buffer): Promise<GpsData> {
  try {
    const metadata = await sharp(inputBuffer).metadata()
    if (metadata.exif) {
      // Parse EXIF GPS data if available
      // Sharp stores EXIF as a raw Buffer; we need to parse it
      // Using a simple regex approach for GPS coordinates
      const exifStr = metadata.exif.toString('utf-8')

      // Try to extract GPS latitude/longitude from EXIF
      const latMatch = exifStr.match(/GPSLatitude.*?(\d+)\/1,(\d+)\/1,(\d+)\/(\d+)/)
      const latRefMatch = exifStr.match(/GPSLatitudeRef.*?([NS])/)
      const lonMatch = exifStr.match(/GPSLongitude.*?(\d+)\/1,(\d+)\/1,(\d+)\/(\d+)/)
      const lonRefMatch = exifStr.match(/GPSLongitudeRef.*?([EW])/)

      if (latMatch && lonMatch) {
        const lat =
          parseInt(latMatch[1]) +
          parseInt(latMatch[2]) / 60 +
          parseInt(latMatch[3]) / parseInt(latMatch[4]) / 3600
        const lon =
          parseInt(lonMatch[1]) +
          parseInt(lonMatch[2]) / 60 +
          parseInt(lonMatch[3]) / parseInt(lonMatch[4]) / 3600

        return {
          latitude: latRefMatch?.[1] === 'S' ? -lat : lat,
          longitude: lonRefMatch?.[1] === 'W' ? -lon : lon,
        }
      }
    }
  } catch {
    // GPS extraction is best-effort
  }

  return {}
}
