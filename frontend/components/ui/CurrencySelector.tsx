'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ALL_CURRENCIES, SYMBOLS, CURRENCY_NAMES } from '@/lib/currency'
import { ChevronDown, Search } from 'lucide-react'

interface CurrencySelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function CurrencySelector({ value, onChange, className = '' }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = ALL_CURRENCIES.filter(code => 
    code.toLowerCase().includes(search.toLowerCase()) || 
    CURRENCY_NAMES[code].toLowerCase().includes(search.toLowerCase()) ||
    SYMBOLS[code]?.toLowerCase().includes(search.toLowerCase())
  )

  const selectedName = CURRENCY_NAMES[value] || value
  const selectedSymbol = SYMBOLS[value] || ''

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-field flex items-center justify-between text-left"
      >
        <span className="truncate">
          <span className="font-mono text-[var(--primary)] mr-2">{selectedSymbol}</span>
          <span className="font-semibold">{value}</span>
          <span className="text-[var(--text-muted)] ml-2">— {selectedName}</span>
        </span>
        <ChevronDown size={16} className={`transition-transform duration-200 text-[var(--text-muted)] ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-fade-in">
          <div className="p-3 border-b border-gray-100/50">
            <input
              type="text"
              autoFocus
              placeholder="Search currency..."
              className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto hide-scrollbar">
            {filtered.length > 0 ? (
              filtered.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    onChange(code)
                    setIsOpen(false)
                    setSearch('')
                  }}
                  className={`w-full px-5 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between border-b border-gray-50/50 last:border-0 ${
                    value === code ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-mono text-[var(--primary)] text-sm font-bold">
                      {SYMBOLS[code] || '$'}
                    </span>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${value === code ? 'text-blue-600' : 'text-slate-900'}`}>
                        {code}
                      </span>
                      <span className="text-[11px] text-slate-500">{CURRENCY_NAMES[code]}</span>
                    </div>
                  </div>
                  {value === code && (
                    <span className="text-blue-600 text-xs font-bold">SELECTED</span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-slate-500 text-sm italic">
                No currencies found matching "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
