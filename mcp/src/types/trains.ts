export type TrainClass = 'SL' | '3A' | '2A' | '1A' | 'CC' | 'EC';

export interface SearchTrainsInput {
  originStation: string;        // Station name or code e.g. "Mumbai" or "CSTM"
  destinationStation: string;   // Station name or code e.g. "Madgaon" or "MAO"
  travelDate: string;           // ISO format: YYYY-MM-DD
  passengers?: number;          // Default: 1, max: 6
  preferredClass?: TrainClass;  // Default: "3A"
}

export interface StationInfo {
  name: string;
  code: string;                 // Indian Railways station code e.g. "MAO"
  city: string;
}

export interface ClassAvailability {
  class: TrainClass;
  className: string;            // Human readable e.g. "AC 3 Tier"
  available: boolean;
  price?: number;               // INR — only if scraped, never fabricate
  availability?: string;        // "AVAILABLE" | "WAITING LIST" | "RAC"
}

export interface TrainResult {
  trainNumber: string;          // e.g. "10104"
  trainName: string;            // e.g. "Mandovi Express"
  departure: string;            // HH:mm format
  arrival: string;              // HH:mm format
  duration: string;             // e.g. "9h 45m"
  runsOn: string[];             // ["Mon", "Wed", "Fri", "Sun"]
  availableClasses: ClassAvailability[];
  bookingUrl: string;           // Direct MMT booking URL for this train
}

export interface SearchTrainsOutput {
  provider: 'MakeMyTrip';
  strategy: 'deeplink' | 'scraped';
  origin: StationInfo;
  destination: StationInfo;
  travelDate: string;
  searchUrl: string;            // Always returned — the MMT search page URL
  results: TrainResult[];       // Empty array if Strategy A only
  totalResults: number;
  cacheHit: boolean;
  generatedAt: string;          // ISO timestamp
}

export interface ITrainProvider {
  name: string;
  buildSearchUrl(
    params: SearchTrainsInput,
    origin: StationInfo,
    destination: StationInfo,
  ): string;
  search?(params: SearchTrainsInput): Promise<TrainResult[]>;
  // search() is optional — providers may be link-only
}
