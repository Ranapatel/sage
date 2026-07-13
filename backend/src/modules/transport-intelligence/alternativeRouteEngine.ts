// ─── Alternative Route Engine ─────────────────────────────────────────────────
// When direct transport is unavailable, generates multi-step journeys through
// intermediate transport hubs. Uses the static hub graph to find candidate
// intermediate cities, then verifies each leg via the DirectSearchEngine.

import {
  JourneyPlan,
  TransportLeg,
  TransportMode,
} from './types';
import { HUB_GRAPH, findHubKey, getHub, findIntermediateHubs } from './hubGraph';
import { searchDirectTrains, searchDirectBuses, parseDurationToMinutes } from './directSearchEngine';
import { buildTrainBookingUrl, buildBusBookingUrl } from './bookingLinkBuilder';

/**
 * Find alternative multi-modal journeys when direct transport is unavailable.
 *
 * Algorithm:
 * 1. Resolve origin and destination to hub keys
 * 2. Find intermediate hubs where origin->hub AND hub->destination both exist in the hub graph
 * 3. For each intermediate hub, verify each leg exists via direct search (train or bus)
 * 4. If 1-hop yields no results, try 2-hop (origin -> hub1 -> hub2 -> destination)
 * 5. Return up to 5 alternative journeys
 */
export async function findAlternativeRoutes(
  origin: string,
  destination: string,
  date: string,
  passengers: number = 1,
): Promise<JourneyPlan[]> {
  const originKey = findHubKey(origin);
  const destKey = findHubKey(destination);

  // If either origin or destination is not in the hub graph,
  // we can't find alternative routes through the graph
  if (!originKey || !destKey) {
    return findAlternativesWithoutHubGraph(origin, destination, date, passengers);
  }

  // Find 1-hop intermediate hubs
  const intermediateHubs = findIntermediateHubs(originKey, destKey);
  const journeys: JourneyPlan[] = [];

  // Try each intermediate hub
  for (const hubKey of intermediateHubs) {
    const hub = getHub(hubKey);
    if (!hub) continue;

    // Search for transport on both legs in parallel
    const [leg1Trains, leg1Buses, leg2Trains, leg2Buses] = await Promise.all([
      searchDirectTrains(originKey, hubKey, date, passengers),
      searchDirectBuses(originKey, hubKey, date),
      searchDirectTrains(hubKey, destKey, date, passengers),
      searchDirectBuses(hubKey, destKey, date),
    ]);

    // Try train+train, train+bus, bus+train, bus+bus combinations
    const leg1Options = [...leg1Trains, ...leg1Buses];
    const leg2Options = [...leg2Trains, ...leg2Buses];

    if (leg1Options.length > 0 && leg2Options.length > 0) {
      // Pick the best option for each leg (cheapest)
      const leg1 = leg1Options.sort((a, b) => a.price - b.price)[0];
      const leg2 = leg2Options.sort((a, b) => a.price - b.price)[0];

      const journey = buildJourneyFromLegs(
        [leg1, leg2],
        date,
        passengers,
        false, // isDirect
      );
      journeys.push(journey);
    }

    // If no direct search results for legs, try hub graph estimated legs
    if (leg1Options.length === 0 || leg2Options.length === 0) {
      const estimatedJourney = buildEstimatedJourney(
        originKey, hubKey, destKey,
        date, passengers,
      );
      if (estimatedJourney) journeys.push(estimatedJourney);
    }
  }

  // If 1-hop yielded nothing, try 2-hop
  if (journeys.length === 0) {
    const twoHopJourneys = await findTwoHopRoutes(originKey, destKey, date, passengers);
    journeys.push(...twoHopJourneys);
  }

  // Deduplicate by similar total cost and duration
  return deduplicateJourneys(journeys).slice(0, 5);
}

/**
 * Build a JourneyPlan from an array of legs.
 */
