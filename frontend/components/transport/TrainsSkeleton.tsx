'use client'

import React from 'react';

export function TrainsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="h-4 w-48 bg-slate-200 animate-pulse rounded-md"></div>
      
      {/* Cards List Skeleton */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="border border-slate-200/60 rounded-2xl p-5 flex flex-col gap-4 bg-white animate-pulse"
        >
          {/* Top Header Row Skeleton */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                <div className="h-3 w-16 bg-slate-200 rounded"></div>
              </div>
            </div>
            <div className="w-16 h-3 bg-slate-200 rounded"></div>
          </div>

          {/* Timeline Row Skeleton */}
          <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl relative my-1">
            <div className="space-y-2 w-[30%]">
              <div className="h-5 w-16 bg-slate-200 rounded"></div>
              <div className="h-3 w-10 bg-slate-200 rounded"></div>
            </div>

            <div className="flex-1 flex flex-col items-center px-2">
              <div className="h-3 w-12 bg-slate-200 rounded mb-1"></div>
              <div className="h-0.5 bg-slate-200 w-full rounded-full"></div>
            </div>

            <div className="space-y-2 w-[30%] text-right flex flex-col items-end">
              <div className="h-5 w-16 bg-slate-200 rounded"></div>
              <div className="h-3 w-10 bg-slate-200 rounded"></div>
            </div>
          </div>

          {/* Footer Action Row Skeleton */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-1">
            <div className="flex gap-2">
              <div className="w-16 h-8 bg-slate-200 rounded-lg"></div>
              <div className="w-16 h-8 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="w-32 h-9 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
