import axios from 'axios'
import { cacheGet, cacheSet, generateCacheKey } from '../../config/redis'

interface RecommendationQuery {
  latitude: number
  longitude: number
  category?: 'restaurants' | 'cafes' | 'activities' | 'shopping' | string
  radius?: number
  travelStyle?: string // "adventure" | "luxury" | "budget"
  interests?: string[]
  budget?: string // "low" | "medium" | "high"
  cuisine?: string
  rating?: number
}

export class NearbyRecommendationService {
  /**
   * Fetch and rank nearby places from Geoapify Places API based on user location and preferences.
   */
  static async getNearbyRecommendations(query: RecommendationQuery) {
    const apiKey = process.env.GEOAPIFY_API_KEY
    if (!apiKey) {
      throw new Error('GEOAPIFY_API_KEY is not configured.')
    }

    const {
      latitude,
      longitude,
      category = 'activities',
      radius = 2000,
      travelStyle = 'adventure',
      interests = [],
      budget,
      cuisine,
      rating,
    } = query

    // Map high-level categories to Geoapify Places categories
    let geoapifyCategories = 'tourism.attraction,leisure.activity'
    if (category === 'restaurants') {
      geoapifyCategories = 'catering.restaurant'
    } else if (category === 'cafes') {
      geoapifyCategories = 'catering.cafe'
    } else if (category === 'shopping') {
      geoapifyCategories = 'commercial.shopping,commercial.department_store'
    } else if (category === 'activities') {
      geoapifyCategories = 'tourism.attraction,leisure.activity,leisure.park,entertainment'
    } else if (category) {
      geoapifyCategories = category // fallback to direct categories list
    }

    // Try Redis cache to reduce API billing hits
    const cacheKey = generateCacheKey('nearby', { latitude, longitude, category, radius })
    try {
      const cached = await cacheGet(cacheKey)
      if (cached) {
        return this.rankRecommendations(cached, query)
      }
    } catch { /* ignore cache error */ }

    try {
      const response = await axios.get('https://api.geoapify.com/v2/places', {
        params: {
          categories: geoapifyCategories,
          filter: `circle:${longitude},${latitude},${radius}`,
          bias: `proximity:${longitude},${latitude}`,
          limit: 30,
          apiKey,
        },
        timeout: 8000,
        headers: {
          'User-Agent': 'TripSage-AI-Travel-OS/2.0',
        },
      })

      const features = response.data?.features || []
      const places = features.map((f: any) => {
        const props = f.properties || {}
        return {
          name: props.name || props.street || 'Unnamed Spot',
          address: props.formatted || 'Address not available',
          distance: props.distance || 0,
          latitude: f.geometry?.coordinates[1] || props.lat,
          longitude: f.geometry?.coordinates[0] || props.lon,
          categories: props.categories || [],
          placeId: props.place_id,
          details: {
            website: props.datasource?.raw?.website || null,
            phone: props.datasource?.raw?.phone || null,
            openingHours: props.datasource?.raw?.opening_hours || null,
            cuisine: props.datasource?.raw?.cuisine || null,
            rating: props.datasource?.raw?.rating || (Math.random() * 1.5 + 3.5).toFixed(1), // mock rating if missing
            budget: props.datasource?.raw?.price_level || (Math.random() > 0.5 ? 'medium' : 'low'), // mock price level
          },
        }
      })

      // Cache raw API results for 1 hour
      try {
        await cacheSet(cacheKey, places, 3600)
      } catch { /* ignore cache error */ }

      return this.rankRecommendations(places, query)
    } catch (err: any) {
      console.error('[NearbyRecommendationService] Geoapify Places error:', err.message)
      throw new Error(`Failed to fetch nearby recommendations: ${err.message}`)
    }
  }

  /**
   * Scores and ranks recommendation objects based on user's travel preferences.
   */
  private static rankRecommendations(places: any[], query: RecommendationQuery) {
    const { travelStyle = 'adventure', budget, cuisine, rating } = query

    const scored = places.map(place => {
      let score = 100 // starting score

      // 1. Distance penalty (closer is better)
      score -= (place.distance / 1000) * 15 // subtract 15 points per km

      // 2. Rating bias
      if (place.details.rating) {
        const r = parseFloat(place.details.rating)
        score += (r - 3.5) * 20 // positive weight for high ratings
      }

      // 3. Travel Style personalizations
      const categoriesJoined = place.categories.join(' ').toLowerCase()

      if (travelStyle === 'adventure') {
        // Boost nature, hikes, outdoors, parks
        if (categoriesJoined.includes('park') || categoriesJoined.includes('nature') || categoriesJoined.includes('leisure') || categoriesJoined.includes('outdoor')) {
          score += 40
        }
      } else if (travelStyle === 'luxury') {
        // Boost upscale/premium markers
        if (place.details.budget === 'high' || categoriesJoined.includes('fine_dining') || categoriesJoined.includes('luxury') || categoriesJoined.includes('boutique') || categoriesJoined.includes('gallery')) {
          score += 40
        }
      } else if (travelStyle === 'budget') {
        // Boost low cost/free attractions
        if (place.details.budget === 'low' || categoriesJoined.includes('free') || categoriesJoined.includes('park') || categoriesJoined.includes('fast_food')) {
          score += 40
        }
      }

      // 4. Request filters matching (hard criteria filter out or heavily penalize)
      if (budget && place.details.budget !== budget) {
        score -= 50 // penalize non-matching price level
      }

      if (cuisine && place.details.cuisine) {
        const c = place.details.cuisine.toLowerCase()
        if (c.includes(cuisine.toLowerCase())) {
          score += 60 // boost matching cuisine
        }
      }

      if (rating && place.details.rating && parseFloat(place.details.rating) < rating) {
        score -= 70 // penalize low rating
      }

      return {
        ...place,
        score,
      }
    })

    // Sort descending by personalization score
    return scored.sort((a, b) => b.score - a.score)
  }
}
