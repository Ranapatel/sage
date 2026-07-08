/**
 * Activities Input Validator
 *
 * Zod schemas for all activity endpoint inputs.
 * All schemas are strict (no extra keys pass through).
 */

const { z } = require('zod')

// ── Shared sub-schemas ────────────────────────────────────────────────────────

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(s => !isNaN(Date.parse(s)), 'Invalid date value')

const paxSchema = z.object({
  age:  z.number().int().min(0).max(120),
  type: z.enum(['ADULT', 'CHILD', 'INFANT']).optional(),
})

const passengerSchema = z.object({
  firstName: z.string().min(1).max(60).trim(),
  lastName:  z.string().min(1).max(60).trim(),
  age:       z.number().int().min(0).max(120),
  type:      z.enum(['ADULT', 'CHILD', 'INFANT']).default('ADULT'),
})

const holderSchema = z.object({
  firstName: z.string().min(1).max(60).trim(),
  lastName:  z.string().min(1).max(60).trim(),
  email:     z.string().email(),
  phone:     z.string().min(6).max(20).trim(),
})

// ── Activity Search ───────────────────────────────────────────────────────────

const activitySearchSchema = z
  .object({
    // Destination options (at least one required)
    destinationCode: z.string().max(20).optional(),
    hotelCode:       z.string().max(20).optional(),
    coordinates: z
      .object({
        latitude:  z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        radius:    z.number().min(1).max(200).default(50),
        unit:      z.enum(['km', 'mi']).default('km'),
      })
      .optional(),

    // Date range
    fromDate: dateStringSchema,
    toDate:   dateStringSchema,

    // Passengers
    paxes: z.array(paxSchema).min(1).max(20),

    // Optional filters
    keyword:       z.string().max(100).optional(),
    language:      z.string().max(5).default('en'),
    minPrice:      z.number().min(0).optional(),
    maxPrice:      z.number().min(0).optional(),
    activityType:  z.string().max(50).optional(),

    // Pagination
    from: z.number().int().min(1).default(1),
    to:   z.number().int().min(1).max(100).default(20),
  })
  .refine(
    d => d.destinationCode || d.hotelCode || d.coordinates,
    {
      message: 'At least one of destinationCode, hotelCode, or coordinates is required',
      path:    ['destinationCode'],
    }
  )
  .refine(
    d => new Date(d.fromDate) <= new Date(d.toDate),
    { message: 'fromDate must be before or equal to toDate', path: ['fromDate'] }
  )
  .refine(
    d => !d.minPrice || !d.maxPrice || d.minPrice <= d.maxPrice,
    { message: 'minPrice must be <= maxPrice', path: ['minPrice'] }
  )

// ── Activity Details ──────────────────────────────────────────────────────────

const activityCacheSearchSchema = z.object({
  destinationCode: z.string().max(20).optional(),
  keyword:         z.string().max(100).optional(),
  category:        z.string().max(50).optional(),
  segment:         z.string().max(50).optional(),
  activityType:    z.string().max(50).optional(),
  minPrice:        z.number().min(0).optional(),
  maxPrice:        z.number().min(0).optional(),
  page:            z.number().int().min(1).default(1),
  limit:           z.number().int().min(1).max(100).default(20),
}).refine(
  d => !d.minPrice || !d.maxPrice || d.minPrice <= d.maxPrice,
  { message: 'minPrice must be <= maxPrice', path: ['minPrice'] }
)

const activityCacheSyncSchema = z.object({
  destinationCode: z.string().max(20).optional(),
  language:        z.string().max(5).default('en'),
  from:            z.number().int().min(1).optional(),
  to:              z.number().int().min(1).max(1000).optional(),
})

const activityContentSyncSchema = z.object({
  language: z.string().max(5).default('en'),
  from:     z.number().int().min(1).optional(),
  to:       z.number().int().min(1).max(1000).optional(),
})

const activityDetailsSchema = z.object({
  activityCode: z.string().min(1).max(50),
  fromDate:     dateStringSchema,
  toDate:       dateStringSchema,
  language:     z.string().max(5).default('en'),
  paxes:        z.array(paxSchema).min(1).max(20),
})

// ── Preconfirm ───────────────────────────────────────────────────────────────

const preconfirmSchema = z.object({
  bookingId:    z.string().uuid('bookingId must be a valid UUID'),
  activityCode: z.string().min(1).max(50),
  activityName: z.string().min(1).max(200),
  modalityCode: z.string().max(50).optional(),
  modalityName: z.string().max(200).optional(),
  language:     z.string().max(5).default('en'),
  fromDate:     dateStringSchema,
  toDate:       dateStringSchema,
  passengers:   z.array(passengerSchema).min(1).max(20),
  holder:       holderSchema,
  amount:       z.number().positive(),
  currency:     z.string().max(3).default('EUR'),
})

// ── Reconfirm ────────────────────────────────────────────────────────────────

const reconfirmSchema = z.object({
  bookingId:          z.string().uuid(),
  razorpayOrderId:    z.string().min(1).max(100),
  razorpayPaymentId:  z.string().min(1).max(100),
  razorpaySignature:  z.string().min(1).max(500),
})

// ── Create Payment Order ──────────────────────────────────────────────────────

const createPaymentOrderSchema = z.object({
  bookingId:      z.string().uuid(),
  idempotencyKey: z.string().uuid(),
  amountINR:      z.number().positive().max(10000000),    // max ₹1 lakh
  currency:       z.enum(['INR']).default('INR'),
})

// ── Cancellation ─────────────────────────────────────────────────────────────

const cancellationSchema = z.object({
  language:  z.string().max(5).default('en'),
  confirmed: z.boolean().optional(),
})

// ── Booking List ─────────────────────────────────────────────────────────────

const bookingListSchema = z.object({
  status:   z.enum(['PRECONFIRMED', 'PAYMENT_PENDING', 'PAID', 'RECONFIRMING', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'FAILED', 'RECONFIRM_FAILED']).optional(),
  fromDate: dateStringSchema.optional(),
  toDate:   dateStringSchema.optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
})

module.exports = {
  activitySearchSchema,
  activityCacheSearchSchema,
  activityCacheSyncSchema,
  activityContentSyncSchema,
  activityDetailsSchema,
  preconfirmSchema,
  reconfirmSchema,
  createPaymentOrderSchema,
  cancellationSchema,
  bookingListSchema,
}
