import { SearchTrainsInput, StationInfo, TrainResult } from '../../types/trains';

export interface ITrainProvider {
  name: string;
  buildSearchUrl(
    params: SearchTrainsInput,
    origin: StationInfo,
    destination: StationInfo,
  ): string;
  search?(params: SearchTrainsInput): Promise<TrainResult[]>;
}
