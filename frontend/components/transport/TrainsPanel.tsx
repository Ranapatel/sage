'use client'

import React from 'react'
import TrainsTab from '../train/TrainsTab'

interface TrainsPanelProps {
  origin: string
  destination: string
  date: string
  passengers?: number
}

export function TrainsPanel(props: TrainsPanelProps) {
  return <TrainsTab />
}

export default TrainsPanel
