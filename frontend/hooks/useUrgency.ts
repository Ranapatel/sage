'use client'

import { useState, useEffect } from 'react'

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
  return Math.floor(Date.now() / 90000)
}

function secondsLeft() {
  const windowMs = 90000
  return Math.ceil((windowMs - (Date.now() % windowMs)) / 1000)
}

function pick<T>(arr: T[], offset: number): T {
  return arr[Math.abs(offset) % arr.length]
}

export function useUrgency(itemId: string) {
  // Start with stable SSR-safe values (0 seed, 90s countdown)
  // to avoid hydration mismatch — real values set after mount
  const [seed, setSeed] = useState(0)
  const [countdown, setCountdown] = useState(90)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Set real values only on the client after hydration
    setSeed(timeSeed())
    setCountdown(secondsLeft())
    setMounted(true)

    const seedTimer = setInterval(() => setSeed(timeSeed()), 90000)
    const countTimer = setInterval(() => setCountdown(secondsLeft()), 1000)
    return () => { clearInterval(seedTimer); clearInterval(countTimer) }
  }, [])

  const idNum = itemId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const combined = seed + idNum

  const discount      = pick(DISCOUNTS, combined)
  const urgency       = mounted ? pick(URGENCY_MESSAGES, combined + 1) : 'Best Deal'
  const flightScarcity = mounted ? pick(SCARCITY_FLIGHT, combined + 2) : 'Limited seats'
  const hotelScarcity  = mounted ? pick(SCARCITY_HOTEL,  combined + 3) : 'Limited rooms'
  const carScarcity    = mounted ? pick(SCARCITY_CAR,    combined + 4) : 'Limited availability'

  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60
  const countdownLabel = mounted
    ? `${mins}m ${String(secs).padStart(2, '0')}s`
    : '--m --s'

  return { discount, urgency, flightScarcity, hotelScarcity, carScarcity, countdownLabel }
}
