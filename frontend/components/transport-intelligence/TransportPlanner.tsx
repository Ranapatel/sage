'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Search, MapPin, Calendar, Users, Sparkles } from 'lucide-react';
import { tripAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import JourneyResults from './JourneyResults';
import type { JourneyPlan } from './JourneyCard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TransportPlannerProps {
  /** Pre-fill origin (e.g., from search form) */
  defaultOrigin?: string;
  /** Pre-fill destination (e.g., from search form) */
  defaultDestination?: string;
  /** Pre-fill date */
  defaultDate?: string;
  /** Show compact mode (no form, just results trigger) */
  compact?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TransportPlanner({
  defaultOrigin = '',
  defaultDestination = '',
  defaultDate = '',
  compact = false,
}: TransportPlannerProps) {
  const { user } = useAuthStore();
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [date, setDate] = useState(defaultDate || new Date().toLocaleDateString('en-CA'));
  const [passengers, setPassengers] = useState('1');
  const [rankPref, setRankPref] = useState<'fastest' | 'cheapest' | 'comfort' | 'balanced'>('balanced');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    directOptions: JourneyPlan[];
    alternativeJourneys: JourneyPlan[];
    recommended: JourneyPlan | null;
    aiSummary: string;
  } | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const handleSearch = useCallback(async () => {
    if (!origin.trim() || !destination.trim() || !date) return;

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await tripAPI.planTransport({
        origin: origin.trim(),
        destination: destination.trim(),
        date,
        passengers: parseInt(passengers) || 1,
        rankPreference: rankPref,
      }, { signal: controller.signal });

      if (res.success && res.data) {
        setResults({
          directOptions: res.data.directOptions || [],
          alternativeJourneys: res.data.alternativeJourneys || [],
          recommended: res.data.recommended || null,
          aiSummary: res.data.aiSummary || '',
        });
      } else {
        setError(res.message || 'Failed to find transport options');
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') return;
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [origin, destination, date, passengers, rankPref]);

  // ── Compact mode: auto-search if all fields are pre-filled ──
  React.useEffect(() => {
    if (compact && defaultOrigin && defaultDestination && defaultDate && !results && !loading) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact]);

  return (
    <div className="space-y-6">
      {/* ── Search Form ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Sparkles size={16} className="text-orange-600" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-slate-800">Smart Route Planner</h2>
            <p className="text-[12px] text-slate-500">Door-to-door transport with multi-modal journey planning</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Origin */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1">
              <MapPin size={11} /> From
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g., Hyderabad"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1">
              <MapPin size={11} /> To
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Gokarna"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1">
              <Calendar size={11} /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toLocaleDateString('en-CA')}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all"
            />
          </div>

          {/* Passengers */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1">
              <Users size={11} /> Passengers
            </label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all bg-white"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Rank Preference + Search Button */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mr-1">Preference:</span>
            {([
              { id: 'balanced', label: 'Balanced' },
              { id: 'fastest', label: 'Fastest' },
              { id: 'cheapest', label: 'Cheapest' },
              { id: 'comfort', label: 'Comfort' },
            ] as const).map(opt => (
              <button
                key={opt.id}
                onClick={() => setRankPref(opt.id)}
                className={`h-8 px-3 rounded-lg text-[12px] font-medium transition-all border ${
                  rankPref === opt.id
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !origin.trim() || !destination.trim() || !date}
            className="h-11 px-6 rounded-xl font-bold text-[14px] bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md shadow-orange-500/10"
          >
            <Search size={16} />
            {loading ? 'Searching...' : 'Find Routes'}
          </button>
        </div>
      </div>

      {/* ── Results ── */}
      {results && (
        <JourneyResults
          directOptions={results.directOptions}
          alternativeJourneys={results.alternativeJourneys}
          recommended={results.recommended}
          aiSummary={results.aiSummary}
          loading={loading}
          error={error}
          onRetry={handleSearch}
        />
      )}

      {/* ── Loading without results yet ── */}
      {loading && !results && (
        <JourneyResults
          directOptions={[]}
          alternativeJourneys={[]}
          recommended={null}
          aiSummary=""
          loading={true}
          error={null}
        />
      )}

      {/* ── Error without results ── */}
      {error && !results && (
        <JourneyResults
          directOptions={[]}
          alternativeJourneys={[]}
          recommended={null}
          aiSummary=""
          loading={false}
          error={error}
          onRetry={handleSearch}
        />
      )}
    </div>
  );
}

export default TransportPlanner;
