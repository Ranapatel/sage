import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { TransportService } from '../services/TransportService';
import {
  CreateUberLinkDto,
  TrainSearchDto,
  BusSearchDto,
  SearchTrainsResult,
  SearchBusesResult,
} from '../types/transport';

@ApiTags('Transport')
@Controller()
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Post('transport/uber')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate an Uber deep link to a destination' })
  @ApiBody({ type: CreateUberLinkDto })
  generateUberLink(@Body() dto: CreateUberLinkDto) {
    return this.transportService.generateLink('uber', dto);
  }

  @Post('train/search')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Search train itineraries and get MakeMyTrip booking deep links',
  })
  @ApiBody({ type: TrainSearchDto })
  async searchTrains(@Body() dto: TrainSearchDto): Promise<SearchTrainsResult> {
    return this.transportService.searchTrains(dto);
  }

  @Post('bus/search')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Search bus itineraries and get MakeMyTrip booking deep links',
  })
  @ApiBody({ type: BusSearchDto })
  async searchBuses(@Body() dto: BusSearchDto): Promise<SearchBusesResult> {
    return this.transportService.searchBuses(dto);
  }
}
