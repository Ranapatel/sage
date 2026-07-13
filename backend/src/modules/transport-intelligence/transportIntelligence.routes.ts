// ─── Transport Intelligence Routes ────────────────────────────────────────────
// Express router for transport intelligence endpoints.

import express from 'express';
import { planJourneyHandler } from './transportIntelligence.controller';

const router = express.Router();

// POST /api/transport-intelligence/plan
// Plan a door-to-door journey with multi-modal transport options
router.post('/plan', planJourneyHandler as any);

export default router;
