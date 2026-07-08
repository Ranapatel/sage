/**
 * Optimizes image URLs based on device type.
 * Handles Unsplash (w/q params) and Wikimedia Commons (width param).
 */
export function getOptimizedImageUrl(url: string, isMobile: boolean = false): string {
  if (!url) return url

  // Wikimedia Commons Special:FilePath or upload.wikimedia.org
  if (url.includes('wikimedia.org') || url.includes('wikipedia.org/api')) {
    const width = isMobile ? 600 : 800
    // Special:FilePath redirect — replace or add width param
    try {
      const u = new URL(url)
      u.searchParams.set('width', String(width))
      return u.toString()
    } catch {
      return url
    }
  }

  // Unsplash
  if (url.includes('images.unsplash.com')) {
    const baseUrl = url.split('?')[0]
    const width = isMobile ? 600 : 1920
    const quality = isMobile ? 60 : 90
    return `${baseUrl}?auto=format&fit=crop&w=${width}&q=${quality}`
  }

  return url
}

const AIRLINE_DOMAIN_MAP: Record<string, string> = {
  'goindigo.in': 'https://images.kiwi.com/airlines/64/6E.png',
  'airindia.com': 'https://images.kiwi.com/airlines/64/AI.png',
  'spicejet.com': 'https://images.kiwi.com/airlines/64/SG.png',
  'akasaair.com': 'https://images.kiwi.com/airlines/64/QP.png',
  'airvistara.com': 'https://images.kiwi.com/airlines/64/UK.png',
  'emirates.com': 'https://images.kiwi.com/airlines/64/EK.png',
  'qatarairways.com': 'https://images.kiwi.com/airlines/64/QR.png',
  'singaporeair.com': 'https://images.kiwi.com/airlines/64/SQ.png'
};

/**
 * Extracts domain and returns a stable airline logo URL.
 * Maps known domains to Kiwi images and uses icon.horse for 100% SLA fallbacks.
 */
export function getLogoUrl(source: string): string {
  const fallback = '/logos/default-airline.svg';
  if (!source) return fallback;

  // Use kiwi or unsplash images directly
  if (source.includes('images.kiwi.com') || source.includes('unsplash.com') || source.startsWith('/')) {
    return source;
  }

  // Extract domain from Clearbit URL if present
  let domain = source;
  if (source.includes('logo.clearbit.com/')) {
    domain = source.split('logo.clearbit.com/')[1];
  } else if (source.startsWith('http')) {
    try {
      domain = new URL(source).hostname;
    } catch {
      domain = source;
    }
  }

  const cleanDomain = domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
  if (!cleanDomain || cleanDomain.length < 3) return fallback;

  if (AIRLINE_DOMAIN_MAP[cleanDomain]) {
    return AIRLINE_DOMAIN_MAP[cleanDomain];
  }

  // Google Favicon returns 404s causing console errors. 
  // Icon.horse always returns a fallback image.
  return `https://icon.horse/icon/${cleanDomain}`;
}
