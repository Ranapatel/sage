/**
 * AuditLog Model
 *
 * Stores a tamper-resistant audit trail for all significant
 * activities-related actions. Secrets and PII are never stored in payload.
 */

const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  action: {
    type:     String,
    required: true,
    enum:     [
      'ACTIVITY_SEARCH',
      'ACTIVITY_DETAILS',
      'PRECONFIRM',
      'PAYMENT_CREATE',
      'PAYMENT_VERIFY',
      'PAYMENT_WEBHOOK',
      'RECONFIRM',
      'BOOKING_GET',
      'BOOKING_LIST',
      'CANCEL_SIMULATION',
      'CANCEL',
    ],
    index: true,
  },
  userId:    { type: String, default: null, index: true },
  bookingId: { type: String, default: null, index: true },
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null },

  // Sanitized request snapshot — no secrets, no card data
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },

  result:    { type: String, enum: ['SUCCESS', 'FAILURE', 'PARTIAL'], default: 'SUCCESS' },
  errorCode: { type: String, default: null },
  errorMsg:  { type: String, default: null },

  durationMs: { type: Number, default: null },
  createdAt:  { type: Date, default: Date.now },
}, { versionKey: false })

// TTL index — auto-purge audit logs after 1 year
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 3600 })

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema)

// In-memory ring buffer fallback (last 500 entries) when MongoDB unavailable
const memoryAuditLog = []
const MEM_LIMIT = 500

const isMongoConnected = () => mongoose.connection.readyState === 1

async function writeAudit(entry) {
  const doc = {
    action:    entry.action,
    userId:    entry.userId    || null,
    bookingId: entry.bookingId || null,
    ipAddress: entry.ipAddress || null,
    userAgent: entry.userAgent || null,
    payload:   entry.payload   || {},
    result:    entry.result    || 'SUCCESS',
    errorCode: entry.errorCode || null,
    errorMsg:  entry.errorMsg  || null,
    durationMs:entry.durationMs|| null,
    createdAt: new Date(),
  }

  if (isMongoConnected()) {
    try {
      await AuditLog.create(doc)
      return
    } catch (err) {
      console.warn('[AuditLog] MongoDB write failed:', err.message)
    }
  }

  // Fallback to memory ring buffer
  if (memoryAuditLog.length >= MEM_LIMIT) memoryAuditLog.shift()
  memoryAuditLog.push(doc)
}

module.exports = { AuditLog, writeAudit }
