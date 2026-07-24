'use client'

import React from 'react'
import { Sparkles, ChevronDown, Award, PiggyBank, Zap } from 'lucide-react'
import { formatPrice } from '@/lib/currency'

export type TabOption = 'best' | 'cheapest' | 'fastest'
export type SortOption = 'earliest' | 'latest' | 'score' | 'stops'

interface SummaryItem {
  price: number
  durationStr: string
}

interface AiFlightTabsHeaderProps {
  activeTab: TabOption
  onTabChange: (tab: TabOption) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  summaries: {
    best: SummaryItem
    cheapest: SummaryItem
    fastest: SummaryItem
  }
  currency?: string
}

export default function AiFlightTabsHeader({
  activeTab,
  onTabChange,
  sortBy,
  onSortChange,
  summaries,
  currency = 'INR',
}: AiFlightTabsHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 relative">
      {/* Tabs list */}
      <div className="grid grid-cols-3 gap-1 flex-1 max-w-2xl">
        {/* Best Tab */}
        <button
          type="button"
          onClick={() => onTabChange('best')}
          className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-left transition-all relative ${
            activeTab === 'best'
              ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-600 dark:text-orange-400 font-bold shadow-xs'
              : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide">
            <Award size={13} className="text-orange-500" />
            <span>Best</span>
          </div>
          {summaries.best.price > 0 && (
            <span className="text-sm font-black mt-0.5">
              {formatPrice(summaries.best.price, currency)}{' '}
              {summaries.best.durationStr && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  • {summaries.best.durationStr}
                </span>
              )}
            </span>
          )}
          {activeTab === 'best' && (
            <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>

        {/* Cheapest Tab */}
        <button
          type="button"
          onClick={() => onTabChange('cheapest')}
          className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-left transition-all relative ${
            activeTab === 'cheapest'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
              : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide">
            <PiggyBank size={13} className="text-emerald-500" />
            <span>Cheapest</span>
          </div>
          {summaries.cheapest.price > 0 && (
            <span className="text-sm font-black mt-0.5">
              {formatPrice(summaries.cheapest.price, currency)}{' '}
              {summaries.cheapest.durationStr && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  • {summaries.cheapest.durationStr}
                </span>
              )}
            </span>
          )}
          {activeTab === 'cheapest' && (
            <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-500 rounded-full" />
          )}
        </button>

        {/* Fastest Tab */}
        <button
          type="button"
          onClick={() => onTabChange('fastest')}
          className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-left transition-all relative ${
            activeTab === 'fastest'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
              : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide">
            <Zap size={13} className="text-blue-500" />
            <span>Fastest</span>
          </div>
          {summaries.fastest.price > 0 && (
            <span className="text-sm font-black mt-0.5">
              {formatPrice(summaries.fastest.price, currency)}{' '}
              {summaries.fastest.durationStr && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  • {summaries.fastest.durationStr}
                </span>
              )}
            </span>
          )}
          {activeTab === 'fastest' && (
            <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Right controls: Other options dropdown + AI Mode pill */}
      <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="earliest">Earliest departure</option>
            <option value="latest">Latest departure</option>
            <option value="score">Highest AI score</option>
            <option value="stops">Lowest stops</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* AI Mode Pill matching reference design */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 via-orange-500/10 to-emerald-500/10 border border-purple-500/30 rounded-full text-purple-600 dark:text-purple-300 font-extrabold text-xs shadow-xs">
          <Sparkles size={13} className="animate-pulse text-purple-500" />
          <span>AI Mode</span>
        </div>
      </div>
    </div>
  )
}
