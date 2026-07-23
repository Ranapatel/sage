import {
  RawCatalogOfferingsResponse,
  RawCatalogOffering,
  RawFlightSegment,
  RawBrand,
  RawBaggageAllowance,
} from '../types/raw.types';
import {
  FlightSearchResponseDto,
  FlightOfferDto,
  FlightSegmentDto,
  BrandedFareInfoDto,
  BaggageAllowanceDto,
  TotalPricingDto,
  PassengerPriceBreakdownDto,
  TravelportIdentifiersDto,
} from '../types/dto.types';

export class FlightSearchParser {
  public static parse(
    rawResponse: any,
    traceId: string,
    processingTimeMs: number
  ): FlightSearchResponseDto {
    const root = rawResponse?.CatalogProductOfferingsResponse || rawResponse?.CatalogOfferingsResponse || rawResponse;
    const transactionId = root?.transactionId;

    const rawOfferings: RawCatalogOffering[] =
      root?.CatalogProductOfferings?.CatalogProductOffering ||
      root?.CatalogOfferings?.CatalogOffering ||
      root?.CatalogProductOfferings ||
      root?.CatalogOfferings ||
      (Array.isArray(root) ? root : []);
    const flightReferenceList: RawFlightSegment[] = root?.ReferenceListFlight || root?.ReferenceList || [];
    const brandReferenceList: RawBrand[] = root?.ReferenceListBrand || [];

    const flightRefMap = new Map<string, RawFlightSegment>();
    flightReferenceList.forEach((seg) => {
      if (seg.id) flightRefMap.set(seg.id, seg);
    });

    const parsedOffers: FlightOfferDto[] = rawOfferings.map((offering) => {
      const offerId = offering.id || offering.Identifier?.value || 'unknown-offer-id';
      const authority = offering.Identifier?.authority;
      const rawIdentifierValue = offering.Identifier?.value || offerId;
      const catalogOfferingId = root?.CatalogOfferings?.id || offering.id || offerId;

      const productOptionIds: string[] = [];
      const productIds: string[] = [];
      const segmentRefs: string[] = [];
      const extractedSegments: FlightSegmentDto[] = [];
      let validatingCarrier = 'YY';

      if (offering.TermsAndConditionsFull?.ValidatingCarrier) {
        validatingCarrier = offering.TermsAndConditionsFull.ValidatingCarrier;
      }

      // Extract Products and Segments
      if (offering.ProductOptions && offering.ProductOptions.length > 0) {
        offering.ProductOptions.forEach((prodOpt) => {
          if (prodOpt.id) productOptionIds.push(prodOpt.id);

          prodOpt.Product?.forEach((prod) => {
            if (prod.id) productIds.push(prod.id);

            // Directly nested FlightSegments
            if (prod.FlightSegment && prod.FlightSegment.length > 0) {
              prod.FlightSegment.forEach((seg) => {
                const parsedSeg = this.parseSegment(seg);
                extractedSegments.push(parsedSeg);
                segmentRefs.push(parsedSeg.segmentId);
                if (!validatingCarrier || validatingCarrier === 'YY') {
                  validatingCarrier = parsedSeg.carrierCode;
                }
              });
            }

            // PassengerFlight references to segments
            if (prod.PassengerFlight && prod.PassengerFlight.length > 0) {
              prod.PassengerFlight.forEach((pf) => {
                if (pf.flightSegmentRef && flightRefMap.has(pf.flightSegmentRef)) {
                  const refSeg = flightRefMap.get(pf.flightSegmentRef)!;
                  const parsedSeg = this.parseSegment(refSeg, pf.cabin, pf.classOfService, pf.fareBasisCode);
                  if (!extractedSegments.some((s) => s.segmentId === parsedSeg.segmentId)) {
                    extractedSegments.push(parsedSeg);
                    segmentRefs.push(parsedSeg.segmentId);
                  }
                }
              });
            }
          });
        });
      }

      // Group segments into legs
      const legs = [
        {
          legIndex: 0,
          origin: extractedSegments[0]?.originAirport || '',
          destination: extractedSegments[extractedSegments.length - 1]?.destinationAirport || '',
          durationMinutes: extractedSegments.reduce((acc, s) => acc + (s.durationMinutes || 0), 0),
          segments: extractedSegments,
        },
      ];

      // Parse Pricing
      const pricing: TotalPricingDto = this.parsePricing(offering.Price);

      // Parse Branded Fare
      const brandedFare = this.parseBrandedFare(offering, brandReferenceList);

      // Parse Baggage Allowance
      const baggageAllowance = this.parseBaggageAllowance(offering.TermsAndConditionsFull?.BaggageAllowanceDetail);

      const travelportIdentifiers: TravelportIdentifiersDto = {
        catalogOfferingId,
        offerId,
        productOptionIds,
        productIds,
        segmentRefs,
        authority,
        rawIdentifierValue,
        offerResponseRef: offering.OfferResponseRef,
      };

      return {
        offerId,
        validatingCarrier,
        pricing,
        legs,
        brandedFare,
        baggageAllowance,
        ticketingDeadline: offering.TermsAndConditionsFull?.PaymentTimeLimit,
        travelportIdentifiers,
      };
    });

    return {
      success: true,
      metadata: {
        traceId,
        transactionId,
        timestamp: new Date().toISOString(),
        processingTimeMs,
        totalResults: parsedOffers.length,
      },
      offers: parsedOffers,
    };
  }

