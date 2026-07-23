import { RawAirPriceResponse } from '../types/raw.types';
import { AirPriceResponseDto, TermsAndConditionsDto } from '../types/dto.types';
import { FlightSearchParser } from './flightSearch.parser';

export class AirPriceParser {
  public static parse(
    rawResponse: RawAirPriceResponse,
    traceId: string,
    processingTimeMs: number
  ): AirPriceResponseDto {
    const offerListRes = rawResponse?.OfferListResponse;
    const transactionId = offerListRes?.transactionId;
    const offer = offerListRes?.OfferID;

    const offerId = offer?.id || offerListRes?.Identifier?.value || 'confirmed-offer-id';
    const authority = offerListRes?.Identifier?.authority || offer?.Identifier?.authority;
    const rawIdentifierValue = offer?.Identifier?.value || offerListRes?.Identifier?.value || offerId;

    // Use FlightSearchParser for pricing, branded fare, baggage allowance, segments
    const mockOffering: any = {
      id: offerId,
      Identifier: { value: rawIdentifierValue, authority },
      ProductOptions: [{ id: 'po-1', Product: offer?.Product || [] }],
      Price: offer?.PriceDetail,
      TermsAndConditionsFull: offer?.TermsAndConditionsFull,
    };

    const parsedSearch = FlightSearchParser.parse(
      {
        CatalogOfferingsResponse: {
          '@type': 'CatalogOfferingsResponse',
          transactionId,
          CatalogOfferings: {
            '@type': 'CatalogOfferings',
            id: offerId,
            CatalogOffering: [mockOffering],
          },
        },
      },
      traceId,
      processingTimeMs
    );

    const firstOffer = parsedSearch.offers[0];

    const termsAndConditions: TermsAndConditionsDto = {
      ticketingDeadline: offer?.TermsAndConditionsFull?.PaymentTimeLimit,
      validatingCarrier: offer?.TermsAndConditionsFull?.ValidatingCarrier || firstOffer?.validatingCarrier,
      rulesSummaryText: (offer?.TermsAndConditionsFull?.FareRuleInfoText || []).map(
        (rule) => `${rule.category ? rule.category + ': ' : ''}${rule.text || ''}`
      ),
    };

    return {
      success: true,
      metadata: {
        traceId,
        transactionId,
        timestamp: new Date().toISOString(),
        processingTimeMs,
        totalResults: 1,
      },
      confirmedOffer: {
        offerId,
        validatingCarrier: firstOffer?.validatingCarrier || 'YY',
        pricing: firstOffer?.pricing || {
          baseFare: 0,
          totalTaxes: 0,
          totalPrice: 0,
          currency: 'USD',
          passengerBreakdown: [],
        },
        legs: firstOffer?.legs || [],
        brandedFare: firstOffer?.brandedFare,
        baggageAllowance: firstOffer?.baggageAllowance || [],
        termsAndConditions,
        travelportIdentifiers: {
          catalogOfferingId: offerId,
          offerId,
          productOptionIds: firstOffer?.travelportIdentifiers?.productOptionIds || [],
          productIds: firstOffer?.travelportIdentifiers?.productIds || [],
          segmentRefs: firstOffer?.travelportIdentifiers?.segmentRefs || [],
          authority,
          rawIdentifierValue,
        },
      },
    };
  }
}
