export type ImageCategory =
  | 'destinations'
  | 'hotels'
  | 'restaurants'
  | 'attractions'
  | 'cars'
  | 'hero'
  | 'activities'

/**
 * Known destination query mappings for optimal travel photography search results
 */
const DESTINATION_MAPPINGS: Record<string, string> = {
  paris: 'Paris skyline',
  tokyo: 'Tokyo city skyline',
  'new york': 'New York skyline',
  bali: 'Bali beach',
  'swiss alps': 'Swiss Alps landscape',
  dubai: 'Dubai skyline',
  goa: 'Goa beach',
  kerala: 'Kerala backwaters',
  hyderabad: 'Hyderabad city skyline',
  mumbai: 'Mumbai city skyline',
  delhi: 'Delhi landmark skyline',
  bengaluru: 'Bengaluru city skyline',
  bangalore: 'Bengaluru city skyline',
  chennai: 'Chennai beach skyline',
  jaipur: 'Jaipur palace heritage',
  udaipur: 'Udaipur lake palace',
  agra: 'Taj Mahal Agra',
  london: 'London skyline Big Ben',
  singapore: 'Marina Bay Sands Singapore skyline',
  rome: 'Rome Colosseum landmark',
  barcelona: 'Barcelona city skyline',
  sydney: 'Sydney Opera House harbour',
  maldives: 'Maldives island beach',
  santorini: 'Santorini island white houses',
  istanbul: 'Istanbul skyline mosque',
  bangkok: 'Bangkok temple skyline',
  phuket: 'Phuket beach Thailand',
}

/**
 * Filter out forbidden luxury car search terms and map to realistic rental fleet terms
 */
const FORBIDDEN_CAR_TERMS = [
  'bmw',
  'mercedes',
  'rolls royce',
  'ferrari',
  'lamborghini',
  'bugatti',
  'bentley',
  'porsche',
  'koenigsegg',
  'maserati',
]

const CAR_MODEL_MAPPINGS: Record<string, string> = {
  hatchback: 'Compact hatchback rental car',
  economy: 'Economy rental car',
  suv: 'Family SUV rental car',
  sedan: 'Sedan rental car',
  innova: 'Toyota Innova MPV cab',
  venue: 'Hyundai Venue compact SUV',
  swift: 'Maruti Suzuki Swift hatchback',
  tiago: 'Tata Tiago hatchback',
  cab: 'Indian cab taxi',
  taxi: 'Airport taxi rental car',
  compact: 'Compact rental car',
  airport: 'Airport terminal rental car pickup',
}

/** Categories where Google Places Photos are appropriate (real venues) */
export const GOOGLE_PLACES_CATEGORIES: ImageCategory[] = [
  'hotels',
  'restaurants',
  'attractions',
  'activities',
]

/** Categories where Unsplash is preferred primary (destination inspiration) */
export const UNSPLASH_PRIMARY_CATEGORIES: ImageCategory[] = ['destinations', 'hero']

/**
 * Category → provider priority chain (excluding hotelbeds special-case and final placeholder).
 * First successful provider with candidates wins; ranking still picks best among candidates.
 */
export const PROVIDER_PRIORITY: Record<ImageCategory, Array<'google' | 'unsplash' | 'pexels'>> = {
  hotels: ['google', 'unsplash', 'pexels'],
  restaurants: ['google', 'unsplash', 'pexels'],
  attractions: ['google', 'unsplash', 'pexels'],
  destinations: ['unsplash', 'pexels', 'google'],
  hero: ['unsplash', 'pexels'],
  activities: ['google', 'pexels', 'unsplash'],
  cars: ['pexels', 'unsplash'],
}

/**
 * Intelligently normalizes raw search terms into high-relevance contextual photography search queries.
 */
