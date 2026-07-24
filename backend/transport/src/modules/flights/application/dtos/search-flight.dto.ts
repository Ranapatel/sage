export class SearchFlightsCriteriaDto {
  origin: string;
  destination: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: 'Economy' | 'PremiumEconomy' | 'Business' | 'First';
  directFlightsOnly?: boolean;
  providerType?: 'GDS' | 'NDC' | 'BOTH';
}
