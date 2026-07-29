/**
 * FxAdapter — pluggable foreign-exchange provider.
 *
 * Phase 1: NullFxAdapter returns null. Future: Frankfurter / Open Exchange Rates.
 */

import type { FxSnapshot } from '../context.types'

export interface FxAdapter {
  readonly name: string
  fetch(base: string, symbols?: string[]): Promise<FxSnapshot | null>
}

export class NullFxAdapter implements FxAdapter {
  readonly name = 'null'

  async fetch(_base: string, _symbols?: string[]): Promise<FxSnapshot | null> {
    return null
  }
}

export function getFxAdapter(): FxAdapter {
  const provider = (process.env.FX_ADAPTER || 'null').toLowerCase()
  if (provider === 'null') return new NullFxAdapter()
  return new NullFxAdapter()
}