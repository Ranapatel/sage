export type EntityType =
  | 'hotel'
  | 'activity'
  | 'destination'
  | 'city'
  | 'restaurant'
  | 'attraction'
  | 'general'
  | 'beach'
  | 'museum'
  | 'park'
  | string

export interface ImageSearchRequest {
  query: string
  entityType?: EntityType
  entityName?: string
  city?: string
  country?: string
  category?: string
  limit?: number
  count?: number
}

export interface ImageObject {
  id: string
  url?: string
  regular?: string
  small?: string
  thumb?: string
  thumbnailUrl?: string
  source?: string
  width?: number
  height?: number
  author?: {
    name?: string
    url?: string
  }
  score?: number
  altText?: string
  photographer?: string
  photographerUrl?: string
  description?: string
  color?: string
}

export interface ImageSearchResponse {
  query?: string
  images: ImageObject[]
  heroImage?: ImageObject
  gallery?: ImageObject[]
  source?: string
  success?: boolean
  cached?: boolean
  queryUsed?: string
  fallbackUsed?: string
  responseTimeMs?: number
}
