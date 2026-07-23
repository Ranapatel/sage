import { TravelerDetails } from '../../infrastructure/travelport/adapters/travelport-workbench.adapter';

export class CreateBookingDto {
  offerRef: string;
  travelers: TravelerDetails[];
  userId?: string;
}
