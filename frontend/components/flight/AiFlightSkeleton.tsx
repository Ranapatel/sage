'use client'

import React from 'react'

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`bg-[#E8E0D8] rounded-lg animate-pulse ${className ?? ''}`}
      style={{ backgroundImage: 'linear-gradient(90deg, #F0EBE3 25%, #E8E0D8 50%, #F0EBE3 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}
    />
  )
}

export default function AiFlightSkeleton() {
  return (
    <div className="space-y-4 w-full">
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Quick Context Bar Skeleton */}
      <SkeletonPulse className="h-12 w-full rounded-xl" />

      {/* Tabs Header Skeleton */}
      <SkeletonPulse className="h-14 w-full rounded-2xl" />

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block bg-white border border-[#E8E0D8] rounded-2xl p-5 space-y-4">
          <SkeletonPulse className="h-5 w-2/3 rounded" />
          <SkeletonPulse className="h-12 rounded-xl" />
          <div className="pt-2 space-y-3">
            <SkeletonPulse className="h-4 w-1/2 rounded" />
            <SkeletonPulse className="h-10 rounded-xl" />
            <SkeletonPulse className="h-10 rounded-xl" />
            <SkeletonPulse className="h-10 rounded-xl" />
          </div>
          <div className="pt-2 space-y-3">
            <SkeletonPulse className="h-4 w-1/3 rounded" />
            <SkeletonPulse className="h-28 rounded-xl" />
          </div>
        </div>

        {/* Flight Cards Skeleton List */}
        <div className="lg:col-span-3 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E8E0D8] rounded-2xl p-5 space-y-4"
            >
              {/* Header Row */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE3]">
                <div className="flex items-center gap-3">
                  <SkeletonPulse className="w-8 h-8 rounded-full" />
                  <div className="space-y-1.5">
                    <SkeletonPulse className="h-4 w-28 rounded" />
                    <SkeletonPulse className="h-3 w-20 rounded" />
                  </div>
                </div>
                <SkeletonPulse className="h-7 w-20 rounded-lg" />
              </div>

              {/* Timeline Row */}
              <div className="flex items-center gap-4 py-1">
                <div className="shrink-0 space-y-1">
                  <SkeletonPulse className="h-8 w-16 rounded" />
                  <SkeletonPulse className="h-3 w-10 rounded" />
                </div>

                <div className="flex-1 flex flex-col items-center gap-2">
                  <SkeletonPulse className="h-3 w-16 rounded" />
                  <div className="relative w-full flex items-center justify-center my-0.5">
                    <SkeletonPulse className="h-1 w-full rounded-full" />
                    <div className="absolute bg-white border border-[#E8E0D8] rounded-full w-7 h-7 flex items-center justify-center z-10">
                      <SkeletonPulse className="w-5 h-5 rounded-full" />
                    </div>
                  </div>
                  <SkeletonPulse className="h-5 w-28 rounded-md" />
                </div>

                <div className="shrink-0 space-y-1 text-right">
                  <SkeletonPulse className="h-8 w-16 rounded" />
                  <SkeletonPulse className="h-3 w-10 rounded" />
                </div>
              </div>

              {/* Footer Row */}
              <div className="pt-3 border-t border-[#F0EBE3] flex items-center justify-between gap-4">
                <SkeletonPulse className="h-9 w-48 rounded-xl" />
                <div className="flex items-center gap-4">
                  <div className="space-y-1 text-right">
                    <SkeletonPulse className="h-7 w-20 rounded" />
                    <SkeletonPulse className="h-3 w-24 rounded" />
                  </div>
                  <SkeletonPulse className="h-10 w-28 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
