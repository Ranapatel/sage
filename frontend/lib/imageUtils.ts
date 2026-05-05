/**
 * Optimizes Unsplash image URLs based on device type
 */
export function getOptimizedImageUrl(url: string, isMobile: boolean = false): string {
  if (!url || !url.includes('images.unsplash.com')) return url;
  
  // Remove existing width/quality params if they exist
  const baseUrl = url.split('?')[0];
  
  // Apply requested params: w=800&q=60 on mobile and w=1920&q=90 on desktop
  const width = isMobile ? 800 : 1920;
  const quality = isMobile ? 60 : 90;
  
  return `${baseUrl}?auto=format&fit=crop&w=${width}&q=${quality}`;
}
