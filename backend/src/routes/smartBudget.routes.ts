// ✂️ PONYTAIL: Clean Express router handling Smart Budget Intelligence endpoints across all 5 phases.

import { Router, Request, Response } from 'express'
import { SmartBudgetIntelligenceService } from '../services/smartBudgetIntelligence.service'
import { SmartBudgetInput, SpendingItem } from '../types/smartBudget.types'

const router = Router()

/**
 * Phase 1 & Phase 2 & Phase 3: Analyze Budget Feasibility & Low-Budget Alternatives
 */
router.post('/analyze', (req: Request, res: Response) => {
  try {
    const input: SmartBudgetInput = req.body
    if (!input.destination) {
      return res.status(400).json({ error: 'Destination is required' })
    }
    if (!input.budget || input.budget <= 0) {
      return res.status(400).json({ error: 'Valid budget is required' })
    }

    const result = SmartBudgetIntelligenceService.analyzeAndOptimize(input)
    return res.json({
      success: true,
      data: result,
    })
  } catch (err: any) {
    console.error('[SmartBudget] Error in /analyze:', err.message)
    return res.status(500).json({ error: err.message || 'Budget analysis failed' })
  }
})

/**
 * Phase 3 & Phase 4: Daily Allocation & Optimization Breakdown
 */
router.post('/optimize', (req: Request, res: Response) => {
  try {
    const { destination, durationDays = 2, budget = 5000, travelers = 1 } = req.body
    if (!destination || !budget) {
      return res.status(400).json({ error: 'Destination and budget are required' })
    }

    const allocation = SmartBudgetIntelligenceService.allocateDailyBudget(budget, durationDays, travelers)
    const analysis = SmartBudgetIntelligenceService.analyzeAndOptimize({ destination, durationDays, budget, travelers })

    return res.json({
      success: true,
      destination,
      durationDays,
      budget,
      travelers,
      status: analysis.status,
      feasibilitySummary: analysis.feasibilitySummary,
      costEstimates: analysis.estimates,
      allocation,
      alternatives: analysis.alternatives,
    })
  } catch (err: any) {
    console.error('[SmartBudget] Error in /optimize:', err.message)
    return res.status(500).json({ error: err.message || 'Budget optimization failed' })
  }
})

/**
 * Phase 5: Real-Time Budget Tracking & Spending Alert System
 */
router.post('/track', (req: Request, res: Response) => {
  try {
    const { totalBudget, spendingItems, currentDay = 1, totalDays = 2 } = req.body
    if (!totalBudget || totalBudget <= 0) {
      return res.status(400).json({ error: 'Valid totalBudget is required' })
    }

    const items: SpendingItem[] = Array.isArray(spendingItems) ? spendingItems : []
    const trackResult = SmartBudgetIntelligenceService.trackSpending(totalBudget, items, currentDay, totalDays)

    return res.json({
      success: true,
      data: trackResult,
    })
  } catch (err: any) {
    console.error('[SmartBudget] Error in /track:', err.message)
    return res.status(500).json({ error: err.message || 'Budget tracking failed' })
  }
})

export default router
