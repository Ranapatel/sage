'use client'

import React from 'react'
import AiSmartBusPlanner from '../bus/AiSmartBusPlanner'

interface BusesPanelProps {
  origin?: string
  destination?: string
  date?: string
  passengers?: number
}

export function BusesPanel(props: BusesPanelProps) {
  return <AiSmartBusPlanner />
}

export default BusesPanel
