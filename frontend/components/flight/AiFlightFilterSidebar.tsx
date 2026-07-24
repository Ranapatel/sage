'use client'

import React, { useState } from 'react'
import {
  Bell, Luggage, Briefcase, Filter, ChevronUp, ChevronDown,
  RotateCcw, Clock, ShieldCheck, DollarSign
} from 'lucide-react'

export interface FlightFilterState {
  cabinBaggageCount: number
  checkedBaggageCount: number
  stops: 'any' | 'direct' | '1stop' | '2stops'
  allowOvernight: boolean
  selectedAirlines: string[]
  departureTimeSlot: 'any' | 'morning' | 'afternoon' | 'evening' | 'night'
  cabinClass: string
  maxPrice: number
  maxDurationMinutes: number
}

interface AiFlightFilterSidebarProps {
  filters: FlightFilterState
  onChange: (updated: FlightFilterState) => void
  onReset: () => void
  availableAirlines: { name: string; code: string }[]
  minPriceLimit: number
  maxPriceLimit: number
  maxDurationLimit: number
}

export default function AiFlightFilterSidebar({
  filters,
  onChange,
  onReset,
  availableAirlines,
  minPriceLimit,
  maxPriceLimit,
  maxDurationLimit,
}: AiFlightFilterSidebarProps) {
  const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    bags: true,
    stops: true,
    airlines: true,
    times: true,
    price: true,
  })

  const toggleSection = (sec: string) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }))
  }

  const handleAirlineToggle = (airlineName: string) => {
    const exists = filters.selectedAirlines.includes(airlineName)
    const updated = exists
      ? filters.selectedAirlines.filter(a => a !== airlineName)
      : [...filters.selectedAirlines, airlineName]
    onChange({ ...filters, selectedAirlines: updated })
  }

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-6 text-slate-900 dark:text-slate-100">
      
      {/* ── Price Alert Card Header ── */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-sm">
            <Bell size={16} className="text-orange-500" />
            <span>Set up price alerts</span>
          </div>
          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={priceAlertsEnabled}
            onClick={() => setPriceAlertsEnabled(!priceAlertsEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              priceAlertsEnabled ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                priceAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
          Receive alerts when the prices for this route change.
        </p>
      </div>

      {/* Header title & Reset button */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-900">
        <div className="flex items-center gap-2 font-extrabold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Filter size={15} className="text-orange-500" />
          <span>Filter Flights</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* ── Section: Bags ── */}
      <div className="border-t border-slate-100 dark:border-slate-900 pt-4">
        <button
          type="button"
          onClick={() => toggleSection('bags')}
          className="flex items-center justify-between w-full text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-3"
        >
          <span className="flex items-center gap-2">
            <Luggage size={16} className="text-orange-500" /> Bags
          </span>
          {openSections.bags ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.bags && (
          <div className="space-y-3.5 pl-1">
            {/* Cabin Baggage Counter */}
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Briefcase size={14} className="text-slate-400" /> Cabin baggage
              </span>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1">
                <button
                  type="button"
                  disabled={filters.cabinBaggageCount <= 0}
                  onClick={() => onChange({ ...filters, cabinBaggageCount: Math.max(0, filters.cabinBaggageCount - 1) })}
                  className="w-5 h-5 rounded flex items-center justify-center font-black text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30"
                >
                  -
                </button>
                <span className="w-4 text-center font-extrabold">{filters.cabinBaggageCount}</span>
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, cabinBaggageCount: filters.cabinBaggageCount + 1 })}
                  className="w-5 h-5 rounded flex items-center justify-center font-black text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  +
                </button>
              </div>
            </div>

            {/* Checked Baggage Counter */}
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Luggage size={14} className="text-slate-400" /> Checked baggage
              </span>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1">
                <button
                  type="button"
                  disabled={filters.checkedBaggageCount <= 0}
                  onClick={() => onChange({ ...filters, checkedBaggageCount: Math.max(0, filters.checkedBaggageCount - 1) })}
                  className="w-5 h-5 rounded flex items-center justify-center font-black text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30"
                >
                  -
                </button>
                <span className="w-4 text-center font-extrabold">{filters.checkedBaggageCount}</span>
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, checkedBaggageCount: filters.checkedBaggageCount + 1 })}
                  className="w-5 h-5 rounded flex items-center justify-center font-black text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Section: Stops ── */}
      <div className="border-t border-slate-100 dark:border-slate-900 pt-4">
        <button
          type="button"
          onClick={() => toggleSection('stops')}
          className="flex items-center justify-between w-full text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-3"
        >
          <span>Stops</span>
          {openSections.stops ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.stops && (
          <div className="space-y-2.5 text-xs font-semibold">
            {[
              { id: 'any', label: 'Any' },
              { id: 'direct', label: 'Direct' },
              { id: '1stop', label: 'Up to 1 stop' },
              { id: '2stops', label: 'Up to 2 stops' },
            ].map(opt => (
              <label key={opt.id} className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="radio"
                  name="stops"
                  value={opt.id}
                  checked={filters.stops === opt.id}
                  onChange={() => onChange({ ...filters, stops: opt.id as any })}
                  className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-slate-700"
                />
                <span className="text-slate-700 dark:text-slate-300">{opt.label}</span>
              </label>
            ))}

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.allowOvernight}
                  onChange={e => onChange({ ...filters, allowOvernight: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-slate-700"
                />
                <span className="text-slate-700 dark:text-slate-300">Allow overnight stopovers</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ── Section: Airlines ── */}
      {availableAirlines.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-900 pt-4">
          <button
            type="button"
            onClick={() => toggleSection('airlines')}
            className="flex items-center justify-between w-full text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-3"
          >
            <span>Airlines</span>
            {openSections.airlines ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.airlines && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs font-semibold">
              {availableAirlines.map(airline => {
                const checked = filters.selectedAirlines.length === 0 || filters.selectedAirlines.includes(airline.name)
                return (
                  <label key={airline.code} className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleAirlineToggle(airline.name)}
                      className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-slate-700"
                    />
                    <span className="text-slate-700 dark:text-slate-300">{airline.name}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Section: Departure Time Slot ── */}
      <div className="border-t border-slate-100 dark:border-slate-900 pt-4">
        <button
          type="button"
          onClick={() => toggleSection('times')}
          className="flex items-center justify-between w-full text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-3"
        >
          <span className="flex items-center gap-2">
            <Clock size={16} className="text-orange-500" /> Departure Time
          </span>
          {openSections.times ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.times && (
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            {[
              { id: 'any', label: 'Any Time' },
              { id: 'morning', label: 'Morning (06-12)' },
              { id: 'afternoon', label: 'Afternoon (12-18)' },
              { id: 'evening', label: 'Night (18-24)' },
            ].map(slot => (
              <button
                key={slot.id}
                type="button"
                onClick={() => onChange({ ...filters, departureTimeSlot: slot.id as any })}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  filters.departureTimeSlot === slot.id
                    ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-orange-300'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Section: Price Range ── */}
      <div className="border-t border-slate-100 dark:border-slate-900 pt-4">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-3"
        >
          <span className="flex items-center gap-2">
            <DollarSign size={16} className="text-orange-500" /> Max Price Limit
          </span>
          {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.price && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-black text-slate-700 dark:text-slate-300">
              <span>Up to ₹{filters.maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={minPriceLimit}
              max={maxPriceLimit}
              step={500}
              value={filters.maxPrice}
              onChange={e => onChange({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        )}
      </div>

    </div>
  )
}
