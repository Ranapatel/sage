const assert = require('assert')
const express = require('express')
const http = require('http')

process.env.NODE_ENV = 'test'
process.env.PORT = '4000'

const searchRouter = require('../src/routes/search')

const app = express()
app.use(express.json())
app.use('/api/search', searchRouter)

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
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) })
        } catch (_) {
          resolve({ status: res.statusCode, body: data })
        }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function runMultiCitySearchTest() {
  console.log('=== Running Multi-City Search Regression Test ===\n')

  const server = app.listen(0)
  await new Promise(r => server.once('listening', r))

  try {
    const payload = {
      from: 'Delhi',
      isMultiCity: true,
      stops: [
        { city: 'Goa', nights: 2 },
        { city: 'Mumbai', nights: 2 }
      ],
      startDate: '2026-12-01',
      budget: 50000,
      travelers: 2
    }

    const res = await request(server, {
      method: 'POST',
      path: '/api/search',
      body: payload
    })

    console.log('Response Status:', res.status)
    assert.strictEqual(res.status, 200, 'Multi-city search must return HTTP 200')
    assert.strictEqual(res.body.success, true, 'Multi-city search must be successful')
    assert.ok(res.body.data, 'Must return search data')
    assert.ok(Array.isArray(res.body.data.hotels), 'Must return hotels array')
    assert.ok(Array.isArray(res.body.data.transport), 'Must return transport array')
    assert.strictEqual(res.body.meta.flightSource, 'multi', 'Meta must indicate multi-city search')

    console.log('Hotels count:', res.body.data.hotels.length)
    console.log('Transport count:', res.body.data.transport.length)
    console.log('\n🎉 MULTI-CITY SEARCH REGRESSION TEST PASSED 100% (NO REFERENCE ERROR)!')
  } finally {
    server.close()
  }
}

runMultiCitySearchTest().catch(err => {
  console.error('Multi-city test failure:', err)
  process.exit(1)
})

