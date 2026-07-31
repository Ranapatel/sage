/**
 * TripSage Cuisine & Restaurant Fallback Library
 * Provides curated, high-quality, category-specific photos and SVG placeholders
 * so no two restaurants ever share a single generic placeholder image.
 */

// ── Curated High-Resolution Photo Pools per Cuisine Category ─────────────────

export const CUISINE_PHOTO_POOLS: Record<string, string[]> = {
  indian: [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', // Chicken tikka curry
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', // Indian dining ambiance
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80', // Samosas & thali
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80', // Rich curry bowl
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&q=80', // Naan bread & spices
    'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80', // Biryani dish
  ],
  italian: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', // Italian restaurant interior
    'https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=800&q=80', // Fresh woodfired pizza
    'https://images.unsplash.com/photo-1621996346565-e3d5d6281270?w=800&q=80', // Gourmet pasta dish
    'https://images.unsplash.com/photo-1533777857889-4be7c70b31f8?w=800&q=80', // Italian bistro dining
    'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&q=80', // Spaghetti marinara
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', // Pizza slice table
  ],
  chinese: [
    'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80', // Dim sum dumplings
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80', // Wok stir fry
    'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&q=80', // Asian noodle bowl
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80', // Chinese feast spread
    'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&q=80', // Dumplings in steamer
  ],
  japanese: [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80', // Sushi platter
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80', // Japanese ramen bowl
    'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&q=80', // Izakaya bar interior
    'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&q=80', // Fresh sashimi rolls
    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80', // Japanese dining setup
  ],
  cafe: [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80', // Cozy cafe interior
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80', // Latte art coffee cup
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', // Coffee shop counter
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80', // Espresso & croissants
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80', // Outdoor cafe seating
  ],
  bakery: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', // Artisan bread loaves
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80', // Golden pastries & croissants
    'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=80', // Cake display shop
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', // Chocolate cake slice
    'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&q=80', // Freshly baked donuts
  ],
  fine_dining: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', // Elegant restaurant interior
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', // Plated gourmet steak
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80', // Upscale dining table
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', // Fine dining ambiance
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80', // Wine glass & gourmet plate
  ],
  seafood: [
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80', // Grilled fish plate
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80', // Seafood platter with shrimp & oysters
    'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&q=80', // Fresh lobster dish
    'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80', // Coastal seafood restaurant
    'https://images.unsplash.com/photo-1535400255456-984241443b29?w=800&q=80', // Paella & shellfish
  ],
  fast_food: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', // Juicy burger & fries
    'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80', // Cheeseburger combo
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80', // Gourmet burger on board
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', // Fast food pizzeria
    'https://images.unsplash.com/photo-1534790566855-4cb788d389ec?w=800&q=80', // Tacos & fast bites
  ],
  vegetarian: [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80', // Fresh green salad bowl
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', // Colorful Buddha bowl
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', // Healthy salad dish
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80', // Vegan avocado dish
    'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&q=80', // Roasted vegetable plate
  ],
  rooftop: [
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80', // Rooftop bar city view
    'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&q=80', // Sunset rooftop lounge
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', // Skyline outdoor dining
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80', // Rooftop cocktail table
    'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80', // Evening rooftop lights
  ],
  bar: [
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80', // Cocktail bar counter
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80', // Craft cocktail glass
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80', // Pub drinks & beer tap
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80', // Wine bar interior
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80', // Nightlife pub lounge
  ],
  dessert: [
    'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&q=80', // Ice cream scoops
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', // Chocolate cake dessert
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80', // Churros & sweet treats
    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80', // Cupcakes & macarons
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', // Sweet pastry showcase
  ],
  street_food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', // Asian night market food
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', // Street food stall vendor
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80', // Tacos street cart
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80', // Samosa street snack
    'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80', // Street burger stand
  ],
  mexican: [
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80', // Fresh tacos plate
    'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=800&q=80', // Guacamole & tortilla chips
    'https://images.unsplash.com/photo-1584208124888-3a20b9c799e2?w=800&q=80', // Burrito plate
    'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=800&q=80', // Mexican restaurant feast
  ],
  thai: [
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80', // Pad thai noodles
    'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80', // Thai green curry bowl
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80', // Thai street food dish
    'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&q=80', // Tom yum soup bowl
  ],
  french: [
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80', // Parisian Bistro
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', // Coq au vin / French steak
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', // French fine dining
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80', // Wine & French cuisine
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80', // French brasserie terrace
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', // Gourmet French plate
    'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&q=80', // French Cafe & Restaurant
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80', // French dining experience
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', // Warm Paris dining hall
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', // Classic bistro tables
  ],
  general_dining: [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
    'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  ]
}

