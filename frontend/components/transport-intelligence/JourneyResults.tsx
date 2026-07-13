'use client';

import React, { useState, useMemo } from 'react';
import { Zap, Wallet, Sparkles, Gauge, AlertCircle, MapPin } from 'lucide-react';
import JourneyCard, { JourneyPlan } from './JourneyCard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface JourneyResultsProps {
  directOptions: JourneyPlan[];
  alternativeJourneys: JourneyPlan[];
  recommended: JourneyPlan | null;
  aiSummary: string;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

type SortPref = 'fastest' | 'cheapest' | 'comfort' | 'balanced';

const SORT_OPTIONS: { id: SortPref; label: string; icon: typeof Zap }[] = [
  { id: 'balanced',  label: 'Balanced',   icon: Sparkles },
  { id: 'fastest',   label: 'Fastest',    icon: Zap },
  { id: 'cheapest',  label: 'Cheapest',   icon: Wallet },
  { id: 'comfort',   label: 'Comfort',    icon: Gauge },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function JourneyResults({
  directOptions,
  alternativeJourneys,
  recommended,
  aiSummary,
  loading,
  error,
  onRetry,
}: JourneyResultsProps) {
  const [sortPref, setSortPref] = useState<SortPref>('balanced');

  // Merge and sort all journeys
  const allJourneys = useMemo(() => {
    const merged = [...directOptions, ...alternativeJourneys];
    return merged.sort((a, b) => {
      switch (sortPref) {
        case 'fastest':
          return a.totalDurationMinutes - b.totalDurationMinutes;
        case 'cheapest':
          return a.totalCost - b.totalCost;
        case 'comfort':
          return a.transfers - b.transfers || a.totalDurationMinutes - b.totalDurationMinutes;
        case 'balanced':
        default:
          return (a.totalDurationMinutes + a.totalCost) - (b.totalDurationMinutes + b.totalCost);
      }
    });
  }, [directOptions, alternativeJourneys, sortPref]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {SORT_OPTIONS.map(opt => (
            <div key={opt.id} className="h-9 w-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 animate-pulse">
            <div className="h-4 w-32 bg-slate-100 rounded" />
            <div className="h-20 bg-slate-50 rounded-xl" />
            <div className="h-10 bg-slate-50 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertCircle size={22} className="text-red-500" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-slate-800 mb-1">Something went wrong</p>
          <p className="text-[13px] text-slate-500">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-orange-500 text-white hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // ── Empty state ──
  if (allJourneys.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
          <MapPin size={24} className="text-slate-400" />
        </div>
        <div>
          <p className="text-[16px] font-bold text-slate-800 mb-1.5">No transport routes found</p>
          <p className="text-[13px] text-slate-500 max-w-sm">
            We couldn't find any direct or alternative routes. Try a different date or nearby cities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── AI Summary Banner ── */}
      {aiSummary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Sparkles size={15} className="text-blue-600" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">AI Route Summary</span>
              <p className="text-[13px] text-slate-700 leading-relaxed mt-1 whitespace-pre-line">
                {aiSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Sort Toggle ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
        <span className="text-[12px] text-slate-400 font-medium shrink-0 mr-1">Sort by:</span>
        {SORT_OPTIONS.map(opt => {
          const isActive = sortPref === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => setSortPref(opt.id)}
              className={`shrink-0 h-9 px-3.5 rounded-xl text-[13px] font-medium flex items-center gap-1.5 transition-all border ${
                isActive
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon size={13} />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* ── Recommended Journey ── */}
      {recommended && (
        <div>
          <h3 className="text-[13px] font-bold text-slate-700 mb-3 uppercase tracking-wide">
            Recommended Route
          </h3>
          <JourneyCard journey={recommended} isRecommended />
        </div>
      )}

      {/* ── Direct Options ── */}
      {directOptions.length > 0 && (
        <div>
          <h3 className="text-[13px] font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-1.5">
            Direct Options
            <span className="text-[11px] font-normal text-slate-400">
              ({directOptions.length})
            </span>
          </h3>
          <div className="space-y-3">
            {directOptions
              .filter(j => !recommended || j.id !== recommended.id)
              .map(journey => (
                <JourneyCard key={journey.id} journey={journey} />
              ))}
          </div>
        </div>
      )}

      {/* ── Alternative Routes ── */}
      {alternativeJourneys.length > 0 && (
        <div>
          <h3 className="text-[13px] font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-1.5">
            Alternative Routes
            <span className="text-[11px] font-normal text-slate-400">
              ({alternativeJourneys.length})
            </span>
          </h3>
          <div className="space-y-3">
            {alternativeJourneys
              .filter(j => !recommended || j.id !== recommended.id)
              .map(journey => (
                <JourneyCard key={journey.id} journey={journey} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default JourneyResults;
