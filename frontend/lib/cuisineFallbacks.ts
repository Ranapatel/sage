/**
 * TripSage Frontend Cuisine & Restaurant Fallback Library
 * Client-side utilities for category detection, cuisine badge styling,
 * photo fallback assignment, and SVG placeholder generation for onError states.
 */

export interface CuisineStyle {
  label: string
  badgeClass: string
  iconName: string
}

export const CUISINE_STYLES: Record<string, CuisineStyle> = {
  indian: {
    label: 'Indian',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    iconName: 'Utensils'
  },
  italian: {
    label: 'Italian',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    iconName: 'Pizza'
  },
  chinese: {
    label: 'Chinese',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    iconName: 'Bowl'
  },
  japanese: {
    label: 'Japanese',
    badgeClass: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    iconName: 'Fish'
  },
  cafe: {
    label: 'Cafe',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    iconName: 'Coffee'
  },
  bakery: {
    label: 'Bakery',
    badgeClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    iconName: 'Croissant'
  },
  fine_dining: {
    label: 'Fine Dining',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    iconName: 'Sparkles'
  },
  seafood: {
    label: 'Seafood',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    iconName: 'Fish'
  },
  fast_food: {
    label: 'Fast Food',
    badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
    iconName: 'Burger'
  },
  vegetarian: {
    label: 'Vegetarian',
    badgeClass: 'bg-green-500/10 text-green-400 border-green-500/20',
    iconName: 'Leaf'
  },
  rooftop: {
    label: 'Rooftop',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    iconName: 'Building'
  },
  bar: {
    label: 'Bar & Lounge',
    badgeClass: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    iconName: 'Glass'
  },
  dessert: {
    label: 'Dessert Shop',
    badgeClass: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
    iconName: 'Cake'
  },
  street_food: {
    label: 'Street Food',
    badgeClass: 'bg-amber-600/10 text-amber-500 border-amber-600/20',
    iconName: 'Flame'
  },
  mexican: {
    label: 'Mexican',
    badgeClass: 'bg-orange-600/10 text-orange-500 border-orange-600/20',
    iconName: 'Flame'
  },
  thai: {
    label: 'Thai',
    badgeClass: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    iconName: 'Utensils'
  },
  general_dining: {
    label: 'Restaurant',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    iconName: 'Utensils'
  }
}

export function detectCuisineKey(cuisine: string = '', placeName: string = ''): string {
  const text = `${cuisine} ${placeName}`.toLowerCase()

  if (text.includes('french') || text.includes('bistro') || text.includes('brasserie') || text.includes('paris')) return 'french'
  if (text.includes('indian') || text.includes('curry') || text.includes('mughlai') || text.includes('punjabi') || text.includes('thali')) return 'indian'
  if (text.includes('italian') || text.includes('pizza') || text.includes('pasta') || text.includes('trattoria') || text.includes('pizzeria')) return 'italian'
  if (text.includes('chinese') || text.includes('dim sum') || text.includes('cantonese') || text.includes('szechuan')) return 'chinese'
  if (text.includes('japanese') || text.includes('sushi') || text.includes('ramen') || text.includes('izakaya')) return 'japanese'
  if (text.includes('bakery') || text.includes('pastry') || text.includes('cake') || text.includes('bakes') || text.includes('bread')) return 'bakery'
  if (text.includes('cafe') || text.includes('café') || text.includes('coffee') || text.includes('espresso') || text.includes('roastery')) return 'cafe'
  if (text.includes('seafood') || text.includes('fish') || text.includes('crab') || text.includes('oyster') || text.includes('lobster')) return 'seafood'
  if (text.includes('fine dining') || text.includes('gourmet') || text.includes('michelin')) return 'fine_dining'
  if (text.includes('fast food') || text.includes('burger') || text.includes('diner') || text.includes('fries') || text.includes('drive')) return 'fast_food'
  if (text.includes('vegan') || text.includes('vegetarian') || text.includes('healthy') || text.includes('salad')) return 'vegetarian'
  if (text.includes('rooftop') || text.includes('sky bar') || text.includes('sky lounge')) return 'rooftop'
  if (text.includes('bar') || text.includes('pub') || text.includes('cocktail') || text.includes('brewery') || text.includes('tavern')) return 'bar'
  if (text.includes('dessert') || text.includes('ice cream') || text.includes('sweet') || text.includes('gelato')) return 'dessert'
  if (text.includes('street food') || text.includes('night market') || text.includes('stall') || text.includes('food truck')) return 'street_food'
  if (text.includes('mexican') || text.includes('taco') || text.includes('burrito')) return 'mexican'
  if (text.includes('thai') || text.includes('pad thai')) return 'thai'

  return 'general_dining'
}

export function getCuisineStyle(cuisine: string = '', placeName: string = ''): CuisineStyle {
  const key = detectCuisineKey(cuisine, placeName)
  return CUISINE_STYLES[key] || CUISINE_STYLES.general_dining
}

const FRONTEND_CUISINE_POOLS: Record<string, string[]> = {
  french: [
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&q=80',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  ],
  indian: [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&q=80',
  ],
  italian: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    'https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=800&q=80',
    'https://images.unsplash.com/photo-1621996346565-e3d5d6281270?w=800&q=80',
    'https://images.unsplash.com/photo-1533777857889-4be7c70b31f8?w=800&q=80',
  ],
  chinese: [
    'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80',
    'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&q=80',
  ],
  japanese: [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&q=80',
  ],
  cafe: [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  ],
  bakery: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
    'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=80',
  ],
  fine_dining: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
  ],
  seafood: [
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80',
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80',
    'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&q=80',
  ],
  fast_food: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
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
  ]
}

function hashStr(s: string): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getClientCuisineFallback(cuisine: string = '', placeName: string = '', id: string = ''): string {
  const key = detectCuisineKey(cuisine, placeName)
  const pool = FRONTEND_CUISINE_POOLS[key] || FRONTEND_CUISINE_POOLS.general_dining
  const idx = hashStr(`${id}_${placeName}_${cuisine}`) % pool.length
  return pool[idx]
}

export function getClientCategorySvg(cuisine: string = '', placeName: string = ''): string {
  const key = detectCuisineKey(cuisine, placeName)
  const style = CUISINE_STYLES[key] || CUISINE_STYLES.general_dining
  const title = placeName ? placeName.replace(/</g, '&lt;').replace(/>/g, '&gt;') : style.label

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A"/>
        <stop offset="100%" stop-color="#1E293B"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#bg)"/>
    <circle cx="400" cy="200" r="70" fill="#334155" fill-opacity="0.5"/>
    <path d="M380 180h40v40h-40z" fill="#94A3B8"/>
    <text x="400" y="320" font-family="system-ui, sans-serif" font-weight="700" font-size="24" fill="#F8FAFC" text-anchor="middle">${title}</text>
    <text x="400" y="355" font-family="system-ui, sans-serif" font-weight="600" font-size="14" fill="#94A3B8" text-anchor="middle">${style.label.toUpperCase()}</text>
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
