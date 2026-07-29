'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, CheckCircle2, Clock, Compass, Train, MapPin, Bus, ShieldCheck } from 'lucide-react'

export default function TrainsSkeleton() {
  const [activeStep, setActiveStep] = useState<number>(1)

  useEffect(() => {
    const timer1 = setTimeout(() => setActiveStep(2), 250)
    const timer2 = setTimeout(() => setActiveStep(3), 500)
    const timer3 = setTimeout(() => setActiveStep(4), 750)
    const timer4 = setTimeout(() => setActiveStep(5), 900)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  const steps = [
    { title: 'Destination Analysis', desc: 'Identifying station radius within 200 km (Madgaon, Vasco, Karmali...)' },
    { title: 'Search Direct Trains', desc: 'Evaluating direct train schedules, running days & class availability...' },
    { title: 'Search Junction Transfer Routes', desc: 'Testing transfer junctions (Pune, Hubballi, Bengaluru, Vijayawada...)' },
    { title: 'Last-Mile Transport Synthesis', desc: 'Calculating taxi, local bus & metro connectivity to hotel...' },
    { title: 'AI Scoring Engine', desc: 'Computing Journey Score, Comfort Score, Budget Score & Reliability...' }
  ]

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-fade-in max-w-4xl mx-auto my-4">
      
      {/* Header Banner */}
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md animate-pulse">
          <Sparkles size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>TripSage AI Route Analysis Pipeline</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Analyzing railway network, junctions & last-mile connections...
          </p>
        </div>
      </div>

      {/* Pipeline Steps List */}
      <div className="space-y-3">
        {steps.map((s, idx) => {
          const stepNum = idx + 1
          const isDone = activeStep > stepNum
          const isCurrent = activeStep === stepNum

          return (
            <div
              key={s.title}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                isDone
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-200'
                  : isCurrent
                  ? 'bg-purple-50/80 dark:bg-purple-950/50 border-purple-500 text-purple-950 dark:text-purple-200 ring-2 ring-purple-500/20 shadow-xs'
                  : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300" />
                )}
              </div>

              <div className="flex-1">
                <div className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <span>Phase {stepNum}: {s.title}</span>
                  {isCurrent && (
                    <span className="bg-purple-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      Analyzing...
                    </span>
                  )}
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  {s.desc}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Skeleton Card Animation */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-36 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
          <div className="h-4 w-24 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
        </div>
        <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>

    </div>
  )
}
