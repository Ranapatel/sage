import { ImageSearchRequest, ImageSearchResponse, ImageObject, EntityType } from '../types/image';
import { ImageQueryBuilder } from '../utils/imageQueryBuilder';
import { ImageCache } from '../cache/image.cache';
import { UnsplashProvider } from '../providers/unsplash.provider';

// Curated high quality travel placeholder images (guarantees API never crashes or returns empty array)
const CURATED_PLACEHOLDERS: Record<EntityType, ImageObject[]> = {
  hotel: [
    {
      id: 'placeholder-hotel-1',
      regular: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80',
      photographer: 'Luxury Resort Collection',
      photographerUrl: 'https://unsplash.com',
      description: 'Modern luxury hotel resort with swimming pool',
      color: '#1e293b',
      width: 1920,
      height: 1080,
    },
    {
      id: 'placeholder-hotel-2',
      regular: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200&q=80',
      photographer: 'Boutique Stay',
      photographerUrl: 'https://unsplash.com',
      description: 'Elegant hotel bedroom interior',
      color: '#0f172a',
      width: 1920,
      height: 1080,
    },
    {
      id: 'placeholder-hotel-3',
      regular: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200&q=80',
      photographer: 'Grand Heritage Hotel',
      photographerUrl: 'https://unsplash.com',
      description: 'Grand luxury hotel building',
      color: '#334155',
      width: 1920,
      height: 1080,
    },
  ],
  restaurant: [
    {
      id: 'placeholder-rest-1',
      regular: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80',
      photographer: 'Fine Dining Guide',
      photographerUrl: 'https://unsplash.com',
      description: 'Cozy fine dining restaurant ambiance',
      color: '#1e1b4b',
      width: 1920,
      height: 1080,
    },
    {
      id: 'placeholder-rest-2',
      regular: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80',
      photographer: 'Gourmet Bistro',
      photographerUrl: 'https://unsplash.com',
      description: 'Delicious restaurant dish plating',
      color: '#312e81',
      width: 1920,
      height: 1080,
    },
  ],
  attraction: [
    {
      id: 'placeholder-attr-1',
      regular: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&q=80',
      photographer: 'Global Landmarks',
      photographerUrl: 'https://unsplash.com',
      description: 'Iconic tourist landmark',
      color: '#0369a1',
      width: 1920,
      height: 1080,
    },
  ],
  beach: [
    {
      id: 'placeholder-beach-1',
      regular: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80',
      photographer: 'Coastal Escapes',
      photographerUrl: 'https://unsplash.com',
      description: 'Tropical sandy beach with turquoise ocean',
      color: '#0e7490',
      width: 1920,
      height: 1080,
    },
  ],
  museum: [
    {
      id: 'placeholder-museum-1',
      regular: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=200&q=80',
      photographer: 'Art & Heritage',
      photographerUrl: 'https://unsplash.com',
      description: 'Classic museum gallery hall',
      color: '#475569',
      width: 1920,
      height: 1080,
    },
  ],
  park: [
    {
      id: 'placeholder-park-1',
      regular: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=80',
      photographer: 'Nature Reserves',
      photographerUrl: 'https://unsplash.com',
      description: 'Lush green city park trail',
      color: '#15803d',
      width: 1920,
      height: 1080,
    },
  ],
  destination: [
    {
      id: 'placeholder-dest-1',
      regular: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&q=80',
      photographer: 'World Travel Guide',
      photographerUrl: 'https://unsplash.com',
      description: 'Scenic travel destination panorama',
      color: '#0284c7',
      width: 1920,
      height: 1080,
    },
  ],
  general: [
    {
      id: 'placeholder-gen-1',
      regular: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&q=80',
      photographer: 'Wanderlust Explorer',
      photographerUrl: 'https://unsplash.com',
      description: 'Beautiful road trip travel landscape',
      color: '#0369a1',
      width: 1920,
      height: 1080,
    },
  ],
};

