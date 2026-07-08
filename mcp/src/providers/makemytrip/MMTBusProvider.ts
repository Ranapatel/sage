import { IBusProvider, SearchBusesInput, BusResult } from '../../types/buses';

/**
 * Static Bus Corridor schedule database for Indian routes.
 */
interface StaticRoute {
  operatorName: string;
  busType: string;
  rating: number;
  departure: string;
  arrival: string;
  duration: string;
  amenities: string[];
  price: number;
  seatsAvailable: number;
}

const STATIC_BUS_ROUTES: Record<string, StaticRoute[]> = {
  'delhi-manali': [
    { operatorName: 'Himalayan Nomad', busType: 'Volvo Multi-Axle AC Semi-Sleeper', rating: 4.6, departure: '20:30', arrival: '08:30', duration: '12h 00m', amenities: ['WiFi', 'Charging Port', 'Water Bottle', 'Blanket'], price: 1450, seatsAvailable: 12 },
    { operatorName: 'Laxmi Holidays', busType: 'Volvo AC Sleeper (2+1)', rating: 4.2, departure: '21:00', arrival: '09:30', duration: '12h 30m', amenities: ['Charging Port', 'Blanket', 'Pillow'], price: 1290, seatsAvailable: 8 },
    { operatorName: 'Zingbus', busType: 'Volvo Multi-Axle AC Sleeper', rating: 4.4, departure: '19:45', arrival: '07:45', duration: '12h 00m', amenities: ['WiFi', 'Charging Port', 'Live Tracking', 'Water Bottle'], price: 1520, seatsAvailable: 15 }
  ],
  'delhi-jaipur': [
    { operatorName: 'Goldline Travels', busType: 'AC Seater (2+2)', rating: 3.9, departure: '07:00', arrival: '12:30', duration: '5h 30m', amenities: ['Charging Port', 'Water Bottle'], price: 450, seatsAvailable: 22 },
    { operatorName: 'Zingbus', busType: 'Volvo AC Semi-Sleeper (2+2)', rating: 4.3, departure: '14:30', arrival: '19:45', duration: '5h 15m', amenities: ['WiFi', 'Charging Port', 'Live Tracking'], price: 650, seatsAvailable: 18 },
    { operatorName: 'VRL Travels', busType: 'Volvo Multi-Axle AC Sleeper', rating: 4.5, departure: '23:30', arrival: '04:45', duration: '5h 15m', amenities: ['Charging Port', 'Blanket', 'Water Bottle'], price: 900, seatsAvailable: 10 }
  ],
  'mumbai-pune': [
    { operatorName: 'MSRTC Shivneri', busType: 'Volvo AC Semi-Sleeper (2+2)', rating: 4.5, departure: '06:00', arrival: '09:30', duration: '3h 30m', amenities: ['Charging Port', 'Newspaper'], price: 515, seatsAvailable: 34 },
    { operatorName: 'MSRTC Shivneri', busType: 'Volvo AC Semi-Sleeper (2+2)', rating: 4.4, departure: '08:00', arrival: '11:30', duration: '3h 30m', amenities: ['Charging Port', 'Newspaper'], price: 515, seatsAvailable: 29 },
    { operatorName: 'Neeta Travels', busType: 'AC Sleeper (2+1)', rating: 3.8, departure: '14:00', arrival: '18:00', duration: '4h 00m', amenities: ['Charging Port', 'Water Bottle'], price: 600, seatsAvailable: 14 }
  ],
  'bangalore-hyderabad': [
    { operatorName: 'VRL Travels', busType: 'Volvo Multi-Axle AC Sleeper', rating: 4.6, departure: '21:30', arrival: '06:30', duration: '9h 00m', amenities: ['WiFi', 'Charging Port', 'Blanket', 'Water Bottle'], price: 1100, seatsAvailable: 19 },
    { operatorName: 'Orange Travels', busType: 'Scania Multi-Axle AC Sleeper', rating: 4.4, departure: '22:15', arrival: '07:15', duration: '9h 00m', amenities: ['WiFi', 'Charging Port', 'Blanket', 'Live Tracking'], price: 1250, seatsAvailable: 24 },
    { operatorName: 'KSRTC Airavat', busType: 'Volvo AC Club Class', rating: 4.7, departure: '20:45', arrival: '05:30', duration: '8h 45m', amenities: ['Charging Port', 'Water Bottle', 'Blanket'], price: 1050, seatsAvailable: 12 }
  ],
  'bangalore-chennai': [
    { operatorName: 'SRS Travels', busType: 'AC Seater (2+2)', rating: 4.1, departure: '08:30', arrival: '14:30', duration: '6h 00m', amenities: ['Charging Port', 'Water Bottle'], price: 550, seatsAvailable: 28 },
    { operatorName: 'KSRTC Airavat', busType: 'Volvo AC Semi-Sleeper', rating: 4.6, departure: '14:15', arrival: '20:15', duration: '6h 00m', amenities: ['Charging Port', 'Blanket'], price: 720, seatsAvailable: 16 },
    { operatorName: 'Asian Xpress', busType: 'Volvo Multi-Axle AC Sleeper', rating: 4.5, departure: '23:00', arrival: '05:00', duration: '6h 00m', amenities: ['WiFi', 'Charging Port', 'Blanket', 'Water Bottle'], price: 950, seatsAvailable: 9 }
  ],
  'mumbai-goa': [
    { operatorName: 'VRL Travels', busType: 'Volvo Multi-Axle AC Sleeper', rating: 4.5, departure: '19:00', arrival: '08:00', duration: '13h 00m', amenities: ['WiFi', 'Charging Port', 'Blanket', 'Water Bottle'], price: 1400, seatsAvailable: 11 },
    { operatorName: 'Atmaram Travels', busType: 'Volvo AC Sleeper (2+1)', rating: 4.1, departure: '18:30', arrival: '07:45', duration: '13h 15m', amenities: ['Charging Port', 'Blanket', 'Pillow'], price: 1200, seatsAvailable: 8 },
    { operatorName: 'Paul Travels', busType: 'Bharat Benz AC Sleeper', rating: 4.3, departure: '20:00', arrival: '09:00', duration: '13h 00m', amenities: ['Charging Port', 'Water Bottle', 'Blanket'], price: 1350, seatsAvailable: 14 }
  ],
  'hyderabad-goa': [
    { operatorName: 'Orange Travels', busType: 'Volvo Multi-Axle AC Sleeper', rating: 4.4, departure: '18:00', arrival: '08:30', duration: '14h 30m', amenities: ['WiFi', 'Charging Port', 'Blanket', 'Water Bottle'], price: 1600, seatsAvailable: 21 },
    { operatorName: 'VRL Travels', busType: 'Volvo Multi-Axle AC Sleeper', rating: 4.6, departure: '19:15', arrival: '09:15', duration: '14h 00m', amenities: ['WiFi', 'Charging Port', 'Blanket', 'Water Bottle'], price: 1750, seatsAvailable: 16 }
  ]
};

