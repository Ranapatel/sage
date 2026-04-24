'use client'

import React, { useState, useEffect } from 'react'
import { useTripStore } from '@/store/tripStore'
import { tripAPI } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function BudgetOptimizerTab() {
  const { tripContext, userProfile } = useTripStore()
  const [data, setData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runOptimizer = async () => {
    if (!tripContext?.destination) return
    setLoading(true)
    setError(null)
    try {
      const res = await tripAPI.optimizeBudget({
        destination: tripContext.destination,
        days: tripContext.endDate && tripContext.startDate 
          ? Math.ceil((new Date(tripContext.endDate).getTime() - new Date(tripContext.startDate).getTime()) / (1000 * 3600 * 24)) || 3
          : 3,
        budget: userProfile?.budget || 2000,
        style: userProfile?.travelStyle || 'adventure',
        preferences: userProfile?.preferences || [],
        members: userProfile?.members || 2
      })
      setData(res.data)
    } catch (err: any) {
      setError(err.message || 'Failed to optimize budget')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold gradient-text mb-2">Budget Optimization Engine</h2>
          <p className="text-[var(--text-secondary)] max-w-2xl text-sm">
            Our AI analyzes millions of data points to minimize total cost while maximizing your experience value, strictly bound to your budget constraints.
          </p>
        </div>
        <button 
          onClick={runOptimizer} 
          disabled={loading || !tripContext?.destination}
          className="btn-primary py-2 px-6 flex items-center gap-2"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Running AI...</>
          ) : (
            <>💰 Run Optimization</>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {!data && !loading && !error && (
        <div className="glass p-12 rounded-2xl text-center border-dashed border-2 border-[var(--border)]">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Ready to optimize</h3>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            Click the button above to generate 3 financially optimized plans for your trip to {tripContext?.destination || 'your destination'}.
          </p>
        </div>
      )}

      {loading && (
        <div className="glass p-12 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-[var(--text-primary)] font-semibold animate-pulse">Running Financial Optimizer...</p>
          <p className="text-[var(--text-muted)] text-sm mt-2">Calculating satisfaction scores, cost penalties, and savings.</p>
        </div>
      )}

      {data && !loading && (
        <div className="glass p-8 rounded-2xl markdown-body prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
