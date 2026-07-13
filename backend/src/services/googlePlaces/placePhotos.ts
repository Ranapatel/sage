/**
 * Place Photos — Fetch Google Place photos only
 *
 * No Unsplash, no other image providers. Google-only.
 * Returns pre-resolved photo URLs for a given Place ID.
 */

import { googleRequest, buildPhotoUrl } from './googleClient'
import { TripSagePlacePhoto, PlacePhotosParams } from './types'

const PHOTO_FIELD_MASK = 'photos'

export async function getPlacePhotos(params: PlacePhotosParams): Promise<TripSagePlacePhoto[]> {
  const { placeId, maxPhotos = 5, maxWidthPx = 800 } = params

  // Fetch only the photos field from place details
  const data = await googleRequest<any>({
    method: 'GET',
    path: `/places/${placeId}`,
    fieldMask: PHOTO_FIELD_MASK,
    cachePrefix: 'gp_photos',
    cacheTtl: 86400, // 24h — photos rarely change
  })

  const photos = (data?.photos || []).slice(0, maxPhotos)

  return photos.map((p: any) => ({
    url: p.name ? buildPhotoUrl(p.name, maxWidthPx) : '',
    width: p.widthPx || 0,
    height: p.heightPx || 0,
    attributions: (p.authorAttributions || []).map((a: any) => a.displayName || ''),
  }))
}
