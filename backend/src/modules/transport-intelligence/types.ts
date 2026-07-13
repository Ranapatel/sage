// ─── Transport Intelligence Module — Type Definitions ─────────────────────────

/** Supported transport modes for multi-modal journey planning */
export type TransportMode = 'train' | 'bus' | 'taxi' | 'metro' | 'auto';

/** Ranking preferences for the AI optimizer */
export type RankType = 'fastest' | 'cheapest' | 'comfort' | 'balanced';

/** A single leg of a multi-modal journey */
export interface TransportLeg {
  mode: TransportMode;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;       // e.g., "8h 15m"
  operator: string;
  price: number;          // INR per passenger
  bookingUrl: string;
  /** Extra metadata from the underlying provider */
  metadata?: Record<string, any>;
}

/** A complete door-to-door journey plan (may have 1+ legs) */
export interface JourneyPlan {
  id: string;
  legs: TransportLeg[];
  totalDurationMinutes: number;
  totalDurationLabel: string;   // e.g., "11h 45m"
  totalCost: number;            // INR total for all legs
  transfers: number;            // number of mode changes
  rank?: RankType;
  rankReason?: string;
  bookingUrl: string;           // primary MMT booking URL
  isDirect: boolean;
  aiExplanation?: string;
}

/** Client request to the transport intelligence endpoint */
export interface PlanRequest {
  origin: string;
  destination: string;
  date: string;                 // YYYY-MM-DD
  passengers?: number;          // default 1
  rankPreference?: RankType;    // default 'balanced'
}

/** Server response from the transport intelligence endpoint */
export interface PlanResponse {
  directOptions: JourneyPlan[];
  alternativeJourneys: JourneyPlan[];
  recommended: JourneyPlan | null;
  aiSummary: string;
  cacheHit: boolean;
  searchedAt: string;           // ISO timestamp
}

/** Hub graph node — a major Indian transport hub */
export interface HubNode {
  name: string;
  stationCode: string;
  citySlug: string;
  state: string;
  lat: number;
  lng: number;
  /** Keyed by hub slug → connection info */
  connectsTo: Record<string, { km: number; modes: TransportMode[]; estTime: string }>;
}

/** Normalized search result from the NestJS transport microservice */
export interface NormalizedSearchResult {
  trains: TransportLeg[];
  buses: TransportLeg[];
  searchUrls: { train?: string; bus?: string };
}
