import axios from 'axios';
import { ImageObject, UnsplashPhoto, UnsplashSearchResult } from '../types/image';

const UNSPLASH_BASE_URL = 'https://api.unsplash.com/search/photos';

export class UnsplashProvider {
  /**
   * Searches Unsplash API for photos matching query, applies quality filtering and Fisher-Yates shuffle.
   */
  public static async searchPhotos(
    query: string,
    requestedCount: number = 5
  ): Promise<{ images: ImageObject[]; query: string; rateLimitRemaining?: number }> {
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!apiKey) {
      console.warn('[UnsplashProvider] ⚠️  UNSPLASH_ACCESS_KEY is missing');
      return { images: [], query };
    }

    const perPage = Math.max(requestedCount * 3, 15); // Request excess candidate photos for quality filtering & shuffling

    try {
      const startTime = Date.now();
      const response = await axios.get<UnsplashSearchResult>(UNSPLASH_BASE_URL, {
        params: {
          query,
          orientation: 'landscape',
          content_filter: 'high',
          per_page: perPage,
          order_by: 'relevant',
          page: 1,
        },
        headers: {
          Authorization: `Client-ID ${apiKey}`,
          'Accept-Version': 'v1',
        },
        timeout: 8000,
      });

      const elapsed = Date.now() - startTime;
      const rateLimitLimit = response.headers['x-ratelimit-limit'];
      const rateLimitRemaining = response.headers['x-ratelimit-remaining'];

      if (rateLimitRemaining !== undefined && parseInt(rateLimitRemaining, 10) < 10) {
        console.warn(`[UnsplashProvider] ⚠️  Low rate-limit remaining: ${rateLimitRemaining}/${rateLimitLimit}`);
      }

      const rawResults = response.data?.results || [];
      console.log(`[UnsplashProvider] Search "${query}" returned ${rawResults.length} raw results in ${elapsed}ms`);

      if (rawResults.length === 0) {
        return { images: [], query, rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : undefined };
      }

      // ── 1. Quality Filtering ───────────────────────────────────────────────
      let filtered = rawResults.filter((photo) => {
        const hasGoodResolution = photo.width >= 1200 && photo.height >= 800;
        const hasDescription = Boolean(photo.description || photo.alt_description);
        return hasGoodResolution && hasDescription;
      });

      // Relaxation fallback if strict filter returned too few results
      if (filtered.length < requestedCount) {
        filtered = rawResults.filter((photo) => photo.width >= 800 && photo.height >= 600);
      }

      if (filtered.length === 0) {
        filtered = rawResults; // final fallback: use whatever photos Unsplash returned
      }

      // ── 2. Randomization (Fisher-Yates Shuffle) ───────────────────────────
      const shuffled = this.shuffleArray([...filtered]);

      // ── 3. Map & Select Requested Count ───────────────────────────────────
      const selected = shuffled.slice(0, requestedCount);
      const images: ImageObject[] = selected.map((photo) => this.mapToImageObject(photo));

      return {
        images,
        query,
        rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : undefined,
      };
    } catch (err: any) {
      if (err.response?.status === 429) {
        console.error('[UnsplashProvider] ❌ Rate limit exceeded (HTTP 429)');
      } else {
        console.error(`[UnsplashProvider] ❌ Error for query "${query}":`, err.response?.data?.errors || err.message);
      }
      return { images: [], query };
    }
  }

  /**
   * Maps Unsplash raw API response item to standard ImageObject model.
   */
  private static mapToImageObject(photo: UnsplashPhoto): ImageObject {
    const desc = photo.description || photo.alt_description || 'Travel destination photo';
    return {
      id: photo.id,
      regular: photo.urls.regular || photo.urls.full,
      small: photo.urls.small,
      thumb: photo.urls.thumb,
      photographer: photo.user?.name || 'Unsplash Contributor',
      photographerUrl: photo.user?.links?.html || 'https://unsplash.com',
      description: desc,
      color: photo.color || '#1e293b',
      width: photo.width,
      height: photo.height,
    };
  }

  /**
   * Fisher-Yates shuffle algorithm for unbiased random selection.
   */
  private static shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
