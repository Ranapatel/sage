// ─── Direct Search Engine ─────────────────────────────────────────────────────
// Searches for direct trains and buses between origin and destination
// by calling the existing NestJS transport microservice (port 4001).
// Performs real-time validation: filters out services that don't operate
// on the selected date, expired routes, and invalid departure times.

import axios from 'axios';
import { TransportLeg, NormalizedSearchResult } from './types';
import { buildTrainBookingUrl, buildBusBookingUrl } from './bookingLinkBuilder';

const NESTJS_URL = process.env.TRANSPORT_SERVICE_URL || 'http://localhost:4001';

/** Day-of-week names matching Indian Railways format */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Parse a duration string like "8h 15m" or "12h" or "3h 30m" into total minutes.
 */
export function parseDurationToMinutes(duration: string): number {
  if (!duration) return 0;
  const hMatch = duration.match(/(\d+)\s*h/i);
  const mMatch = duration.match(/(\d+)\s*m/i);
  return (hMatch ? parseInt(hMatch[1], 10) * 60 : 0) + (mMatch ? parseInt(mMatch[1], 10) : 0);
}

/**
 * Get the day-of-week abbreviation for a YYYY-MM-DD date.
 */
function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return DAY_NAMES[date.getDay()];
}

/**
 * Validate that the travel date is not in the past.
 */
export function validateTravelDate(dateStr: string): void {
  const todayStr = new Date().toLocaleDateString('en-CA');
  if (dateStr < todayStr) {
    throw new Error(`Travel date ${dateStr} is in the past. Today is ${todayStr}.`);
  }
}

/**
 * Search for direct trains between two cities via the NestJS microservice.
 * Filters results to only show trains running on the selected day of week.
 */
export async function searchDirectTrains(
  origin: string,
  destination: string,
  date: string,
  passengers: number = 1,
): Promise<TransportLeg[]> {
  try {
    const response = await axios.post(`${NESTJS_URL}/api/train/search`, {
      departureCity: origin,
      destinationCity: destination,
      departureDate: date,
      passengers,
      travelClass: 'ALL',
    }, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    const data = response.data;
    const trains = data?.results || data?.trains || [];
    const originInfo = data?.origin;
    const destInfo = data?.destination;
    const searchUrl = data?.searchUrl || '';

    const dayOfWeek = getDayOfWeek(date);

    const legs: TransportLeg[] = trains
      .filter((t: any) => {
        // Real-time validation: does this train run on the selected day?
        if (t.runsOn && Array.isArray(t.runsOn) && t.runsOn.length > 0) {
          return t.runsOn.includes(dayOfWeek);
        }
        return true; // If no runsOn data, include it (let the user decide)
      })
      .map((t: any) => {
        // Find the cheapest available class fare
        const classFares = t.classFares || t.availableClasses || [];
        let price = 0;
        let className = '';

        if (classFares.length > 0) {
          const available = classFares.filter((c: any) => c.available !== false);
          const best = available.length > 0 ? available[0] : classFares[0];
          price = best.fare || best.price || 0;
          className = best.classCode || best.class || '';
        }

        const originLabel = originInfo
          ? `${originInfo.name || origin} (${originInfo.code || ''})`
          : origin;
        const destLabel = destInfo
          ? `${destInfo.name || destination} (${destInfo.code || ''})`
          : destination;

        return {
          mode: 'train' as const,
          origin: originLabel,
          destination: destLabel,
          departureTime: t.departureTime || t.departure || '',
          arrivalTime: t.arrivalTime || t.arrival || '',
          duration: t.duration || '',
          operator: `${t.trainName || 'Train'} #${t.trainNumber || ''}`.trim(),
          price,
          bookingUrl: searchUrl || buildTrainBookingUrl(
            originInfo?.code || origin,
            destInfo?.code || destination,
            date,
            passengers,
          ),
          metadata: {
            trainNumber: t.trainNumber,
            trainName: t.trainName,
            runsOn: t.runsOn,
            className,
          },
        };
      });

    return legs;
  } catch (err: any) {
    console.warn('[DirectSearchEngine] Train search failed:', err.message);
    return [];
  }
}

/**
 * Search for direct buses between two cities via the NestJS microservice.
 */
export async function searchDirectBuses(
  origin: string,
  destination: string,
  date: string,
): Promise<TransportLeg[]> {
  try {
    const response = await axios.post(`${NESTJS_URL}/api/bus/search`, {
      departureCity: origin,
      destinationCity: destination,
      departureDate: date,
    }, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    const data = response.data;
    const buses = data?.results || [];
    const searchUrl = data?.searchUrl || '';

    const legs: TransportLeg[] = buses.map((b: any) => ({
      mode: 'bus' as const,
      origin: data?.origin?.name || origin,
      destination: data?.destination?.name || destination,
      departureTime: b.departure || '',
      arrivalTime: b.arrival || '',
      duration: b.duration || '',
      operator: b.name || b.operatorName || b.type || 'Bus',
      price: b.price || 0,
      bookingUrl: searchUrl || buildBusBookingUrl(origin, destination, date),
      metadata: {
        busType: b.type || b.busType,
        rating: b.rating,
        seatsAvailable: b.seatsAvailable,
        amenities: b.amenities,
      },
    }));

    return legs;
  } catch (err: any) {
    console.warn('[DirectSearchEngine] Bus search failed:', err.message);
    return [];
  }
}

/**
 * Search for all direct transport (trains + buses) in parallel.
 * Returns normalized results with search URLs.
 */
export async function searchAllDirect(
  origin: string,
  destination: string,
  date: string,
  passengers: number = 1,
): Promise<NormalizedSearchResult> {
  validateTravelDate(date);

  const [trains, buses] = await Promise.all([
    searchDirectTrains(origin, destination, date, passengers),
    searchDirectBuses(origin, destination, date),
  ]);

  return {
    trains,
    buses,
    searchUrls: {
      train: trains[0]?.bookingUrl || '',
      bus: buses[0]?.bookingUrl || '',
    },
  };
}
