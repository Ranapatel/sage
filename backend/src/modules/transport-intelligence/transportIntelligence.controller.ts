// ─── Transport Intelligence Controller ────────────────────────────────────────
// Express request handlers for the transport intelligence endpoints.

import { PlanRequest, RankType } from './types';
import { planJourney } from './transportIntelligence.service';

/**
 * POST /api/transport-intelligence/plan
 * Plan a door-to-door journey with multi-modal transport options.
 */
export async function planJourneyHandler(req: any, res: any): Promise<void> {
  try {
    const { origin, destination, date, passengers, rankPreference } = req.body;

    // ── Input validation ──────────────────────────────────────────────────
    if (!origin || typeof origin !== 'string' || origin.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Origin is required' });
      return;
    }

    if (!destination || typeof destination !== 'string' || destination.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Destination is required' });
      return;
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ success: false, message: 'Date must be in YYYY-MM-DD format' });
      return;
    }

    // Validate date is not in the past
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (date < todayStr) {
      res.status(400).json({
        success: false,
        message: `Travel date ${date} is in the past. Today is ${todayStr}.`,
      });
      return;
    }

    // Validate rank preference
    const validPreferences: RankType[] = ['fastest', 'cheapest', 'comfort', 'balanced'];
    const pref = rankPreference as RankType;
    if (pref && !validPreferences.includes(pref)) {
      res.status(400).json({
        success: false,
        message: `rankPreference must be one of: ${validPreferences.join(', ')}`,
      });
      return;
    }

    // Validate passengers
    const pax = Number(passengers) || 1;
    if (pax < 1 || pax > 10) {
      res.status(400).json({ success: false, message: 'Passengers must be between 1 and 10' });
      return;
    }

    // ── Execute ───────────────────────────────────────────────────────────
    const request: PlanRequest = {
      origin: origin.trim(),
      destination: destination.trim(),
      date,
      passengers: pax,
      rankPreference: pref || 'balanced',
    };

    const result = await planJourney(request);

    res.status(200).json({
      success: true,
      data: result,
      message: result.directOptions.length > 0
        ? `Found ${result.directOptions.length} direct option(s)`
        : result.alternativeJourneys.length > 0
          ? `No direct routes found. ${result.alternativeJourneys.length} alternative route(s) available.`
          : 'No transport options found for this route.',
      error: null,
    });
  } catch (err: any) {
    console.error('[TransportIntelligence] Plan error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Transport planning service temporarily unavailable. Please try again.',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }
}
