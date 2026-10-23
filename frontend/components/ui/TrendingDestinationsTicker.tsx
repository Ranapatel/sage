'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'

const TRENDING_ITEMS = [
  'One departure city, one destination',
  'Day-by-day drafts with rupee estimates',
  'Visa notes for Indian passports',
  'Edit the draft after it is generated',
  'Book flights and hotels on their own sites'
]

export default function TrendingDestinationsTicker() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % TRENDING_ITEMS.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="inline-flex items-center gap-2 bg-[#FFF4EE] border border-[#FED7AA] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#EA580C] shadow-2xs animate-fade-in">
      <TrendingUp size={14} className="shrink-0 animate-pulse text-[#EA580C]" />
      <span className="truncate max-w-[280px] sm:max-w-xs md:max-w-md transition-all duration-300">
        {TRENDING_ITEMS[index]}
      </span>
    </div>
  )
}
