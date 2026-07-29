/**
 * useRecommendation — generic recommendation fetch + loading state.
 */

import { useCallback, useState } from 'react'
import { contextAPI } from '@/lib/api'
import type { ContextRecommendation, ModuleId } from '@/lib/api'

export function useRecommendation<T = any>(module: ModuleId) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recommend = useCallback(
    async (params: { tripId?: string; input?: unknown; bypassCache?: boolean } = {}): Promise<ContextRecommendation<T>[]> => {
      setLoading(true)
      setError(null)
      try {
        const res = await contextAPI.recommend<T>({
          module,
          tripId: params.tripId,
          input: params.input,
          bypassCache: params.bypassCache,
        })
        return res.recommendations ?? []
      } catch (err: any) {
        setError(err?.message || 'Failed to load recommendations.')
        return []
      } finally {
        setLoading(false)
      }
    },
    [module]
  )

  return { recommend, loading, error }
}

export default useRecommendation