  private static parseSegment(
    seg: RawFlightSegment,
    fallbackCabin?: string,
    fallbackClass?: string,
    fallbackFareBasis?: string
  ): FlightSegmentDto {
    const depTimeStr = `${seg.Departure?.date}T${seg.Departure?.time || '00:00:00'}`;
    const arrTimeStr = `${seg.Arrival?.date}T${seg.Arrival?.time || '00:00:00'}`;
    const durationMinutes = this.parseIsoDurationToMinutes(seg.duration);

    return {
      segmentId: seg.id || `seg-${seg.carrier}-${seg.flightNumber}`,
      sequence: seg.sequence || 1,
      carrierCode: seg.carrier || 'YY',
      flightNumber: seg.flightNumber || '000',
      operatingCarrierCode: seg.operatingCarrier || seg.carrier,
      operatingFlightNumber: seg.operatingFlightNumber || seg.flightNumber,
      aircraftEquipment: seg.equipment,
      originAirport: seg.Departure?.location || 'XXX',
      originTerminal: seg.Departure?.terminal,
      departureDateTime: depTimeStr,
      destinationAirport: seg.Arrival?.location || 'YYY',
      destinationTerminal: seg.Arrival?.terminal,
      arrivalDateTime: arrTimeStr,
      durationMinutes,
      formattedDuration: durationMinutes ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m` : undefined,
      stopsCount: seg.numberOfStops || 0,
      cabin: fallbackCabin || 'Economy',
      classOfService: fallbackClass,
      fareBasisCode: fallbackFareBasis,
    };
  }

  private static parsePricing(rawPrice: any): TotalPricingDto {
    if (!rawPrice) {
      return { baseFare: 0, totalTaxes: 0, totalPrice: 0, currency: 'USD', passengerBreakdown: [] };
    }

    const passengerBreakdown: PassengerPriceBreakdownDto[] = [];

    if (rawPrice.PriceBreakdownAir && Array.isArray(rawPrice.PriceBreakdownAir)) {
      rawPrice.PriceBreakdownAir.forEach((pb: any) => {
        passengerBreakdown.push({
          passengerType: pb.PassengerType || 'ADT',
          quantity: pb.Quantity || 1,
          baseFare: pb.Amount?.Base || 0,
          taxes: pb.Amount?.Taxes || 0,
          totalPrice: pb.Amount?.Total || 0,
          currency: pb.Amount?.CurrencyCode || rawPrice.CurrencyCode || 'USD',
          taxBreakdown: (pb.TaxBreakdown || []).map((t: any) => ({
            code: t.code || 'TAX',
            amount: t.amount || 0,
            currency: t.currency || pb.Amount?.CurrencyCode || 'USD',
          })),
        });
      });
    }

    return {
      baseFare: rawPrice.TotalBase || 0,
      totalTaxes: rawPrice.TotalTaxes || 0,
      totalPrice: rawPrice.TotalPrice || 0,
      currency: rawPrice.CurrencyCode || 'USD',
      passengerBreakdown,
    };
  }

  private static parseBrandedFare(offering: RawCatalogOffering, brandRefList: RawBrand[]): BrandedFareInfoDto | undefined {
    let rawBrand: RawBrand | undefined;

    // Check PassengerFlight for brand ref or embedded brand
    offering.ProductOptions?.forEach((po) => {
      po.Product?.forEach((p) => {
        p.PassengerFlight?.forEach((pf) => {
          if (pf.Brand) rawBrand = pf.Brand;
        });
      });
    });

    if (!rawBrand && brandRefList.length > 0) {
      rawBrand = brandRefList[0];
    }

    if (!rawBrand) return undefined;

    return {
      brandName: rawBrand.name || 'Standard Fare',
      brandCode: rawBrand.brandCode,
      brandTier: rawBrand.brandTier,
      attributes: (rawBrand.BrandAttribute || []).map((attr) => ({
        name: attr.name,
        inclusion: attr.inclusion,
        classification: attr.classification,
        description: attr.description,
      })),
    };
  }

  private static parseBaggageAllowance(rawBags?: RawBaggageAllowance[]): BaggageAllowanceDto[] {
    if (!rawBags || rawBags.length === 0) {
      return [
        {
          passengerType: 'ADT',
          baggageType: 'Checked',
          formattedSummary: 'Standard airline baggage rules apply',
        },
      ];
    }

    return rawBags.map((bag) => {
      let formattedSummary = '';
      if (bag.maxPieces !== undefined) {
        formattedSummary = `${bag.maxPieces} ${bag.baggageType || 'Checked'} piece(s) included`;
      } else if (bag.maxWeight) {
        formattedSummary = `${bag.maxWeight.value}${bag.maxWeight.unit} ${bag.baggageType || 'Checked'} baggage included`;
      } else {
        formattedSummary = `${bag.baggageType || 'Checked'} baggage included`;
      }

      return {
        passengerType: bag.passengerType || 'ADT',
        maxPieces: bag.maxPieces,
        maxWeightValue: bag.maxWeight?.value,
        maxWeightUnit: bag.maxWeight?.unit,
        baggageType: bag.baggageType || 'Checked',
        formattedSummary,
      };
    });
  }

  private static parseIsoDurationToMinutes(durationStr?: string): number | undefined {
    if (!durationStr) return undefined;
    // Format PT2H30M or PT150M
    const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return undefined;
    const hours = parseInt(match[1] || '0', 10);
    const mins = parseInt(match[2] || '0', 10);
    return hours * 60 + mins;
  }
}
