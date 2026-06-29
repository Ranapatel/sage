import { Injectable } from '@nestjs/common';
import { BusResult } from '../../types/transport';

interface StaticRoute {
  operatorName: string;
  busType: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  seatsAvailable: number;
}

const STATIC_BUS_ROUTES: Record<string, StaticRoute[]> = {
  'delhi-manali': [
    { operatorName: 'Himalayan Nomad', busType: 'Volvo Multi-Axle AC Semi-Sleeper', departure: '20:30', arrival: '08:30', duration: '12h 00m', price: 1450, seatsAvailable: 12 },
    { operatorName: 'Laxmi Holidays', busType: 'Volvo AC Sleeper (2+1)', departure: '21:00', arrival: '09:30', duration: '12h 30m', price: 1290, seatsAvailable: 8 },
    { operatorName: 'Zingbus', busType: 'Volvo Multi-Axle AC Sleeper', departure: '19:45', arrival: '07:45', duration: '12h 00m', price: 1520, seatsAvailable: 15 }
  ],
  'delhi-jaipur': [
    { operatorName: 'Goldline Travels', busType: 'AC Seater (2+2)', departure: '07:00', arrival: '12:30', duration: '5h 30m', price: 450, seatsAvailable: 22 },
    { operatorName: 'Zingbus', busType: 'Volvo AC Semi-Sleeper (2+2)', departure: '14:30', arrival: '19:45', duration: '5h 15m', price: 650, seatsAvailable: 18 },
    { operatorName: 'VRL Travels', busType: 'Volvo Multi-Axle AC Sleeper', departure: '23:30', arrival: '04:45', duration: '5h 15m', price: 900, seatsAvailable: 10 }
  ],
  'mumbai-pune': [
    { operatorName: 'MSRTC Shivneri', busType: 'Volvo AC Semi-Sleeper (2+2)', departure: '06:00', arrival: '09:30', duration: '3h 30m', price: 515, seatsAvailable: 34 },
    { operatorName: 'MSRTC Shivneri', busType: 'Volvo AC Semi-Sleeper (2+2)', departure: '08:00', arrival: '11:30', duration: '3h 30m', price: 515, seatsAvailable: 29 },
    { operatorName: 'Neeta Travels', busType: 'AC Sleeper (2+1)', departure: '14:00', arrival: '18:00', duration: '4h 00m', price: 600, seatsAvailable: 14 }
  ],
  'bangalore-hyderabad': [
    { operatorName: 'VRL Travels', busType: 'Volvo Multi-Axle AC Sleeper', departure: '21:30', arrival: '06:30', duration: '9h 00m', price: 1100, seatsAvailable: 19 },
    { operatorName: 'Orange Travels', busType: 'Scania Multi-Axle AC Sleeper', departure: '22:15', arrival: '07:15', duration: '9h 00m', price: 1250, seatsAvailable: 24 },
    { operatorName: 'KSRTC Airavat', busType: 'Volvo AC Club Class', departure: '20:45', arrival: '05:30', duration: '8h 45m', price: 1050, seatsAvailable: 12 }
  ],
  'bangalore-chennai': [
    { operatorName: 'SRS Travels', busType: 'AC Seater (2+2)', departure: '08:30', arrival: '14:30', duration: '6h 00m', price: 550, seatsAvailable: 28 },
    { operatorName: 'KSRTC Airavat', busType: 'Volvo AC Semi-Sleeper', departure: '14:15', arrival: '20:15', duration: '6h 00m', price: 720, seatsAvailable: 16 },
    { operatorName: 'Asian Xpress', busType: 'Volvo Multi-Axle AC Sleeper', departure: '23:00', arrival: '05:00', duration: '6h 00m', price: 950, seatsAvailable: 9 }
  ],
  'mumbai-goa': [
    { operatorName: 'VRL Travels', busType: 'Volvo Multi-Axle AC Sleeper', departure: '19:00', arrival: '08:00', duration: '13h 00m', price: 1400, seatsAvailable: 11 },
    { operatorName: 'Atmaram Travels', busType: 'Volvo AC Sleeper (2+1)', departure: '18:30', arrival: '07:45', duration: '13h 15m', price: 1200, seatsAvailable: 8 },
    { operatorName: 'Paul Travels', busType: 'Bharat Benz AC Sleeper', departure: '20:00', arrival: '09:00', duration: '13h 00m', price: 1350, seatsAvailable: 14 }
  ],
  'hyderabad-goa': [
    { operatorName: 'Orange Travels', busType: 'Volvo Multi-Axle AC Sleeper', departure: '18:00', arrival: '08:30', duration: '14h 30m', price: 1600, seatsAvailable: 21 },
    { operatorName: 'VRL Travels', busType: 'Volvo Multi-Axle AC Sleeper', departure: '19:15', arrival: '09:15', duration: '14h 00m', price: 1750, seatsAvailable: 16 }
  ]
};

@Injectable()
export class MMTBusScraper {
  /**
   * Scrapes/Fetches bus listings. Returns static matches or empty array.
   */
  async scrape(
    originSlug: string,
    destSlug: string,
    date: string,
  ): Promise<BusResult[]> {
    const from = originSlug.toLowerCase().trim();
    const to = destSlug.toLowerCase().trim();
    
    const key1 = `${from}-${to}`;
    const key2 = `${to}-${from}`;

    let staticList = STATIC_BUS_ROUTES[key1] || STATIC_BUS_ROUTES[key2];

    if (!staticList) {
      // Fuzzy lookup
      const matchingKey = Object.keys(STATIC_BUS_ROUTES).find(key => {
        const [kFrom, kTo] = key.split('-');
        return (from.includes(kFrom) && to.includes(kTo)) || (to.includes(kFrom) && from.includes(kTo));
      });
      if (matchingKey) {
        staticList = STATIC_BUS_ROUTES[matchingKey];
      }
    }

    if (staticList) {
      return staticList.map(bus => ({
        id: `${bus.operatorName.replace(/\s+/g, '-')}-${bus.departure}`,
        name: bus.operatorName,
        type: bus.busType,
        price: bus.price,
        departure: bus.departure,
        arrival: bus.arrival,
        duration: bus.duration,
        liveStatus: `${bus.seatsAvailable} seats left`,
      }));
    }

    return [];
  }
}
