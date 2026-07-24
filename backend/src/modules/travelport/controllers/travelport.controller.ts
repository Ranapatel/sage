import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { FlightSearchService } from '../search/flightSearch.service';
import { AirPriceService } from '../airprice/airPrice.service';
import { FareRulesService } from '../farerules/fareRules.service';
import { TravelportErrorHandler } from '../errors/travelportError.handler';
import { getOrCreateTraceId } from '../utils/trace.utils';

// ── Validation Schemas ────────────────────────────────────────────────────────

const searchLegSchema = z.object({
  origin: z.string().length(3, 'Origin must be a 3-letter IATA code'),
  destination: z.string().length(3, 'Destination must be a 3-letter IATA code'),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Departure date must be YYYY-MM-DD'),
  departureTime: z.string().optional(),
});

const passengerCountSchema = z.object({
  adults: z.number().int().min(1, 'At least 1 adult required'),
  children: z.number().int().min(0).optional(),
  infantsOnLap: z.number().int().min(0).optional(),
  infantsInSeat: z.number().int().min(0).optional(),
  youths: z.number().int().min(0).optional(),
  seniors: z.number().int().min(0).optional(),
});

const searchModifiersSchema = z
  .object({
    cabinPreference: z.enum(['Economy', 'PremiumEconomy', 'Business', 'First']).optional(),
    directFlightsOnly: z.boolean().optional(),
    maxStops: z.number().int().min(0).optional(),
    preferredCarriers: z.array(z.string()).optional(),
    prohibitedCarriers: z.array(z.string()).optional(),
  })
  .optional();

export const flightSearchRequestSchema = z.object({
  legs: z.array(searchLegSchema).min(1, 'At least 1 search leg required'),
  passengers: passengerCountSchema,
  modifiers: searchModifiersSchema,
  traceId: z.string().optional(),
});

export const airPriceRequestSchema = z.object({
  catalogOfferingId: z.string().min(1, 'catalogOfferingId is required'),
  rawIdentifierValue: z.string().optional(),
  offerId: z.string().optional(),
  traceId: z.string().optional(),
});

export const fareRulesRequestSchema = z.object({
  catalogOfferingId: z.string().min(1, 'catalogOfferingId is required'),
  rawIdentifierValue: z.string().optional(),
  offerId: z.string().optional(),
  traceId: z.string().optional(),
});

// ── Controller Handlers ───────────────────────────────────────────────────────

export class TravelportController {
  private searchService: FlightSearchService;
  private priceService: AirPriceService;
  private fareRulesService: FareRulesService;

  constructor() {
    this.searchService = new FlightSearchService();
    this.priceService = new AirPriceService();
    this.fareRulesService = new FareRulesService();
  }

  public searchFlights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const traceId = getOrCreateTraceId((req.headers['traceid'] as string) || req.body?.traceId);
    try {
      const validatedBody = flightSearchRequestSchema.parse(req.body);
      validatedBody.traceId = traceId;

      const result = await this.searchService.searchFlights(validatedBody);
      res.status(200).json(result);
    } catch (err: any) {
      const exception = TravelportErrorHandler.handle(err, traceId);
      res.status(exception.statusCode).json(exception.toNormalizedDto());
    }
  };

  public priceOffer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const traceId = getOrCreateTraceId((req.headers['traceid'] as string) || req.body?.traceId);
    try {
      const validatedBody = airPriceRequestSchema.parse(req.body);
      validatedBody.traceId = traceId;
      if (!validatedBody.rawIdentifierValue) {
        validatedBody.rawIdentifierValue = validatedBody.catalogOfferingId;
      }

      const result = await this.priceService.priceOffer({
        ...validatedBody,
        rawIdentifierValue: validatedBody.rawIdentifierValue || validatedBody.catalogOfferingId,
      });
      res.status(200).json(result);
    } catch (err: any) {
      const exception = TravelportErrorHandler.handle(err, traceId);
      res.status(exception.statusCode).json(exception.toNormalizedDto());
    }
  };

  public getFareRules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const traceId = getOrCreateTraceId((req.headers['traceid'] as string) || req.body?.traceId);
    try {
      const validatedBody = fareRulesRequestSchema.parse(req.body);
      validatedBody.traceId = traceId;
      if (!validatedBody.rawIdentifierValue) {
        validatedBody.rawIdentifierValue = validatedBody.catalogOfferingId;
      }

      const result = await this.fareRulesService.getFareRules({
        ...validatedBody,
        rawIdentifierValue: validatedBody.rawIdentifierValue || validatedBody.catalogOfferingId,
      });
      res.status(200).json(result);
    } catch (err: any) {
      const exception = TravelportErrorHandler.handle(err, traceId);
      res.status(exception.statusCode).json(exception.toNormalizedDto());
    }
  };
}
