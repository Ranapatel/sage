// ─── Provider Interfaces ──────────────────────────────────────────────────────
// UI codes against these interfaces, never directly against MakeMyTrip.

export interface TrainSearchParams {
  originStation: string
  destinationStation: string
  travelDate: string
  passengers?: number
  preferredClass?: string
}

export interface BusSearchParams {
  origin: string
  destination: string
  travelDate: string
  passengers?: number
}

// ─── Train Types ──────────────────────────────────────────────────────────────

export interface TrainClassFare {
  classCode: string
  className: string
  fare: number
  availability?: 'AVAILABLE' | 'RAC' | 'WL' | null
}

export interface TrainResult {
  id: string
  trainNumber: string
  trainName: string
  trainType: string
  origin: { station: string; code: string }
  destination: { station: string; code: string }
  departure: string
  arrival: string
  duration: string
  runsOn: string[]
  classes: TrainClassFare[]
  bookingUrl: string
  aiRank?: { badge: string; reasons: string[] } | null
}

export interface TrainSearchResponse {
  results: TrainResult[]
  searchUrl: string
}

// ─── Bus Types ────────────────────────────────────────────────────────────────

export interface BusResult {
  id: string
  operator: string
  busType: string
  rating: number | null
  amenities: string[]
  departure: string
  arrival: string
  duration: string
  fare: number | null
  seatsLeft: number | null
  bookingUrl: string
  aiRank?: { badge: string; reasons: string[] } | null
}

export interface BusSearchResponse {
  results: BusResult[]
  searchUrl: string
}

// ─── Provider Interfaces ──────────────────────────────────────────────────────

export interface ITrainProvider {
  searchTrains(params: TrainSearchParams): Promise<TrainSearchResponse>
}

export interface IBusProvider {
  searchBuses(params: BusSearchParams): Promise<BusSearchResponse>
}

// ─── Class name mapping ───────────────────────────────────────────────────────

export const CLASS_NAMES: Record<string, string> = {
  SL: 'Sleeper',
  '3A': 'AC 3 Tier',
  '3E': '3A Economy',
  '2A': 'AC 2 Tier',
  '1A': 'First AC',
  CC: 'Chair Car',
  EC: 'Exec. Chair',
  '2S': 'Second Sitting',
}
