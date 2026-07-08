import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type TrainClass = 'SL' | '3A' | '2A' | '1A' | 'CC' | 'EC';

export class CreateUberLinkDto {
  @ApiProperty({
    description: 'Name of the destination place',
    example: 'Bangalore Palace',
  })
  @IsString()
  @IsNotEmpty()
  destinationName!: string;

  @ApiProperty({
    description: 'Latitude coordinate of the destination (-90 to 90)',
    example: 12.9987,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({
    description: 'Longitude coordinate of the destination (-180 to 180)',
    example: 77.5921,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiPropertyOptional({
    description: 'Pickup type/location (defaults to my_location)',
    example: 'my_location',
    default: 'my_location',
  })
  @IsString()
  @IsOptional()
  pickupType?: string = 'my_location';
}

export class TrainSearchDto {
  @ApiProperty({
    description: 'Departure city name or station name',
    example: 'New Delhi',
  })
  @IsString()
  @IsNotEmpty()
  departureCity!: string;

  @ApiProperty({
    description: 'Destination city name or station name',
    example: 'Mumbai',
  })
  @IsString()
  @IsNotEmpty()
  destinationCity!: string;

  @ApiProperty({
    description: 'Departure date in YYYY-MM-DD format',
    example: '2026-06-27',
  })
  @IsString()
  @IsNotEmpty()
  departureDate!: string;

  @ApiPropertyOptional({
    description: 'Number of passengers traveling',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  passengers?: number = 1;

  @ApiPropertyOptional({
    description: 'Preferred travel class (SL, 3A, 2A, 1A, CC, EC, ALL)',
    example: 'ALL',
    default: 'ALL',
  })
  @IsString()
  @IsOptional()
  travelClass?: TrainClass | 'ALL' = 'ALL';
}

export class BusSearchDto {
  @ApiProperty({
    description: 'Departure city name',
    example: 'Mumbai',
  })
  @IsString()
  @IsNotEmpty()
  departureCity!: string;

  @ApiProperty({
    description: 'Destination city name',
    example: 'Pune',
  })
  @IsString()
  @IsNotEmpty()
  destinationCity!: string;

  @ApiProperty({
    description: 'Departure date in YYYY-MM-DD format',
    example: '2026-06-27',
  })
  @IsString()
  @IsNotEmpty()
  departureDate!: string;
}

export interface TrainClassFare {
  classCode: string;
  fare: number;
}

export interface TrainResult {
  id: string;
  trainName: string;
  trainNumber: string;
  originStation: string;
  originCode: string;
  destinationStation: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  travelClass: TrainClass;
  trainType: string;
  runsOn: string[];
  classFares: TrainClassFare[];
}

export interface BusResult {
  id: string;
  name: string;
  type: string;
  price: number;
  departure: string;
  arrival: string;
  duration: string;
  rating: number | null;
  amenities: string[];
  seatsAvailable: number | null;
  liveStatus?: string;
  bookingLink?: string;
}

export interface SearchTrainsInput {
  departureCity: string;
  destinationCity: string;
  departureDate: string;
  passengers?: number;
  travelClass?: TrainClass | 'ALL';
}

export interface SearchTrainsResult {
  provider: 'MakeMyTrip';
  origin: { name: string; code: string; city: string };
  destination: { name: string; code: string; city: string };
  travelDate: string;
  preferredClass: TrainClass | 'ALL';
  searchUrl: string;
  results: TrainResult[];
  cacheHit: boolean;
  generatedAt: string;
}

export interface SearchBusesInput {
  departureCity: string;
  destinationCity: string;
  departureDate: string;
}

export interface SearchBusesResult {
  provider: 'MakeMyTrip';
  origin: { name: string; slug: string };
  destination: { name: string; slug: string };
  travelDate: string;
  searchUrl: string;
  results: BusResult[];
  cacheHit: boolean;
  generatedAt: string;
}

export interface StationInfo {
  name: string;
  code: string;
  city: string;
}

export interface CityInfo {
  name: string;
  slug: string;
}
