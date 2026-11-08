const assert = require('assert')
const express = require('express')
const http = require('http')

process.env.NODE_ENV = 'test'
process.env.CLERK_SECRET_KEY = 'sk_test_mock_for_booking_security_test'

try {
  require('ts-node').register({ transpileOnly: true })
} catch (_) { }

const { authMiddleware } = require('../src/middleware/auth.middleware')
const bookingRouter = require('../src/routes/booking')

const app = express()
app.use(express.json())

// Mock users middleware for testing authorization logic
const mockUsers = {
  userA: { id: 'usr_userA_123', clerkUserId: 'clerk_userA_123', email: 'userA@tripsage.in' },
  userB: { id: 'usr_userB_456', clerkUserId: 'clerk_userB_456', email: 'userB@tripsage.in' }
}

// Override authMiddleware in this test harness to simulate User A, User B, or Unauth
let activeTestUser = null
app.use((req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied: No token provided' })
  }
  const token = authHeader.split(' ')[1]
  if (token === 'token_user_a') {
    req.user = mockUsers.userA
    return next()
  } else if (token === 'token_user_b') {
    req.user = mockUsers.userB
    return next()
  } else {
    return res.status(401).json({ success: false, message: 'Access denied: Invalid or expired token' })
  }
})

app.use('/api/booking', bookingRouter)

// In-memory test runner
async function request(server, { method, path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1',
      port: server.address().port,
      method,
      path,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        let json = null
        try { json = JSON.parse(data) } catch (e) { json = data }
        resolve({ status: res.statusCode, body: json })
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function runSecurityTests() {
  console.log('=== Running Booking IDOR & Authorization Security Tests ===\n')

  const server = app.listen(0)
  await new Promise(r => server.once('listening', r))

  try {
    const { v4: uuidv4 } = require('uuid')
    const testBookingId = uuidv4()

    // Seed test booking belonging to User A
    const fs = require('fs')
    const path = require('path')
    const bookingsFile = path.join(__dirname, '../../data/bookings.json')
    let existingBookings = {}
    if (fs.existsSync(bookingsFile)) {
      try { existingBookings = JSON.parse(fs.readFileSync(bookingsFile, 'utf8')) } catch (_) { }
    }

    const testBooking = {
      id: testBookingId,
      userId: mockUsers.userA.id,
      userClerkId: mockUsers.userA.clerkUserId,
      type: 'hotel',
      itemId: 'hbd_test_101',
      status: 'CONFIRMED',
      bookingReference: 'HBD-REF-TEST-999',
      hotelName: 'Secure Oasis Resort',
      hotelAddress: 'Goa, India',
      checkIn: '2026-12-01',
      checkOut: '2026-12-04',
      totalPrice: 12000,
      currency: 'INR',
      guests: [{ firstName: 'Alice', lastName: 'Smith' }],
      cancellationPolicies: [{ amount: '0', from: '2026-11-25T00:00:00Z' }]
    }

    existingBookings[testBookingId] = testBooking
    fs.mkdirSync(path.dirname(bookingsFile), { recursive: true })
    fs.writeFileSync(bookingsFile, JSON.stringify(existingBookings, null, 2), 'utf8')

    // Reload bookings in router
    const { execSync } = require('child_process')

    console.log('[Test 1] Unauthenticated user accesses User A booking...')
    let res = await request(server, {
      method: 'GET',
      path: `/api/booking/${testBookingId}`
    })
    assert.strictEqual(res.status, 401, 'Unauthenticated access must return 401')
    console.log('  └─ ✅ PASSED (401 Unauthorized)')

    console.log('[Test 2] User B accesses User A booking...')
    res = await request(server, {
      method: 'GET',
      path: `/api/booking/${testBookingId}`,
      headers: { Authorization: 'Bearer token_user_b' }
    })
    assert.strictEqual(res.status, 404, 'User B must not see User A booking (404 privacy-preserving)')
    console.log('  └─ ✅ PASSED (404 Not Found)')

    console.log('[Test 3] User A accesses own booking...')
    res = await request(server, {
      method: 'GET',
      path: `/api/booking/${testBookingId}`,
      headers: { Authorization: 'Bearer token_user_a' }
    })
    assert.strictEqual(res.status, 200, 'User A must access own booking')
    assert.strictEqual(res.body.data.id, testBookingId)
    console.log('  └─ ✅ PASSED (200 OK)')

    console.log('[Test 4] User B attempts to cancel User A booking...')
    res = await request(server, {
      method: 'POST',
      path: `/api/booking/${testBookingId}/cancel`,
      headers: { Authorization: 'Bearer token_user_b' }
    })
    assert.strictEqual(res.status, 404, 'User B cannot cancel User A booking')
    console.log('  └─ ✅ PASSED (404 Not Found / Denied)')

    console.log('[Test 5] User B attempts to confirm User A booking...')
    res = await request(server, {
      method: 'POST',
      path: `/api/booking/${testBookingId}/confirm`,
      headers: { Authorization: 'Bearer token_user_b' }
    })
    assert.strictEqual(res.status, 404, 'User B cannot confirm User A booking')
    console.log('  └─ ✅ PASSED (404 Not Found / Denied)')

    console.log('[Test 6] User B attempts to download User A voucher...')
    res = await request(server, {
      method: 'GET',
      path: `/api/booking/${testBookingId}/voucher`,
      headers: { Authorization: 'Bearer token_user_b' }
    })
    assert.strictEqual(res.status, 404, 'User B cannot view User A voucher')
    console.log('  └─ ✅ PASSED (404 Not Found / Denied)')

    console.log('[Test 7] User A downloads own voucher...')
    res = await request(server, {
      method: 'GET',
      path: `/api/booking/${testBookingId}/voucher`,
      headers: { Authorization: 'Bearer token_user_a' }
    })
    assert.strictEqual(res.status, 200, 'User A can view own voucher')
    assert.ok(res.body.data.bookingReference, 'Voucher contains bookingReference')
    console.log('  └─ ✅ PASSED (200 OK)')

    // Cleanup test booking
    delete existingBookings[testBookingId]
    fs.writeFileSync(bookingsFile, JSON.stringify(existingBookings, null, 2), 'utf8')

    console.log('\n🎉 ALL 7 BOOKING SECURITY REGRESSION TESTS PASSED 100%!')
  } finally {
    server.close()
  }
}

runSecurityTests().catch(err => {
  console.error('Test failure:', err)
  process.exit(1)
})

