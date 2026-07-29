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
    <div className="bg-white border border-[#E8E0D8] rounded-2xl p-2.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 relative">
      {/* Tabs list */}
      <div className="grid grid-cols-3 gap-1 flex-1 max-w-2xl">
        {/* Best Tab */}
        <button
          type="button"
          onClick={() => onTabChange('best')}
          className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
            activeTab === 'best'
              ? 'bg-orange-50/90 border-[#EA580C] text-[#EA580C] font-bold shadow-xs'
              : 'border-transparent text-[#6B6B6B] hover:bg-[#FFFBF7]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide">
            <Award size={13} className="text-[#EA580C]" />
            <span>Best</span>
          </div>
          {summaries.best.price > 0 && (
            <span className="text-sm font-black mt-0.5 text-[#1A1A1A]">
              {formatPrice(summaries.best.price, currency)}{' '}
              {summaries.best.durationStr && (
                <span className="text-xs font-medium text-[#6B6B6B]">
                  • {summaries.best.durationStr}
                </span>
              )}
            </span>
          )}
          {activeTab === 'best' && (
            <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#EA580C] rounded-full" />
          )}
        </button>

        {/* Cheapest Tab */}
        <button
          type="button"
          onClick={() => onTabChange('cheapest')}
          className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
            activeTab === 'cheapest'
              ? 'bg-emerald-50/90 border-emerald-500 text-emerald-800 font-bold shadow-xs'
              : 'border-transparent text-[#6B6B6B] hover:bg-[#FFFBF7]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide">
            <PiggyBank size={13} className="text-emerald-600" />
            <span>Cheapest</span>
          </div>
          {summaries.cheapest.price > 0 && (
            <span className="text-sm font-black mt-0.5 text-[#1A1A1A]">
              {formatPrice(summaries.cheapest.price, currency)}{' '}
              {summaries.cheapest.durationStr && (
                <span className="text-xs font-medium text-[#6B6B6B]">
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
          className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
            activeTab === 'fastest'
              ? 'bg-blue-50/90 border-blue-500 text-blue-800 font-bold shadow-xs'
              : 'border-transparent text-[#6B6B6B] hover:bg-[#FFFBF7]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide">
            <Zap size={13} className="text-blue-600" />
            <span>Fastest</span>
          </div>
          {summaries.fastest.price > 0 && (
            <span className="text-sm font-black mt-0.5 text-[#1A1A1A]">
              {formatPrice(summaries.fastest.price, currency)}{' '}
              {summaries.fastest.durationStr && (
                <span className="text-xs font-medium text-[#6B6B6B]">
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
            className="appearance-none bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="earliest">Earliest departure</option>
            <option value="latest">Latest departure</option>
            <option value="score">Highest AI score</option>
            <option value="stops">Lowest stops</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>

        {/* AI Mode Pill matching reference design */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-[#EA580C] font-extrabold text-xs shadow-2xs">
          <Sparkles size={13} className="animate-pulse text-[#EA580C]" />
          <span>AI Mode</span>
        </div>
      </div>
    </div>
  )
}
