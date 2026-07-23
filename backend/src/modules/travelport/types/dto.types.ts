/**
 * TripSage Normalized Flight Models & Frontend DTOs for Travelport Phase 1.
 * Preserves raw Travelport identifiers for all future phase requirements.
 */

export interface TravelportIdentifiersDto {
  catalogOfferingId: string;
  offerId: string;
  productOptionIds: string[];
  productIds: string[];
  segmentRefs: string[];
  offerResponseRef?: string;
  authority?: string;
  rawIdentifierValue: string;
}

export interface PassengerCountDto {
  adults: number;
  children?: number;
  infantsOnLap?: number;
  infantsInSeat?: number;
  youths?: number;
  seniors?: number;
}

export interface SearchLegRequestDto {
  origin: string; // 3-letter IATA
  destination: string; // 3-letter IATA
  departureDate: string; // YYYY-MM-DD
  departureTime?: string;
}

export interface SearchModifiersDto {
  cabinPreference?: 'Economy' | 'PremiumEconomy' | 'Business' | 'First';
  directFlightsOnly?: boolean;
  maxStops?: number;
  preferredCarriers?: string[];
  prohibitedCarriers?: string[];
}

export interface FlightSearchRequestDto {
  legs: SearchLegRequestDto[];
  passengers: PassengerCountDto;
  modifiers?: SearchModifiersDto;
  traceId?: string;
}

export interface FlightSegmentDto {
  segmentId: string;
  sequence: number;
  carrierCode: string;
  carrierName?: string;
  flightNumber: string;
  operatingCarrierCode?: string;
  operatingCarrierName?: string;
  operatingFlightNumber?: string;
  aircraftEquipment?: string;
  originAirport: string;
  originTerminal?: string;
  departureDateTime: string;
  destinationAirport: string;
  destinationTerminal?: string;
  arrivalDateTime: string;
  durationMinutes?: number;
  formattedDuration?: string;
  stopsCount: number;
  cabin: string;
  classOfService?: string;
  fareBasisCode?: string;
}

export interface BrandAttributeDto {
  name: string;
  inclusion: 'Included' | 'Chargeable' | 'NotOffered' | string;
  classification?: string;
  description?: string;
}

export interface BrandedFareInfoDto {
  brandName: string;
  brandCode?: string;
  brandTier?: string;
  attributes: BrandAttributeDto[];
}

export interface BaggageAllowanceDto {
  passengerType: string;
  maxPieces?: number;
  maxWeightValue?: number;
  maxWeightUnit?: string;
  baggageType: 'Checked' | 'CarryOn';
  formattedSummary: string;
}

export interface TaxBreakdownDto {
  code: string;
  amount: number;
  currency: string;
}

export interface PassengerPriceBreakdownDto {
  passengerType: string; // e.g. ADT
  quantity: number;
  baseFare: number;
  taxes: number;
  totalPrice: number;
  currency: string;
  taxBreakdown: TaxBreakdownDto[];
}

export interface TotalPricingDto {
  baseFare: number;
  totalTaxes: number;
  totalPrice: number;
  currency: string;
  passengerBreakdown: PassengerPriceBreakdownDto[];
}

export interface FlightOfferDto {
  offerId: string;
  validatingCarrier: string;
  pricing: TotalPricingDto;
  legs: Array<{
    legIndex: number;
    origin: string;
    destination: string;
    durationMinutes?: number;
    segments: FlightSegmentDto[];
  }>;
  brandedFare?: BrandedFareInfoDto;
  baggageAllowance: BaggageAllowanceDto[];
  ticketingDeadline?: string; // ISO String / DateTime
  travelportIdentifiers: TravelportIdentifiersDto;
}

export interface MetadataDto {
  traceId: string;
  transactionId?: string;
  timestamp: string;
  processingTimeMs: number;
  totalResults: number;
}

export interface FlightSearchResponseDto {
  success: boolean;
  metadata: MetadataDto;
  offers: FlightOfferDto[];
}

// ── AirPrice DTOs ─────────────────────────────────────────────────────────────

export interface AirPriceRequestDto {
  catalogOfferingId: string;
  rawIdentifierValue: string;
  offerId?: string;
  traceId?: string;
}

export interface TermsAndConditionsDto {
  ticketingDeadline?: string;
  validatingCarrier?: string;
  cancellationSummary?: string;
  changeSummary?: string;
  rulesSummaryText?: string[];
}

export interface AirPriceResponseDto {
  success: boolean;
  metadata: MetadataDto;
  confirmedOffer: {
    offerId: string;
    validatingCarrier: string;
    pricing: TotalPricingDto;
    legs: Array<{
      legIndex: number;
      origin: string;
      destination: string;
      segments: FlightSegmentDto[];
    }>;
    brandedFare?: BrandedFareInfoDto;
    baggageAllowance: BaggageAllowanceDto[];
    termsAndConditions: TermsAndConditionsDto;
    travelportIdentifiers: TravelportIdentifiersDto;
  };
}

// ── Standalone Fare Rules DTOs ────────────────────────────────────────────────

export interface FareRulesRequestDto {
  catalogOfferingId: string;
  rawIdentifierValue: string;
  offerId?: string;
  traceId?: string;
}

export interface StructuredFareRuleCategoryDto {
  categoryKey: 'MIN_STAY' | 'MAX_STAY' | 'CANCELLATION' | 'REFUND' | 'CHANGES' | 'ADVANCE_PURCHASE' | 'GENERAL';
  title: string;
  textDetails: string[];
  penaltyAmount?: number;
  currency?: string;
  isRefundable?: boolean;
  isChangeable?: boolean;
}

export interface FareRulesResponseDto {
  success: boolean;
  metadata: MetadataDto;
  fareRules: {
    catalogOfferingId: string;
    offerId: string;
    ruleCategories: StructuredFareRuleCategoryDto[];
    summaryText: string;
    travelportIdentifiers: TravelportIdentifiersDto;
  };
}

// ── Normalized Internal Error DTO ──────────────────────────────────────────────

export interface NormalizedErrorDto {
  success: false;
  error: {
    code: string;
    message: string;
    category: string;
    statusCode: number;
    sourceId?: string;
    sourceCode?: string;
    traceId: string;
    transactionId?: string;
    details?: any;
  };
}
