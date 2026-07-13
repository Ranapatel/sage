/**
 * Activities Router
 *
 * Endpoints:
 *   POST /api/activities/search      — Search activities
 *   POST /api/activities/details     — Get activity details + store rateKey
 *   POST /api/activities/preconfirm  — Create preconfirmed booking reservation
 *   POST /api/activities/reconfirm   — Confirm booking after payment
 *
 * Security:
 *   - Per-route rate limiters
 *   - Zod input validation
 *   - Audit logging on every action
 *   - No secrets exposed to clients
 */

const express = require('express')
const router  = express.Router()

const activitiesService        = require('../activities/activitiesService')
const activitiesBookingService = require('../activities/activitiesBookingService')
const activityCacheSearch      = require('../activities/activityCacheSearchService')
const activityCacheSync        = require('../activities/activityCacheSyncService')
const activityContentSync      = require('../activities/activityContentSyncService')
const razorpayService          = require('../services/razorpayService')
const { featureGate } = require('../activities/activityFeatureFlags')
const { paymentStore }         = require('../models/Payment')
const { writeAudit }           = require('../models/AuditLog')
const { zodValidate }          = require('../middleware/validateRequest')
const { authMiddleware }       = require('../middleware/auth.middleware')
const {
  activitySearchSchema,
  activityCacheSearchSchema,
  activityCacheSyncSchema,
  activityContentSyncSchema,
  activityDetailsSchema,
  preconfirmSchema,
  reconfirmSchema,
} = require('../activities/activitiesValidator')
const {
  activitiesSearchLimiter,
  activitiesDetailsLimiter,
  bookingMutationLimiter,
} = require('../middleware/rateLimitMiddleware')

// Helper: extract client info for audit logs
function clientMeta(req) {
  return {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || null,
    userId:    req.user?.email || req.user?.id || null,
  }
}

// Helper: clean error to not expose internals in production
function safeError(err) {
  return process.env.NODE_ENV === 'production'
    ? 'An error occurred. Please try again.'
    : err.message
}

// ── POST /api/activities/search ───────────────────────────────────────────────

router.post(
  '/search',
  activitiesSearchLimiter,
  zodValidate(activitySearchSchema),
  async (req, res) => {
    const start = Date.now()
    try {
      const result = await activitiesService.searchActivities(req.validatedBody)

      await writeAudit({
        action:     'ACTIVITY_SEARCH',
        payload:    { destination: req.validatedBody.destinationCode || req.validatedBody.coordinates, from: req.validatedBody.fromDate, to: req.validatedBody.toDate },
        result:     'SUCCESS',
        durationMs: Date.now() - start,
        ...clientMeta(req),
      })

      res.json({ success: true, data: result })
    } catch (err) {
      await writeAudit({ action: 'ACTIVITY_SEARCH', result: 'FAILURE', errorMsg: err.message, durationMs: Date.now() - start, ...clientMeta(req) })
      const status = err.statusCode || 500
      res.status(status).json({ success: false, error: safeError(err) })
    }
  }
)

// ── POST /api/activities/details ──────────────────────────────────────────────

router.post(
  '/cache-search',
  activitiesSearchLimiter,
  zodValidate(activityCacheSearchSchema),
  async (req, res) => {
    const start = Date.now()
    try {
      const result = await activityCacheSearch.searchCachedActivities(req.validatedBody)

      await writeAudit({
        action:     'ACTIVITY_CACHE_SEARCH',
        payload:    req.validatedBody,
        result:     'SUCCESS',
        durationMs: Date.now() - start,
        ...clientMeta(req),
      })

      res.json({ success: true, data: result })
    } catch (err) {
      await writeAudit({ action: 'ACTIVITY_CACHE_SEARCH', result: 'FAILURE', errorMsg: err.message, durationMs: Date.now() - start, ...clientMeta(req) })
      const status = err.statusCode || 500
      res.status(status).json({ success: false, error: safeError(err) })
    }
  }
)

router.post(
  '/content-sync',
  authMiddleware,
  bookingMutationLimiter,
  zodValidate(activityContentSyncSchema),
  async (req, res) => {
    const start = Date.now()
    try {
      const result = await activityContentSync.syncCatalog(req.validatedBody)
      await writeAudit({
        action:     'ACTIVITY_CONTENT_SYNC',
        payload:    req.validatedBody,
        result:     'SUCCESS',
        durationMs: Date.now() - start,
        ...clientMeta(req),
      })
      res.status(202).json({ success: true, data: result })
    } catch (err) {
      await writeAudit({ action: 'ACTIVITY_CONTENT_SYNC', result: 'FAILURE', errorMsg: err.message, durationMs: Date.now() - start, ...clientMeta(req) })
      const status = err.statusCode || 500
      res.status(status).json({ success: false, error: safeError(err) })
    }
  }
)