export class ImageService {
  /**
   * Main entry point to search images for any entity type.
   * Returns 3-5 images (or up to 10 for destinations).
   */
  public static async searchImages(request: ImageSearchRequest): Promise<ImageSearchResponse> {
    const startTime = Date.now();
    const { entityName, entityType, city, count } = request;
    const requestedCount = count || (entityType === 'destination' ? 10 : 5);

    // ── 1. Check Redis Cache ──────────────────────────────────────────────────
    const cacheKey = ImageQueryBuilder.buildCacheKey(entityType, entityName, city);
    const cachedResponse = await ImageCache.get(cacheKey);
    if (cachedResponse && cachedResponse.images && cachedResponse.images.length > 0) {
      console.log(`[ImageService] ⚡ Cache HIT for key "${cacheKey}" (${cachedResponse.images.length} images)`);
      return {
        ...cachedResponse,
        responseTimeMs: Date.now() - startTime,
      };
    }

    console.log(`[ImageService] 🔍 Cache MISS for key "${cacheKey}". Initiating search queries...`);

    // ── 2. Build Intelligent Queries ──────────────────────────────────────────
    const queries = ImageQueryBuilder.buildQueries(request);
    let successfulImages: ImageObject[] = [];
    let successfulQuery = '';
    let fallbackUsed = '';

    // ── 3. Execute Fallback Search Strategy ───────────────────────────────────
    for (let i = 0; i < queries.length; i++) {
      const currentQuery = queries[i];
      console.log(`[ImageService] Trying query [${i + 1}/${queries.length}]: "${currentQuery}"`);

      const result = await UnsplashProvider.searchPhotos(currentQuery, requestedCount);
      if (result.images && result.images.length > 0) {
        successfulImages = result.images;
        successfulQuery = currentQuery;
        fallbackUsed = i > 0 ? `Fallback index ${i}: "${currentQuery}"` : 'None (Primary query matched)';
        break;
      }
    }

    // ── 4. Destination Level Fallback ─────────────────────────────────────────
    if (successfulImages.length === 0 && city) {
      const destQuery = `${city} travel`;
      console.log(`[ImageService] [Fallback] Trying destination-level query: "${destQuery}"`);
      const destResult = await UnsplashProvider.searchPhotos(destQuery, requestedCount);
      if (destResult.images && destResult.images.length > 0) {
        successfulImages = destResult.images;
        successfulQuery = destQuery;
        fallbackUsed = `Destination Fallback: "${destQuery}"`;
      }
    }

    // ── 5. Curated High Quality Placeholder Fallback ──────────────────────────
    let finalSource: 'unsplash' | 'destination_fallback' | 'placeholder' = 'unsplash';

    if (successfulImages.length === 0) {
      console.warn(`[ImageService] ⚠️ All queries failed for "${entityName}". Using curated placeholder fallback.`);
      const pool = CURATED_PLACEHOLDERS[entityType] || CURATED_PLACEHOLDERS.general;
      successfulImages = [...pool];
      successfulQuery = 'placeholder_fallback';
      fallbackUsed = 'Curated Placeholder Fallback';
      finalSource = 'placeholder';
    } else if (fallbackUsed.includes('Destination Fallback')) {
      finalSource = 'destination_fallback';
    }

    const elapsed = Date.now() - startTime;
    console.log(`[ImageService] ✅ Resolved ${successfulImages.length} images for "${entityName}" (${finalSource}) in ${elapsed}ms`);

    const response: ImageSearchResponse = {
      success: true,
      source: finalSource,
      cached: false,
      queryUsed: successfulQuery,
      fallbackUsed,
      responseTimeMs: elapsed,
      images: successfulImages,
    };

    // ── 6. Store in Redis Cache ───────────────────────────────────────────────
    if (finalSource !== 'placeholder') {
      await ImageCache.set(cacheKey, response);
    }

    return response;
  }
}
