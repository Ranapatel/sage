'use client'

import React from 'react'
import AiSmartBusPlanner from '../bus/AiSmartBusPlanner'

interface BusesPanelProps {
  origin?: string
  destination?: string
  date?: string
  passengers?: number
}

/**
 * The Bus tab is now powered by the AI Smart Bus Planner, which
 * independently analyzes the road transport network and synthesizes
 * Best / Fastest / Cheapest routes (direct or multi-hop with last-mile
 * transport and redBus deep links).
 */
export function BusesPanel(_props: BusesPanelProps) {
  return <AiSmartBusPlanner />
}

export default BusesPanel