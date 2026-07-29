/**
 * FxAdapter — pluggable foreign-exchange provider.
 *
 * Phase 8 ships two implementations:
 *   - `null`        — returns null (no I/O). Default.
 *   - `frankfurter` — calls the no-key Frankfurter API (https://www.frankfurter.dev/).
 *
 * Activate via env var: `FX_ADAPTER=frankfurter`
 */

import axios from 'axios'
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

/** Frankfurter — no-key FX API based on ECB daily rates. */
export class FrankfurterFxAdapter implements FxAdapter {
  readonly name = 'frankfurter'

  async fetch(base: string, symbols?: string[]): Promise<FxSnapshot | null> {
    try {
      const url = `https://api.frankfurter.dev/v1/latest`
      const params: Record<string, string> = { base: base.toUpperCase() }
      if (symbols && symbols.length > 0) {
        params['symbols'] = symbols.map((s) => s.toUpperCase()).join(',')
      }
      const res = await axios.get(url, { params, timeout: 3500 })
      const data = res.data ?? {}
      if (!data.rates) return null
      const rates: Record<string, number> = {}
      for (const [k, v] of Object.entries(data.rates)) {
        if (typeof v === 'number') rates[k.toUpperCase()] = v
        else if (typeof v === 'string') {
          const n = Number(v)
          if (!Number.isNaN(n)) rates[k.toUpperCase()] = n
        }
      }
      return { base: (data.base ?? base).toUpperCase(), rates }
    } catch (err: any) {
      console.warn('[FxAdapter] frankfurter error:', err?.message || err)
      return null
    }
  }
}

export function getFxAdapter(): FxAdapter {
  const provider = (process.env.FX_ADAPTER || 'null').toLowerCase()
  if (provider === 'frankfurter') return new FrankfurterFxAdapter()
  return new NullFxAdapter()
}