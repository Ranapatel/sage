import { Router } from 'express';
import { TravelportController } from '../controllers/travelport.controller';

const router = Router();
const controller = new TravelportController();

/**
 * Phase 1 Travelport Flight Integration Routes
 * Strictly Phase 1: Search, AirPrice (Reference Payload), Standalone Fare Rules
 */
router.post('/search', controller.searchFlights);
router.post('/airprice', controller.priceOffer);
router.post('/farerules', controller.getFareRules);

export default router;
