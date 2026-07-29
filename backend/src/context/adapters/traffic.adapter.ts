/**
 * TrafficAdapter — pluggable traffic / route-conditions provider.
 *
 * Phase 1: NullTrafficAdapter. Future: Google Distance Matrix / TomTom.
 */

import type { TrafficSnapshot } from '../context.types'

export interface TrafficAdapter {
  readonly name: string
  fetch(origin: string, destination: string, isoDate?: string): Promise<TrafficSnapshot | null>
}

export class NullTrafficAdapter implements TrafficAdapter {
  readonly name = 'null'

  async fetch(_origin: string, _destination: string, _isoDate?: string): Promise<TrafficSnapshot | null> {
    return null
  }
}

export function getTrafficAdapter(): TrafficAdapter {
  const provider = (process.env.TRAFFIC_ADAPTER || 'null').toLowerCase()
  if (provider === 'null') return new NullTrafficAdapter()
  return new NullTrafficAdapter()
}