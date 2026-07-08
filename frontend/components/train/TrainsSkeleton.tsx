'use client'

import React from 'react'

export default function TrainsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="h-6 w-48 bg-slate-200 animate-pulse rounded-md"></div>
      
      {/* Cards List Skeleton */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="border border-slate-200/60 rounded-2xl p-5 flex flex-col gap-4 bg-white animate-pulse"
        >
          {/* Main Row Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Logo Box */}
              <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0"></div>

              {/* Grid times and details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 flex-1">
                <div className="col-span-2 flex items-center gap-4">
                  <div className="space-y-2">
                    <div className="h-4 w-12 bg-slate-200 rounded"></div>
                    <div className="h-3 w-16 bg-slate-200 rounded"></div>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="flex-1 flex flex-col items-center px-2 space-y-1">
                    <div className="h-3 w-12 bg-slate-200 rounded"></div>
                    <div className="h-0.5 bg-slate-200 w-full rounded-full"></div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-4 w-12 bg-slate-200 rounded"></div>
                    <div className="h-3 w-16 bg-slate-200 rounded"></div>
                  </div>
                </div>

                <div className="space-y-2 flex flex-col justify-center">
                  <div className="h-3.5 w-32 bg-slate-200 rounded"></div>
                  <div className="h-3 w-16 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="space-y-2 text-right">
                <div className="h-3 w-12 bg-slate-200 rounded"></div>
                <div className="h-5 w-20 bg-slate-200 rounded"></div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
