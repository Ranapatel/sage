import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransportController } from './controllers/TransportController';
import { TransportService } from './services/TransportService';
import { StationResolver } from './services/StationResolver';
import { CitySlugService } from './services/CitySlugService';
import { TransportCacheService } from './services/TransportCacheService';
import { MakeMyTripProvider } from './providers/MakeMyTripProvider';
import { UberProvider } from './providers/UberProvider';
import { MMTTrainScraper } from './providers/makemytrip/MMTTrainScraper';
import { MMTBusScraper } from './providers/makemytrip/MMTBusScraper';

import { FlightsModule } from './modules/flights/flights.module';

@Module({
  imports: [FlightsModule],
  controllers: [AppController, TransportController],
  providers: [
    AppService,
    TransportService,
    StationResolver,
    CitySlugService,
    TransportCacheService,
    MakeMyTripProvider,
    UberProvider,
    MMTTrainScraper,
    MMTBusScraper,
  ],
})
export class AppModule {}