router.post(
  '/cache-sync',
  authMiddleware,
  bookingMutationLimiter,
  zodValidate(activityCacheSyncSchema),
  async (req, res) => {
    const start = Date.now()
    try {
      const result = await activityCacheSync.syncAll(req.validatedBody)

      await writeAudit({
        action:     'ACTIVITY_CACHE_SYNC',
        payload:    req.validatedBody,
        result:     'SUCCESS',
        durationMs: Date.now() - start,
        ...clientMeta(req),
      })

      res.status(202).json({ success: true, data: result })
    } catch (err) {
      await writeAudit({ action: 'ACTIVITY_CACHE_SYNC', result: 'FAILURE', errorMsg: err.message, durationMs: Date.now() - start, ...clientMeta(req) })
      const status = err.statusCode || 500
      res.status(status).json({ success: false, error: safeError(err) })
    }
  }
)

router.post(
  '/details',
  activitiesDetailsLimiter,
  zodValidate(activityDetailsSchema),
  async (req, res) => {
    const start = Date.now()
    // bookingId must be provided by frontend as UUID (used to namespace rateKey in Redis)
    const bookingId = req.headers['x-booking-id'] || req.body.bookingId
    if (!bookingId) {
      return res.status(400).json({ success: false, error: 'x-booking-id header or body.bookingId is required to namespace the rateKey.' })
    }

    try {
      const result = await activitiesService.getActivityDetails(bookingId, req.validatedBody)

      await writeAudit({
        action:     'ACTIVITY_DETAILS',
        bookingId,
        payload:    { activityCode: req.validatedBody.activityCode },
        result:     'SUCCESS',
        durationMs: Date.now() - start,
        ...clientMeta(req),
      })

      // Never return rateKey raw — frontend stores bookingId, backend holds the key
      const { rateKey: _omit, ...safeResult } = result
      res.json({ success: true, data: { ...safeResult, rateKeyStored: true, bookingId } })
    } catch (err) {
      await writeAudit({ action: 'ACTIVITY_DETAILS', bookingId, result: 'FAILURE', errorMsg: err.message, durationMs: Date.now() - start, ...clientMeta(req) })
      const status = err.statusCode || 500
      res.status(status).json({ success: false, error: safeError(err) })
    }
  }
)

// ── POST /api/activities/preconfirm ──────────────────────────────────────────

router.post(
  '/preconfirm',
  authMiddleware,
  bookingMutationLimiter,
  zodValidate(preconfirmSchema),
  async (req, res) => {
    const start = Date.now()
    try {
      const result = await activitiesBookingService.preconfirmBooking(req.validatedBody)

      await writeAudit({
        action:     'PRECONFIRM',
        bookingId:  result.bookingId,
        payload:    { activityCode: req.validatedBody.activityCode, amount: req.validatedBody.amount },
        result:     'SUCCESS',
        durationMs: Date.now() - start,
        ...clientMeta(req),
      })

      res.status(201).json({ success: true, data: result })
    } catch (err) {
      await writeAudit({ action: 'PRECONFIRM', bookingId: req.validatedBody?.bookingId, result: 'FAILURE', errorMsg: err.message, durationMs: Date.now() - start, ...clientMeta(req) })
      const status = err.statusCode || 500
      res.status(status).json({ success: false, error: safeError(err) })
    }
  }
)

// ── POST /api/activities/reconfirm ───────────────────────────────────────────

router.post(
  '/reconfirm',
  authMiddleware,
  bookingMutationLimiter,
  zodValidate(reconfirmSchema),
  async (req, res) => {
    const start = Date.now()
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.validatedBody

    try {
      // Gate 1: Verify payment signature
      const verifiedPayment = await razorpayService.verifyPayment({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      })

      // Gate 2: Confirm with Hotelbeds
      const result = await activitiesBookingService.reconfirmBooking(req.validatedBody, verifiedPayment)

      await writeAudit({
        action:     'RECONFIRM',
        bookingId,
        payload:    { razorpayOrderId },
        result:     'SUCCESS',
        durationMs: Date.now() - start,
        ...clientMeta(req),
      })

      res.json({ success: true, data: result })
    } catch (err) {
      await writeAudit({ action: 'RECONFIRM', bookingId, result: 'FAILURE', errorMsg: err.message, durationMs: Date.now() - start, ...clientMeta(req) })
      const status = err.statusCode || 500
      res.status(status).json({ success: false, error: safeError(err) })
    }
  }
)

module.exports = router
