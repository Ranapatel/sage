'use client'

import React from 'react'

export default function BusesSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-6 w-32 bg-slate-200 animate-pulse rounded-md"></div>
        <div className="h-6 w-20 bg-slate-200 animate-pulse rounded-md"></div>
      </div>
      
      {/* Cards List Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-slate-200/60 rounded-2xl p-5 flex flex-col gap-4 bg-white animate-pulse"
          >
            {/* Top Row Skeleton */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
                <div className="space-y-1">
                  <div className="h-4 w-28 bg-slate-200 rounded"></div>
                  <div className="h-3 w-20 bg-slate-200 rounded"></div>
                </div>
              </div>
              <div className="w-12 h-4 bg-slate-200 rounded"></div>
            </div>

            {/* Timeline Skeleton */}
            <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl relative my-1">
              <div className="space-y-1 w-[30%]">
                <div className="h-4 w-12 bg-slate-200 rounded"></div>
                <div className="h-3 w-8 bg-slate-200 rounded"></div>
              </div>
              <div className="flex-1 flex flex-col items-center px-2 space-y-1">
                <div className="h-3 w-10 bg-slate-200 rounded"></div>
                <div className="h-0.5 bg-slate-200 w-full rounded-full"></div>
              </div>
              <div className="space-y-1 w-[30%] text-right flex flex-col items-end">
                <div className="h-4 w-12 bg-slate-200 rounded"></div>
                <div className="h-3 w-8 bg-slate-200 rounded"></div>
              </div>
            </div>

            {/* Amenities Skeleton */}
            <div className="flex gap-1">
              <div className="w-10 h-4 bg-slate-200 rounded-full"></div>
              <div className="w-12 h-4 bg-slate-200 rounded-full"></div>
              <div className="w-8 h-4 bg-slate-200 rounded-full"></div>
            </div>

            {/* Pricing & CTA Skeleton */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="space-y-1">
                <div className="h-3 w-16 bg-slate-200 rounded"></div>
                <div className="h-5 w-20 bg-slate-200 rounded"></div>
              </div>
              <div className="w-24 h-9 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
