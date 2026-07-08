'use client'

import React from 'react'

interface TrainFiltersProps {
  classes: string[]
  trainTypes: string[]
  minPrice: number
  maxPrice: number
  filters: {
    selectedClasses: string[]
    selectedTypes: string[]
    maxPrice: number
    depTime: string
    arrTime: string
  }
  setFilters: React.Dispatch<React.SetStateAction<any>>
  sortBy: string
  setSortBy: (val: string) => void
}

export default function TrainFilters({
  classes,
  trainTypes,
  minPrice,
  maxPrice,
  filters,
  setFilters,
  sortBy,
  setSortBy,
}: TrainFiltersProps) {
  const toggleClass = (cls: string) => {
    const next = filters.selectedClasses.includes(cls)
      ? filters.selectedClasses.filter((c) => c !== cls)
      : [...filters.selectedClasses, cls]
    setFilters((f: any) => ({ ...f, selectedClasses: next }))
  }

  const toggleType = (type: string) => {
    const next = filters.selectedTypes.includes(type)
      ? filters.selectedTypes.filter((t) => t !== type)
      : [...filters.selectedTypes, type]
    setFilters((f: any) => ({ ...f, selectedTypes: next }))
  }

  return (
    <div className="glass rounded-2xl p-5 border border-slate-200/60 shadow-sm space-y-6">
      <div>
        <h4 className="font-bold text-[var(--text-primary)] mb-3 text-sm uppercase tracking-wider">Sort By</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'ai', label: 'AI Recommended' },
            { id: 'price_low', label: 'Cheapest' },
            { id: 'duration_low', label: 'Fastest' },
            { id: 'dep_early', label: 'Dep: Early' },
            { id: 'arr_early', label: 'Arr: Early' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={`text-xs py-2 px-3 rounded-xl font-semibold transition-all border ${
                sortBy === opt.id
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                  : 'bg-white/50 text-[var(--text-secondary)] border-slate-200 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-200/60" />

      {/* Class Filter */}
      {classes.length > 0 && (
        <div>
          <h4 className="font-bold text-[var(--text-primary)] mb-3 text-sm uppercase tracking-wider">Travel Class</h4>
          <div className="flex flex-wrap gap-2">
            {classes.map((cls) => {
              const active = filters.selectedClasses.includes(cls)
              return (
                <button
                  key={cls}
                  onClick={() => toggleClass(cls)}
                  className={`text-xs py-1.5 px-3 rounded-full font-bold transition-all border ${
                    active
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-white/60 text-[var(--text-secondary)] border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cls}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Train Type Filter */}
      {trainTypes.length > 0 && (
        <div>
          <h4 className="font-bold text-[var(--text-primary)] mb-3 text-sm uppercase tracking-wider">Train Type</h4>
          <div className="flex flex-wrap gap-2">
            {trainTypes.map((type) => {
              const active = filters.selectedTypes.includes(type)
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`text-xs py-1.5 px-3 rounded-full font-bold transition-all border ${
                    active
                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                      : 'bg-white/60 text-[var(--text-secondary)] border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {type}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Price Slider */}
      {maxPrice > minPrice && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider">Max Price</h4>
            <span className="text-xs font-bold text-[var(--primary)]">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(filters.maxPrice)}
            </span>
          </div>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={filters.maxPrice}
            onChange={(e) => setFilters((f: any) => ({ ...f, maxPrice: Number(e.target.value) }))}
            className="w-full accent-[var(--primary)] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
            <span>₹{minPrice}</span>
            <span>₹{maxPrice}</span>
          </div>
        </div>
      )}

      {/* Departure and Arrival Time Filters */}
      <div>
        <h4 className="font-bold text-[var(--text-primary)] mb-3 text-sm uppercase tracking-wider">Departure Time</h4>
        <select
          value={filters.depTime}
          onChange={(e) => setFilters((f: any) => ({ ...f, depTime: e.target.value }))}
          className="w-full text-xs bg-white/60 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[var(--primary)] transition-all font-semibold"
        >
          <option value="any">Any Time</option>
          <option value="morning">Morning (00:00 - 06:00)</option>
          <option value="midday">Mid-day (06:00 - 12:00)</option>
          <option value="afternoon">Afternoon (12:00 - 18:00)</option>
          <option value="night">Night (18:00 - 24:00)</option>
        </select>
      </div>

      <div>
        <h4 className="font-bold text-[var(--text-primary)] mb-3 text-sm uppercase tracking-wider">Arrival Time</h4>
        <select
          value={filters.arrTime}
          onChange={(e) => setFilters((f: any) => ({ ...f, arrTime: e.target.value }))}
          className="w-full text-xs bg-white/60 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[var(--primary)] transition-all font-semibold"
        >
          <option value="any">Any Time</option>
          <option value="morning">Morning (00:00 - 06:00)</option>
          <option value="midday">Mid-day (06:00 - 12:00)</option>
          <option value="afternoon">Afternoon (12:00 - 18:00)</option>
          <option value="night">Night (18:00 - 24:00)</option>
        </select>
      </div>
    </div>
  )
}
