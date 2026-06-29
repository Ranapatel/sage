'use client'

import React, { memo } from 'react';
import { Bus, Star, ExternalLink } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/currency';

export interface BusResult {
  operatorName: string;
  busType: string;
  rating?: number;
  departure: string;
  arrival: string;
  duration: string;
  amenities: string[];
  price?: number;
  seatsAvailable?: number;
  bookingUrl: string;
}

interface BusCardProps {
  bus: BusResult;
}

function BusCard({ bus }: BusCardProps) {
  const { user } = useAuthStore();
  const currency = user?.currency ?? 'INR';

  const handleBook = () => {
    trackEvent('booking_click', {
      type: 'bus',
      operator: bus.operatorName,
      price: bus.price,
      url: bus.bookingUrl,
    });
  };

  return (
    <div className="card border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg p-5 flex flex-col gap-4 bg-[var(--surface-2)]">
      {/* Header Row */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
            <Bus size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-[var(--text-primary)] text-base leading-snug">
                {bus.operatorName}
              </h4>
              {bus.rating && (
                <div className="flex items-center gap-0.5 bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded text-[10px] font-black">
                  <Star size={10} className="fill-green-600" />
                  {bus.rating.toFixed(1)}
                </div>
              )}
            </div>
            <span className="text-xs font-semibold text-[var(--text-muted)] mt-0.5 block">
              {bus.busType}
            </span>
          </div>
        </div>
        
        {bus.seatsAvailable !== undefined && bus.seatsAvailable > 0 && (
          <span className="text-[10px] font-extrabold bg-orange-500/10 text-orange-600 px-2 py-1 rounded uppercase tracking-wider">
            {bus.seatsAvailable} seats left
          </span>
        )}
      </div>

      {/* Timeline Row */}
      <div className="flex items-center justify-between bg-slate-50/5 p-4 rounded-xl relative my-1">
        <div className="text-left w-[30%]">
          <div className="font-black text-lg text-[var(--text-primary)] tracking-tight">
            {bus.departure}
          </div>
          <div className="font-extrabold text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
            Depart
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center px-2">
          <span className="text-[10px] font-bold text-[var(--text-muted)] mb-1">
            {bus.duration}
          </span>
          <div className="w-full flex items-center justify-center relative">
            <div className="h-px bg-[var(--border)] w-full"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-mono">›</div>
          </div>
        </div>

        <div className="text-right w-[30%]">
          <div className="font-black text-lg text-[var(--text-primary)] tracking-tight">
            {bus.arrival}
          </div>
          <div className="font-extrabold text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
            Arrive
          </div>
        </div>
      </div>

      {/* Amenities Row */}
      {bus.amenities && bus.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {bus.amenities.map((amenity, idx) => (
            <span key={idx} className="text-[10px] font-bold bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)] px-2 py-0.5 rounded-full">
              {amenity}
            </span>
          ))}
        </div>
      )}

      {/* Pricing and Booking CTA */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border)] mt-1">
        <div className="text-left">
          <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase tracking-wider">
            Fare Estimate
          </span>
          <span className="text-lg font-black text-[var(--primary)] font-mono tracking-tight mt-0.5 block">
            {bus.price ? `from ${formatPrice(bus.price, currency)}` : '—'}
          </span>
        </div>

        <a
          href={bus.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleBook}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm bg-[#E8461E] text-white hover:opacity-90 transition-opacity whitespace-nowrap shadow-md shadow-red-500/10 ml-auto"
        >
          Book on MakeMyTrip <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}

export default memo(BusCard);
