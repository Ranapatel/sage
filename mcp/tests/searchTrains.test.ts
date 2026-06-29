import { StationCodeResolver } from '../src/services/stationResolver';
import { TrainUrlBuilder } from '../src/services/trainUrlBuilder';
import { executeSearchTrains } from '../src/tools/searchTrains';
import { MMTTrainProvider } from '../src/providers/makemytrip/MMTTrainProvider';

describe('StationCodeResolver', () => {
  it('should resolve "mumbai" case-insensitively', async () => {
    const res = await StationCodeResolver.resolve('mumbai');
    expect(res).toBeDefined();
    expect(res.code).toBe('CSTM');
    expect(res.city).toBe('Mumbai');
  });

  it('should resolve station code "CSTM"', async () => {
    const res = await StationCodeResolver.resolve('CSTM');
    expect(res).toBeDefined();
    expect(res.code).toBe('CSTM');
  });

  it('should resolve "Mumbai CST" case-insensitively', async () => {
    const res = await StationCodeResolver.resolve('Mumbai CST');
    expect(res).toBeDefined();
    expect(res.code).toBe('CSTM');
  });

  it('should return suggestions on resolution failure', async () => {
    expect.assertions(4);
    try {
      await StationCodeResolver.resolve('UnknownPlaceXYZ');
    } catch (e: any) {
      expect(e.status).toBe('error');
      expect(e.code).toBe('STATION_NOT_FOUND');
      expect(e.suggestions).toBeDefined();
      expect(e.suggestions.length).toBeGreaterThan(0);
    }
  });
});

describe('TrainUrlBuilder', () => {
  it('should build correct URL with all class codes, dates, and passengers', () => {
    const urlSL = TrainUrlBuilder.buildMMTTrainUrl({
      originCode: 'CSTM',
      destinationCode: 'MAO',
      travelDate: '2025-08-15',
      passengers: 2,
      trainClass: 'SL',
    });
    expect(urlSL).toContain('class=SL');
    expect(urlSL).toContain('from=CSTM');
    expect(urlSL).toContain('to=MAO');
    expect(urlSL).toContain('departDate=2025-08-15');
    expect(urlSL).toContain('pax=2');

    const url3A = TrainUrlBuilder.buildMMTTrainUrl({
      originCode: 'NDLS',
      destinationCode: 'HWH',
      travelDate: '2026-01-01',
      passengers: 1,
      trainClass: '3A',
    });
    expect(url3A).toContain('class=3A');
    expect(url3A).toContain('from=NDLS');
    expect(url3A).toContain('to=HWH');
  });
});

describe('searchTrains tool handler', () => {
  const getFutureDate = (daysAhead: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  it('should return error for past travel dates', async () => {
    const res: any = await executeSearchTrains({
      originStation: 'Mumbai',
      destinationStation: 'Goa',
      travelDate: '2020-01-01',
      passengers: 1,
      preferredClass: '3A',
    });
    expect(res.status).toBe('error');
    expect(res.code).toBe('INVALID_DATE');
  });

  it('should return searchUrl even when results array is empty', async () => {
    process.env.ENABLE_MOCK_SCRAPER = 'false';
    const futureDate = getFutureDate(10);
    
    const res: any = await executeSearchTrains({
      originStation: 'Mumbai',
      destinationStation: 'Goa',
      travelDate: futureDate,
      passengers: 2,
      preferredClass: '3A',
    });

    expect(res.provider).toBe('MakeMyTrip');
    expect(res.searchUrl).toBeDefined();
    expect(res.searchUrl).toContain('from=CSTM');
    expect(res.searchUrl).toContain('to=MAO');
    expect(res.results).toEqual([]);
    expect(res.totalResults).toBe(0);
  });

  it('should fallback gracefully to Strategy A (deep link) on provider/scraper failure', async () => {
    // Force search to fail by mocking provider.search to throw an error
    const spy = jest.spyOn(MMTTrainProvider.prototype, 'search').mockRejectedValue(new Error('Scraping Timeout'));
    const futureDate = getFutureDate(11);

    const res: any = await executeSearchTrains({
      originStation: 'Mumbai',
      destinationStation: 'Goa',
      travelDate: futureDate,
      passengers: 1,
      preferredClass: '3A',
    });

    expect(res.status).toBe('unavailable');
    expect(res.code).toBe('PROVIDER_UNAVAILABLE');
    expect(res.searchUrl).toBeDefined();
    expect(res.searchUrl).toContain('from=CSTM');
    expect(res.searchUrl).toContain('to=MAO');
    
    spy.mockRestore();
  });
});