export function buildContextualSearchQuery(category: ImageCategory, rawQuery: string): string {
  if (!rawQuery || rawQuery.trim().length === 0) {
    return defaultQueryForCategory(category)
  }

  const queryLower = rawQuery.toLowerCase().trim()

  switch (category) {
    case 'destinations':
    case 'hero': {
      if (DESTINATION_MAPPINGS[queryLower]) {
        return DESTINATION_MAPPINGS[queryLower]
      }
      if (/\b(skyline|beach|landscape|mountains|backwaters|sunset|city|island|nature)\b/i.test(queryLower)) {
        return rawQuery.trim()
      }
      return `${rawQuery.trim()} city skyline`
    }

    case 'restaurants': {
      // Prefer place-name queries for Google Places; keep contextual for stock APIs
      if (/\b(restaurant|dining|cafe|café|bistro|food|sushi|interior|kitchen)\b/i.test(queryLower)) {
        return rawQuery.trim()
      }
      return `${rawQuery.trim()} restaurant`
    }

    case 'attractions': {
      if (
        /\b(tower|palace|museum|temple|monument|fort|bridge|park|statue|viewpoint|landmark)\b/i.test(
          queryLower
        )
      ) {
        return rawQuery.trim()
      }
      return `${rawQuery.trim()} tourist attraction landmark`
    }

    case 'hotels': {
      if (/\b(hotel|resort|residence|villa|suite|bedroom|pool|room)\b/i.test(queryLower)) {
        return rawQuery.trim()
      }
      return `${rawQuery.trim()} hotel`
    }

    case 'cars': {
      for (const forbidden of FORBIDDEN_CAR_TERMS) {
        if (queryLower.includes(forbidden)) {
          return 'Economy rental car fleet'
        }
      }

      for (const [key, mappedQuery] of Object.entries(CAR_MODEL_MAPPINGS)) {
        if (queryLower.includes(key)) {
          return mappedQuery
        }
      }

      if (/\b(car|cab|taxi|suv|sedan|hatchback|rental|vehicle)\b/i.test(queryLower)) {
        return rawQuery.trim()
      }
      return `${rawQuery.trim()} rental car vehicle`
    }

    case 'activities': {
      if (
        /\b(tour|adventure|safari|cruise|trek|diving|snorkeling|skiing|hiking|experience)\b/i.test(
          queryLower
        )
      ) {
        return rawQuery.trim()
      }
      return `${rawQuery.trim()} outdoor activity tour`
    }

    default:
      return rawQuery.trim()
  }
}

/**
 * Build a stock-photo friendly query (Unsplash/Pexels) that is contextual,
 * not a bare place name — especially for destinations and activities.
 */
export function buildStockPhotoQuery(category: ImageCategory, rawQuery: string): string {
  const base = buildContextualSearchQuery(category, rawQuery)

  switch (category) {
    case 'restaurants':
      // Unsplash should not be used for hotel/restaurant-specific shots primarily,
      // but as fallback use generic interior/cuisine context.
      if (/\b(interior|dining|cuisine|food)\b/i.test(base)) return base
      return `${base} interior dining`
    case 'hotels':
      if (/\b(resort|room|lobby|pool)\b/i.test(base)) return base
      return `${base} luxury hotel exterior`
    case 'activities':
      return base
    case 'cars':
      return base
    case 'attractions':
      return base
    default:
      return base
  }
}

function defaultQueryForCategory(category: ImageCategory): string {
  switch (category) {
    case 'hotels':
      return 'luxury hotel resort'
    case 'restaurants':
      return 'restaurant interior fine dining'
    case 'attractions':
      return 'famous landmark travel attraction'
    case 'cars':
      return 'compact rental car'
    case 'activities':
      return 'outdoor adventure travel activity'
    case 'hero':
      return 'travel destination skyline'
    case 'destinations':
    default:
      return 'travel landmark scenery'
  }
}

/**
 * Map Google Places includedType for Text Search (New) based on category.
 */
export function googleIncludedTypeForCategory(category: ImageCategory): string | undefined {
  switch (category) {
    case 'hotels':
      return 'lodging'
    case 'restaurants':
      return 'restaurant'
    case 'attractions':
      return 'tourist_attraction'
    case 'activities':
      return 'tourist_attraction'
    default:
      return undefined
  }
}
