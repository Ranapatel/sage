/**
 * DelaysAdapter — pluggable transport-delay provider.
 *
 * Phase 1: NullDelaysAdapter. Future: IRCTC live running-status / airline
 * flight-status APIs.
 */

import type { DelaysSnapshot } from '../context.types'

export interface DelaysAdapter {
  readonly name: string
  fetch(source: string, identifier: string, isoDate?: string): Promise<DelaysSnapshot | null>
}

export class NullDelaysAdapter implements DelaysAdapter {
  readonly name = 'null'

  async fetch(_source: string, _identifier: string, _isoDate?: string): Promise<DelaysSnapshot | null> {
    return null
  }
}

export function getDelaysAdapter(): DelaysAdapter {
  const provider = (process.env.DELAYS_ADAPTER || 'null').toLowerCase()
  if (provider === 'null') return new NullDelaysAdapter()
  return new NullDelaysAdapter()
}