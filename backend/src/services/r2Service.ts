/**
 * DEPRECATED — Cloudflare R2 has been replaced with Cloudinary.
 *
 * Single Source of Truth for image storage is now Cloudinary:
 *   - Config: src/config/cloudinary.ts
 *   - Service: src/services/cloudinary.service.ts
 */

export function r2DeprecatedError(): never {
  throw new Error('Cloudflare R2 is deprecated and removed. Use CloudinaryService instead.')
}
