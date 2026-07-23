import { Injectable, BadRequestException } from '@nestjs/common';

export interface NDCRestrictionCheckResult {
  isPermitted: boolean;
  warnings: string[];
  blockers: string[];
  recommendation?: string;
}

export interface FlightSegmentCriteria {
  carrierCode: string;
  providerType: 'NDC' | 'GDS' | 'EDIFACT';
  isInterline?: boolean;
}

@Injectable()
export class NDCRestrictionsEngine {

  /**
   * Evaluates an itinerary for NDC operational & carrier restrictions
   */
  evaluateItineraryRestrictions(segments: FlightSegmentCriteria[], paymentMethod?: string): NDCRestrictionCheckResult {
    const blockers: string[] = [];
    const warnings: string[] = [];

    const ndcSegments = segments.filter((s) => s.providerType === 'NDC');
    const gdsSegments = segments.filter((s) => s.providerType === 'GDS' || s.providerType === 'EDIFACT');

    // 1. Detect Mixed GDS + NDC Segments
    if (ndcSegments.length > 0 && gdsSegments.length > 0) {
      blockers.push(
        'Combining NDC and GDS flight segments in a single order is not permitted by Travelport TripServices API rules. Please book NDC and GDS segments as separate orders.',
      );
    }

    // 2. Detect Mixed NDC Airlines
    const uniqueNdcCarriers = Array.from(new Set(ndcSegments.map((s) => s.carrierCode)));
    if (uniqueNdcCarriers.length > 1) {
      blockers.push(
        `Combining multiple NDC carriers (${uniqueNdcCarriers.join(', ')}) in a single booking session is restricted by NDC IATA OrderCreate standards. Please create separate orders for each NDC carrier.`,
      );
    }

    // 3. Detect Payment Method Constraints for NDC Merchant of Record
    if (ndcSegments.length > 0 && paymentMethod === 'UPI') {
      warnings.push(
        'Selected NDC carrier requires Credit/Debit Card Merchant-of-Record payment for instant ticketing. UPI payments require agency pre-authorization.',
      );
    }

    const isPermitted = blockers.length === 0;

    return {
      isPermitted,
      blockers,
      warnings,
      recommendation: isPermitted
        ? 'Itinerary satisfies all NDC IATA OrderCreate standards.'
        : 'Adjust flight selections into separate orders as recommended.',
    };
  }

  /**
   * Asserts itinerary compliance or throws BadRequestException
   */
  validateOrThrow(segments: FlightSegmentCriteria[], paymentMethod?: string): void {
    const result = this.evaluateItineraryRestrictions(segments, paymentMethod);
    if (!result.isPermitted) {
      throw new BadRequestException({
        code: 'NDC_RESTRICTION_VIOLATION',
        message: result.blockers.join(' | '),
        details: result,
      });
    }
  }
}
