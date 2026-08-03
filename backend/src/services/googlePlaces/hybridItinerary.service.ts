/**
 * Hybrid Itinerary Engine — TripSage
 *
 * Merges Google Places (New) real-world metadata with LLaMA 3.3 (Groq) reasoning
 * to generate optimized, personalized, and factually accurate travel itineraries.
 */

import axios from 'axios'
import { googleRequest, buildPhotoUrl } from './googleClient'
import { getPlaceDetails } from './placeDetails'
import { ImageService } from '../imageService'
import { RankingMatrixService } from './rankingMatrix.service'
import { SolarTimeService } from './solarTimeService'
import {
  TripSagePlace,
  HybridItinerary,
  HybridItineraryParams,
  PlaceCategory,
  CATEGORY_TO_GOOGLE_TYPES,
  PlaceReviewSummary,
  TripSagePlaceDetailsExtended,
} from './types'

const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const LLM_MODEL = 'openai/gpt-oss-120b'

export class HybridItineraryService {
  /**
   * Main entry point to generate a premium optimized hybrid itinerary
   */
  static async generate(params: HybridItineraryParams): Promise<HybridItinerary> {
    const { destination, from, days, budget, currency = 'INR', style, members, preferences = [], startDate } = params

    // ── 0. Redis Cache Check ────────────────────────────────────────────────
    const cacheKey = generateCacheKey('hybrid_itinerary', {
      destination,
      from,
      days,
      budget,
      style,
      members,
      startDate,
      preferences: preferences.join(','),
    })

    try {
      const cached = await cacheGet(cacheKey)
      if (cached) {
        console.log(`[HybridItinerary] ✅ Cache HIT for "${destination}"`)
        return cached as HybridItinerary
      }
    } catch { /* proceed without cache */ }

    console.log(`[HybridItinerary] 🚀 Generating hybrid itinerary for "${destination}" (${days} days)...`)

    // ── 1. Phase 1: Destination Intelligence (Candidates Discovery) ─────────
    let candidates = await this.discoverCandidates(destination, preferences)
    console.log(`[HybridItinerary] Discovered ${candidates.length} candidate places in "${destination}"`)

    if (candidates.length === 0) {
      const destinationCity = destination.split(',')[0].trim()
      console.warn(`[HybridItinerary] 0 candidates discovered from Google Places for "${destination}" — generating fallback candidates from destination intelligence`)
      const { generateMockPlaces } = require('../aiService')
      const mockPlaces = generateMockPlaces(destination)
      candidates = mockPlaces.map((p: any, i: number) => ({
        id: `mock_cand_${i}_${Date.now()}`,
        name: p.name,
        address: `${p.name}, ${destinationCity}`,
        latitude: 15.2993 + (i * 0.01),
        longitude: 74.1240 + (i * 0.01),
        rating: 4.7,
        userRatingsTotal: 100,
        priceLevel: p.cost ? (p.cost > 500 ? 2 : 1) : 0,
        category: (p.category || 'attractions').toLowerCase(),
        types: ['tourist_attraction'],
        photoUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80&auto=format&fit=crop',
        googleMapsUrl: '',
        isOpenNow: true,
        source: 'google_places' as const,
      }))
    }

    // ── 2. Phase 2: AI Place Ranking ────────────────────────────────────────
    const rankedCandidates = await this.rankCandidates(candidates, params)
    console.log(`[HybridItinerary] AI ranked top candidates. Selecting best matches...`)

    // ── 3. Phase 3 & 4: AI Itinerary Generation & Route Optimization ────────
    const itineraryData = await this.generateOptimizedItinerary(rankedCandidates, params)
    console.log(`[HybridItinerary] Day-by-day itinerary structured and optimized.`)

    // ── 4. Phase 5 & 6: Place Enrichment & AI Review Intelligence ───────────
    const enrichedItinerary = await this.enrichItineraryPlaces(itineraryData)
    console.log(`[HybridItinerary] Places enriched and review summaries generated.`)

    const finalItinerary = {
      ...enrichedItinerary,
      destination,
      days,
      style,
    }

    // ── 5. Cache result (24 hours) ──────────────────────────────────────────
    try {
      await cacheSet(cacheKey, finalItinerary, 86400)
    } catch { /* silent */ }

    return finalItinerary as HybridItinerary
  }

