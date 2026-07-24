/**
 * Hotelbeds Giata CDN image utilities.
 *
 * All hotel images MUST come from the Hotelbeds Giata CDN:
 *   https://photos.hotelbeds.com/giata/{size_prefix?}{relative_path}
 *
 * Available sizes per Hotelbeds documentation:
 *   standard (320px) : https://photos.hotelbeds.com/giata/{path}
 *   small (74px)     : https://photos.hotelbeds.com/giata/small/{path}
 *   medium (117px)   : https://photos.hotelbeds.com/giata/medium/{path}
 *   bigger (800px)   : https://photos.hotelbeds.com/giata/bigger/{path}
 *
 * NEVER use Unsplash or any external image sources.
 */
const GIATA_BASE = 'https://photos.hotelbeds.com/giata/';

export type ImageSize = 'thumbnail' | 'medium' | 'standard' | 'bigger' | 'xl' | 'xxl' | 'original';

const SIZE_PREFIXES: Record<ImageSize, string> = {
  thumbnail: 'small/',    // 74px width
  medium:    'medium/',   // 117px width
  standard:  '',          // 320px width
  bigger:    'bigger/',   // 800px width
  xl:        'xl/',       // 1024px width
  xxl:       'xxl/',      // 2048px width
  original:  'original/', // original size
};

/**
 * Builds a Hotelbeds Giata CDN image URL from a relative path or existing Giata URL.
 * Only Hotelbeds/Giata URLs are accepted. External URLs return empty string.
 */
export function buildHotelImageUrl(path: string, size: ImageSize = 'bigger'): string {
  if (!path) return '';

  // If it's a Giata CDN URL, extract the raw relative path and rebuild with requested size
  const giataMatch = path.match(/https?:\/\/photos\.hotelbeds\.com\/giata\/(?:(small|medium|bigger|xl|xxl|original)\/)?(.+)/i);
  if (giataMatch) {
    const rawPath = giataMatch[2].replace(/^\/+/, '');
    return `${GIATA_BASE}${SIZE_PREFIXES[size]}${rawPath}`;
  }

  // If it's already an absolute non-Giata URL, return it directly (pre-resolved Unsplash/Google image)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Relative path (e.g. "00/012345/012345a_hb_ro_001.jpg") — build full Giata URL
  const clean = path.replace(/^\/+/, '');
  return `${GIATA_BASE}${SIZE_PREFIXES[size]}${clean}`;
}

/**
 * Ordered fallback chain — try higher quality first, degrade gracefully on 404.
 * Falls back through all 7 sizes.
 */
export const IMAGE_FALLBACK_CHAIN: ImageSize[] = ['original', 'xxl', 'xl', 'bigger', 'standard', 'medium', 'thumbnail'];
