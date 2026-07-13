/**
 * Cloudflare R2 Storage Service
 *
 * R2 is S3-compatible — we use the AWS SDK v3 with R2 endpoint override.
 * Provides:
 *   - generateUploadUrl()  → presigned PUT URL for direct client upload
 *   - getObject()          → download an object as a Buffer (for image processing)
 *   - putObject()          → upload a Buffer (for processed WEBP + thumbnails)
 *   - deleteObject()       → remove an object
 *   - getPublicUrl()       → public URL for serving images
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

// ── R2 Configuration ────────────────────────────────────────────────────────

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY
const R2_SECRET_KEY = process.env.R2_SECRET_KEY
const R2_BUCKET = process.env.R2_BUCKET || 'tripsage-media'
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL // e.g. https://media.tripsage.in

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY || !R2_SECRET_KEY) {
  console.warn('[R2] Missing configuration — photo uploads will not work')
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY || '',
    secretAccessKey: R2_SECRET_KEY || '',
  },
})

// ── Constants ───────────────────────────────────────────────────────────────

const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const UPLOAD_URL_EXPIRY = 300 // 5 minutes

// ── Types ───────────────────────────────────────────────────────────────────

export interface UploadUrlResult {
  uploadUrl: string
  fileKey: string
}

// ── Validation ──────────────────────────────────────────────────────────────

export function validateFileType(fileType: string): boolean {
  return ALLOWED_FORMATS.includes(fileType.toLowerCase())
}

export function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE
}

export { MAX_FILE_SIZE, ALLOWED_FORMATS }

// ── File Key Generation ─────────────────────────────────────────────────────

/**
 * Generates a unique R2 object key following the storage structure:
 *   tripsage-media/users/{userId}/trips/{tripId}/day-{dayId}/image.webp
 */
export function generateFileKey(
  userId: string,
  tripId: string,
  itineraryDayId: string,
  extension: string = 'webp'
): string {
  const uuid = randomUUID()
  return `users/${userId}/trips/${tripId}/day-${itineraryDayId}/${uuid}.${extension}`
}

// ── Public URL ──────────────────────────────────────────────────────────────

export function getPublicUrl(fileKey: string): string {
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${fileKey}`
  }
  // Fallback: R2 dev URL (works if bucket is set to public access)
  return `https://${R2_ACCOUNT_ID}.r2.dev/${fileKey}`
}

// ── Presigned Upload URL ────────────────────────────────────────────────────

export async function generateUploadUrl(
  fileKey: string,
  fileType: string,
  fileSize: number
): Promise<UploadUrlResult> {
  if (!validateFileType(fileType)) {
    throw new Error(`Unsupported file type: ${fileType}. Allowed: ${ALLOWED_FORMATS.join(', ')}`)
  }
  if (!validateFileSize(fileSize)) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`)
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileKey,
    ContentType: fileType,
    ContentLength: fileSize,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: UPLOAD_URL_EXPIRY,
  })

  return { uploadUrl, fileKey }
}

// ── Get Object (download as Buffer) ─────────────────────────────────────────

export async function getObject(fileKey: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileKey,
  })

  const response = await s3Client.send(command)

  // The S3 SDK v3 Body is a StreamingBlobPayloadOutputTypes — use transformToByteArray
  if (response.Body && typeof (response.Body as any).transformToByteArray === 'function') {
    const arrayBuffer = await (response.Body as any).transformToByteArray()
    return Buffer.from(arrayBuffer)
  }

  // Fallback: read from stream
  if (response.Body && typeof (response.Body as any).on === 'function') {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      ;(response.Body as any).on('data', (chunk: Buffer) => chunks.push(chunk))
      ;(response.Body as any).on('end', () => resolve(Buffer.concat(chunks)))
      ;(response.Body as any).on('error', reject)
    })
  }

  throw new Error('Unable to read R2 response body')
}

// ── Put Object (upload Buffer) ──────────────────────────────────────────────

export async function putObject(
  fileKey: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileKey,
    Body: body,
    ContentType: contentType,
  })

  await s3Client.send(command)
}

// ── Delete Object ───────────────────────────────────────────────────────────

export async function deleteObject(fileKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileKey,
  })

  await s3Client.send(command)
}

// ── Extract file key from URL ───────────────────────────────────────────────

export function extractFileKeyFromUrl(url: string): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    // Remove leading slash from pathname
    return parsed.pathname.replace(/^\//, '')
  } catch {
    // If it's already a key (not a URL), return as-is
    return url
  }
}
