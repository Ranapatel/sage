/**
 * Raw Travelport JSON REST API Schemas
 * Directly mirrors the Travelport JSON API contracts.
 */

export interface TravelportOAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface TravelportErrorItem {
  StatusCode?: number;
  Message?: string;
  SourceID?: string;
  SourceCode?: string;
  Category?: string;
  description?: string;
  code?: string;
  name?: string;
}

export interface TravelportErrorResponse {
  StatusCode?: number;
  Message?: string;
  SourceID?: string;
  SourceCode?: string;
  Category?: string;
  Result?: {
    Error?: TravelportErrorItem[];
    Warning?: TravelportErrorItem[];
    Status?: string;
  };
  Error?: TravelportErrorItem[];
  errors?: TravelportErrorItem[];
}

// ── Search Request ────────────────────────────────────────────────────────────

export interface RawPassengerCriteria {
  value: string; // e.g. "ADT", "CHD", "INF"
  number: number; // count
  age?: number;
}

export interface RawSearchModifiers {
  CabinPreference?: string[];
  DirectFlightsOnly?: boolean;
  MaxStops?: number;
  CarrierPreference?: Array<{
    type: 'Preferred' | 'Prohibited' | 'Permitted';
    carriers: string[];
  }>;
}

export interface RawSearchLeg {
  origin: string; // 3-letter IATA
  destination: string; // 3-letter IATA
  departureDate: string; // YYYY-MM-DD
  departureTime?: string; // HH:mm
}

export interface RawCatalogOfferingsQueryRequest {
  CatalogOfferingsQueryRequest: {
    '@type': 'CatalogOfferingsQueryRequest';
    CatalogOfferingsRequest: {
      '@type': 'CatalogOfferingsRequestAir';
      PassengerCriteria: RawPassengerCriteria[];
      SearchCriteriaFlight: Array<{
        '@type': 'SearchCriteriaFlight';
        departureDate: string;
        departureTime?: string;
        From: {
          value: string;
        };
        To: {
          value: string;
        };
      }>;
      SearchModifiersAir?: {
        '@type': 'SearchModifiersAir';
        CabinPreference?: string[];
        MaxStops?: number;
        DirectFlightsOnly?: boolean;
        CarrierPreference?: Array<{
          type: string;
          carriers: string[];
        }>;
      };
    };
  };
}

// ── Search Response ───────────────────────────────────────────────────────────

export interface RawIdentifier {
  value: string;
  authority?: string;
}

export interface RawPriceBreakdown {
  '@type': 'PriceBreakdownAir';
  Quantity: number;
  PassengerType: string; // e.g. ADT
  Amount: {
    Base: number;
    Taxes?: number;
    Total: number;
    CurrencyCode: string;
  };
  TaxBreakdown?: Array<{
    code: string;
    amount: number;
    currency?: string;
  }>;
}

export interface RawPriceDetail {
  '@type': 'PriceDetailAir';
  TotalBase: number;
  TotalTaxes?: number;
  TotalPrice: number;
  CurrencyCode: string;
  PriceBreakdownAir?: RawPriceBreakdown[];
}

export interface RawFlightSegment {
  '@type': 'FlightSegment';
  id: string;
  sequence: number;
  carrier: string;
  flightNumber: string;
  operatingCarrier?: string;
  operatingFlightNumber?: string;
  equipment?: string;
  Departure: {
    location: string;
    date: string;
    time?: string;
    terminal?: string;
  };
  Arrival: {
    location: string;
    date: string;
    time?: string;
    terminal?: string;
  };
  duration?: string;
  distance?: number;
  numberOfStops?: number;
}

export interface RawBrandAttribute {
  name: string;
  inclusion: 'Included' | 'Chargeable' | 'NotOffered' | string;
  classification?: string;
  description?: string;
}

export interface RawBrand {
  '@type': 'Brand';
  id?: string;
  name: string;
  brandCode?: string;
  brandTier?: string;
  BrandAttribute?: RawBrandAttribute[];
}

