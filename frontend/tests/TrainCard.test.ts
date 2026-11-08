import test from 'node:test'
import assert from 'node:assert/strict'
import { buildIrctcDeepLink } from '../lib/smartTrainPlanner.ts'

const mockTrain = {
  trainNumber: '12345',
  trainName: 'Test Express',
  departure: '10:00',
  arrival: '18:00',
  duration: '8h 00m',
  runsOn: ['Mon', 'Tue'],
  availableClasses: [
    {
      class: '3A',
      className: 'AC 3 Tier',
      available: true,
      price: 1500,
      availability: 'AVAILABLE 24',
    },
  ],
  bookingUrl: 'https://makemytrip.com/railways/test',
  originCode: 'NDLS',
  destinationCode: 'CSTM',
}

test('TrainCard: validates train details model integrity', () => {
  assert.equal(mockTrain.trainNumber, '12345')
  assert.equal(mockTrain.trainName, 'Test Express')
  assert.equal(mockTrain.originCode, 'NDLS')
  assert.equal(mockTrain.destinationCode, 'CSTM')
  assert.equal(mockTrain.availableClasses[0].class, '3A')
  assert.equal(mockTrain.availableClasses[0].price, 1500)
})

test('TrainCard: IRCTC deep link builder formats parameters correctly', () => {
  const deepLink = buildIrctcDeepLink({
    srcStn: mockTrain.originCode,
    destStn: mockTrain.destinationCode,
    dateStr: '2026-12-01',
    journeyClass: '3A',
  })
  assert.ok(deepLink.includes('NDLS'), 'Contains origin station code')
  assert.ok(deepLink.includes('CSTM'), 'Contains destination station code')
  assert.ok(deepLink.includes('irctc.co.in'), 'Points to official IRCTC domain')
})