  /**
   * Discovers 30-50 candidate places in the destination based on user preferences/interests
   */
  private static async discoverCandidates(destination: string, preferences: string[]): Promise<TripSagePlace[]> {
    const destinationCity = destination.split(',')[0].trim()

    // Always query these core categories for rich candidate coverage
    const categoriesToQuery: PlaceCategory[] = ['attractions', 'landmarks', 'parks', 'museums', 'restaurants', 'cafes']

    const prefLower = preferences.map(p => p.toLowerCase())
    if (prefLower.some(p => p.includes('nature') || p.includes('outdoor') || p.includes('scenic') || p.includes('view'))) {
      categoriesToQuery.push('beaches')
    }
    if (prefLower.some(p => p.includes('history') || p.includes('culture') || p.includes('museum') || p.includes('art'))) {
      categoriesToQuery.push('temples')
    }
    if (prefLower.some(p => p.includes('shop') || p.includes('market') || p.includes('mall'))) {
      categoriesToQuery.push('shopping')
    }

    // Deduplicate categories, query in parallel
    const uniqueCategories = Array.from(new Set(categoriesToQuery))

    // Execute queries in parallel
    const promises = uniqueCategories.map(async (category) => {
      const includedTypes = CATEGORY_TO_GOOGLE_TYPES[category] || CATEGORY_TO_GOOGLE_TYPES.general
      const textQuery = category === 'beaches'
        ? `beaches in ${destinationCity}`
        : `${category} in ${destinationCity}`

      try {
        const data = await googleRequest<any>({
          path: '/places:searchText',
          body: {
            textQuery,
            includedType: category !== 'beaches' && includedTypes.length > 0 ? includedTypes[0] : undefined,
            maxResultCount: 15,
            languageCode: 'en',
          },
          fieldMask: [
            'places.id',
            'places.displayName',
            'places.formattedAddress',
            'places.location',
            'places.rating',
            'places.userRatingCount',
            'places.priceLevel',
            'places.types',
            'places.photos',
            'places.googleMapsUri',
            'places.currentOpeningHours',
          ].join(','),
          cachePrefix: 'gp_search',
          cacheTtl: 86400, // 24 hours
        })

        const places = data?.places || []
        return places.map((p: any) => ({
          id: p.id || '',
          name: p.displayName?.text || '',
          address: p.formattedAddress || '',
          latitude: p.location?.latitude ?? 0,
          longitude: p.location?.longitude ?? 0,
          rating: p.rating ?? null,
          userRatingsTotal: p.userRatingCount ?? null,
          priceLevel: this.parsePriceLevel(p.priceLevel),
          category,
          types: p.types || [],
          photoUrl: p.photos?.[0]?.name ? buildPhotoUrl(p.photos[0].name) : null,
          googleMapsUrl: p.googleMapsUri || '',
          isOpenNow: p.currentOpeningHours?.openNow ?? null,
          source: 'google_places' as const,
        }))
      } catch (err: any) {
        console.warn(`[HybridItinerary/Discovery] Error fetching category "${category}":`, err.message)
        return []
      }
    })

    // Also run a custom "hidden gems", "viewpoints" or generic "things to do" query to discover offbeat places
    const extraQueries = ['viewpoints', 'hidden gems', 'things to do']
    const extraPromises = extraQueries.map(async (extra) => {
      try {
        const data = await googleRequest<any>({
          path: '/places:searchText',
          body: {
            textQuery: `${extra} in ${destinationCity}`,
            maxResultCount: extra === 'things to do' ? 15 : 8,
            languageCode: 'en',
          },
          fieldMask: [
            'places.id',
            'places.displayName',
            'places.formattedAddress',
            'places.location',
            'places.rating',
            'places.userRatingCount',
            'places.priceLevel',
            'places.types',
            'places.photos',
            'places.googleMapsUri',
            'places.currentOpeningHours',
          ].join(','),
          cachePrefix: 'gp_search',
          cacheTtl: 86400,
        })
        const places = data?.places || []
        return places.map((p: any) => ({
          id: p.id || '',
          name: p.displayName?.text || '',
          address: p.formattedAddress || '',
          latitude: p.location?.latitude ?? 0,
          longitude: p.location?.longitude ?? 0,
          rating: p.rating ?? null,
          userRatingsTotal: p.userRatingCount ?? null,
          priceLevel: this.parsePriceLevel(p.priceLevel),
          category: 'general' as PlaceCategory,
          types: p.types || [],
          photoUrl: p.photos?.[0]?.name ? buildPhotoUrl(p.photos[0].name) : null,
          googleMapsUrl: p.googleMapsUri || '',
          isOpenNow: p.currentOpeningHours?.openNow ?? null,
          source: 'google_places' as const,
        }))
      } catch (err: any) {
        console.warn(`[HybridItinerary/Discovery] Error fetching query "${extra}":`, err.message)
        return []
      }
    })

    const results = await Promise.all([...promises, ...extraPromises])
    const flat = results.flat()

    // Deduplicate by Place ID
    const seen = new Set<string>()
    return flat.filter(p => {
      if (!p.id || seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })
  }

  /**
   * Scores and ranks candidates using Groq LLaMA model based on user travel preferences
   */
  private static async rankCandidates(candidates: TripSagePlace[], params: HybridItineraryParams): Promise<any[]> {
    const { style, preferences = [], budget, days, members, startDate } = params
    const apiKey = process.env.GROQ_API_KEY

    // Calculate solar times for target destination
    const sampleLat = candidates[0]?.latitude || 15.2993
    const sampleLng = candidates[0]?.longitude || 74.1240
    const solarTimes = SolarTimeService.calculateSolarTimes(sampleLat, sampleLng, startDate)

    // Pre-rank candidates using multi-factor scoring matrix
    const scoredCandidates = RankingMatrixService.rankCandidates(candidates, params, solarTimes)
    const sortedCandidatePlaces = scoredCandidates.map(sc => sc.place)

    if (!apiKey) {
      return sortedCandidatePlaces
    }

    // Limit candidate details sent to LLM to top 35 to prevent 413 Payload Too Large
    const candidateSubset = sortedCandidatePlaces.slice(0, 35)
    const candidateListStr = candidateSubset.map((c, idx) => `
Index: ${idx}
ID: ${c.id}
Name: ${c.name}
Rating: ${c.rating} (${c.userRatingsTotal} reviews)
Category: ${c.category}
Types: ${c.types.slice(0, 3).join(', ')}
Coords: [${c.latitude}, ${c.longitude}]
Price Level: ${c.priceLevel !== null ? c.priceLevel : 'unspecified'}
`).join('\n')

    const systemPrompt = `You are a Travel Ranker for TripSage.
Your task: Score each candidate place from 0 to 100 based on how well it fits the user profile.
Consider:
- Travel style: "${style}"
- Preferences: "${preferences.join(', ')}"
- Budget: ${budget} INR for ${days} days (${members} people)
- Local uniqueness: prioritize high ratings, hidden gems, viewpoints
- Minimize travel distances (score places clustered together higher)

You must return ONLY a valid JSON object of this format:
{
  "ranked": [
    {
      "index": 0,
      "placeId": "ChIJ...",
      "score": 95,
      "reason": "Short 1-sentence reason explaining why it fits"
    }
  ]
}`

    const userPrompt = `Score these candidate places for the travel profile:
Style: ${style}
Preferences: ${preferences.join(', ')}
Total Budget: ${budget} INR

Candidates:
${candidateListStr}`

    try {
      const res = await axios.post(GROQ_API_URL, {
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      })

      const content = res.data.choices[0]?.message?.content
      const parsed = JSON.parse(content || '{}')
      const scores = parsed.ranked || []

      // Map scores back to candidate place objects
      const scoredCandidates = scores.map((s: any) => {
        const place = candidates.find(c => c.id === s.placeId) || candidates[s.index]
        if (!place) return null
        return {
          ...place,
          score: s.score || 50,
          reason: s.reason || '',
        }
      }).filter(Boolean)

      // Sort by score descending
      return scoredCandidates.sort((a: any, b: any) => b.score - a.score)
    } catch (err: any) {
      console.warn(`[HybridItinerary/Ranking] LLM ranking failed: ${err.message}. Using default rating sorting.`)
      return candidates.map(c => ({ ...c, score: 80, reason: 'Highly rated local spot.' }))
    }
  }

  /**
   * Arranges the top candidates into a sequential, geographical, optimized itinerary
   */
  private static async generateOptimizedItinerary(rankedCandidates: any[], params: HybridItineraryParams): Promise<any> {
    const { destination, days, budget, currency = 'INR', style, members, preferences = [], startDate } = params
    const apiKey = process.env.GROQ_API_KEY
    const destinationCity = destination.split(',')[0].trim()

    // Select candidate pool proportional to the trip length (4 slots per day)
    const topCandidatesCount = Math.max(25, days * 4 + 4)
    const topCandidates = rankedCandidates.slice(0, topCandidatesCount)

    const candidatesListStr = topCandidates.map((c, i) => `
- Name: ${c.name}
  Place ID: ${c.id}
  Category: ${c.category}
  Coords: [${c.latitude}, ${c.longitude}]
  Avg Rating: ${c.rating}
  Est Price Level: ${c.priceLevel !== null ? c.priceLevel : 'unspecified'}
  Reason: ${c.reason}
`).join('\n')

    const systemPrompt = `You are TripSage, an expert local travel planner.
Your job: Generate a premium, highly optimized ${days}-day itinerary for ${destinationCity} using ONLY the provided candidates pool.

CORE RULES:
1. GEOGRAPHICAL CLUSTERING: Group nearby coordinates on the same day to minimize travel time.
2. SEQUENTIAL SLOTS: Allocate exactly 4 slots per day (morning, afternoon, evening, night).
   - "morning" (e.g. 09:00): Outdoor/temple/walking tour
   - "afternoon" (e.g. 13:00): Indoor/museum/dining/shopping
   - "evening" (e.g. 17:00): Golden hour viewpoint/sunset spot
   - "night" (e.g. 20:00): Dinner/markets/cultural shows
3. STRICT DUPLICATE REMOVAL: Every single slot in the entire itinerary MUST be a unique place. DO NOT repeat the same Place ID or the same name on different days or different slots. Do not recommend the same attraction (e.g. Vashisht Village) more than once in the entire trip. If the candidate pool is too small to fill all slots, use your own internal knowledge to suggest unique local attractions, spots, or restaurants in ${destinationCity} and set their placeId to null.
4. MEAL BREAKS: Suggest actual dining/cafes from candidates (or custom names if candidates have few restaurants) in the "afternoon" or "night" slots.
5. BUDGET LIMITS: Total estimated activities budget must fit the user's budget.
6. WEATHER/RAIN ALTERNATIVES: For each day, list 2 indoor alternative activities.

You must return ONLY valid JSON matching this schema:
{
  "itinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "slots": {
        "morning": {
          "placeId": "ChIJ...",
          "name": "India Gate — New Delhi",
          "time": "09:00",
          "category": "attractions",
          "activity": "Explore the war memorial",
          "visitDurationMinutes": 60,
          "estimatedCost": 0,
          "tip": "Visit early to avoid heat"
        },
        "afternoon": { ... },
        "evening": { ... },
        "night": { ... }
      },
      "travelTimeMinutes": 35,
      "walkingDistanceMeters": 1500,
      "transportation": "Auto-rickshaw or walking recommended",
      "rainyDayAlternatives": ["National Museum", "Select Citywalk Mall"]
    }
  ],
  "totalEstimatedCost": 1500,
  "budgetBreakdown": {
    "flightsEstimate": 0,
    "hotelsEstimate": 6000,
    "foodEstimate": 4000,
    "activitiesEstimate": 3000,
    "remainingBudget": 7000
  },
  "budgetWarning": null,
  "tips": ["Tip 1", "Tip 2"]
}`

    const userPrompt = `Destination: ${destinationCity}
Duration: ${days} days
Style: ${style}
Members: ${members}
Budget: ${budget} ${currency}
Preferences: ${preferences.join(', ')}
Starting date: ${startDate || 'unspecified'}

Candidate Places:
${candidatesListStr}`

    try {
      const res = await axios.post(GROQ_API_URL, {
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 3000,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      })

      const content = res.data.choices[0]?.message?.content
      const parsed = JSON.parse(content || '{}')
      if (parsed.itinerary && Array.isArray(parsed.itinerary) && parsed.itinerary.length > 0) {
        return parsed
      }
      return this.buildFallbackHybridItinerary(rankedCandidates, params)
    } catch (err: any) {
      console.warn('[HybridItinerary/Generation] LLM generation failed, constructing fallback itinerary from candidates:', err.message)
      return this.buildFallbackHybridItinerary(rankedCandidates, params)
    }
  }

  /**
   * Constructs a high-quality fallback day-by-day itinerary directly from candidate places if LLM fails or is rate limited
   */
  private static buildFallbackHybridItinerary(
    candidates: TripSagePlace[],
    params: HybridItineraryParams
  ): any {
    const { days = 3, budget = 50000, currency = 'INR', destination } = params
    const destCity = destination.split(',')[0].trim()

    const itinerary: any[] = []
    const candList = candidates.length > 0 ? candidates : [
      { id: 'fb_1', name: `Central Landmark — ${destCity}`, category: 'attractions', rating: 4.8, userRatingsTotal: 250, priceLevel: 1, latitude: 0, longitude: 0, address: destCity, types: ['landmark'], photoUrl: null, googleMapsUrl: '', isOpenNow: true, source: 'google_places' }
    ]

    let candIdx = 0
    for (let d = 1; d <= days; d++) {
      const morningCand = candList[candIdx % candList.length]
      candIdx++
      const afternoonCand = candList[candIdx % candList.length]
      candIdx++
      const eveningCand = candList[candIdx % candList.length]
      candIdx++

      itinerary.push({
        day: d,
        date: new Date(Date.now() + (d - 1) * 86400000).toISOString().split('T')[0],
        slots: {
          morning: {
            placeId: morningCand.id,
            name: morningCand.name,
            time: '09:30',
            category: morningCand.category || 'attractions',
            activity: `Explore ${morningCand.name}`,
            visitDurationMinutes: 90,
            estimatedCost: 100,
            tip: 'Visit in the morning for best experience'
          },
          afternoon: {
            placeId: afternoonCand.id,
            name: afternoonCand.name,
            time: '13:30',
            category: afternoonCand.category || 'dining',
            activity: `Lunch and sightseeing at ${afternoonCand.name}`,
            visitDurationMinutes: 90,
            estimatedCost: 250,
            tip: 'Try local specialties'
          },
          evening: {
            placeId: eveningCand.id,
            name: eveningCand.name,
            time: '17:30',
            category: eveningCand.category || 'attractions',
            activity: `Sunset stroll and exploration around ${eveningCand.name}`,
            visitDurationMinutes: 120,
            estimatedCost: 150,
            tip: 'Great spot for evening photography'
          }
        },
        travelTimeMinutes: 30,
        walkingDistanceMeters: 1200,
        transportation: 'Local taxi or walking recommended',
        rainyDayAlternatives: [`${destCity} Museum`, `${destCity} Cultural Center`]
      })
    }

    return {
      itinerary,
      totalEstimatedCost: Math.min(budget, 500 * days),
      budgetBreakdown: {
        flightsEstimate: 0,
        hotelsEstimate: Math.floor(budget * 0.4),
        foodEstimate: Math.floor(budget * 0.3),
        activitiesEstimate: Math.floor(budget * 0.2),
        remainingBudget: Math.floor(budget * 0.1)
      },
      tips: [
        `Plan your morning visits early to avoid crowds in ${destCity}.`,
        `Carry water and comfortable walking shoes.`,
        `Check local opening hours in advance.`
      ]
    }
  }

  /**
   * Fetches full metadata for selected itinerary places and generates AI review summaries in a single batch
   */
  private static async enrichItineraryPlaces(itineraryData: any): Promise<HybridItinerary> {
    const days: any[] = itineraryData.itinerary || []
    
    // 1. Gather all unique Place IDs in the itinerary slots
    const placeIds = new Set<string>()
    days.forEach(d => {
      const slots = d.slots || {}
      Object.keys(slots).forEach(key => {
        const slot = slots[key]
        if (slot && slot.placeId) {
          placeIds.add(slot.placeId)
        }
      })
    })

    const uniqueIds = Array.from(placeIds)
    if (uniqueIds.length === 0) return itineraryData

    console.log(`[HybridItinerary/Enrichment] Fetching details for ${uniqueIds.length} unique stops...`)

    // 2. Fetch Google Place Details in parallel
    const detailsPromises = uniqueIds.map(async (id) => {
      try {
        return await getPlaceDetails(id)
      } catch (err: any) {
        console.warn(`[HybridItinerary/Enrichment] Failed to fetch details for Place ID "${id}":`, err.message)
        return null
      }
    })

    const detailsResults = await Promise.all(detailsPromises)
    const detailsMap = new Map<string, any>()
    detailsResults.forEach(d => {
      if (d && d.id) {
        detailsMap.set(d.id, d)
      }
    })

    // 3. Compile reviews for a single batch AI call to summarize reviews
    const apiKey = process.env.GROQ_API_KEY
    let reviewsSummaryMap = new Map<string, PlaceReviewSummary>()

    if (apiKey) {
      const placesForSummary = uniqueIds.map(id => {
        const detailsObj = detailsMap.get(id)
        if (!detailsObj) return null
        return {
          id,
          name: detailsObj.name,
          reviews: (detailsObj.reviews || []).map((r: any) => `(${r.rating} stars) ${r.text.substring(0, 150)}`).slice(0, 3)
        }
      }).filter(Boolean)

      if (placesForSummary.length > 0) {
        const summarySystemPrompt = `You are a Travel Review Intelligence Analyzer.
Given a list of places and some user reviews for each, generate a structured compilation of review summaries.
Keep it strictly under 100 words per place, highly actionable.

Output ONLY a valid JSON object matching this schema:
{
  "summaries": {
    "PLACE_ID_STRING": {
      "loved": ["Feature 1 loved", "Feature 2 loved"],
      "complaints": ["Complaint 1", "Complaint 2"],
      "photographyTips": ["Tip 1", "Tip 2"],
      "accessibilityNotes": "Wheelchair access info or walking conditions",
      "bestHours": "e.g. 08:00 - 10:00 or Sunset",
      "whoShouldVisit": "Description of target visitor",
      "whoShouldSkip": "Description of who might not like it",
      "hiddenTips": ["Lesser known tip 1"]
    }
  }
}`

        const summaryUserPrompt = `Summarize the reviews for these places:
${JSON.stringify(placesForSummary, null, 2)}`

        // Attempt LLM call with a 1-retry fallback on 429
        const makeLlmCall = async (attempt = 1): Promise<any> => {
          try {
            return await axios.post(GROQ_API_URL, {
              model: LLM_MODEL,
              messages: [
                { role: 'system', content: summarySystemPrompt },
                { role: 'user', content: summaryUserPrompt },
              ],
              max_tokens: 2000,
              temperature: 0.2,
              response_format: { type: 'json_object' }
            }, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 20000,
            })
          } catch (err: any) {
            if (err.response?.status === 429 && attempt === 1) {
              console.warn('[HybridItinerary/Enrichment] Rate limited (429) on review summary. Retrying in 1.5s...')
              await new Promise(resolve => setTimeout(resolve, 1500))
              return makeLlmCall(2)
            }
            throw err
          }
        }

        try {
          const summaryRes = await makeLlmCall()
          const summaryContent = summaryRes.data.choices[0]?.message?.content
          const parsedSummaries = JSON.parse(summaryContent || '{}').summaries || {}
          Object.keys(parsedSummaries).forEach(key => {
            reviewsSummaryMap.set(key, parsedSummaries[key])
          })
        } catch (err: any) {
          console.warn('[HybridItinerary/Enrichment] Failed to generate AI review summaries:', err.message)
        }
      }
    }

    const assignedUrls = new Set<string>()
    const destinationCity = itineraryData.destination || ''

    // 4. Enrich every slot in the itinerary days list sequentially to preserve duplicate prevention
    const enrichedDays: any[] = []
    for (const d of days) {
      const slots = d.slots || {}
      const enrichedSlots: any = {}

      for (const key of Object.keys(slots)) {
        const slot = slots[key]
        if (!slot) {
          enrichedSlots[key] = null
          continue
        }

        let rating: number | null = null
        let reviewsCount: number | null = null
        let googleMapsUrl: string = ''
        let phone: string | null = null
        let website: string | null = null
        let openingHours: string[] | null = null
        let coordinates: [number, number] | null = null
        let reviewSummary: PlaceReviewSummary | null = null

        let selectedPhotoUrl: string | null = null
        let isAiIllustration = false

        if (slot.placeId && detailsMap.has(slot.placeId)) {
          const detail = detailsMap.get(slot.placeId)
          rating = detail.rating
          reviewsCount = detail.userRatingsTotal
          googleMapsUrl = detail.googleMapsUrl
          phone = detail.phone
          website = detail.website
          openingHours = detail.openingHours
          coordinates = [detail.latitude, detail.longitude]
          reviewSummary = reviewsSummaryMap.get(slot.placeId) || null

          // Find first non-duplicate official photo
          const detailPhotos = detail.photos || []
          for (const p of detailPhotos) {
            if (p.url && !assignedUrls.has(p.url)) {
              selectedPhotoUrl = p.url
              break
            }
          }
        }

        // If no photo selected yet, resolve via centralized ImageService
        if (!selectedPhotoUrl) {
          try {
            const resolved = await ImageService.resolvePlaceImages({
              placeId: slot.placeId,
              placeName: slot.name,
              city: destinationCity,
              category: slot.category,
              ignoreUrls: assignedUrls
            })
            selectedPhotoUrl = resolved.imageUrl
            isAiIllustration = !!resolved.isAiIllustration
          } catch (err: any) {
            console.warn(`[HybridItinerary/Enrichment] ImageService failed for "${slot.name}":`, err.message)
          }
        }

        if (selectedPhotoUrl) {
          assignedUrls.add(selectedPhotoUrl)
        }

        enrichedSlots[key] = {
          ...slot,
          rating,
          reviewsCount,
          photoUrl: selectedPhotoUrl,
          image: selectedPhotoUrl, // Keep both photoUrl and image for compatibility
          isAiIllustration,
          googleMapsUrl,
          phone,
          website,
          openingHours,
          coordinates,
          reviewSummary,
        }
      }

      const placesList = [
        enrichedSlots.morning,
        enrichedSlots.afternoon,
        enrichedSlots.evening,
        enrichedSlots.night
      ].filter(Boolean)

      enrichedDays.push({
        ...d,
        slots: enrichedSlots,
        places: placesList,
      })
    }

    return {
      ...itineraryData,
      itinerary: enrichedDays,
    }
  }

  /**
   * Resolves price level string/number
   */
  private static parsePriceLevel(level: string | undefined): number | null {
    if (!level) return null
    const map: Record<string, number> = {
      PRICE_LEVEL_FREE: 0,
      PRICE_LEVEL_INEXPENSIVE: 1,
      PRICE_LEVEL_MODERATE: 2,
      PRICE_LEVEL_EXPENSIVE: 3,
      PRICE_LEVEL_VERY_EXPENSIVE: 4,
    }
    return map[level] ?? null
  }
}

