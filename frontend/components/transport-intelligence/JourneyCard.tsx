'use client';

import React, { memo } from 'react';
import { Train, Bus, Car, Navigation, ExternalLink, Clock, Wallet, ArrowDown, MapPin } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { trackEvent } from '@/lib/analytics';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TransportLeg {
  mode: 'train' | 'bus' | 'taxi' | 'metro' | 'auto';
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  operator: string;
  price: number;
  bookingUrl: string;
}

export interface JourneyPlan {
  id: string;
  legs: TransportLeg[];
  totalDurationMinutes: number;
  totalDurationLabel: string;
  totalCost: number;
  transfers: number;
  rank?: string;
  rankReason?: string;
  bookingUrl: string;
  isDirect: boolean;
  aiExplanation?: string;
}

interface JourneyCardProps {
  journey: JourneyPlan;
  isRecommended?: boolean;
}

// ─── Mode Icon & Label ────────────────────────────────────────────────────────

const MODE_CONFIG: Record<string, { icon: typeof Train; label: string; color: string; bg: string }> = {
  train: { icon: Train, label: 'Train', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
  bus:   { icon: Bus,   label: 'Bus',   color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
  taxi:  { icon: Car,   label: 'Taxi',  color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  metro: { icon: Train, label: 'Metro', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
  auto:  { icon: Navigation, label: 'Auto', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
};

const RANK_BADGES: Record<string, { label: string; cls: string }> = {
  fastest:   { label: 'Fastest', cls: 'bg-green-500/10 text-green-700 border-green-500/20' },
  cheapest:  { label: 'Cheapest', cls: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
  comfort:   { label: 'Most Comfortable', cls: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20' },
  balanced:  { label: 'Best Balanced', cls: 'bg-orange-500/10 text-orange-700 border-orange-500/20' },
};

// ─── Component ────────────────────────────────────────────────────────────────

function JourneyCard({ journey, isRecommended }: JourneyCardProps) {
  const { user } = useAuthStore();
  const currency = user?.currency ?? 'INR';
  const { requireAuth } = useRequireAuth();

  const handleBook = requireAuth(() => {
    trackEvent('booking_click', {
      type: 'transport-intelligence',
      isDirect: journey.isDirect,
      transfers: journey.transfers,
      cost: journey.totalCost,
      url: journey.bookingUrl,
    });
    window.open(journey.bookingUrl, '_blank', 'noopener,noreferrer');
  });

  const rankBadge = journey.rank ? RANK_BADGES[journey.rank] : null;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-lg ${
      isRecommended
        ? 'border-orange-300 shadow-md shadow-orange-500/5'
        : 'border-slate-200/80 hover:border-slate-300'
    }`}>
      {/* ── Header: Route + Rank Badge ── */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isRecommended && (
            <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              Recommended
            </span>
          )}
          {rankBadge && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${rankBadge.cls}`}>
              {rankBadge.label}
            </span>
          )}
          {journey.isDirect ? (
            <span className="text-[10px] font-bold bg-green-500/10 text-green-700 px-2.5 py-1 rounded-full border border-green-500/20 uppercase tracking-wide">
              Direct
            </span>
          ) : (
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase tracking-wide">
              {journey.transfers} Transfer{journey.transfers > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {journey.rankReason && (
          <span className="text-[11px] text-slate-400 font-medium text-right hidden sm:block">
            {journey.rankReason}
          </span>
        )}
      </div>

      {/* ── Journey Legs ── */}
      <div className="px-5 pb-4">
        {journey.legs.map((leg, idx) => {
          const config = MODE_CONFIG[leg.mode] || MODE_CONFIG.bus;
          const Icon = config.icon;
          const isFirst = idx === 0;
          const isLast = idx === journey.legs.length - 1;

          return (
            <div key={idx}>
              {/* Connector arrow between legs */}
              {idx > 0 && (
                <div className="flex items-center gap-2 py-1.5 pl-3">
                  <ArrowDown size={12} className="text-slate-300" />
                  <span className="text-[10px] text-slate-400 font-medium">Transfer at {leg.origin.split('(')[0].trim()}</span>
                </div>
              )}

              {/* Leg card */}
              <div className={`flex items-start gap-3 p-3 rounded-xl border ${config.bg}`}>
                {/* Mode icon */}
                <div className={`w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon size={16} />
                </div>

                {/* Leg details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[11px] font-bold uppercase tracking-wide ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {leg.operator}
                    </span>
                  </div>

                  {/* Origin → Destination */}
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-800">
                    <span className="truncate">{leg.origin}</span>
                    <span className="text-slate-300 shrink-0">→</span>
                    <span className="truncate">{leg.destination}</span>
                  </div>

                  {/* Times + Duration */}
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                    {leg.departureTime && leg.departureTime !== '—' && (
                      <span className="font-mono font-bold text-slate-700">
                        {leg.departureTime}
                      </span>
                    )}
                    {leg.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {leg.duration}
                      </span>
                    )}
                    {leg.arrivalTime && leg.arrivalTime !== '—' && (
                      <span className="font-mono font-bold text-slate-700">
                        {leg.arrivalTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Leg price */}
                {leg.price > 0 && (
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block">fare</span>
                    <span className="text-[13px] font-bold text-slate-700">
                      {formatPrice(leg.price, currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer: Total + CTA ── */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Total Time
            </span>
            <span className="text-[15px] font-bold text-slate-800 flex items-center gap-1">
              <Clock size={12} /> {journey.totalDurationLabel}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Est. Cost
            </span>
            <span className="text-[15px] font-bold text-orange-600 flex items-center gap-1">
              <Wallet size={12} /> {formatPrice(journey.totalCost, currency)}
            </span>
          </div>
        </div>

        <button
          onClick={handleBook}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm bg-[#E8461E] text-white hover:opacity-90 transition-opacity whitespace-nowrap shadow-md shadow-red-500/10"
        >
          Book on MakeMyTrip <ExternalLink size={13} />
        </button>
      </div>

      {/* ── AI Explanation ── */}
      {journey.aiExplanation && (
        <div className="px-5 py-3 border-t border-slate-100 bg-blue-50/30">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-line">
              {journey.aiExplanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(JourneyCard);
