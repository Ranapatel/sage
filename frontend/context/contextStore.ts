/**
 * Context store — Zustand slice that holds the cached ContextObject,
 * the latest BudgetPlan, and unread-notification count.
 *
 * Read-only from the UI's perspective — mutations happen via
 * ContextProvider → API → reducer-style updates here.
 */

import { create } from 'zustand'
import type { ContextObject, ContextRecommendation, BudgetPlan } from '@/lib/api'

interface ContextState {
  /** Cached ContextObject — refreshed by the provider on auth / trip change. */
  context: ContextObject | null
  /** Last fetched BudgetPlan recommendation. */
  budgetPlan: ContextRecommendation<BudgetPlan> | null
  /** Unread notifications count (cheap counter, full list fetched on demand). */
  unreadCount: number
  /** True while a build is in flight. */
  isBuilding: boolean
  /** Last error encountered (auto-clears on next successful build). */
  lastError: string | null

  setContext: (ctx: ContextObject | null) => void
  setBudgetPlan: (plan: ContextRecommendation<BudgetPlan> | null) => void
  setUnreadCount: (n: number) => void
  setIsBuilding: (b: boolean) => void
  setLastError: (err: string | null) => void
  reset: () => void
}

export const useContextStore = create<ContextState>((set) => ({
  context: null,
  budgetPlan: null,
  unreadCount: 0,
  isBuilding: false,
  lastError: null,

  setContext: (ctx) => set({ context: ctx, lastError: null }),
  setBudgetPlan: (plan) => set({ budgetPlan: plan }),
  setUnreadCount: (n) => set({ unreadCount: n }),
  setIsBuilding: (b) => set({ isBuilding: b }),
  setLastError: (err) => set({ lastError: err }),
  reset: () => set({
    context: null,
    budgetPlan: null,
    unreadCount: 0,
    isBuilding: false,
    lastError: null,
  }),
}))