export class MMTBusProvider implements IBusProvider {
  public readonly name = 'MakeMyTrip';

  /**
   * Constructs the MakeMyTrip bus search URL.
   */
  public buildSearchUrl(params: SearchBusesInput): string {
    const fromSlug = params.origin.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const toSlug = params.destination.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Parse YYYY-MM-DD
    const dateParts = params.travelDate.split('-');
    if (dateParts.length !== 3) {
      return `https://www.makemytrip.com/bus-tickets/`;
    }
    const [year, month, day] = dateParts;
    return `https://www.makemytrip.com/bus-tickets/${fromSlug}-to-${toSlug}/?dd=${day}&mm=${month}&yy=${year}`;
  }

  /**
   * Simulates/Searches bus listings. Returns static matches or empty array if no corridor matches.
   */
  public async search(params: SearchBusesInput): Promise<BusResult[]> {
    const from = params.origin.toLowerCase().trim();
    const to = params.destination.toLowerCase().trim();
    
    const key1 = `${from}-${to}`;
    const key2 = `${to}-${from}`; // bidirectional check just in case

    let staticList = STATIC_BUS_ROUTES[key1] || STATIC_BUS_ROUTES[key2];

    if (!staticList) {
      // Fuzzy lookup if standard matches fail (e.g. "goa, india" to "mumbai")
      const matchingKey = Object.keys(STATIC_BUS_ROUTES).find(key => {
        const [kFrom, kTo] = key.split('-');
        return (from.includes(kFrom) && to.includes(kTo)) || (to.includes(kFrom) && from.includes(kTo));
      });
      if (matchingKey) {
        staticList = STATIC_BUS_ROUTES[matchingKey];
      }
    }

    const bookingUrl = this.buildSearchUrl(params);

    if (staticList) {
      return staticList.map(bus => ({
        ...bus,
        bookingUrl
      }));
    }

    return [];
  }
}
