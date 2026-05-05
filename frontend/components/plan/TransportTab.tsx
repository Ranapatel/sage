'use client'

import React, { memo } from 'react'
import TransportCard from '../transport/TransportCard'

interface Props {
  transport: any[]
  loading: boolean
  tripContext: any
  searchForm: any
}

function SkeletonCards({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="shimmer h-4 w-1/3" />
            <div className="shimmer h-6 w-16" />
          </div>
          <div className="flex items-center gap-4">
            <div className="shimmer h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="shimmer h-4 w-full" />
              <div className="shimmer h-3 w-2/3" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="shimmer h-6 w-20" />
            <div className="shimmer h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="card p-12 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-bold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-[var(--text-muted)] text-sm">{desc}</p>
    </div>
  )
}

function TransportTab({ transport, loading, tripContext, searchForm }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title text-xl">✈️ Flight Options</h2>
        <div className="flex items-center gap-2">
          <span className="live-dot"></span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Live prices</span>
        </div>
      </div>

      {loading ? <SkeletonCards count={3} /> : (
        transport.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transport.map((t: any) => <TransportCard key={t.id} item={t} showDetail />)}
          </div>
        ) : (
          <EmptyState icon="✈️" title="No flights found" desc="Try adjusting your search criteria" />
        )
      )}
    </div>
  )
}

export default memo(TransportTab)
