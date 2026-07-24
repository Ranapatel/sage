import { TravelportHeaderBuilder } from '../headers/travelportHeader.builder';
import { TravelportAuthService } from '../auth/travelportAuth.service';
import { FlightSearchParser } from '../parsers/flightSearch.parser';
import { AirPriceParser } from '../parsers/airPrice.parser';
import { FareRulesParser } from '../parsers/fareRules.parser';
import { TravelportErrorHandler } from '../errors/travelportError.handler';
import { TRAVELPORT_HEADERS, ErrorCategory } from '../constants/travelport.constants';

async function runPhase1Tests() {
  console.log('===========================================================');
  console.log('   Travelport Flights Integration - Phase 1 Test Suite    ');
  console.log('===========================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ✅ ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ❌ ${testName}`);
      failed++;
    }
  }

  // 1. Header Builder Test
  console.log('\n--- 1. Header Builder Test ---');
  const headers = TravelportHeaderBuilder.build({
    bearerToken: 'test-bearer-token-123',
    traceId: 'trace-test-001',
  });
  assert(headers[TRAVELPORT_HEADERS.AUTHORIZATION] === 'Bearer test-bearer-token-123', 'Authorization header built correctly');
  assert(headers[TRAVELPORT_HEADERS.ACCEPT] === 'application/json', 'Accept header built correctly');
  assert(headers[TRAVELPORT_HEADERS.CONTENT_TYPE] === 'application/json', 'Content-Type header built correctly');
  assert(headers[TRAVELPORT_HEADERS.TRACE_ID] === 'trace-test-001', 'TraceId header included');
  assert(!!headers[TRAVELPORT_HEADERS.XAUTH_ACCESSGROUP], 'XAUTH_TRAVELPORT_ACCESSGROUP header included');
  assert(!!headers[TRAVELPORT_HEADERS.TVP_PCC_CORE], 'TVP-PCC-CORE header included');
  assert(headers[TRAVELPORT_HEADERS.ACCEPT_VERSION] === '11.0.0', 'Accept-Version header included');
  assert(headers[TRAVELPORT_HEADERS.CONTENT_VERSION] === '11.0.0', 'Content-Version header included');

  // 2. OAuth Authentication Service Test
  console.log('\n--- 2. OAuth Authentication Service Test ---');
  const authService = TravelportAuthService.getInstance();
  const token = await authService.getAccessToken('test-trace-auth');
  assert(typeof token === 'string' && token.length > 0, 'OAuth service returned a valid token string');

  // 3. Flight Search Parser Test
  console.log('\n--- 3. Flight Search Parser & Identifier Preservation Test ---');
  const mockSearchResponse = {
    CatalogOfferingsResponse: {
      '@type': 'CatalogOfferingsResponse' as const,
      transactionId: 'tx-search-999',
      CatalogOfferings: {
        '@type': 'CatalogOfferings' as const,
        id: 'cat-offering-root-1',
        CatalogOffering: [
          {
            '@type': 'CatalogOffering' as const,
            id: 'offering-001',
            Identifier: { value: 'raw-offering-val-1', authority: 'Travelport' },
            OfferResponseRef: 'off-resp-ref-001',
            ProductOptions: [
              {
                '@type': 'ProductOptions' as const,
                id: 'po-101',
                Product: [
                  {
                    '@type': 'ProductAir' as const,
                    id: 'prod-201',
                    FlightSegment: [
                      {
                        '@type': 'FlightSegment' as const,
                        id: 'seg-301',
                        sequence: 1,
                        carrier: 'UA',
                        flightNumber: '100',
                        operatingCarrier: 'UA',
                        operatingFlightNumber: '100',
                        equipment: '738',
                        Departure: { location: 'JFK', date: '2026-09-01', time: '08:00:00', terminal: '4' },
                        Arrival: { location: 'LHR', date: '2026-09-01', time: '20:00:00', terminal: '2' },
                        duration: 'PT7H00M',
                        numberOfStops: 0,
                      },
                    ],
                    PassengerFlight: [
                      {
                        '@type': 'PassengerFlight' as const,
                        passengerQuantity: 1,
                        passengerTypeCode: 'ADT',
                        flightSegmentRef: 'seg-301',
                        cabin: 'Economy',
                        classOfService: 'Y',
                        fareBasisCode: 'Y1234',
                      },
                    ],
                  },
                ],
              },
            ],
            Price: {
              '@type': 'PriceDetailAir' as const,
              TotalBase: 500,
              TotalTaxes: 100,
              TotalPrice: 600,
              CurrencyCode: 'USD',
              PriceBreakdownAir: [
                {
                  '@type': 'PriceBreakdownAir' as const,
                  Quantity: 1,
                  PassengerType: 'ADT',
                  Amount: { Base: 500, Taxes: 100, Total: 600, CurrencyCode: 'USD' },
                },
              ],
            },
            TermsAndConditionsFull: {
              PaymentTimeLimit: '2026-08-30T23:59:00Z',
              ValidatingCarrier: 'UA',
              BaggageAllowanceDetail: [
                {
                  '@type': 'BaggageAllowanceDetail' as const,
                  passengerType: 'ADT',
                  maxPieces: 1,
                  baggageType: 'Checked' as const,
                },
              ],
            },
          },
        ],
      },
    },
  };

  const parsedSearch = FlightSearchParser.parse(mockSearchResponse, 'trace-search-01', 120);
  assert(parsedSearch.success === true, 'Search parsing succeeded');
  assert(parsedSearch.offers.length === 1, 'Extracted 1 offer');
  assert(parsedSearch.offers[0].offerId === 'offering-001', 'Offer ID preserved');
  assert(parsedSearch.offers[0].travelportIdentifiers.catalogOfferingId === 'cat-offering-root-1', 'Catalog Offering ID preserved');
  assert(parsedSearch.offers[0].travelportIdentifiers.productOptionIds.includes('po-101'), 'Product Option ID preserved');
  assert(parsedSearch.offers[0].travelportIdentifiers.productIds.includes('prod-201'), 'Product ID preserved');
  assert(parsedSearch.offers[0].pricing.totalPrice === 600, 'Parsed total price correctly');
  assert(parsedSearch.metadata.transactionId === 'tx-search-999', 'Transaction ID captured correctly');

  // 4. AirPrice Reference Payload Parser Test
  console.log('\n--- 4. AirPrice Reference Payload Parser Test ---');
  const mockAirPriceResponse = {
    OfferListResponse: {
      '@type': 'OfferListResponse' as const,
      transactionId: 'tx-price-888',
      Identifier: { value: 'raw-price-val-1', authority: 'Travelport' },
      OfferID: {
        id: 'offering-001',
        Identifier: { value: 'raw-offering-val-1', authority: 'Travelport' },
        Product: mockSearchResponse.CatalogOfferingsResponse.CatalogOfferings.CatalogOffering[0].ProductOptions[0].Product,
        PriceDetail: mockSearchResponse.CatalogOfferingsResponse.CatalogOfferings.CatalogOffering[0].Price,
        TermsAndConditionsFull: {
          PaymentTimeLimit: '2026-08-30T23:59:00Z',
          ValidatingCarrier: 'UA',
          FareRuleInfoText: [{ category: 'MIN_STAY', text: '3 days minimum stay' }],
        },
      },
    },
  };

  const parsedAirPrice = AirPriceParser.parse(mockAirPriceResponse, 'trace-price-01', 95);
  assert(parsedAirPrice.success === true, 'AirPrice parsing succeeded');
  assert(parsedAirPrice.confirmedOffer.offerId === 'offering-001', 'Confirmed offer ID matched');
  assert(parsedAirPrice.confirmedOffer.pricing.totalPrice === 600, 'Confirmed pricing matched');
  assert(parsedAirPrice.confirmedOffer.termsAndConditions.validatingCarrier === 'UA', 'Confirmed validating carrier');
  assert(parsedAirPrice.metadata.transactionId === 'tx-price-888', 'Captured AirPrice transactionId');

  // 5. Standalone Fare Rules Parser Test
  console.log('\n--- 5. Standalone Fare Rules Parser Test ---');
  const mockFareRulesResponse = {
    FareRulesResponse: {
      '@type': 'FareRulesResponse' as const,
      transactionId: 'tx-farerules-777',
      Identifier: { value: 'raw-rules-val-1' },
      FareRuleList: {
        '@type': 'FareRuleList' as const,
        FareRuleInfo: [
          { category: 'CANCELLATION', title: 'Cancellation Policy', text: ['Non-refundable penalty USD 200 apply.'], penaltyAmount: 200, currency: 'USD', refundable: false },
          { category: 'MIN_STAY', title: 'Minimum Stay', text: ['3 days minimum stay requirement.'], refundable: true },
        ],
      },
    },
  };

  const parsedFareRules = FareRulesParser.parse(mockFareRulesResponse, 'offering-001', 'trace-rules-01', 65);
  assert(parsedFareRules.success === true, 'Fare Rules parsing succeeded');
  assert(parsedFareRules.fareRules.ruleCategories.length === 2, 'Parsed 2 rule categories');
  assert(parsedFareRules.fareRules.ruleCategories[0].categoryKey === 'CANCELLATION', 'Category key mapped to CANCELLATION');
  assert(parsedFareRules.metadata.transactionId === 'tx-farerules-777', 'Captured Fare Rules transactionId');

  // 6. Error Handler Test
  console.log('\n--- 6. Error Handler Normalization Test ---');
  const mockTravelportErrPayload = {
    StatusCode: 400,
    Message: 'Invalid origin airport code',
    SourceID: 'TVP_AIR_SEARCH',
    SourceCode: 'ERR_INVALID_AIRPORT',
    Category: 'ValidationError',
  };

  const normalizedErr = TravelportErrorHandler.handle(
    { response: { status: 400, data: mockTravelportErrPayload } },
    'trace-err-01'
  );

  assert(normalizedErr.statusCode === 400, 'Error status code parsed as 400');
  assert(normalizedErr.category === ErrorCategory.VALIDATION, 'Error category parsed as ValidationError');
  assert(normalizedErr.message === 'Invalid origin airport code', 'Error message extracted correctly');
  const dtoErr = normalizedErr.toNormalizedDto();
  assert(dtoErr.success === false, 'Error DTO has success: false');
  assert(dtoErr.error.traceId === 'trace-err-01', 'Error DTO preserves traceId');

  console.log('\n===========================================================');
  console.log(`   Phase 1 Test Suite Complete: ${passed} Passed, ${failed} Failed`);
  console.log('===========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase1Tests().catch((err) => {
  console.error('Fatal error running Phase 1 test suite:', err);
  process.exit(1);
});
