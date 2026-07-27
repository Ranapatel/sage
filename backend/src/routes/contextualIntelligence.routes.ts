// ✂️ PONYTAIL: Clean Express router encapsulating all 8 phases of Contextual Travel Intelligence with robust error boundaries.

import { Router, Request, Response } from 'express'
import { ContextualDataCollector } from '../services/contextualDataCollector.service'
import { ContextualDecisionEngine } from '../services/contextualDecisionEngine.service'
import { TravelAssistantService } from '../services/travelAssistant.service'
import { UserTravelContext } from '../types/contextualTravel.types'

const { generateItinerary } = require('../services/aiService')

const router = Router()

/**
 * Phase 1 & 2: User Context Collection & Integrated Data Collection
 */
router.post('/context', async (req: Request, res: Response) => {
  try {
    const userContext: UserTravelContext = req.body
    if (!userContext.destination) {
      return res.status(400).json({ error: 'Destination is required' })
    }

    const collectedData = await ContextualDataCollector.collect(userContext)
    return res.json({
      success: true,
      context: userContext,
      data: collectedData,
    })
  } catch (err: any) {
    console.error('[ContextualIntelligence] Error in /context:', err.message)
    return res.status(500).json({ error: err.message || 'Data collection failed' })
  }
})

/**
 * Phase 3 & 4: Context Analysis & AI Decision Engine
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { userContext, collectedData } = req.body
    if (!userContext || !userContext.destination) {
      return res.status(400).json({ error: 'userContext with destination is required' })
    }

    const data = collectedData || await ContextualDataCollector.collect(userContext)
    const analysis = ContextualDecisionEngine.analyzeContext(userContext, data)
    const decision = ContextualDecisionEngine.rankAndFilter(userContext, data)

    return res.json({
      success: true,
      analysis,
      decision,
    })
  } catch (err: any) {
    console.error('[ContextualIntelligence] Error in /analyze:', err.message)
    return res.status(500).json({ error: err.message || 'Context analysis failed' })
  }
})

/**
 * Phase 1 through 6: End-to-end Contextual Smart Itinerary Generation with Explanations
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const userContext: UserTravelContext = req.body
    if (!userContext.destination) {
      return res.status(400).json({ error: 'Destination is required' })
    }

    // 1 & 2. Collect Context & Fetch Data
    const data = await ContextualDataCollector.collect(userContext)

    // 3 & 4. Context Analysis & AI Decision Ranking
    const analysis = ContextualDecisionEngine.analyzeContext(userContext, data)
    const decision = ContextualDecisionEngine.rankAndFilter(userContext, data)

    // 5 & 6. Smart Itinerary Generation with Recommendation Explanations
    const result = await generateItinerary({
      destination: userContext.destination,
      from: userContext.origin,
      days: userContext.days || 3,
      budget: userContext.budget || 50000,
      currency: userContext.currency || 'INR',
      style: userContext.travelStyle || 'Balanced',
      preferences: userContext.interests || ['sightseeing'],
      members: userContext.members || 2,
      startDate: userContext.startDate,
      language: userContext.preferredLanguage || 'en',
    })

    return res.json({
      success: true,
      userContext,
      analysis,
      decisionSummary: {
        selectedHotel: decision.selectedHotel?.name,
        topActivitiesCount: decision.topActivities.length,
      },
      itinerary: result.data?.itinerary || [],
      explanations: result.data?.explanations || {
        whyHotel: 'Central stay selected to minimize travel time.',
        whyActivity: 'Matched to user interest profiles and weather suitability.',
        whyRestaurant: 'Authentic local dining within budget constraints.',
        whyRoute: 'Geographically optimized route.',
        whyTiming: 'Organized to avoid peak rush hours.',
      },
      budgetBreakdown: result.data?.budgetBreakdown,
      totalEstimatedCost: result.data?.totalEstimatedCost,
      tips: result.data?.tips || [],
    })
  } catch (err: any) {
    console.error('[ContextualIntelligence] Error in /generate:', err.message)
    return res.status(500).json({ error: err.message || 'Smart itinerary generation failed' })
  }
})

/**
 * Phase 7 & 8: Real-Time Assistance & Continuous Optimization
 */
router.post('/assistant', async (req: Request, res: Response) => {
  try {
    const { message, latitude, longitude, currentTime, weather, itinerary, preferences, completedPlaces, action } = req.body

    if (action === 'reoptimize' && Array.isArray(itinerary)) {
      const reoptimized = TravelAssistantService.reoptimizeItinerary(
        itinerary,
        completedPlaces || [],
        latitude && longitude ? { lat: latitude, lng: longitude } : undefined
      )
      return res.json(reoptimized)
    }

    const advice = await TravelAssistantService.getAssistantAdvice({
      message: message || 'What should I do next?',
      latitude: latitude || 13.7563,
      longitude: longitude || 100.5018,
      currentTime: currentTime || '14:00',
      weather: weather || { description: 'Clear' },
      itinerary: itinerary || [],
      preferences: preferences || { travelStyle: 'Balanced', interests: [] },
    })

    return res.json({
      success: true,
      advice,
    })
  } catch (err: any) {
    console.error('[ContextualIntelligence] Error in /assistant:', err.message)
    return res.status(500).json({ error: err.message || 'Real-time assistant call failed' })
  }
})

export default router
