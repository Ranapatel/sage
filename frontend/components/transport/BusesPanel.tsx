'use client'

import React, { useEffect, useState } from 'react';
import BusCard, { BusClassResult } from './BusCard';
import { TrainsEmpty } from './TrainsEmpty';
import { TrainsSkeleton } from './TrainsSkeleton';
import { Bus, ExternalLink } from 'lucide-react';

interface BusesPanelProps {
  origin: string;
  destination: string;
  date: string;            // YYYY-MM-DD
  passengers?: number;
}

type PanelState =
  | { status: 'loading' }
  | { status: 'success'; results: BusClassResult[]; searchUrl: string }
  | { status: 'empty'; searchUrl: string }
  | { status: 'error'; searchUrl: string; message: string };

export function BusesPanel({
  origin,
  destination,
  date,
  passengers = 1,
}: BusesPanelProps) {
  const [state, setState] = useState<PanelState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    async function load() {
      setState({ status: 'loading' });
      try {
        const res = await fetch("/api/transport/buses/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin, destination, travelDate: date, passengers }),
        });
        if (!res.ok) throw new Error('Failed to load buses');
        const data = await res.json();
        
        if (!active) return;
        
        if (data.results && data.results.length > 0) {
          setState({
            status: 'success',
            results: data.results,
            searchUrl: data.searchUrl,
          });
        } else {
          setState({
            status: 'empty',
            searchUrl: data.searchUrl || "https://www.makemytrip.com/bus-tickets/",
          });
        }
      } catch (err: any) {
        if (!active) return;
        setState({
          status: 'error',
          searchUrl: "https://www.makemytrip.com/bus-tickets/",
          message: err.message || "Could not load buses.",
        });
      }
    }
    
    if (origin && destination && date) {
      load();
    } else {
      setState({
        status: 'empty',
        searchUrl: "https://www.makemytrip.com/bus-tickets/",
      });
    }

    return () => {
      active = false;
    };
  }, [origin, destination, date, passengers]);

  if (state.status === "loading") return <TrainsSkeleton />;

  if (state.status === "empty" || state.status === "error") {
    // Re-use TrainsEmpty structure but customize with Bus details
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass rounded-2xl border border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-red-500 flex items-center justify-center shadow-md shadow-blue-600/20">
                    <Bus size={18} className="text-white" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                    Bus Bookings
                  </h3>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Live routes &bull; Instant availability &bull; Official Deep Links
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-8 border border-slate-200/60 rounded-2xl bg-white shadow-md text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-600">
            <Bus size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-black text-slate-800">Book Buses on MakeMyTrip</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              We have generated a direct listing search for your route from <span className="font-extrabold text-slate-700">{origin}</span> to <span className="font-extrabold text-slate-700">{destination}</span> on MakeMyTrip.
            </p>
          </div>
          <div className="max-w-xs mx-auto">
            <a
              href={state.searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full py-3 px-6 rounded-xl font-bold text-sm bg-[#E8461E] text-white hover:opacity-90 transition-opacity whitespace-nowrap shadow-md shadow-red-500/10"
            >
              Search on MakeMyTrip <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 animate-fade-in">
      <div className="text-xs font-bold text-[var(--text-muted)] mb-1">
        {state.results.length} bus options found · book on MakeMyTrip
      </div>
      {state.results.map((bus, idx) => (
        <BusCard key={idx} bus={bus} />
      ))}
      <a
        href={state.searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-center font-bold text-xs text-[var(--primary)] hover:underline py-3 block bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:bg-slate-50 transition-colors"
      >
        View all buses on MakeMyTrip →
      </a>
    </div>
  );
}
export default BusesPanel;
