// ─── Journey Ranker ───────────────────────────────────────────────────────────
// AI Route Optimization: scores and sorts journeys by fastest, cheapest,
// comfort, or balanced preferences. Uses deterministic algorithmic scoring.

import { JourneyPlan, RankType, TransportLeg } from './types';

/**
 * Rank journeys by the specified preference and return the top N.
 * Each journey gets a rank label and reason appended.
 */
export function rankJourneys(
  journeys: JourneyPlan[],
  preference: RankType = 'balanced',
  topN: number = 5,
): JourneyPlan[] {
  if (journeys.length === 0) return [];

  const scored = journeys.map(j => ({
    journey: j,
    score: calculateScore(j, preference, journeys),
  }));

  // Sort by score descending (higher = better)
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topN).map((item, idx) => ({
    ...item.journey,
    rank: preference,
    rankReason: getRankReason(item.journey, preference, idx === 0),
  }));
}

/**
 * Calculate a 0-100 score for a journey based on the ranking preference.
 */
function calculateScore(
  journey: JourneyPlan,
  preference: RankType,
  allJourneys: JourneyPlan[],
): number {
  if (allJourneys.length === 0) return 50;

  // Find min/max across all journeys for normalization
  const allDurations = allJourneys.map(j => j.totalDurationMinutes || 0);
  const allCosts = allJourneys.map(j => j.totalCost || 0);
  const allTransfers = allJourneys.map(j => j.transfers || 0);

  const minDur = Math.min(...allDurations) || 1;
  const maxDur = Math.max(...allDurations) || 1;
  const minCost = Math.min(...allCosts) || 1;
  const maxCost = Math.max(...allCosts) || 1;
  const maxTransfers = Math.max(...allTransfers) || 1;

  // Normalized scores (0-100, higher = better)
  const durScore = maxDur > minDur
    ? Math.round(((maxDur - (journey.totalDurationMinutes || 0)) / (maxDur - minDur)) * 100)
    : 70;
  const costScore = maxCost > minCost
    ? Math.round(((maxCost - (journey.totalCost || 0)) / (maxCost - minCost)) * 100)
    : 70;
  const transferScore = maxTransfers > 0
    ? Math.round(((maxTransfers - (journey.transfers || 0)) / maxTransfers) * 100)
    : 90;

  // Departure time convenience: prefer departures between 6am-10am
  const depScore = calculateDepartureScore(journey.legs);

  switch (preference) {
    case 'fastest':
      return Math.round(durScore * 0.65 + transferScore * 0.15 + depScore * 0.10 + costScore * 0.10);

    case 'cheapest':
      return Math.round(costScore * 0.65 + durScore * 0.15 + transferScore * 0.10 + depScore * 0.10);

    case 'comfort':
      return Math.round(transferScore * 0.40 + depScore * 0.25 + durScore * 0.20 + costScore * 0.15);

    case 'balanced':
    default:
      return Math.round(durScore * 0.35 + costScore * 0.35 + transferScore * 0.15 + depScore * 0.15);
  }
}

/**
 * Score departure time convenience: 6-10am = 100, 10am-2pm = 80,
 * 2-6pm = 65, 6-10pm = 50, 10pm-6am = 30
 */
function calculateDepartureScore(legs: TransportLeg[]): number {
  if (!legs.length) return 50;
  const firstLeg = legs[0];
  if (!firstLeg.departureTime || firstLeg.departureTime === '—') return 50;

  const hour = parseInt(firstLeg.departureTime.split(':')[0], 10);
  if (isNaN(hour)) return 50;

  if (hour >= 6 && hour <= 10) return 100;
  if (hour >= 10 && hour <= 14) return 80;
  if (hour >= 14 && hour <= 18) return 65;
  if (hour >= 18 && hour <= 22) return 50;
  return 30; // late night / early morning
}

/**
 * Generate a human-readable reason for the rank.
 */
function getRankReason(journey: JourneyPlan, preference: RankType, isTop: boolean): string {
  const transfers = journey.transfers === 0
    ? 'direct route'
    : `${journey.transfers} transfer${journey.transfers > 1 ? 's' : ''}`;

  switch (preference) {
    case 'fastest':
      return isTop
        ? `Fastest option — ${journey.totalDurationLabel}, ${transfers}`
        : `${journey.totalDurationLabel} — ${transfers}`;
    case 'cheapest':
      return isTop
        ? `Lowest cost — Rs.${journey.totalCost}, ${transfers}`
        : `Rs.${journey.totalCost} — ${transfers}`;
    case 'comfort':
      return isTop
        ? `Most comfortable — ${transfers}, good timings`
        : `${transfers}, decent timings`;
    case 'balanced':
    default:
      return isTop
        ? `Best balance — ${journey.totalDurationLabel}, Rs.${journey.totalCost}, ${transfers}`
        : `${journey.totalDurationLabel}, Rs.${journey.totalCost}`;
  }
}

/**
 * Find the single best journey for the "recommended" field.
 * Uses balanced scoring by default.
 */
export function findRecommended(journeys: JourneyPlan[]): JourneyPlan | null {
  if (journeys.length === 0) return null;
  const ranked = rankJourneys(journeys, 'balanced', 1);
  return ranked[0] || null;
}
