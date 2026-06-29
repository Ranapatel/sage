import {
  SearchTrainsInput,
  SearchTrainsResult,
  SearchBusesInput,
  SearchBusesResult,
} from '../../types/transport';

export interface ITransportProvider {
  name: string;
  searchTrains?(input: SearchTrainsInput): Promise<SearchTrainsResult>;
  searchBuses?(input: SearchBusesInput): Promise<SearchBusesResult>;
  getTrainBookingUrl(input: SearchTrainsInput): string;
  getBusBookingUrl(input: SearchBusesInput): string;
}
