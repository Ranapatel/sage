import { SearchTrainsInput, TrainResult } from '../../types/trains';

/**
 * Strategy B Scraper stub.
 * This class encapsulates scraping live train lists using Puppeteer/Playwright.
 */
export class MMTTrainScraper {
  /**
   * Scrapes live train schedules and availability from MakeMyTrip.
   */
  public async scrape(params: SearchTrainsInput): Promise<TrainResult[]> {
    // Strategy B is currently a stub/pluggable strategy and will be fully implemented later.
    // In this stub, we return an empty array or can return mock results if enabled by environment.
    if (process.env.ENABLE_MOCK_SCRAPER === 'true') {
      return this.getMockResults(params);
    }
    return [];
  }

  private getMockResults(params: SearchTrainsInput): TrainResult[] {
    const preferred = params.preferredClass || '3A';
    return [
      {
        trainNumber: '12952',
        trainName: 'Mumbai Rajdhani',
        departure: '16:55',
        arrival: '08:35',
        duration: '15h 40m',
        runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        availableClasses: [
          {
            class: preferred,
            className: this.getClassName(preferred),
            available: true,
            price: 2050,
            availability: 'AVAILABLE',
          },
        ],
        bookingUrl: 'https://www.makemytrip.com/railways/listing.html',
      },
    ];
  }

  private getClassName(c: string): string {
    switch (c) {
      case 'SL': return 'Sleeper Class';
      case '3A': return 'AC 3 Tier';
      case '2A': return 'AC 2 Tier';
      case '1A': return 'AC First Class';
      case 'CC': return 'Chair Car';
      case 'EC': return 'Executive Chair Car';
      default: return 'AC 3 Tier';
    }
  }
}
