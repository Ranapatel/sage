import { Injectable, BadRequestException } from '@nestjs/common';
import { ITransportProvider } from './interfaces/ITransportProvider';
import { CreateUberLinkDto } from '../types/transport';

@Injectable()
export class UberProvider implements ITransportProvider {
  public readonly name = 'Uber';

  generateLink(dto: CreateUberLinkDto): string {
    const { destinationName, latitude, longitude, pickupType } = dto;

    // Coordinate validation
    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException(
        'Latitude must be between -90 and 90 degrees.',
      );
    }
    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException(
        'Longitude must be between -180 and 180 degrees.',
      );
    }

    const pickup = pickupType || 'my_location';
    const encodedName = encodeURIComponent(destinationName);

    const url = `https://m.uber.com/ul/?action=setPickup&pickup=${pickup}&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[nickname]=${encodedName}`;
    console.log('[NestJS UberProvider] Generated Uber URL:', url);
    return url;
  }

  getTrainBookingUrl(): string {
    throw new BadRequestException('Uber does not support train bookings.');
  }

  getBusBookingUrl(): string {
    throw new BadRequestException('Uber does not support bus bookings.');
  }
}
