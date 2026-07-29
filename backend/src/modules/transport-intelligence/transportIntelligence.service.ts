// ─── Transport Intelligence Service ───────────────────────────────────────────
// Main orchestrator: coordinates direct search, alternative route finding,
// journey ranking, booking URL building, and AI explanation.
// Uses Redis caching for frequent routes.

import { PlanRequest, PlanResponse, JourneyPlan, TransportLeg, RankType } from './types';
import { searchAllDirect, parseDurationToMinutes } from './directSearchEngine';
import { findAlternativeRoutes } from './alternativeRouteEngine';
import { rankJourneys, findRecommended } from './journeyRanker';
import { buildJourneyBookingUrl } from './bookingLinkBuilder';
import { generateRouteExplanation } from './transportAgent';
import { prisma } from '../../prisma/prisma.client';

// Reuse existing Redis cache from the backend
const { cacheGet, cacheSet, generateCacheKey } = require('../../../config/redis');


const CACHE_PREFIX = 'transport-intel';
const CACHE_TTL = 15 * 60; // 15 minutes

/**
 * Main entry point: plan a door-to-door journey.
 *
 * Flow:
 * 1. Check Redis cache
 * 2. Search direct trains + buses
 * 3. If no direct options, find alternative routes via hub graph
 * 4. Rank all journeys by preference
 * 5. Build booking URLs
 * 6. Generate AI explanation
 * 7. Cache and return
 */
export async function planJourney(request: PlanRequest): Promise<PlanResponse> {
  const {
    origin,
    destination,
    date,
    passengers = 1,
    rankPreference = 'balanced' as RankType,
    userId,
  } = request;

  // Save search query to DB for analytics/history. Only persists when the
  // user is authenticated — public searches don't have a userId yet.
  if (userId) {
    await prisma.userSearchHistory.create({
      data: {
        userId,
        origin,
        destination,
        searchDate: date,
        passengers,
        rankPreference,
      },
    }).catch(err => console.warn('[DB Error] Failed to save search history:', err.message));
  }

  // ── 1. Check cache ──────────────────────────────────────────────────────
  const cacheKey = generateCacheKey(CACHE_PREFIX, {
    origin, destination, date, passengers, rankPreference,
  });

  const cached = await cacheGet(cacheKey);
  if (cached) {
    return { ...cached, cacheHit: true };
  }

  // ── 2. Search direct transport ──────────────────────────────────────────
  const directResult = await searchAllDirect(origin, destination, date, passengers);
  const directLegs: TransportLeg[] = [...directResult.trains, ...directResult.buses];

  // Convert direct legs to single-leg journeys
  const directJourneys: JourneyPlan[] = directLegs.map(leg => ({
    id: `direct-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    legs: [leg],
    totalDurationMinutes: parseDurationToMinutes(leg.duration),
    totalDurationLabel: leg.duration,
    totalCost: (leg.price || 0) * passengers,
    transfers: 0,
    isDirect: true,
    bookingUrl: leg.bookingUrl,
  }));

  // ── 3. Find alternatives if no direct options ───────────────────────────
  let alternativeJourneys: JourneyPlan[] = [];

  if (directJourneys.length === 0) {
    alternativeJourneys = await findAlternativeRoutes(origin, destination, date, passengers);
  }

  // ── 4. Rank journeys ────────────────────────────────────────────────────
  const allJourneys = [...directJourneys, ...alternativeJourneys];
  const rankedJourneys = rankJourneys(allJourneys, rankPreference, 10);

  // Split back into direct and alternative after ranking
  const rankedDirect = rankedJourneys.filter(j => j.isDirect);
  const rankedAlternatives = rankedJourneys.filter(j => !j.isDirect);

  // ── 5. Build booking URLs ───────────────────────────────────────────────
  for (const j of [...rankedDirect, ...rankedAlternatives]) {
    j.bookingUrl = buildJourneyBookingUrl(j, date, passengers);
  }

  // ── 6. Find recommended ─────────────────────────────────────────────────
  const recommended = findRecommended(allJourneys);

  // ── 7. Generate AI explanation ──────────────────────────────────────────
  const aiSummary = await generateRouteExplanation(request, rankedDirect, rankedAlternatives);

  // Attach AI explanation to the recommended journey
  if (recommended) {
    recommended.aiExplanation = aiSummary;

    // Save recommended journey plan to DB
    await prisma.journeyPlans.create({
      data: {
        origin,
        destination,
        date,
        totalDurationMinutes: recommended.totalDurationMinutes,
        totalCost: recommended.totalCost,
        transfers: recommended.transfers,
        isDirect: recommended.isDirect,
        bookingUrl: recommended.bookingUrl,
        aiExplanation: aiSummary,
      },
    }).catch(err => console.warn('[DB Error] Failed to save recommended journey plan:', err.message));
  }

  const response: PlanResponse = {
    directOptions: rankedDirect,
    alternativeJourneys: rankedAlternatives,
    recommended,
    aiSummary,
    cacheHit: false,
    searchedAt: new Date().toISOString(),
  };

  // ── 8. Cache result ─────────────────────────────────────────────────────
  await cacheSet(cacheKey, response, CACHE_TTL);

  return response;
}
