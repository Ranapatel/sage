const assert = require('assert')
const reconciliationService = require('./activitiesReconciliationService')

// Basic integrity check to verify module exposes the scheduled trigger
assert.strictEqual(typeof reconciliationService.reconcileStrandedBookings, 'function')
assert.strictEqual(typeof reconciliationService.reconcileBooking, 'function')

console.log('activitiesReconciliation tests passed')