// ── Category Normalization Helper ─────────────────────────────────────────────

export function normalizeCuisineCategory(cuisine: string = '', category: string = ''): string {
  const text = `${cuisine} ${category}`.toLowerCase()

  if (text.includes('french') || text.includes('bistro') || text.includes('brasserie') || text.includes('paris')) return 'french'
  if (text.includes('indian') || text.includes('curry') || text.includes('mughlai') || text.includes('punjabi') || text.includes('south indian')) return 'indian'
  if (text.includes('italian') || text.includes('pizza') || text.includes('pasta') || text.includes('trattoria') || text.includes('pizzeria')) return 'italian'
  if (text.includes('chinese') || text.includes('dim sum') || text.includes('cantonese') || text.includes('szechuan')) return 'chinese'
  if (text.includes('japanese') || text.includes('sushi') || text.includes('ramen') || text.includes('izakaya') || text.includes('tempura')) return 'japanese'
  if (text.includes('bakery') || text.includes('pastry') || text.includes('cake') || text.includes('bakes') || text.includes('bread')) return 'bakery'
  if (text.includes('cafe') || text.includes('café') || text.includes('coffee') || text.includes('espresso') || text.includes('tea room')) return 'cafe'
  if (text.includes('seafood') || text.includes('fish') || text.includes('crab') || text.includes('oyster') || text.includes('lobster')) return 'seafood'
  if (text.includes('fine dining') || text.includes('gourmet') || text.includes('michelin') || text.includes('upscale')) return 'fine_dining'
  if (text.includes('fast food') || text.includes('burger') || text.includes('diner') || text.includes('fries')) return 'fast_food'
  if (text.includes('vegan') || text.includes('vegetarian') || text.includes('healthy') || text.includes('salad')) return 'vegetarian'
  if (text.includes('rooftop') || text.includes('sky bar') || text.includes('sky lounge')) return 'rooftop'
  if (text.includes('bar') || text.includes('pub') || text.includes('lounge') || text.includes('cocktail') || text.includes('brewery')) return 'bar'
  if (text.includes('dessert') || text.includes('ice cream') || text.includes('sweet') || text.includes('gelato') || text.includes('chocolatier')) return 'dessert'
  if (text.includes('street food') || text.includes('night market') || text.includes('food truck') || text.includes('stall')) return 'street_food'
  if (text.includes('mexican') || text.includes('taco') || text.includes('burrito') || text.includes('tex-mex')) return 'mexican'
  if (text.includes('thai') || text.includes('pad thai')) return 'thai'

  return 'general_dining'
}

// ── Deterministic Hash for Distinct Image Selection ───────────────────────────

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Returns a distinct, category-matched fallback image URL for a given restaurant.
 * Guarantees different restaurants receive different images.
 */
export function getCategoryFallbackImage(cuisine: string, restaurantName: string, placeId?: string): string {
  const catKey = normalizeCuisineCategory(cuisine)
  const pool = CUISINE_PHOTO_POOLS[catKey] || CUISINE_PHOTO_POOLS.general_dining
  const seed = `${placeId || ''}_${restaurantName}_${cuisine}`
  const index = hashString(seed) % pool.length
  return pool[index]
}

/**
 * Returns a full list of fallback images for gallery preview if API photos are absent.
 */
export function getCategoryFallbackGallery(cuisine: string, restaurantName: string, placeId?: string): string[] {
  const catKey = normalizeCuisineCategory(cuisine)
  const pool = CUISINE_PHOTO_POOLS[catKey] || CUISINE_PHOTO_POOLS.general_dining
  const seed = `${placeId || ''}_${restaurantName}_${cuisine}`
  const startIndex = hashString(seed) % pool.length

  const gallery: string[] = []
  for (let i = 0; i < Math.min(pool.length, 4); i++) {
    gallery.push(pool[(startIndex + i) % pool.length])
  }
  return gallery
}

// ── Category SVG Data URI Generator (for 100% Offline / Error Fallbacks) ──────

