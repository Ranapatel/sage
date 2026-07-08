export interface BusResult {
  operatorName: string;         // e.g. "VRL Travels"
  busType: string;              // e.g. "AC Sleeper"
  rating?: number;              // e.g. 4.2
  departure: string;            // e.g. "22:00"
  arrival: string;              // e.g. "12:00"
  duration: string;             // e.g. "14h"
  amenities: string[];          // ["WiFi", "Charging", "Blanket"]
  price?: number;               // INR — estimated, e.g. 1200
  seatsAvailable?: number;      // e.g. 14
  bookingUrl: string;
}

export interface SearchBusesInput {
  origin: string;
  destination: string;
  travelDate: string;           // YYYY-MM-DD
  passengers?: number;
}

export interface SearchBusesOutput {
  provider: 'MakeMyTrip';
  origin: string;
  destination: string;
  travelDate: string;
  searchUrl: string;
  results: BusResult[];
}

export interface IBusProvider {
  name: string;
  buildSearchUrl(params: SearchBusesInput): string;
  search(params: SearchBusesInput): Promise<BusResult[]>;
}