export interface RawBaggageAllowance {
  '@type': 'BaggageAllowanceDetail';
  passengerType?: string;
  maxPieces?: number;
  maxWeight?: {
    value: number;
    unit: string;
  };
  baggageType?: 'Checked' | 'CarryOn';
}

export interface RawPassengerFlight {
  '@type': 'PassengerFlight';
  passengerQuantity: number;
  passengerTypeCode: string;
  flightSegmentRef: string;
  cabin: string;
  classOfService?: string;
  fareBasisCode?: string;
  Brand?: RawBrand;
}

export interface RawProduct {
  '@type': 'ProductAir';
  id: string;
  productOptionsRef?: string[];
  FlightSegment: RawFlightSegment[];
  PassengerFlight: RawPassengerFlight[];
}

export interface RawCatalogOffering {
  '@type': 'CatalogOffering';
  id: string;
  Identifier: RawIdentifier;
  OfferResponseRef?: string;
  ProductOptions?: Array<{
    '@type': 'ProductOptions';
    id: string;
    Product: RawProduct[];
  }>;
  Price: RawPriceDetail;
  TermsAndConditionsFull?: {
    PaymentTimeLimit?: string;
    BaggageAllowanceDetail?: RawBaggageAllowance[];
    ValidatingCarrier?: string;
  };
}

export interface RawCatalogOfferingsResponse {
  CatalogOfferingsResponse: {
    '@type': 'CatalogOfferingsResponse';
    transactionId?: string;
    CatalogOfferings: {
      '@type': 'CatalogOfferings';
      id: string;
      CatalogOffering: RawCatalogOffering[];
    };
    ReferenceListFlight?: RawFlightSegment[];
    ReferenceListBrand?: RawBrand[];
    ReferenceListTermsAndConditions?: any[];
  };
}

// ── AirPrice Request & Response ───────────────────────────────────────────────

export interface RawAirPriceReferencePayloadRequest {
  AirPriceQueryBuildFromCatalogOffering: {
    '@type': 'AirPriceQueryBuildFromCatalogOffering';
    CatalogOfferingIdentifier: {
      '@type': 'CatalogOfferingIdentifier';
      Identifier: RawIdentifier;
      CatalogOfferingRef?: string;
    };
  };
}

export interface RawAirPriceResponse {
  OfferListResponse: {
    '@type': 'OfferListResponse';
    transactionId?: string;
    Identifier?: RawIdentifier;
    OfferID: {
      id: string;
      Identifier: RawIdentifier;
      Product: RawProduct[];
      PriceDetail: RawPriceDetail;
      TermsAndConditionsFull?: {
        PaymentTimeLimit?: string;
        ValidatingCarrier?: string;
        BaggageAllowanceDetail?: RawBaggageAllowance[];
        FareRuleInfoText?: Array<{
          category?: string;
          text?: string;
        }>;
      };
    };
  };
}

// ── Standalone Fare Rules Request & Response ──────────────────────────────────

export interface RawFareRulesRequest {
  FareRulesQueryBuildFromCatalogOffering: {
    '@type': 'FareRulesQueryBuildFromCatalogOffering';
    CatalogOfferingIdentifier: {
      '@type': 'CatalogOfferingIdentifier';
      Identifier: RawIdentifier;
    };
  };
}

export interface RawFareRuleCategory {
  category: string; // e.g. "MIN_STAY", "MAX_STAY", "CANCELLATION", "REFUND", "CHANGES", "ADVANCE_PURCHASE"
  title?: string;
  text?: string[];
  penaltyAmount?: number;
  currency?: string;
  refundable?: boolean;
  changeable?: boolean;
}

export interface RawFareRulesResponse {
  FareRulesResponse: {
    '@type': 'FareRulesResponse';
    transactionId?: string;
    Identifier?: RawIdentifier;
    FareRuleList: {
      '@type': 'FareRuleList';
      FareRuleInfo: RawFareRuleCategory[];
    };
  };
}
