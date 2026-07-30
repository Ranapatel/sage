'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-lg ${className ?? ''}`}
      style={{
        background: 'linear-gradient(90deg, #F0EBE3 25%, #E8E0D8 50%, #F0EBE3 75%)',
        backgroundSize: '200% 100%',
        animation: 'trainShimmer 1.5s infinite',
      }}
    />
  )
}

export default function TrainsSkeleton() {
  const [activeStep, setActiveStep] = useState<number>(1)

  useEffect(() => {
    const timers = [
      setTimeout(() => setActiveStep(2), 300),
      setTimeout(() => setActiveStep(3), 600),
      setTimeout(() => setActiveStep(4), 900),
      setTimeout(() => setActiveStep(5), 1100),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const steps = [
    { title: 'Destination Analysis', desc: 'Identifying stations within 200 km radius...' },
    { title: 'Direct Train Search', desc: 'Evaluating schedules, running days & class availability...' },
    { title: 'Junction Transfer Routes', desc: 'Testing transfers via Pune, Hubballi, Vijayawada...' },
    { title: 'Last-Mile Connectivity', desc: 'Calculating taxi, bus & metro links to your hotel...' },
    { title: 'AI Scoring Engine', desc: 'Computing Journey, Comfort, Budget & Reliability scores...' },
  ]

  return (
    <div className="w-full space-y-4">
      <style>{`
        @keyframes trainShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* AI Analysis Pipeline Card */}
      <div className="bg-white border border-[#E8E0D8] rounded-2xl p-5 shadow-xs space-y-4">
        
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#E8E0D8]">
          <div className="w-9 h-9 rounded-xl bg-[#EA580C] flex items-center justify-center shrink-0">
            <Loader2 size={18} className="text-white animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#1A1A1A] font-display">
              TripSage AI · Route Analysis
            </h3>
            <p className="text-[11px] text-[#6B6B6B] font-medium mt-0.5">
              Analysing railway network & last-mile connections...
            </p>
          </div>
        </div>

        {/* Pipeline Steps */}
        <div className="space-y-2.5">
          {steps.map((s, idx) => {
            const stepNum = idx + 1
            const isDone = activeStep > stepNum
            const isCurrent = activeStep === stepNum

            return (
              <div
                key={s.title}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-50 border-emerald-200'
                    : isCurrent
                    ? 'bg-orange-50 border-[#EA580C]/40 ring-1 ring-[#EA580C]/20'
                    : 'bg-[#FFFBF7] border-[#E8E0D8] opacity-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 size={16} className="text-[#EA580C] animate-spin" />
                  ) : (
                    <Circle size={16} className="text-[#E8E0D8]" />
                  )}
                </div>
                <div>
                  <p className={`text-xs font-extrabold tracking-wide ${
                    isDone ? 'text-emerald-800' : isCurrent ? 'text-[#EA580C]' : 'text-[#9CA3AF]'
                  }`}>
                    {s.title}
                    {isCurrent && (
                      <span className="ml-2 text-[9px] bg-[#EA580C] text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                        Live
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-[#6B6B6B] font-medium mt-0.5">{s.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Skeleton Train Cards Preview */}
      {[1, 2].map((i) => (
        <div key={i} className="bg-white border border-[#E8E0D8] rounded-2xl p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE3]">
            <div className="space-y-1.5">
              <SkeletonPulse className="h-4 w-36" />
              <SkeletonPulse className="h-3 w-24" />
            </div>
            <SkeletonPulse className="h-7 w-20 rounded-lg" />
          </div>

          {/* Timeline row */}
          <div className="flex items-center gap-4">
            <div className="shrink-0 space-y-1">
              <SkeletonPulse className="h-7 w-14" />
              <SkeletonPulse className="h-3 w-10" />
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <SkeletonPulse className="h-3 w-16" />
              <SkeletonPulse className="h-1 w-full rounded-full" />
              <SkeletonPulse className="h-5 w-24 rounded-md" />
            </div>
            <div className="shrink-0 space-y-1">
              <SkeletonPulse className="h-7 w-14" />
              <SkeletonPulse className="h-3 w-10" />
            </div>
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between pt-3 border-t border-[#F0EBE3]">
            <SkeletonPulse className="h-9 w-48 rounded-xl" />
            <div className="flex items-center gap-3">
              <SkeletonPulse className="h-7 w-20" />
              <SkeletonPulse className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
