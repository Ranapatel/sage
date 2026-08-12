'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ALL_CURRENCIES, SYMBOLS, CURRENCY_NAMES } from '@/lib/currency'
import { ChevronDown, Search, Check, X } from 'lucide-react'

interface CurrencySelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  align?: 'left' | 'right'
}

const POPULAR_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'CAD', 'AUD']

export default function CurrencySelector({ value, onChange, className = '', align = 'left' }: CurrencySelectorProps) {
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

  const filtered = ALL_CURRENCIES.filter(code => {
    const name = CURRENCY_NAMES[code] || ''
    const symbol = SYMBOLS[code] || ''
    const query = search.toLowerCase().trim()
    return (
      code.toLowerCase().includes(query) ||
      name.toLowerCase().includes(query) ||
      symbol.toLowerCase().includes(query)
    )
  })

  const selectedSymbol = SYMBOLS[value] || '₹'
  const alignClass = align === 'right' ? 'right-0' : 'left-0'

  return (
    <div className={`relative inline-block ${className}`} ref={wrapperRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-xs active:scale-95"
        aria-label="Select currency"
      >
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[#EA580C] font-mono text-xs font-black">{selectedSymbol}</span>
          <span className="font-extrabold text-slate-900">{value}</span>
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 text-slate-400 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute ${alignClass} top-full mt-2 w-64 sm:w-72 max-w-[calc(100vw-48px)] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150`}>
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-5 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder="Search currency (e.g. USD, EUR, INR)..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-5 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Currency List */}
          <div className="max-h-72 overflow-y-auto p-1.5 divide-y divide-slate-50">
            {/* Popular Currencies Header (only when not searching) */}
            {!search && (
              <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Popular Currencies
              </div>
            )}

            {filtered.length > 0 ? (
              filtered.map((code) => {
                const isSelected = value === code
                const symbol = SYMBOLS[code] || '$'
                const name = CURRENCY_NAMES[code] || code

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      onChange(code)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left transition-colors flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50 text-[#EA580C] font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-black shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#EA580C] text-white'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-orange-100 group-hover:text-[#EA580C]'
                        }`}
                      >
                        {symbol}
                      </span>
                      <div className="flex flex-col min-w-0 truncate">
                        <span className={`text-xs font-extrabold truncate ${isSelected ? 'text-[#EA580C]' : 'text-slate-900'}`}>
                          {code}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium truncate">
                          {name}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                )
              })
            ) : (
              <div className="px-4 py-8 text-center text-slate-400 text-xs font-medium italic">
                No currency found matching "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
