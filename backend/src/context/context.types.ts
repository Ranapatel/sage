/**
 * Contextual Intelligence Layer — type definitions.
 *
 * The ContextObject is the single source of truth that flows through every
 * downstream intelligence module (Budget, Transport, Weather, Hotel, etc.).
 * Each module receives a fully-built `ContextObject` and emits typed
 * `Recommendation<T>` records which are scored by the decision engine.
 */

// ─── Context sub-schemas ──────────────────────────────────────────────────────

export interface UserContext {
  id: string
  clerkUserId: string
  email: string
  firstName?: string | null
  lastName?: string | null
  homeCity?: string | null
  country?: string | null
  language?: string
  currency?: string
  preferredTransport?: string | null
  dietaryRestrictions?: string[]
  accessibilityNotes?: string | null
  favoriteAirlines?: string[]
  favoriteHotelChains?: string[]
  favoriteCuisines?: string[]
}

export interface TripContext {
  id: string
  destination: string
  title: string
  startDate: string // ISO
  endDate: string   // ISO
  budget: number
  travelers: number
  status: string
  daysUntilStart: number
  durationDays: number
}

export interface DestinationContext {
  city: string
  country?: string
  timezone?: string
  currency?: string
  lat?: number
  lng?: number
}

export interface BudgetContext {
  totalBudget: number
  perDay: number
  currency: string
  allocation: {
    accommodation: number
    transportation: number
    food: number
    activities: number
    emergency: number
  }
}

export interface TransportContext {
  preferredMode?: string
  recentSearches: Array<{
    origin: string
    destination: string
    rankPreference?: string
    createdAt: string
  }>
}

export interface WeatherContext {
  available: boolean
  currentTempC?: number
  forecastSummary?: string
  dailyForecast?: Array<{
    date: string
    minC: number
    maxC: number
    conditions: string
  }>
  recommendation?: string
}

export interface PreferencesContext {
  travelStyle?: string | null
  budgetRange?: string | null
  interests: string[]
  foodPreference: string[]
  accommodationPreference?: string | null
  tripDuration?: string | null
  favoriteCuisines: string[]
}

export interface LiveDataContext {
  weather: WeatherContext
  fx?: { base: string; rates: Record<string, number> } | null
  traffic?: { severity: 'low' | 'medium' | 'high'; notes?: string } | null
  delays?: { source: string; status: 'on-time' | 'delayed' | 'unknown'; notes?: string } | null
  safety?: { level: 'safe' | 'caution' | 'avoid'; advisory?: string } | null
}

export interface ItineraryContext {
  dayCount: number
  totalActivities: number
  days: Array<{
    dayNumber: number
    title: string
    activityCount: number
  }>
}

export interface HistoryContext {
  totalTrips: number
  totalSearches: number
  recentFeedback: Array<{
    module: string
    action: string
    rating?: number | null
    createdAt: string
  }>
  averageSpend?: number
}

// ─── Aggregated ContextObject ─────────────────────────────────────────────────

export interface ContextObject {
  /** Monotonic version counter — incremented by `processor.service.ts`. */
  version: number
  builtAt: string // ISO
  user: UserContext
  trip: TripContext | null
  destination: DestinationContext | null
  budget: BudgetContext | null
  transport: TransportContext
  preferences: PreferencesContext
  liveData: LiveDataContext
  itinerary: ItineraryContext | null
  history: HistoryContext
  /** Resolved scoring weights derived from prefs (used by decision.service). */
  scoringWeights: ScoringWeights
}

// ─── Scoring dimensions ───────────────────────────────────────────────────────

export type ScoreDimension =
  | 'journeyScore'
  | 'comfortScore'
  | 'budgetScore'
  | 'safetyScore'
  | 'convenienceScore'
  | 'reliabilityScore'
  | 'familyScore'
  | 'businessScore'
  | 'accessibilityScore'
  | 'aiConfidenceScore'

export interface ScoringWeights {
  journeyScore: number
  comfortScore: number
  budgetScore: number
  safetyScore: number
  convenienceScore: number
  reliabilityScore: number
  familyScore: number
  businessScore: number
  accessibilityScore: number
  aiConfidenceScore: number
}

/** Per-dimension score 0–100 emitted by a recommendation. */
export type Scores = Partial<Record<ScoreDimension, number>>

// ─── Recommendation envelope ──────────────────────────────────────────────────

export interface Recommendation<T> {
  id: string
  module: ModuleId
  type: string
  scores: Scores
  /** Final aggregated 0–100 score using the weights above. */
  overallScore: number
  aiConfidence: number // 0–100
  data: T
  explanation: string
  generatedAt: string // ISO
  inputHash: string
}

// ─── Module IDs (must match SCORE_DIMENSIONS / module registry) ───────────────

export type ModuleId =
  | 'budget'
  | 'transport'
  | 'weather'
  | 'hotel'
  | 'restaurant'
  | 'route'
  | 'itinerary'
  | 'rental'
  | 'activity'
  | 'notification'

// ─── Budget plan data shape ───────────────────────────────────────────────────

export interface BudgetAllocation {
  category: 'accommodation' | 'transportation' | 'food' | 'activities' | 'emergency'
  perDay: number
  total: number
  percentage: number
}

export interface BudgetPlan {
  tripId?: string
  destination: string
  durationDays: number
  travelers: number
  totalBudget: number
  currency: string
  perDayBudget: number
  allocation: BudgetAllocation[]
  /** Pre-computed alternatives the user can swap in. */
  alternatives: Array<{
    label: string
    deltaCost: number
    rationale: string
  }>
  /** Warnings surfaced from the analysis. */
  warnings: Array<{
    level: 'info' | 'warning' | 'critical'
    message: string
  }>
}

// ─── Raw context shape returned by collector before normalization ─────────────

export interface RawContext {
  user: UserContext | null
  trip: TripContext | null
  preferences: PreferencesContext | null
  history: HistoryContext | null
  liveData: LiveDataContext
  itinerary: ItineraryContext | null
  /** Hash of the inputs that produced this raw context. */
  inputHash: string
  errors: Array<{ source: string; message: string }>
}

// ─── Adapter response wrappers ────────────────────────────────────────────────

export interface WeatherSnapshot {
  tempC: number
  conditions: string
  daily?: Array<{ date: string; minC: number; maxC: number; conditions: string }>
}

export interface FxSnapshot {
  base: string
  rates: Record<string, number>
}

export interface TrafficSnapshot {
  severity: 'low' | 'medium' | 'high'
  notes?: string
}

export interface DelaysSnapshot {
  source: string
  status: 'on-time' | 'delayed' | 'unknown'
  notes?: string
}

export interface SafetySnapshot {
  level: 'safe' | 'caution' | 'avoid'
  advisory?: string
}