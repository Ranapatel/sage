'use client'

import React from 'react'
import TrainsPanel from '../transport/TrainsPanel'
import { useTripStore } from '@/store/tripStore'

export default function TrainsTab() {
  const { tripContext } = useTripStore()
  return (
    <TrainsPanel
      origin={tripContext?.startLocation || ''}
      destination={tripContext?.destination || ''}
      date={tripContext?.startDate || ''}
      passengers={(tripContext as any)?.travelers || (tripContext as any)?.members || 1}
    />
  )
}
