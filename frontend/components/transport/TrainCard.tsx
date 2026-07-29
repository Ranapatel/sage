'use client'

import React from 'react';
import { Train, ExternalLink, Clock } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/currency';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { buildIrctcDeepLink } from '@/lib/smartTrainPlanner';

export interface ClassAvailability {
  class: string;
  className: string;
  available: boolean;
  price?: number;
  availability?: string;
}

export interface TrainResult {
  trainNumber: string;
  trainName: string;
  departure: string;
  arrival: string;
  duration: string;
  runsOn?: string[];
  availableClasses: ClassAvailability[];
  bookingUrl: string;
  originCode: string;
  destinationCode: string;
}

interface TrainCardProps {
  train: TrainResult;
}

const CLASS_LABELS: Record<string, string> = {
  SL: 'Sleeper',
  '3A': 'AC 3 Tier',
  '2A': 'AC 2 Tier',
  '1A': 'First AC',
  CC: 'Chair Car',
  EC: 'Exec. Chair',
  '2S': '2nd Sitting',
};

export function TrainCard({ train }: TrainCardProps) {
  const { user } = useAuthStore();
  const currency = user?.currency ?? 'INR';
  const { requireAuth } = useRequireAuth();

  const handleBook = requireAuth((e?: React.MouseEvent) => {
    trackEvent('booking_click', {
      type: 'train',
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      url: train.bookingUrl,
    });
    const url = (train.bookingUrl && !train.bookingUrl.includes('makemytrip.com'))
      ? train.bookingUrl
      : buildIrctcDeepLink({ srcStn: train.originCode, destStn: train.destinationCode });
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  // Helper to determine availability badge styles
  const getAvailabilityBadge = (cls: ClassAvailability) => {
    if (!cls.availability) return null;
    const status = cls.availability.toUpperCase();
    if (status.includes('AVAILABLE') || status.includes('AVBL')) {
      return (
        <span className="text-[9px] font-extrabold bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
          Available
        </span>
      );
    }
    if (status.includes('WL')) {
      return (
        <span className="text-[9px] font-extrabold bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
          {cls.availability}
        </span>
      );
    }
    if (status.includes('RAC')) {
      return (
        <span className="text-[9px] font-extrabold bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
          {cls.availability}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="card border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg p-5 flex flex-col gap-4 bg-[var(--surface-2)]">
      {/* Header Row */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
            <Train size={16} />
          </div>
          <div>
            <h4 className="font-extrabold text-[var(--text-primary)] text-base leading-snug">
              {train.trainName}
            </h4>
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              #{train.trainNumber}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Runs On</span>
          <div className="text-xs font-extrabold text-[var(--text-secondary)] mt-0.5">
            {Array.isArray(train.runsOn) ? train.runsOn.join(' · ') : (train.runsOn || 'Daily')}
          </div>
        </div>
      </div>

      {/* Timeline Row */}
      <div className="flex items-center justify-between bg-slate-50/5 p-4 rounded-xl relative my-1">
        <div className="text-left w-[30%]">
          <div className="font-black text-lg text-[var(--text-primary)] tracking-tight">
            {train.departure || '08:00'}
          </div>
          <div className="font-extrabold text-xs text-[var(--text-secondary)] uppercase mt-0.5">
            {train.originCode || 'DEP'}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center px-2">
          <span className="text-[10px] font-bold text-[var(--text-muted)] mb-1">
            {train.duration || '6h 30m'}
          </span>
          <div className="w-full flex items-center justify-center relative">
            <div className="h-px bg-[var(--border)] w-full"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-mono">›</div>
          </div>
        </div>

        <div className="text-right w-[30%]">
          <div className="font-black text-lg text-[var(--text-primary)] tracking-tight">
            {train.arrival || '14:30'}
          </div>
          <div className="font-extrabold text-xs text-[var(--text-secondary)] uppercase mt-0.5">
            {train.destinationCode || 'ARR'}
          </div>
        </div>
      </div>

      {/* Classes and Booking CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
        <div className="flex flex-wrap gap-2 items-center">
          {(Array.isArray(train.availableClasses) ? train.availableClasses : []).map((cls) => (
            <div
              key={cls.class}
              className={`flex flex-col items-start gap-1 p-2 rounded-lg border text-left min-w-[75px] transition-all duration-200 ${
                cls.available
                  ? 'bg-green-500/5 border-green-500/20 text-green-700'
                  : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)]'
              }`}
            >
              <div className="flex items-center justify-between w-full gap-1">
                <span className="text-[10px] font-black uppercase">
                  {CLASS_LABELS[cls.class] ?? cls.class}
                </span>
                {getAvailabilityBadge(cls)}
              </div>
              <span className="text-xs font-black font-mono mt-0.5">
                {cls.price ? formatPrice(cls.price, currency) : '—'}
              </span>
            </div>
          ))}
        </div>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleBook(e);
          }}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm bg-[#001E62] hover:bg-[#00174c] text-white transition-opacity whitespace-nowrap shadow-md shadow-blue-900/10 ml-auto"
        >
          Book on IRCTC <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
