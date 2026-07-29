import type { ModuleId, ScoreDimension, ScoringWeights } from './context.types'

/** Module identifiers — keep in sync with `context.types.ts#ModuleId`. */
export const MODULE_IDS: Record<string, ModuleId> = {
  BUDGET:      'budget',
  TRANSPORT:   'transport',
  WEATHER:     'weather',
  HOTEL:       'hotel',
  RESTAURANT:  'restaurant',
  ROUTE:       'route',
  ITINERARY:   'itinerary',
  RENTAL:      'rental',
  ACTIVITY:    'activity',
  NOTIFICATION:'notification',
} as const

export const SCORE_DIMENSIONS: readonly ScoreDimension[] = [
  'journeyScore',
  'comfortScore',
  'budgetScore',
  'safetyScore',
  'convenienceScore',
  'reliabilityScore',
  'familyScore',
  'businessScore',
  'accessibilityScore',
  'aiConfidenceScore',
] as const

/** Default scoring weights (sum ≈ 1.0). */
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  journeyScore:         0.18,
  comfortScore:         0.10,
  budgetScore:          0.20,
  safetyScore:          0.12,
  convenienceScore:     0.08,
  reliabilityScore:     0.10,
  familyScore:          0.05,
  businessScore:        0.05,
  accessibilityScore:   0.07,
  aiConfidenceScore:    0.05,
}

/**
 * Scoring weights shifted based on travel-style and purpose hints.
 * The processor picks one of these when travelStyle = 'family' | 'business' | 'accessibility'.
 */
export const FAMILY_SCORING_WEIGHTS: ScoringWeights = {
  journeyScore:         0.10,
  comfortScore:         0.15,
  budgetScore:          0.18,
  safetyScore:          0.18,
  convenienceScore:     0.12,
  reliabilityScore:     0.08,
  familyScore:          0.12,
  businessScore:        0.00,
  accessibilityScore:   0.05,
  aiConfidenceScore:    0.02,
}

export const BUSINESS_SCORING_WEIGHTS: ScoringWeights = {
  journeyScore:         0.18,
  comfortScore:         0.10,
  budgetScore:          0.10,
  safetyScore:          0.08,
  convenienceScore:     0.18,
  reliabilityScore:     0.15,
  familyScore:          0.00,
  businessScore:        0.15,
  accessibilityScore:   0.03,
  aiConfidenceScore:    0.03,
}

export const ACCESSIBILITY_SCORING_WEIGHTS: ScoringWeights = {
  journeyScore:         0.10,
  comfortScore:         0.12,
  budgetScore:          0.10,
  safetyScore:          0.12,
  convenienceScore:     0.12,
  reliabilityScore:     0.08,
  familyScore:          0.05,
  businessScore:        0.00,
  accessibilityScore:   0.25,
  aiConfidenceScore:    0.06,
}

/** Default TTL for cached context objects (1 hour). */
export const DEFAULT_TTL_SECONDS = 3600

/** Default TTL for hot aggregations (e.g. user-trip-count). */
export const HOT_AGG_TTL_SECONDS = 600 // 10 minutes

/** Cache key prefix for all context data. */
export const CTX_CACHE_PREFIX = 'ts:ctx:'

/** Default budget allocation percentages (sum = 1.0). */
export const BUDGET_ALLOCATION_DEFAULTS: {
  accommodation: number
  transportation: number
  food: number
  activities: number
  emergency: number
} = {
  accommodation: 0.35,
  transportation: 0.20,
  food: 0.25,
  activities: 0.10,
  emergency: 0.10,
}

/** Pages of feedback / favorites to keep in hot path. */
export const RECENT_FEEDBACK_LIMIT = 20
export const RECENT_FAVORITES_LIMIT = 20
export const RECENT_SEARCHES_LIMIT = 10

/** Trip-count bucketing — how far back to consider "history". */
export const HISTORY_LOOKBACK_DAYS = 365

/** Weather code → friendly description (used by NullWeatherAdapter fallback). */
export const DEFAULT_CONDITIONS = 'Unknown'

/** User-facing budget warning thresholds. */
export const BUDGET_WARN = {
  /** Spending >80% of category ⇒ warn. */
  CATEGORY_WARN: 0.80,
  /** Spending >100% ⇒ critical. */
  CATEGORY_CRITICAL: 1.00,
} as const