function buildJourneyFromLegs(
  legs: TransportLeg[],
  date: string,
  passengers: number,
  isDirect: boolean,
): JourneyPlan {
  const totalMinutes = legs.reduce((sum, leg) => sum + parseDurationToMinutes(leg.duration), 0);
  const totalCost = legs.reduce((sum, leg) => sum + (leg.price || 0), 0) * passengers;
  const transfers = legs.length - 1;

  return {
    id: `journey-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    legs,
    totalDurationMinutes: totalMinutes,
    totalDurationLabel: formatDuration(totalMinutes),
    totalCost,
    transfers,
    isDirect,
    bookingUrl: legs[0]?.bookingUrl || 'https://www.makemytrip.com/',
  };
}

/**
 * Build an estimated journey from hub graph connection data
 * (used when direct search returns no results but hub graph shows a known corridor).
 */
function buildEstimatedJourney(
  originKey: string,
  hubKey: string,
  destKey: string,
  date: string,
  passengers: number,
): JourneyPlan | null {
  const originHub = getHub(originKey);
  const hub = getHub(hubKey);
  const destHub = getHub(destKey);
  if (!originHub || !hub || !destHub) return null;

  const conn1 = originHub.connectsTo[hubKey];
  const conn2 = hub.connectsTo[destKey];
  if (!conn1 || !conn2) return null;

  // Estimate price: ~Rs.2/km for train, ~Rs.3/km for bus, ~Rs.8/km for taxi
  const pricePerKm: Record<TransportMode, number> = {
    train: 2, bus: 3, taxi: 8, metro: 5, auto: 10,
  };

  const mode1 = conn1.modes[0];
  const mode2 = conn2.modes[0];
  const price1 = Math.round(conn1.km * pricePerKm[mode1] * passengers);
  const price2 = Math.round(conn2.km * pricePerKm[mode2] * passengers);

  const leg1: TransportLeg = {
    mode: mode1,
    origin: `${originHub.name} (${originHub.stationCode})`,
    destination: `${hub.name} (${hub.stationCode})`,
    departureTime: '—',
    arrivalTime: '—',
    duration: conn1.estTime,
    operator: mode1 === 'train' ? 'Multiple trains available' : 'Multiple buses available',
    price: price1,
    bookingUrl: mode1 === 'train'
      ? buildTrainBookingUrl(originHub.stationCode, hub.stationCode, date, passengers)
      : buildBusBookingUrl(originHub.citySlug, hub.citySlug, date),
  };

  const leg2: TransportLeg = {
    mode: mode2,
    origin: `${hub.name} (${hub.stationCode})`,
    destination: `${destHub.name} (${destHub.stationCode})`,
    departureTime: '—',
    arrivalTime: '—',
    duration: conn2.estTime,
    operator: mode2 === 'train' ? 'Multiple trains available' : 'Multiple buses available',
    price: price2,
    bookingUrl: mode2 === 'train'
      ? buildTrainBookingUrl(hub.stationCode, destHub.stationCode, date, passengers)
      : buildBusBookingUrl(hub.citySlug, destHub.citySlug, date),
  };

  return buildJourneyFromLegs([leg1, leg2], date, passengers, false);
}

/**
 * Find 2-hop routes: origin -> hub1 -> hub2 -> destination
 */
async function findTwoHopRoutes(
  originKey: string,
  destKey: string,
  date: string,
  passengers: number,
): Promise<JourneyPlan[]> {
  const originHub = getHub(originKey);
  const destHub = getHub(destKey);
  if (!originHub || !destHub) return [];

  const journeys: JourneyPlan[] = [];

  // For each hub1 connected from origin
  for (const [hub1Key] of Object.entries(originHub.connectsTo)) {
    if (hub1Key === destKey) continue;
    const hub1 = getHub(hub1Key);
    if (!hub1) continue;

    // For each hub2 connected from hub1 that connects to destination
    for (const [hub2Key] of Object.entries(hub1.connectsTo)) {
      if (hub2Key === destKey || hub2Key === originKey) continue;
      const hub2 = getHub(hub2Key);
      if (!hub2) continue;

      // Check if hub2 connects to destination
      if (!hub2.connectsTo[destKey]) continue;

      // Build estimated 2-hop journey
      const j = buildEstimatedTwoHopJourney(originKey, hub1Key, hub2Key, destKey, date, passengers);
      if (j) journeys.push(j);

      // Limit results
      if (journeys.length >= 3) break;
    }
    if (journeys.length >= 3) break;
  }

  return journeys;
}

/**
 * Build an estimated 2-hop journey from hub graph data.
 */
function buildEstimatedTwoHopJourney(
  originKey: string,
  hub1Key: string,
  hub2Key: string,
  destKey: string,
  date: string,
  passengers: number,
): JourneyPlan | null {
  const originHub = getHub(originKey);
  const hub1 = getHub(hub1Key);
  const hub2 = getHub(hub2Key);
  const destHub = getHub(destKey);
  if (!originHub || !hub1 || !hub2 || !destHub) return null;

  const conn1 = originHub.connectsTo[hub1Key];
  const conn2 = hub1.connectsTo[hub2Key];
  const conn3 = hub2.connectsTo[destKey];
  if (!conn1 || !conn2 || !conn3) return null;

  const pricePerKm: Record<TransportMode, number> = {
    train: 2, bus: 3, taxi: 8, metro: 5, auto: 10,
  };

  const legs: TransportLeg[] = [
    {
      mode: conn1.modes[0],
      origin: `${originHub.name} (${originHub.stationCode})`,
      destination: `${hub1.name} (${hub1.stationCode})`,
      departureTime: '—', arrivalTime: '—',
      duration: conn1.estTime,
      operator: 'Multiple options',
      price: Math.round(conn1.km * pricePerKm[conn1.modes[0]] * passengers),
      bookingUrl: conn1.modes[0] === 'train'
        ? buildTrainBookingUrl(originHub.stationCode, hub1.stationCode, date, passengers)
        : buildBusBookingUrl(originHub.citySlug, hub1.citySlug, date),
    },
    {
      mode: conn2.modes[0],
      origin: `${hub1.name} (${hub1.stationCode})`,
      destination: `${hub2.name} (${hub2.stationCode})`,
      departureTime: '—', arrivalTime: '—',
      duration: conn2.estTime,
      operator: 'Multiple options',
      price: Math.round(conn2.km * pricePerKm[conn2.modes[0]] * passengers),
      bookingUrl: conn2.modes[0] === 'train'
        ? buildTrainBookingUrl(hub1.stationCode, hub2.stationCode, date, passengers)
        : buildBusBookingUrl(hub1.citySlug, hub2.citySlug, date),
    },
    {
      mode: conn3.modes[0],
      origin: `${hub2.name} (${hub2.stationCode})`,
      destination: `${destHub.name} (${destHub.stationCode})`,
      departureTime: '—', arrivalTime: '—',
      duration: conn3.estTime,
      operator: 'Multiple options',
      price: Math.round(conn3.km * pricePerKm[conn3.modes[0]] * passengers),
      bookingUrl: conn3.modes[0] === 'train'
        ? buildTrainBookingUrl(hub2.stationCode, destHub.stationCode, date, passengers)
        : buildBusBookingUrl(hub2.citySlug, destHub.citySlug, date),
    },
  ];

  return buildJourneyFromLegs(legs, date, passengers, false);
}

/**
 * Fallback: try to find alternatives without hub graph matching.
 * Uses the hub graph's nearest hubs by coordinate distance.
 */
async function findAlternativesWithoutHubGraph(
  origin: string,
  destination: string,
  date: string,
  passengers: number,
): Promise<JourneyPlan[]> {
  // Try a few common intermediate hubs that are likely to have connections
  const commonHubs = ['delhi', 'mumbai', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'jaipur', 'ahmedabad'];
  const journeys: JourneyPlan[] = [];

  for (const hubKey of commonHubs) {
    const [leg1, leg2] = await Promise.all([
      searchDirectTrains(origin, hubKey, date, passengers),
      searchDirectBuses(origin, hubKey, date),
    ]);

    const [leg3, leg4] = await Promise.all([
      searchDirectTrains(hubKey, destination, date, passengers),
      searchDirectBuses(hubKey, destination, date),
    ]);

    const leg1Options = [...leg1, ...leg2];
    const leg2Options = [...leg3, ...leg4];

    if (leg1Options.length > 0 && leg2Options.length > 0) {
      const bestLeg1 = leg1Options.sort((a, b) => a.price - b.price)[0];
      const bestLeg2 = leg2Options.sort((a, b) => a.price - b.price)[0];
      journeys.push(buildJourneyFromLegs([bestLeg1, bestLeg2], date, passengers, false));
    }

    if (journeys.length >= 3) break;
  }

  return journeys;
}

/**
 * Format minutes as "Xh Ym"
 */
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Remove duplicate journeys (same total cost +/- Rs.50 and same duration +/- 30min)
 */
function deduplicateJourneys(journeys: JourneyPlan[]): JourneyPlan[] {
  const seen: JourneyPlan[] = [];
  for (const j of journeys) {
    const isDuplicate = seen.some(s =>
      Math.abs(s.totalCost - j.totalCost) < 50 &&
      Math.abs(s.totalDurationMinutes - j.totalDurationMinutes) < 30
    );
    if (!isDuplicate) seen.push(j);
  }
  return seen;
}
