import axios from 'axios';

export interface TrainClassAvailability {
  class: string;
  className: string;
  available: boolean;
  price?: number;
  availability?: string;
}

export interface TrainResult {
  trainNumber: string;
  trainName: string;
  departure: string;
  arrival: string;
  duration: string;
  runsOn: string[];
  availableClasses: TrainClassAvailability[];
  bookingUrl: string;
  originCode: string;
  destinationCode: string;
}

export interface BusResult {
  operatorName: string;
  busType: string;
  rating?: number;
  departure: string;
  arrival: string;
  duration: string;
  amenities: string[];
  price?: number;
  seatsAvailable?: number;
  bookingUrl: string;
}

export class MakeMyTripProvider {
  private nestUrl = process.env.NEST_SERVICE_URL || 'http://localhost:4001';

  async searchTrains(params: {
    originStation: string;
    destinationStation: string;
    travelDate: string;
    passengers?: number;
    preferredClass?: string;
  }): Promise<{ results: TrainResult[]; searchUrl: string }> {
    const response = await axios.post(`${this.nestUrl}/api/train/search`, {
      departureCity: params.originStation,
      destinationCity: params.destinationStation,
      departureDate: params.travelDate,
      passengers: params.passengers || 1,
      travelClass: params.preferredClass || '3A',
    });

    const data = response.data;
    const searchUrl = data.searchUrl || 'https://www.makemytrip.com/railways/';
    const rawResults = data.results || [];

    // Group flat results by trainNumber
    const grouped = new Map<string, TrainResult>();
    for (const flat of rawResults) {
      const trainNo = flat.trainNumber;
      if (!grouped.has(trainNo)) {
        grouped.set(trainNo, {
          trainNumber: trainNo,
          trainName: flat.trainName,
          departure: flat.departureTime || flat.departure || '',
          arrival: flat.arrivalTime || flat.arrival || '',
          duration: flat.duration,
          runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // default to daily runs if not present
          originCode: flat.originCode || '',
          destinationCode: flat.destinationCode || '',
          availableClasses: [],
          bookingUrl: searchUrl,
        });
      }
      const t = grouped.get(trainNo)!;
      t.availableClasses.push({
        class: flat.travelClass,
        className: this.getClassName(flat.travelClass),
        available: true,
        price: flat.price,
        availability: 'AVAILABLE',
      });
    }

    return {
      results: Array.from(grouped.values()),
      searchUrl,
    };
  }

  async searchBuses(params: {
    origin: string;
    destination: string;
    travelDate: string;
    passengers?: number;
  }): Promise<{ results: BusResult[]; searchUrl: string }> {
    const response = await axios.post(`${this.nestUrl}/api/bus/search`, {
      departureCity: params.origin,
      destinationCity: params.destination,
      departureDate: params.travelDate,
    });

    const data = response.data;
    const searchUrl = data.searchUrl || 'https://www.makemytrip.com/bus-tickets/';
    const rawResults = data.results || [];

    const results = rawResults.map((flat: any): BusResult => {
      // Parse seats from liveStatus e.g. "14 seats left" -> 14
      let seats = 10;
      if (flat.liveStatus) {
        const match = flat.liveStatus.match(/(\d+)/);
        if (match) {
          seats = parseInt(match[1], 10);
        }
      }
      
      return {
        operatorName: flat.name,
        busType: flat.type,
        rating: 4.2, // default rating
        departure: flat.departure,
        arrival: flat.arrival,
        duration: flat.duration,
        amenities: ['WiFi', 'Charging Port', 'Blanket'],
        price: flat.price,
        seatsAvailable: seats,
        bookingUrl: flat.bookingLink || searchUrl,
      };
    });

    return {
      results,
      searchUrl,
    };
  }

  private getClassName(c: string): string {
    switch (c) {
      case 'SL': return 'Sleeper Class';
      case '3A': return 'AC 3 Tier';
      case '2A': return 'AC 2 Tier';
      case '1A': return 'AC First Class';
      case 'CC': return 'Chair Car';
      case 'EC': return 'Executive Chair Car';
      case '3E': return 'AC 3 Tier Economy';
      default: return c;
    }
  }
}
