import axios from 'axios'
import type {
  ITrainProvider,
  IBusProvider,
  TrainSearchParams,
  TrainSearchResponse,
  TrainResult,
  TrainClassFare,
  BusSearchParams,
  BusSearchResponse,
  BusResult,
  CLASS_NAMES,
} from '@/types/transport'

const CLASS_NAME_MAP: Record<string, string> = {
  SL: 'Sleeper',
  '3A': 'AC 3 Tier',
  '3E': '3A Economy',
  '2A': 'AC 2 Tier',
  '1A': 'First AC',
  CC: 'Chair Car',
  EC: 'Exec. Chair',
  '2S': 'Second Sitting',
}

export class MakeMyTripProvider implements ITrainProvider, IBusProvider {
  private nestUrl = process.env.NEST_SERVICE_URL || 'http://localhost:4001'

  async searchTrains(params: TrainSearchParams): Promise<TrainSearchResponse> {
    const response = await axios.post(`${this.nestUrl}/api/train/search`, {
      departureCity: params.originStation,
      destinationCity: params.destinationStation,
      departureDate: params.travelDate,
      passengers: params.passengers || 1,
      travelClass: params.preferredClass || '3A',
    })

    const data = response.data
    const searchUrl = data.searchUrl || 'https://www.makemytrip.com/railways/'
    const rawResults = data.results || []

    // Group flat results by trainNumber (backend now sends grouped,
    // but handle legacy per-class rows too for backward compat)
    const grouped = new Map<string, TrainResult>()
    for (const flat of rawResults) {
      const trainNo = flat.trainNumber
      if (!grouped.has(trainNo)) {
        grouped.set(trainNo, {
          id: trainNo,
          trainNumber: trainNo,
          trainName: flat.trainName,
          trainType: flat.trainType || 'EXPRESS',
          origin: {
            station: flat.originStation || '',
            code: flat.originCode || '',
          },
          destination: {
            station: flat.destinationStation || '',
            code: flat.destinationCode || '',
          },
          departure: flat.departureTime || flat.departure || '',
          arrival: flat.arrivalTime || flat.arrival || '',
          duration: flat.duration,
          runsOn: flat.runsOn || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          classes: [],
          bookingUrl: searchUrl,
          aiRank: null,
        })
      }

      const t = grouped.get(trainNo)!

      // If backend sends pre-grouped classFares array, use that
      if (flat.classFares && Array.isArray(flat.classFares) && flat.classFares.length > 0) {
        // Only add if not already populated
        if (t.classes.length === 0) {
          t.classes = flat.classFares.map((cf: { classCode: string; fare: number }) => ({
            classCode: cf.classCode,
            className: CLASS_NAME_MAP[cf.classCode] || cf.classCode,
            fare: cf.fare,
            availability: null, // eRail doesn't provide seat availability
          }))
        }
      } else if (flat.travelClass) {
        // Legacy per-class row format
        t.classes.push({
          classCode: flat.travelClass,
          className: CLASS_NAME_MAP[flat.travelClass] || flat.travelClass,
          fare: flat.price,
          availability: null,
        })
      }
    }

    return {
      results: Array.from(grouped.values()),
      searchUrl,
    }
  }

  async searchBuses(params: BusSearchParams): Promise<BusSearchResponse> {
    const response = await axios.post(`${this.nestUrl}/api/bus/search`, {
      departureCity: params.origin,
      destinationCity: params.destination,
      departureDate: params.travelDate,
    })

    const data = response.data
    const searchUrl = data.searchUrl || 'https://www.makemytrip.com/bus-tickets/'
    const rawResults = data.results || []

    const results: BusResult[] = rawResults.map((flat: any): BusResult => {
      let seats: number | null = null
      if (flat.seatsAvailable != null) {
        seats = flat.seatsAvailable
      } else if (flat.liveStatus) {
        const match = flat.liveStatus.match(/(\d+)/)
        if (match) seats = parseInt(match[1], 10)
      }

      return {
        id: flat.id || `${(flat.name || '').replace(/\s+/g, '-')}-${flat.departure}`,
        operator: flat.name || flat.operatorName || '',
        busType: flat.type || flat.busType || '',
        rating: flat.rating ?? null,
        departure: flat.departure,
        arrival: flat.arrival,
        duration: flat.duration,
        amenities: flat.amenities || [],
        fare: flat.price ?? null,
        seatsLeft: seats,
        bookingUrl: flat.bookingLink || searchUrl,
        aiRank: null,
      }
    })

    return {
      results,
      searchUrl,
    }
  }
}
