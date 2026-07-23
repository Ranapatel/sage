/**
 * Image Service Architecture — Types
 */

export type EntityType =
  | 'hotel'
  | 'restaurant'
  | 'attraction'
  | 'beach'
  | 'museum'
  | 'park'
  | 'destination'
  | 'general';

export interface ImageObject {
  id: string;
  regular: string;
  small: string;
  thumb: string;
  photographer: string;
  photographerUrl: string;
  description: string;
  color: string;
  width: number;
  height: number;
}

export interface ImageSearchRequest {
  entityName: string;
  entityType: EntityType;
  city: string;
  country?: string;
  count?: number; // 3-5 images for entities, up to 10 for destinations
}

export interface ImageSearchResponse {
  success: boolean;
  source: 'unsplash' | 'cache' | 'destination_fallback' | 'placeholder';
  cached: boolean;
  queryUsed?: string;
  fallbackUsed?: string;
  responseTimeMs?: number;
  images: ImageObject[];
}

export interface UnsplashSearchResult {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

export interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  color: string | null;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    id: string;
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
}
