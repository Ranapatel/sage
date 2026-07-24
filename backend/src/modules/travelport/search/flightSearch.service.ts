import { TravelportClient } from '../client/travelport.client';
import { TRAVELPORT_ENDPOINTS, PASSENGER_TYPES } from '../constants/travelport.constants';
import { FlightSearchRequestDto, FlightSearchResponseDto } from '../types/dto.types';
import { RawCatalogOfferingsQueryRequest, RawPassengerCriteria, RawCatalogOfferingsResponse } from '../types/raw.types';
import { FlightSearchParser } from '../parsers/flightSearch.parser';
import { getOrCreateTraceId } from '../utils/trace.utils';

export class FlightSearchService {
  private client: TravelportClient;

  constructor() {
    this.client = TravelportClient.getInstance();
  }

  /**
   * Executes a Flight Search query (One-Way, Round-Trip, or Multi-City).
   */
  public async searchFlights(requestDto: FlightSearchRequestDto): Promise<FlightSearchResponseDto> {
    const traceId = getOrCreateTraceId(requestDto.traceId);
    const startTime = Date.now();

    // Construct raw CatalogOfferingsQueryRequest payload
    const rawPayload = this.buildRawSearchPayload(requestDto);

    // Call central Travelport Client
    const clientResponse = await this.client.post<RawCatalogOfferingsResponse>(
      TRAVELPORT_ENDPOINTS.CATALOG_OFFERINGS,
      rawPayload,
      { traceId }
    );

    const processingTimeMs = Date.now() - startTime;

    // Parse and return normalized response
    return FlightSearchParser.parse(clientResponse.data, traceId, processingTimeMs);
  }

  private buildRawSearchPayload(dto: FlightSearchRequestDto): RawCatalogOfferingsQueryRequest {
    const passengerCriteria: RawPassengerCriteria[] = [];

    if (dto.passengers.adults > 0) {
      passengerCriteria.push({ value: PASSENGER_TYPES.ADULT, number: dto.passengers.adults });
    }
    if (dto.passengers.children && dto.passengers.children > 0) {
      passengerCriteria.push({ value: PASSENGER_TYPES.CHILD, number: dto.passengers.children });
    }
    if (dto.passengers.infantsOnLap && dto.passengers.infantsOnLap > 0) {
      passengerCriteria.push({ value: PASSENGER_TYPES.INFANT_LAP, number: dto.passengers.infantsOnLap });
    }
    if (dto.passengers.infantsInSeat && dto.passengers.infantsInSeat > 0) {
      passengerCriteria.push({ value: PASSENGER_TYPES.INFANT_SEAT, number: dto.passengers.infantsInSeat });
    }
    if (dto.passengers.youths && dto.passengers.youths > 0) {
      passengerCriteria.push({ value: PASSENGER_TYPES.YOUTH, number: dto.passengers.youths });
    }
    if (dto.passengers.seniors && dto.passengers.seniors > 0) {
      passengerCriteria.push({ value: PASSENGER_TYPES.SENIOR, number: dto.passengers.seniors });
    }

    if (passengerCriteria.length === 0) {
      passengerCriteria.push({ value: PASSENGER_TYPES.ADULT, number: 1 });
    }

    const searchCriteriaFlight = dto.legs.map((leg) => ({
      '@type': 'SearchCriteriaFlight' as const,
      departureDate: leg.departureDate,
      departureTime: leg.departureTime,
      From: { value: leg.origin.toUpperCase() },
      To: { value: leg.destination.toUpperCase() },
    }));

    const searchModifiersAir: any = {
      '@type': 'SearchModifiersAir',
    };

    if (dto.modifiers?.cabinPreference) {
      searchModifiersAir.CabinPreference = [dto.modifiers.cabinPreference];
    }
    if (dto.modifiers?.directFlightsOnly !== undefined) {
      searchModifiersAir.DirectFlightsOnly = dto.modifiers.directFlightsOnly;
    }
    if (dto.modifiers?.maxStops !== undefined) {
      searchModifiersAir.MaxStops = dto.modifiers.maxStops;
    }

    return {
      CatalogProductOfferingsQueryRequest: {
        '@type': 'CatalogProductOfferingsQueryRequest',
        CatalogProductOfferingsRequest: {
          '@type': 'CatalogProductOfferingsRequestAir',
          PassengerCriteria: passengerCriteria,
          SearchCriteriaFlight: searchCriteriaFlight,
          SearchModifiersAir: searchModifiersAir,
        },
      },
    } as any;
  }
}
