'use client'

import React from 'react'

export default function AiFlightSkeleton() {
  return (
    <div className="space-y-4 w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block space-y-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          <div className="space-y-3">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>

        {/* Flight Cards Skeleton List */}
        <div className="lg:col-span-3 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm"
            >
              <div className="space-y-4 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                <div className="flex items-center gap-4">
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded flex-1" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              </div>
              <div className="w-full md:w-48 flex flex-col justify-between items-end space-y-3">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
