/**
 * SafetyAdapter — pluggable safety / travel-advisory provider.
 *
 * Phase 1: NullSafetyAdapter. Future: US State Dept / UK FCDO feeds.
 */

import type { SafetySnapshot } from '../context.types'

export interface SafetyAdapter {
  readonly name: string
  fetch(country: string, city?: string): Promise<SafetySnapshot | null>
}

export class NullSafetyAdapter implements SafetyAdapter {
  readonly name = 'null'

  async fetch(_country: string, _city?: string): Promise<SafetySnapshot | null> {
    return null
  }
}

export function getSafetyAdapter(): SafetyAdapter {
  const provider = (process.env.SAFETY_ADAPTER || 'null').toLowerCase()
  if (provider === 'null') return new NullSafetyAdapter()
  return new NullSafetyAdapter()
}