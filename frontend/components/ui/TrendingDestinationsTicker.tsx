'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'

const TRENDING_ITEMS = [
  '🔥 1,480 travelers planned a trip to Vietnam today',
  '⚡ Goa 3-day itineraries trending up +320% this week',
  '🌴 Bali Hidden Gem routes unlocked by 940 explorers',
  '🏔️ Ladakh bike expeditions planned by 620 users today',
  '✨ Thailand multi-city routes saved 1,150 times this week'
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
