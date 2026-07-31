/**
 * Multi-Factor Candidate Ranking Matrix Service — TripSage AI Engine
 *
 * Implements weighted multi-factor scoring across:
 * - Interest Alignment
 * - Rating & Review Quality
 * - Solar & Time Suitability
 * - Budget Compatibility
 * - Accessibility & Demographic Fit
 */

import { TripSagePlace, HybridItineraryParams } from './types'
import { SolarTimeService, SolarTimes } from './solarTimeService'

export interface ScoredCandidate {
  place: TripSagePlace
  totalScore: number
  scoreBreakdown: {
    interestMatch: number
    ratingScore: number
    solarFit: number
    budgetFit: number
    hiddenGemBonus: number
  }
}

export class RankingMatrixService {
  /**
   * Ranks a list of candidate places using multi-factor weighted scoring.
   */
  static rankCandidates(
    candidates: TripSagePlace[],
    params: HybridItineraryParams,
    solar?: SolarTimes
  ): ScoredCandidate[] {
    const preferences = (params.preferences || []).map(p => p.toLowerCase())
    const userBudget = params.budget || 50000
    const perDayBudget = userBudget / (params.days || 3)
    const solarPref = params.solarPreference || params.persona?.solarPreference || 'none'

    const scored: ScoredCandidate[] = candidates.map(place => {
      // 1. Interest Match (Weight: 0.35)
      let interestMatch = 0.5
      const nameLower = place.name.toLowerCase()
      const categoryLower = (place.category || '').toLowerCase()
      const typesStr = (place.types || []).join(' ').toLowerCase()

      if (preferences.length > 0) {
        const matches = preferences.filter(pref =>
          nameLower.includes(pref) ||
          categoryLower.includes(pref) ||
          typesStr.includes(pref)
        )
        interestMatch = Math.min(1.0, 0.4 + (matches.length * 0.3))
      }

      // 2. Rating & Review Quality (Weight: 0.25)
      const rating = place.rating || 4.0
      const reviews = place.userRatingsTotal || 100
      const ratingScore = Math.min(1.0, (rating / 5.0) * (Math.log10(reviews + 1) / 4.0))

      // 3. Solar & Timing Fit (Weight: 0.15)
      let solarFit = 0.7
      if (solar) {
        const isSunsetCategory = ['viewpoint', 'landmarks', 'beaches', 'parks'].includes(categoryLower)
        const activeSolarPref = isSunsetCategory ? 'sunset' : solarPref
        solarFit = SolarTimeService.evaluateSolarFit('18:00', activeSolarPref, solar)
      }

      // 4. Budget Compatibility (Weight: 0.15)
      let budgetFit = 0.8
      const estCost = place.priceLevel ? place.priceLevel * 300 : 200
      if (estCost <= perDayBudget * 0.2) {
        budgetFit = 1.0
      } else if (estCost > perDayBudget * 0.5) {
        budgetFit = 0.4
      }

      // 5. Hidden Gem Bonus (Weight: 0.10)
      // Highly rated (>= 4.5) with lower review count (50-600) gets a hidden gem boost
      let hiddenGemBonus = 0
      if (rating >= 4.5 && reviews >= 30 && reviews <= 600) {
        hiddenGemBonus = 0.9
      }

      // Composite Weighted Score
      const totalScore = (
        (interestMatch * 0.35) +
        (ratingScore * 0.25) +
        (solarFit * 0.15) +
        (budgetFit * 0.15) +
        (hiddenGemBonus * 0.10)
      )

      return {
        place,
        totalScore: parseFloat(totalScore.toFixed(3)),
        scoreBreakdown: {
          interestMatch: parseFloat(interestMatch.toFixed(2)),
          ratingScore: parseFloat(ratingScore.toFixed(2)),
          solarFit: parseFloat(solarFit.toFixed(2)),
          budgetFit: parseFloat(budgetFit.toFixed(2)),
          hiddenGemBonus: parseFloat(hiddenGemBonus.toFixed(2)),
        }
      }
    })

    // Sort descending by total score
    return scored.sort((a, b) => b.totalScore - a.totalScore)
  }
}
