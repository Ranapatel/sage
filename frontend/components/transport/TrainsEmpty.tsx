'use client'

import React from 'react';
import { Train, ExternalLink, Shield } from 'lucide-react';
import BookingButton from '../BookingButton';

interface TrainsEmptyProps {
  searchUrl: string;
  origin?: string;
  destination?: string;
}

export function TrainsEmpty({ searchUrl, origin = 'your origin', destination = 'your destination' }: TrainsEmptyProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Branded Header */}
      <div className="glass rounded-2xl border border-blue-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-red-500 flex items-center justify-center shadow-md shadow-blue-600/20">
                  <Train size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                  Train Bookings
                </h3>
              </div>
              <p className="text-xs font-bold text-blue-700/80 mt-2 flex items-center gap-1.5">
                <Shield size={11} className="text-blue-600" />
                Routed via MakeMyTrip
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Live routes &bull; Instant availability &bull; Official Deep Links
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent MMT Card */}
      <div className="glass p-8 border border-slate-200/60 rounded-2xl bg-white shadow-md text-center max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-600">
          <Train size={32} />
        </div>
        <div className="space-y-2">
          <h4 className="text-lg font-black text-slate-800">Book Trains on MakeMyTrip</h4>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            We have generated a direct listing search for your route from <span className="font-extrabold text-slate-700">{origin}</span> to <span className="font-extrabold text-slate-700">{destination}</span> on MakeMyTrip.
          </p>
        </div>
        <div className="max-w-xs mx-auto">
          <BookingButton
            label="Book on MakeMyTrip"
            icon="train"
            url={searchUrl}
            provider="makemytrip"
          />
        </div>
      </div>
    </div>
  );
}