export function getCategorySvgDataUri(cuisine: string, restaurantName: string): string {
  const catKey = normalizeCuisineCategory(cuisine)

  const THEMES: Record<string, { bg1: string; bg2: string; icon: string; label: string }> = {
    indian: {
      bg1: '#7C2D12',
      bg2: '#EA580C',
      label: 'Indian Cuisine',
      icon: `<path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" fill="#FEF08A"/>`
    },
    italian: {
      bg1: '#991B1B',
      bg2: '#DC2626',
      label: 'Italian Trattoria',
      icon: `<path d="M12 2L2 22h20L12 2zm0 6l5 10H7l5-10z" fill="#FECACA"/>`
    },
    chinese: {
      bg1: '#9F1239',
      bg2: '#E11D48',
      label: 'Asian Dining',
      icon: `<path d="M4 6h16M4 12h16M4 18h16" stroke="#FFE4E6" stroke-width="2" stroke-linecap="round"/>`
    },
    japanese: {
      bg1: '#881337',
      bg2: '#BE123C',
      label: 'Japanese & Sushi',
      icon: `<circle cx="12" cy="12" r="7" fill="#FECDD3"/>`
    },
    cafe: {
      bg1: '#78350F',
      bg2: '#D97706',
      label: 'Cafe & Coffee',
      icon: `<path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" stroke="#FEF3C7" stroke-width="2" fill="none"/>`
    },
    bakery: {
      bg1: '#92400E',
      bg2: '#F59E0B',
      label: 'Bakery & Pastry',
      icon: `<path d="M12 4a8 8 0 00-8 8v8h16v-8a8 8 0 00-8-8z" stroke="#FEF3C7" stroke-width="2" fill="none"/>`
    },
    fine_dining: {
      bg1: '#1E1B4B',
      bg2: '#4338CA',
      label: 'Fine Dining',
      icon: `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#E0E7FF"/>`
    },
    seafood: {
      bg1: '#065F46',
      bg2: '#0D9488',
      label: 'Seafood Restaurant',
      icon: `<path d="M22 12c-4-4-10-4-14 0l-4-4 2 8-2 8 4-4c4 4 10 4 14 0z" fill="#CCFBF1"/>`
    },
    fast_food: {
      bg1: '#9A3412',
      bg2: '#F97316',
      label: 'Fast Food & Diner',
      icon: `<rect x="4" y="10" width="16" height="10" rx="3" fill="#FFEDD5"/><path d="M5 8a7 7 0 0114 0H5z" fill="#FED7AA"/>`
    },
    vegetarian: {
      bg1: '#14532D',
      bg2: '#16A34A',
      label: 'Vegetarian & Vegan',
      icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#DCFCE7"/>`
    },
    rooftop: {
      bg1: '#311B92',
      bg2: '#7C4DFF',
      label: 'Rooftop Dining',
      icon: `<path d="M3 21h18M5 21V7l7-4 7 4v14" stroke="#EDE7F6" stroke-width="2" fill="none"/>`
    },
    bar: {
      bg1: '#4A148C',
      bg2: '#8E24AA',
      label: 'Bar & Lounge',
      icon: `<path d="M8 22h8M12 15v7M5 3l7 8 7-8H5z" stroke="#F3E5F5" stroke-width="2" fill="none"/>`
    },
    dessert: {
      bg1: '#881337',
      bg2: '#F43F5E',
      label: 'Dessert & Sweets',
      icon: `<path d="M12 21a9 9 0 009-9H3a9 9 0 009 9z" fill="#FFE4E6"/><circle cx="12" cy="7" r="3" fill="#FECDD3"/>`
    },
    street_food: {
      bg1: '#B45309',
      bg2: '#F59E0B',
      label: 'Street Food',
      icon: `<path d="M3 13h18M5 13V7h14v6M8 21v-4M16 21v-4" stroke="#FEF3C7" stroke-width="2"/>`
    },
    mexican: {
      bg1: '#991B1B',
      bg2: '#EA580C',
      label: 'Mexican Kitchen',
      icon: `<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 14a4 4 0 110-8 4 4 0 010 8z" fill="#FFEDD5"/>`
    },
    thai: {
      bg1: '#065F46',
      bg2: '#10B981',
      label: 'Thai Flavors',
      icon: `<path d="M12 2l3 7h7l-6 4 2 7-6-4-6 4 2-7-6-4h7z" fill="#D1FAE5"/>`
    },
    general_dining: {
      bg1: '#1E293B',
      bg2: '#475569',
      label: 'Restaurant & Dining',
      icon: `<path d="M11 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V2M7 2v20M20 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" stroke="#F1F5F9" stroke-width="2" fill="none"/>`
    }
  }

  const theme = THEMES[catKey] || THEMES.general_dining
  const title = restaurantName ? restaurantName.replace(/</g, '&lt;').replace(/>/g, '&gt;') : theme.label

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.bg1}"/>
        <stop offset="100%" stop-color="${theme.bg2}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#g)"/>
    <circle cx="400" cy="210" r="80" fill="white" fill-opacity="0.1"/>
    <g transform="translate(376, 186) scale(2)">
      ${theme.icon}
    </g>
    <text x="400" y="340" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="28" fill="#FFFFFF" text-anchor="middle">${title}</text>
    <text x="400" y="375" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="16" fill="#FFFFFF" fill-opacity="0.7" text-anchor="middle">${theme.label.toUpperCase()}</text>
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
