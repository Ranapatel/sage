import { Test, TestingModule } from '@nestjs/testing';
import { MakeMyTripProvider } from './providers/MakeMyTripProvider';
import { StationResolver } from './services/StationResolver';
import { CitySlugService } from './services/CitySlugService';
import { MMTTrainScraper } from './providers/makemytrip/MMTTrainScraper';
import { MMTBusScraper } from './providers/makemytrip/MMTBusScraper';

describe('MakeMyTripProvider', () => {
  let provider: MakeMyTripProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MakeMyTripProvider,
        {
          provide: StationResolver,
          useValue: {
            resolve: jest.fn().mockImplementation((query: string) => {
              if (query === 'Goa' || query === 'MAO') {
                return Promise.resolve({
                  name: 'Madgaon Junction',
                  code: 'MAO',
                  city: 'Goa',
                });
              }
              return Promise.resolve({
                name: 'Mumbai CSMT',
                code: 'CSTM',
                city: 'Mumbai',
              });
            }),
            resolveCodeSync: jest.fn().mockImplementation((query: string) => {
              if (query === 'MAO' || query === 'Goa') {
                return 'MAO';
              }
              return 'CSTM';
            }),
          },
        },
        {
          provide: CitySlugService,
          useValue: {
            resolve: jest.fn().mockImplementation((query: string) => {
              if (query.toLowerCase() === 'pune') {
                return Promise.resolve({ name: 'Pune', slug: 'pune' });
              }
              return Promise.resolve({ name: 'Mumbai', slug: 'mumbai' });
            }),
            resolveSlugSync: jest.fn().mockImplementation((query: string) => {
              if (query.toLowerCase() === 'pune') {
                return 'pune';
              }
              return 'mumbai';
            }),
          },
        },
        {
          provide: MMTTrainScraper,
          useValue: {
            scrape: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: MMTBusScraper,
          useValue: {
            scrape: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    provider = module.get<MakeMyTripProvider>(MakeMyTripProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('getTrainBookingUrl', () => {
    it('should generate official MMT train URL pattern', () => {
      const url = provider.getTrainBookingUrl({
        departureCity: 'CSTM',
        destinationCity: 'MAO',
        departureDate: '2025-08-15',
        passengers: 1,
        travelClass: '3A',
      });
      expect(url).toBe(
        'https://www.makemytrip.com/railways/listing.html?from=CSTM&to=MAO&departDate=2025-08-15&pax=1&class=3A',
      );
    });
  });

  describe('getBusBookingUrl', () => {
    it('should generate official MMT bus URL pattern', () => {
      const url = provider.getBusBookingUrl({
        departureCity: 'mumbai',
        destinationCity: 'pune',
        departureDate: '2026-08-15',
      });
      expect(url).toBe(
        'https://www.makemytrip.com/bus-tickets/mumbai-to-pune/?dd=15&mm=08&yy=2026',
      );
    });
  });

  describe('searchTrains', () => {
    it('should return SearchTrainsResult structure', async () => {
      const result = (await provider.searchTrains({
        departureCity: 'Mumbai',
        destinationCity: 'Goa',
        departureDate: '2025-08-15',
        passengers: 1,
        travelClass: '3A',
      })) as {
        provider: string;
        origin: { code: string };
        searchUrl: string;
        results: unknown[];
      };
      expect(result.provider).toBe('MakeMyTrip');
      expect(result.origin.code).toBe('CSTM');
      expect(result.searchUrl).toContain('listing.html');
      expect(result.results).toEqual([]);
    });
  });

  describe('searchBuses', () => {
    it('should return SearchBusesResult structure', async () => {
      const result = (await provider.searchBuses({
        departureCity: 'Mumbai',
        destinationCity: 'Pune',
        departureDate: '2026-08-15',
      })) as {
        provider: string;
        origin: { slug: string };
        searchUrl: string;
        results: unknown[];
      };
      expect(result.provider).toBe('MakeMyTrip');
      expect(result.origin.slug).toBe('mumbai');
      expect(result.searchUrl).toContain('bus-tickets');
      expect(result.results).toEqual([]);
    });
  });
});
