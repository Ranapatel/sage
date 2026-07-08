import { z } from 'zod'

export const updateProfileSchema = z.object({
  phoneNumber: z.string().max(20).optional().nullable(),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }).optional().nullable(),
  gender: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  language: z.string().max(50).optional().nullable()
})

export const updatePreferencesSchema = z.object({
  travelStyle: z.string().max(100).optional().nullable(),
  budgetRange: z.string().max(100).optional().nullable(),
  interests: z.array(z.string().max(100)).optional(),
  foodPreference: z.array(z.string().max(100)).optional(),
  accommodationPreference: z.string().max(100).optional().nullable(),
  tripDuration: z.string().max(50).optional().nullable()
})

export const savedItemSchema = z.object({
  type: z.enum(['destination', 'itinerary', 'hotel', 'activity', 'restaurant']),
  referenceId: z.string().min(1)
})

export const memorySchema = z.object({
  tripId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  photos: z.array(z.string().url()),
  location: z.string().max(200).optional().nullable()
})

export const walletTransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['credit', 'debit']),
  reason: z.string().min(1).max(300)
})

export const referralSchema = z.object({
  referredEmail: z.string().email(),
  status: z.string().default('pending'),
  reward: z.number().nonnegative().default(100.0)
})
