/**
 * Decision service — Phase 5 of the Contextual Intelligence Layer plan.
 *
 * Pure weighted scorer. Given a set of per-dimension scores and a ContextObject's
 * ScoringWeights, returns the final 0–100 overall score plus a normalized
 * explanation. Designed to be a pure function (no I/O) for testability.
 */

import { SCORE_DIMENSIONS } from './context.constants'
import type { ContextObject, Scores, ScoringWeights } from './context.types'

export interface DecisionResult {
  overallScore: number
  perDimension: Scores
  explanation: string
  confidence: number // 0-100
}

/**
 * Compute the overall score.
 * Each dimension is weighted, then summed. Missing dimensions default to 50
 * (neutral) so they don't tank the score.
 */
export function scoreRecommendation(
  perDimension: Scores,
  weights: ScoringWeights,
  options?: { missingDefault?: number }
): number {
  const missingDefault = options?.missingDefault ?? 50
  let total = 0
  let totalWeight = 0
  for (const dim of SCORE_DIMENSIONS) {
    const v = perDimension[dim]
    const w = weights[dim]
    if (w <= 0) continue
    const score = typeof v === 'number' ? v : missingDefault
    total += score * w
    totalWeight += w
  }
  if (totalWeight <= 0) return 0
  return Math.round(total / totalWeight)
}

/**
 * How confident are we in this recommendation? Based on how many
 * dimensions were actually measured vs defaulted.
 */
export function computeConfidence(perDimension: Scores): number {
  const measured = SCORE_DIMENSIONS.filter((d) => typeof perDimension[d] === 'number').length
  return Math.round((measured / SCORE_DIMENSIONS.length) * 100)
}

/**
 * Build a human-readable explanation string from the scores.
 * Highlights the top 3 scoring dimensions.
 */
export function buildExplanation(perDimension: Scores, data: any): string {
  const ranked = SCORE_DIMENSIONS
    .map((d) => ({ dim: d, score: perDimension[d] ?? 0 }))
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  if (ranked.length === 0) return 'Score based on default weighting.'

  const top = ranked.map((r) => `${formatDimension(r.dim)} (${r.score})`).join(', ')
  const ctx = data?.destination || data?.destination || ''
  return `Strongest signals: ${top}${ctx ? ` for ${ctx}` : ''}.`
}

function formatDimension(d: string): string {
  return d
    .replace(/Score$/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
}

/**
 * One-shot scorer: builds a DecisionResult from raw scores + context weights.
 */
export function decide(perDimension: Scores, ctx: ContextObject, data: any): DecisionResult {
  const overallScore = scoreRecommendation(perDimension, ctx.scoringWeights)
  const confidence = computeConfidence(perDimension)
  return {
    overallScore,
    perDimension: perDimension,
    explanation: buildExplanation(perDimension, data),
    confidence,
  }
}