import { TrainClass } from '../types/trains';

/**
 * Service to build MakeMyTrip deep links for train search.
 */
export class TrainUrlBuilder {
  /**
   * Constructs the MakeMyTrip train listing URL based on query details.
   */
  public static buildMMTTrainUrl(params: {
    originCode: string;
    destinationCode: string;
    travelDate: string; // YYYY-MM-DD
    passengers: number;
    trainClass: TrainClass;
  }): string {
    const base = 'https://www.makemytrip.com/railways/listing.html';
    const query = new URLSearchParams({
      from: params.originCode,
      to: params.destinationCode,
      departDate: params.travelDate,
      pax: String(params.passengers),
      class: params.trainClass,
    });
    return `${base}?${query.toString()}`;
  }
}
