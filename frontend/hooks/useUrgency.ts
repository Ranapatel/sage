'use client'

import { useState, useEffect } from 'react'

// Rotates every N seconds based on wall-clock time buckets
const URGENCY_MESSAGES = [
  'Selling fast!',
  'Limited time deal',
  'Offer ending soon',
  'High demand today',
  'Price drop — act now',
  'Trending destination',
  'Almost gone!',
]

const SCARCITY_FLIGHT = [
  'Only 1 seat left!',
  'Only 2 seats left!',
  'Only 3 seats left!',
  'Last 4 seats!',
  'Only 2 economy seats!',
]

const SCARCITY_HOTEL = [
  'Only 1 room left!',
  'Only 2 rooms left!',
  'Last room at this price!',
  'Only 3 rooms available!',
]

const SCARCITY_CAR = [
  'Only 1 car left!',
  'Last 2 available!',
  'Only 3 cars left!',
]

const DISCOUNTS = [15, 20, 22, 25, 28, 30, 32, 35]

function timeSeed() {
  // Changes every 90 seconds — gives a "live" feel without being distracting
  return Math.floor(Date.now() / 90000)
}

function pick<T>(arr: T[], offset: number): T {
  return arr[Math.abs(offset) % arr.length]
}

/** Countdown in seconds within the current 90-second window */
function secondsLeft() {
  const windowMs = 90000
  return Math.ceil((windowMs - (Date.now() % windowMs)) / 1000)
}

export function useUrgency(itemId: string) {
  const [seed, setSeed] = useState(timeSeed)
  const [countdown, setCountdown] = useState(secondsLeft)

  useEffect(() => {
    // Update seed every 90 seconds
    const seedTimer = setInterval(() => setSeed(timeSeed()), 90000)
    // Tick countdown every second
    const countTimer = setInterval(() => setCountdown(secondsLeft()), 1000)
    return () => { clearInterval(seedTimer); clearInterval(countTimer) }
  }, [])

  // Mix item id into the seed so different items show different values
  const idNum = itemId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const combined = seed + idNum

  const discount = pick(DISCOUNTS, combined)
  const urgency = pick(URGENCY_MESSAGES, combined + 1)

  const flightScarcity = pick(SCARCITY_FLIGHT, combined + 2)
  const hotelScarcity = pick(SCARCITY_HOTEL, combined + 3)
  const carScarcity = pick(SCARCITY_CAR, combined + 4)

  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60
  const countdownLabel = `${mins}m ${String(secs).padStart(2, '0')}s`

  return { discount, urgency, flightScarcity, hotelScarcity, carScarcity, countdownLabel }
}
