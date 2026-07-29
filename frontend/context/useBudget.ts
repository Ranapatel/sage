/**
 * useBudget — Budget Intelligence hook (Phase 4 first fully-wired module).
 *
 * Returns the cached BudgetPlan (sourced from useContextStore) and a
 * `refresh()` helper that re-fetches the plan.
 */

import { useCallback } from 'react'
import { contextAPI } from '@/lib/api'
import { useContextStore } from './contextStore'
import type { BudgetPlan, ContextRecommendation } from '@/lib/api'

export function useBudget() {
  const plan = useContextStore((s) => s.budgetPlan)
  const setBudgetPlan = useContextStore((s) => s.setBudgetPlan)

  const refresh = useCallback(async (tripId?: string): Promise<ContextRecommendation<BudgetPlan> | null> => {
    const res = await contextAPI.recommend<BudgetPlan>({
      module: 'budget',
      tripId,
      bypassCache: true,
      input: {},
    })
    const first = res.recommendations?.[0]
    if (first) setBudgetPlan(first)
    return first ?? null
  }, [setBudgetPlan])

  return {
    plan: plan?.data ?? null,
    recommendation: plan,
    refresh,
  }
}

export default useBudget