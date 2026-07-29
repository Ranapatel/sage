'use client'

import React from 'react'
import AiSmartTrainPlanner from '../train/AiSmartTrainPlanner'

interface TrainsPanelProps {
  origin: string
  destination: string
  date: string            // YYYY-MM-DD
  passengers?: number
}

/**
 * The Train tab is now powered by the AI Smart Train Planner, which
 * independently analyzes the railway network and synthesizes Best /
 * Fastest / Cheapest / Comfortable routes (direct or multi-leg with
 * last-mile transport and IRCTC deep links).
 */
export function TrainsPanel(_props: TrainsPanelProps) {
  return <AiSmartTrainPlanner />
}

export default TrainsPanel