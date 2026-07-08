// High-quality, curated Unsplash photos for popular travel places
const PLACE_IMAGES: Record<string, string> = {
  // Goa
  'bom jesus': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80&auto=format&fit=crop',
  'fort aguada': 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=600&q=80&auto=format&fit=crop',
  'baga beach': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80&auto=format&fit=crop',
  'calangute': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80&auto=format&fit=crop',
  'dudhsagar': 'https://images.unsplash.com/photo-1614082242424-0cb83a45c3bb?w=600&q=80&auto=format&fit=crop',
  'anjuna': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80&auto=format&fit=crop',
  'chorao': 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&q=80&auto=format&fit=crop',
  'cola beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80&auto=format&fit=crop',
  'snorkeling': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80&auto=format&fit=crop',
  
  // Bali
  'uluwatu': 'https://images.unsplash.com/photo-1517089596392-db9a5e9478cc?w=600&q=80&auto=format&fit=crop',
  'tegallalang': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80&auto=format&fit=crop',
  'tanah lot': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=600&q=80&auto=format&fit=crop',
  'kelingking': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80&auto=format&fit=crop',
  'batur': 'https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?w=600&q=80&auto=format&fit=crop',
  'sekumpul': 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&q=80&auto=format&fit=crop',

  // General fallbacks by category/type
  'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format&fit=crop',
  'landmark': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80&auto=format&fit=crop',
  'beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80&auto=format&fit=crop',
  'nature': 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&q=80&auto=format&fit=crop',
  'nightlife': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80&auto=format&fit=crop',
}

export function getPlaceImage(placeName: string, category?: string): string {
  const nameLower = (placeName || '').toLowerCase()
  const catLower = (category || '').toLowerCase()

  // 1. Check direct name matches
  for (const [key, url] of Object.entries(PLACE_IMAGES)) {
    if (nameLower.includes(key)) return url
  }

  // 2. Check category hints
  if (catLower.includes('food') || catLower.includes('dining') || catLower.includes('restaurant') || catLower.includes('market')) {
    return PLACE_IMAGES.food
  }
  if (catLower.includes('outdoor') || catLower.includes('nature') || catLower.includes('waterfall') || catLower.includes('trek')) {
    return PLACE_IMAGES.nature
  }
  if (catLower.includes('nightlife') || catLower.includes('club') || catLower.includes('party')) {
    return PLACE_IMAGES.nightlife
  }
  if (catLower.includes('beach') || catLower.includes('water') || catLower.includes('sea')) {
    return PLACE_IMAGES.beach
  }

  // 3. Fallback based on name keywords
  if (nameLower.includes('beach') || nameLower.includes('sea') || nameLower.includes('shack')) {
    return PLACE_IMAGES.beach
  }
  if (nameLower.includes('restaurant') || nameLower.includes('caf') || nameLower.includes('bar') || nameLower.includes('eats') || nameLower.includes('kitchen') || nameLower.includes('food')) {
    return PLACE_IMAGES.food
  }
  if (nameLower.includes('waterfall') || nameLower.includes('trek') || nameLower.includes('mountain') || nameLower.includes('lake') || nameLower.includes('island') || nameLower.includes('valley')) {
    return PLACE_IMAGES.nature
  }
  if (nameLower.includes('club') || nameLower.includes('night') || nameLower.includes('lounge')) {
    return PLACE_IMAGES.nightlife
  }

  return PLACE_IMAGES.landmark
}
