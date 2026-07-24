'use client'

import React, { memo, useMemo, useState, useEffect } from 'react'
import {
  Plane, Building2, MapPin, Wallet, Sparkles,
  ArrowRight, Check, Home, Info, Share2, Bookmark,
  Sun, CloudRain, CloudSun, ShieldAlert, ChevronDown, ChevronUp,
  ExternalLink, Calendar, Clock, Briefcase, AlertTriangle, AlertCircle, X, FileDown,
  CloudLightning, Umbrella, Train, Bus, Car, CheckCircle2, TrendingUp, Users, Zap, ShieldCheck, Banknote
} from 'lucide-react'
import { SYMBOLS } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import { useTripStore } from '@/store/tripStore'
import { getDaysBetween, formatDate } from '@/lib/utils'
import { getVisaInfo } from '@/lib/visaData'
import toast from 'react-hot-toast'
import TransportCard from '../transport/TransportCard'
import HotelCard from '../hotel/HotelCard'
import HotelDetailModal from '../hotel/HotelDetailModal'
import LocationAutocomplete from '../ui/LocationAutocomplete'
import { 
  Icon3DOverview, 
  Icon3DTransport, 
  Icon3DStay, 
  Icon3DItinerary 
} from '@/components/ui/TripSageIcons'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

// ── Destination background images ─────────────────────────────────────────────
const DESTINATION_IMAGES: Record<string, string> = {
  // Kerala & South India
  kochi:       'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=85&auto=format&fit=crop',
  cochin:      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=85&auto=format&fit=crop',
  kerala:      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=85&auto=format&fit=crop',
  munnar:      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&q=85&auto=format&fit=crop',
  wayanad:     'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=85&auto=format&fit=crop',
  alleppey:    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=85&auto=format&fit=crop',
  trivandrum:  'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=85&auto=format&fit=crop',
  thiruvananthapuram: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=85&auto=format&fit=crop',
  pondicherry: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=85&auto=format&fit=crop',
  puducherry:  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=85&auto=format&fit=crop',
  ooty:        'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=1200&q=85&auto=format&fit=crop',
  coorg:       'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1200&q=85&auto=format&fit=crop',
  mysore:      'https://images.unsplash.com/photo-1600100397608-f010e423b961?w=1200&q=85&auto=format&fit=crop',
  mysuru:      'https://images.unsplash.com/photo-1600100397608-f010e423b961?w=1200&q=85&auto=format&fit=crop',
  chennai:     'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=85&auto=format&fit=crop',
  bangalore:   'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&q=85&auto=format&fit=crop',
  bengaluru:   'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&q=85&auto=format&fit=crop',
  hyderabad:   'https://images.unsplash.com/photo-1572445271230-a78e5b8ace6d?w=1200&q=85&auto=format&fit=crop',
  visakhapatnam: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85&auto=format&fit=crop',
  vizag:       'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85&auto=format&fit=crop',
  goa:         'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=85&auto=format&fit=crop',

  // North & West India
  udaipur:     'https://images.unsplash.com/photo-1615836245337-f5b9b2303f1c?w=1200&q=85&auto=format&fit=crop',
  jaipur:      'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=85&auto=format&fit=crop',
  jodhpur:     'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=85&auto=format&fit=crop',
  jaisalmer:   'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=85&auto=format&fit=crop',
  rajasthan:   'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=85&auto=format&fit=crop',
  varanasi:    'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&q=85&auto=format&fit=crop',
  rishikesh:   'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=1200&q=85&auto=format&fit=crop',
  amritsar:    'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1200&q=85&auto=format&fit=crop',
  agra:        'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=85&auto=format&fit=crop',
  delhi:       'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=85&auto=format&fit=crop',
  mumbai:      'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=1200&q=85&auto=format&fit=crop',
  manali:      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85&auto=format&fit=crop',
  shimla:      'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&q=85&auto=format&fit=crop',
  ladakh:      'https://images.unsplash.com/photo-1574968986035-8f9d1c93b8e1?w=1200&q=85&auto=format&fit=crop',
  leh:         'https://images.unsplash.com/photo-1574968986035-8f9d1c93b8e1?w=1200&q=85&auto=format&fit=crop',
  srinagar:    'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1200&q=85&auto=format&fit=crop',
  kashmir:     'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1200&q=85&auto=format&fit=crop',

  // East & Hill Stations
  kolkata:     'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&q=85&auto=format&fit=crop',
  darjeeling:  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85&auto=format&fit=crop',
  shillong:    'https://images.unsplash.com/photo-1626015486807-6b45391a27b8?w=1200&q=85&auto=format&fit=crop',
  gangtok:     'https://images.unsplash.com/photo-1626015486807-6b45391a27b8?w=1200&q=85&auto=format&fit=crop',

  // International Destinations
  bali:        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85&auto=format&fit=crop',
  dubai:       'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85&auto=format&fit=crop',
  bangkok:     'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=85&auto=format&fit=crop',
  singapore:   'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=85&auto=format&fit=crop',
  maldives:    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=85&auto=format&fit=crop',
  paris:       'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85&auto=format&fit=crop',
  london:      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=85&auto=format&fit=crop',
  tokyo:       'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85&auto=format&fit=crop',
  sydney:      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=85&auto=format&fit=crop',
  rome:        'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=85&auto=format&fit=crop',
  barcelona:   'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=85&auto=format&fit=crop',
  amsterdam:   'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=1200&q=85&auto=format&fit=crop',
  istanbul:    'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=85&auto=format&fit=crop',
  prague:      'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=85&auto=format&fit=crop',
  hanoi:       'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&q=85&auto=format&fit=crop',
  'ho chi minh': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=85&auto=format&fit=crop',
  phuket:      'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&q=85&auto=format&fit=crop',
  krabi:       'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=85&auto=format&fit=crop',
  kathmandu:   'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=85&auto=format&fit=crop',
  colombo:     'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85&auto=format&fit=crop',
  'abu dhabi':  'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1200&q=85&auto=format&fit=crop',
  mauritius:   'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1200&q=85&auto=format&fit=crop',
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=85&auto=format&fit=crop'

function getDestinationImage(destination: string): string {
  if (!destination) return FALLBACK_IMAGE
  const key = destination.toLowerCase().split(',')[0].trim().replace(/[^a-z\s]/g, '')
  if (DESTINATION_IMAGES[key]) return DESTINATION_IMAGES[key]
  const partialKey = Object.keys(DESTINATION_IMAGES).find(k => key.includes(k) || k.includes(key))
  return partialKey ? DESTINATION_IMAGES[partialKey] : FALLBACK_IMAGE
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  transport: any[]
  hotels: any[]
  weather: any
  itinerary: any[]
  bookingStatus: any
  destination: string
  loading: boolean
  onTabChange: (tab: string) => void
  tripStatus: string
  tripHistory: any[]
  onCompleteTrip: () => void
  onNewTrip: () => void
  onShare: () => void
  onSave: () => void
}

// ── Skeleton shimmer ──────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-slate-100 overflow-hidden relative ${className}`}
      style={{ minHeight: 16 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
          animation: 'shimmer 1.5s infinite',
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  )
}

// ── Budget math ───────────────────────────────────────────────────────────────

function useBudgetBreakdown(budget: number, nights: number, travelers: number, currency: string) {
  return useMemo(() => {
    const sym = SYMBOLS[currency] ?? currency
    const locale = currency === 'INR' ? 'en-IN' : 'en-US'
    const fmt = (n: number) => `${sym}${Math.round(n).toLocaleString(locale)}`

    const travel = Math.round(budget * 0.40)
    const stay = Math.round(budget * 0.25)
    const activities = Math.round(budget * 0.20)
    const totalEstimated = travel + stay + activities
    const remaining = budget - totalEstimated
    const perPerson = travelers > 0 ? Math.round(totalEstimated / travelers) : totalEstimated
    const pctUsed = budget > 0 ? Math.min(100, (totalEstimated / budget) * 100) : 0

    const saverPerPerson = Math.round(perPerson * 0.85)
    const comfortPerPerson = Math.round(perPerson * 1.15)

    return { sym, fmt, travel, stay, activities, totalEstimated, remaining, perPerson, pctUsed, saverPerPerson, comfortPerPerson }
  }, [budget, nights, travelers, currency])
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onTabChange }: { onTabChange: (t: string) => void }) {
  const { setTrip } = useTripStore()
  const [fromCity, setFromCity] = useState('Delhi')
  const [toCity, setToCity] = useState('')
  const [isBuilding, setIsBuilding] = useState(false)

  const POPULAR = ['Goa', 'Manali', 'Bali', 'Dubai', 'Singapore', 'Kerala', 'Jaipur', 'Bangkok']

  const handleBuildTrip = (selectedDest?: string) => {
    const dest = selectedDest || toCity
    if (!dest || !dest.trim()) {
      toast.error('Please enter a destination city!')
      return
    }

    setIsBuilding(true)
    const today = new Date()
    const future = new Date(today.getTime() + 4 * 86400000)
    const startStr = today.toISOString().split('T')[0]
    const endStr = future.toISOString().split('T')[0]

    setTrip({
      destination: dest,
      startLocation: fromCity || 'Delhi',
      startDate: startStr,
      endDate: endStr,
      currentDay: 1,
    })

    useTripStore.getState().setProfile({
      budget: 25000,
      members: 2,
      travelStyle: 'adventure',
    })

    useTripStore.getState().setItinerary([
      {
        day: 1,
        date: startStr,
        theme: `Arrival & Highlights of ${dest}`,
        places: [
          { name: `Central Landmark & Heritage Site`, category: 'landmark', time: '10:00', duration: '2 hrs' },
          { name: `Scenic Local Market & Promenade`, category: 'shopping', time: '14:00', duration: '2 hrs' }
        ]
      }
    ])

    toast.success(`Trip plan generated for ${dest}!`)
    setIsBuilding(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-center space-y-6 animate-fade-in">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center shadow-sm">
          <Plane className="w-8 h-8 text-[#EA580C]" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] leading-tight font-display">
          Where are you going?
        </h2>
        <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed max-w-md mx-auto font-medium">
          Enter your destination below or tap a popular trip to generate your AI itinerary in seconds.
        </p>
      </div>

      <div className="bg-white border border-[#E8E0D8] p-5 sm:p-6 rounded-3xl shadow-sm text-left space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B6B6B] block mb-1">
              Departure City
            </label>
            <div className="bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3 py-2">
              <LocationAutocomplete
                value={fromCity}
                onChange={setFromCity}
                placeholder="From..."
                className="w-full bg-transparent border-none text-xs font-bold text-[#1A1A1A] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B6B6B] block mb-1">
              Destination City
            </label>
            <div className="bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3 py-2">
              <LocationAutocomplete
                value={toCity}
                onChange={setToCity}
                placeholder="Where to? (e.g. Goa, Bali)"
                className="w-full bg-transparent border-none text-xs font-bold text-[#1A1A1A] outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleBuildTrip()}
          disabled={isBuilding}
          className="w-full py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <Sparkles size={16} />
          <span>{isBuilding ? 'Building Your Trip...' : 'Plan My Trip Now ➔'}</span>
        </button>
      </div>

      <div className="space-y-2.5 pt-2">
        <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest">
          Or Pick a Popular Destination
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR.map(city => (
            <button
              key={city}
              type="button"
              className="px-3.5 py-1.5 bg-[#FFFBF7] border border-[#E8E0D8] hover:border-[#EA580C] hover:bg-orange-50 hover:text-[#EA580C] rounded-xl text-xs font-extrabold text-[#4B4B4B] transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
              onClick={() => {
                setToCity(city)
                handleBuildTrip(city)
              }}
            >
              <MapPin size={11} className="text-[#EA580C]" /> {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Donut Budget Ring Chart ────────────────────────────────────────────────────

function DonutRing({ segments, size = 80 }: { segments: { value: number; color: string }[]; size?: number }) {
  const r = 30
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const total = segments.reduce((s, seg) => s + seg.value, 0)

  let offset = 0
  const arcs = segments.map(seg => {
    const pct = total > 0 ? seg.value / total : 0
    const dash = pct * circumference
    const arc = { dash, offset: -offset * circumference / total * total, color: seg.color, pct }
    offset += seg.value
    return arc
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={8} />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={8}
          strokeDasharray={`${arc.dash} ${circumference}`}
          strokeDashoffset={-arcs.slice(0, i).reduce((s, a) => s + a.dash, 0)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease' }}
        />
      ))}
    </svg>
  )
}

// ── LEFT: Trip Mood Panel ─────────────────────────────────────────────────────

function TripMoodPanel({ weather, remaining, fmt, loading }: { weather: any; remaining: number; fmt: (n: number) => string; loading: boolean }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000)
    return () => clearInterval(id)
  }, [])

  const rows = [
    { label: 'Pace', value: 'Easy', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', dot: '#16A34A', pill: true },
    { label: 'Weather', value: 'Pack light, rain gear', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A', dot: '#B45309', pill: false },
    { label: 'Budget', value: remaining > 0 ? fmt(remaining) + ' left' : 'On track', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', dot: '#EA580C', pill: false },
    { label: 'Status', value: 'Ready to book', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', dot: '#16A34A', pill: true },
  ]

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
          <Zap size={14} className="text-violet-600" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Trip Mood</p>
      </div>
      <div className="space-y-3">
        {rows.map((r, idx) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: r.dot,
                  boxShadow: `0 0 0 ${(tick + idx) % 4 === 0 ? '4px' : '0px'} ${r.dot}33`,
                  transition: 'box-shadow 0.5s ease',
                }}
              />
              <span className="text-[13px] text-slate-600 shrink-0">{r.label}</span>
            </div>
            {loading ? (
              <Skeleton className="h-5 w-24" />
            ) : r.pill ? (
              <span
                className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full border"
                style={{ color: r.color, background: r.bg, borderColor: r.border }}
              >
                {r.value}
              </span>
            ) : (
              <span className="text-[13px] font-semibold text-right" style={{ color: r.color }}>{r.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── LEFT: Journey Flow ── reactive vertical timeline ──────────────────────────

function JourneyFlowVertical({ loading, hasTransport, hasHotels }: { loading: boolean; hasTransport: boolean; hasHotels: boolean }) {
  const steps = [
    { label: 'Origin', status: 'Ready', done: true, color: '#EA580C' },
    { label: 'Travel', status: hasTransport ? 'Matched' : 'Searching...', done: hasTransport, color: '#EA580C' },
    { label: 'Stay', status: hasHotels ? 'Matched' : 'Searching...', done: hasHotels, color: '#16A34A' },
    { label: 'Experience', status: 'Planned', done: true, color: '#16A34A' },
    { label: 'All Set', status: 'Ready to go', done: hasTransport && hasHotels, color: '#7C3AED' },
  ]

  const completedCount = steps.filter(s => s.done).length

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 mt-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
          <TrendingUp size={14} className="text-[#EA580C]" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Journey Flow</p>
        <span className="ml-auto text-[10px] font-black text-[#EA580C] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
          {completedCount}/{steps.length}
        </span>
      </div>
      <div className="relative">
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-100" />
        <div
          className="absolute left-[9px] top-2 w-px bg-gradient-to-b from-[#EA580C] to-[#7C3AED] transition-all duration-1000"
          style={{ height: `${(completedCount / steps.length) * 100}%` }}
        />
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3 relative">
              <div
                className="w-[18px] h-[18px] rounded-full border-2 shrink-0 z-10 flex items-center justify-center transition-all duration-500"
                style={{
                  background: step.done ? step.color : 'white',
                  borderColor: step.done ? step.color : '#D1C9C0',
                  boxShadow: step.done ? `0 0 0 3px ${step.color}20` : 'none',
                }}
              >
                {step.done && <Check size={10} className="text-white" strokeWidth={3} />}
              </div>
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className={`text-[13px] font-medium ${step.done ? 'text-slate-800' : 'text-slate-400'}`}>
                  {step.label}
                </span>
                {loading ? (
                  <Skeleton className="h-4 w-14" />
                ) : (
                  <span className={`text-[11px] font-semibold ${step.done ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {step.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── CENTER: Trip Story Card (premium hero) ────────────────────────────────────

function TripStoryCard({
  loading, perPerson, budget, sym, fmt, travelers, destination,
  origin, nights, onFlights, onAdjust
}: {
  loading: boolean; perPerson: number; budget: number; sym: string; fmt: (n: number) => string
  travelers: number; destination: string; origin?: string; nights: number
  onFlights: () => void; onAdjust: () => void
}) {
  const locale = sym === '₹' ? 'en-IN' : 'en-US'
  const imgUrl = getDestinationImage(destination)
  const destName = destination.split(',')[0].trim() || 'Your Destination'
  const originName = origin ? origin.split(',')[0].trim() : null

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group">

      {/* ── Destination hero image ── */}
      <div className="relative w-full" style={{ height: 240 }}>
        <img
          src={imgUrl}
          alt={destName}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          style={{ filter: loading ? 'brightness(0.5) blur(2px)' : 'brightness(0.65)' }}
        />
        {/* Layered gradient: top left for badge, bottom for content */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.82) 100%)' }}
        />
        {/* Subtle animated shimmer on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(135deg, rgba(234,88,12,0.08) 0%, transparent 60%)' }}
        />

        {/* Content on image */}
        <div className="absolute inset-0 p-5 flex flex-col justify-between">
          {/* Top badges */}
          <div className="flex items-center justify-end">
            {travelers > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
                <Users size={10} /> {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}
              </span>
            )}
          </div>

          {/* Route + price */}
          <div>
            {loading ? (
              <Skeleton className="h-7 w-2/3 mb-2" />
            ) : (
              <div className="mb-1.5">
                {originName && (
                  <p className="text-[11px] text-white/60 font-semibold uppercase tracking-widest mb-1">
                    {originName} → {destName}
                  </p>
                )}
                <h2 className="text-[22px] font-extrabold text-white leading-tight drop-shadow-sm">
                  {nights > 0 ? `${nights} Night${nights > 1 ? 's' : ''} in ` : ''}{destName}
                </h2>
              </div>
            )}
            {loading ? (
              <Skeleton className="h-9 w-36" />
            ) : (
              <div className="flex items-end gap-2 flex-wrap">
                <span className="text-[32px] font-black text-white leading-none drop-shadow-sm">
                  {sym}{perPerson > 0 ? Math.round(perPerson).toLocaleString(locale) : '—'}
                </span>
                <span className="text-[13px] text-white/65 mb-1">/person est.</span>
                {budget > 0 && (
                  <span className="text-[11px] text-white/50 mb-1 ml-1">of {fmt(budget)} total</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* White content area */}
      <div className="p-5 pt-4">
        <p className="text-[13px] text-slate-500 font-medium italic leading-relaxed mb-4">
          Fast route with a well-located stay — leaves room for food, local travel, and activities.
        </p>

        <div className="space-y-2.5">
          <button
            onClick={onFlights}
            className="w-full h-11 bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#C2410C] hover:to-[#EA580C] text-white font-black text-[14px] rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 active:scale-[0.98]"
          >
            See flight options <ArrowRight size={15} />
          </button>
          <button
            onClick={onAdjust}
            className="w-full h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[13px] rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
          >
            Adjust my plan
          </button>
        </div>
      </div>
    </div>
  )
}

// ── RIGHT: Budget Compass with Donut Ring ─────────────────────────────────────

function BudgetCompass({
  loading, budget, totalEstimated, remaining, travel, stay, activities, pctUsed, fmt, sym
}: {
  loading: boolean; budget: number; totalEstimated: number; remaining: number
  travel: number; stay: number; activities: number
  pctUsed: number; fmt: (n: number) => string; sym: string
}) {
  const breakdowns = [
    { label: 'Travel', amount: travel, color: '#EA580C' },
    { label: 'Stay', amount: stay, color: '#3B82F6' },
    { label: 'Activities', amount: activities, color: '#7C3AED' },
  ]

  const donutSegments = [
    { value: travel, color: '#EA580C' },
    { value: stay, color: '#3B82F6' },
    { value: activities, color: '#7C3AED' },
    { value: Math.max(0, remaining), color: '#E2E8F0' },
  ]

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
            <Wallet size={14} className="text-[#EA580C]" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Budget Compass</p>
        </div>
        <Info size={13} className="text-slate-400" />
      </div>

      {/* Donut Ring + Total */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative shrink-0">
          {loading ? (
            <div className="w-20 h-20 rounded-full bg-slate-100 animate-pulse" />
          ) : (
            <DonutRing segments={budget > 0 ? donutSegments : [{ value: 1, color: '#E2E8F0' }]} size={80} />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-slate-500 text-center leading-none">
              {loading ? '...' : `${Math.round(pctUsed)}%`}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {loading ? (
            <Skeleton className="h-7 w-28 mb-1.5" />
          ) : (
            <p className="text-[24px] font-black text-slate-900 leading-none">{fmt(budget)}</p>
          )}
          <div className="mt-1.5 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-500" strokeWidth={2.5} />
              {loading ? <Skeleton className="h-3 w-24" /> : (
                <span className="text-[11px] text-emerald-600 font-semibold">Est. {fmt(totalEstimated)}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] shrink-0" />
              {loading ? <Skeleton className="h-3 w-20" /> : (
                <span className="text-[11px] font-semibold" style={{ color: remaining >= 0 ? '#EA580C' : '#DC2626' }}>
                  {remaining >= 0 ? fmt(remaining) + ' left' : 'Over budget'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown rows with mini color bars */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        {breakdowns.map(b => {
          const pct = budget > 0 ? Math.min(100, (b.amount / budget) * 100) : 0
          return (
            <div key={b.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: b.color }} />
                  <span className="text-[12px] text-slate-600">{b.label}</span>
                </div>
                {loading ? (
                  <Skeleton className="h-3 w-14" />
                ) : (
                  <span className="text-[12px] font-bold text-slate-800">{fmt(b.amount)}</span>
                )}
              </div>
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: loading ? '0%' : `${pct}%`, background: b.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── MOBILE: Horizontal Mood Pills ─────────────────────────────────────────────

function MobileMoodPills({ loading, remaining, fmt }: { loading: boolean; remaining: number; fmt: (n: number) => string }) {
  const pills = [
    { label: 'Easy Pace', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
    { label: 'Rain Aware', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
    { label: loading ? '...' : (remaining > 0 ? fmt(remaining) : 'On track'), color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
    { label: 'Ready', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar px-4">
      {pills.map((p, i) => (
        <span
          key={i}
          className="shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap"
          style={{ color: p.color, background: p.bg, borderColor: p.border }}
        >
          {p.label}
        </span>
      ))}
    </div>
  )
}

// ── Weather Forecast Modal ────────────────────────────────────────────────────

function WeatherForecastModal({
  weather,
  destination,
  onClose,
}: {
  weather: any
  destination: string
  onClose: () => void
}) {
  const destinationCity = destination.split(',')[0].trim()

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#E8E0D8] flex items-center justify-between bg-[#FFFBF7]">
          <h3 className="font-bold text-[#1A1A1A] text-lg flex items-center gap-2">
            <CloudSun className="text-[#EA580C]" size={20} />
            <span>Weather Forecast – {destinationCity}</span>
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#E8E0D8] rounded-lg transition-colors text-[#6B6B6B]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-left">
          <div className="flex items-center gap-6 pb-4 border-b border-[#F5F5F4]">
            <div className="text-6xl text-[#EA580C]"><CloudSun size={56} /></div>
            <div>
              <p className="text-3xl font-bold text-[#1A1A1A] font-mono">{weather.temperature}°C</p>
              <p className="text-sm font-semibold text-[#6B6B6B] mt-0.5">{weather.condition}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Feels like {weather.feelsLike || weather.temperature}°C</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#FFFBF7] border border-[#F2ECE4] rounded-xl p-3">
              <p className="text-xs text-[#9CA3AF] uppercase">Rain Probability</p>
              <p className="text-lg font-bold text-[#EA580C] mt-1 font-mono">{weather.percentage}%</p>
            </div>
            <div className="bg-[#FFFBF7] border border-[#F2ECE4] rounded-xl p-3">
              <p className="text-xs text-[#9CA3AF] uppercase">Humidity</p>
              <p className="text-lg font-bold text-blue-500 mt-1 font-mono">{weather.humidity}%</p>
            </div>
            <div className="bg-[#FFFBF7] border border-[#F2ECE4] rounded-xl p-3">
              <p className="text-xs text-[#9CA3AF] uppercase">Wind Speed</p>
              <p className="text-lg font-bold text-purple-500 mt-1 font-mono">{weather.wind} km/h</p>
            </div>
          </div>

          {weather.forecast && weather.forecast.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">4-Day Forecast</p>
              <div className="border border-[#E8E0D8] rounded-xl overflow-hidden divide-y divide-[#E8E0D8]">
                {weather.forecast.map((f: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 text-sm hover:bg-[#FFFBF7] transition-colors">
                    <span className="font-semibold text-[#1A1A1A]">{f.date}</span>
                    <span className="text-[#6B6B6B]">{f.condition}</span>
                    <span className="font-mono font-semibold">
                      <span className="text-red-500">{f.high}°</span> / <span className="text-blue-500">{f.low}°</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3">
            <AlertCircle size={20} className="text-[#EA580C] shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-bold text-[#C2410C]">Weather Travel Alert</p>
              <p className="text-[12px] text-[#EA580C] leading-relaxed mt-1">
                Always review local advisory updates before traveling. Ensure your travel insurance covers weather-related trip cancellations or delays.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E8E0D8] bg-[#FFFBF7] flex justify-end">
          <button onClick={onClose} className="btn-primary bg-[#EA580C] hover:bg-[#C2410C] px-6 py-2 rounded-xl text-white font-bold text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function WeatherOptModal({
  isOptimizing,
  setIsOptimizing,
  success,
  setSuccess,
  onClose,
  onApply,
  weather,
}: {
  isOptimizing: boolean
  setIsOptimizing: (val: boolean) => void
  success: boolean
  setSuccess: (val: boolean) => void
  onClose: () => void
  onApply: () => void
  weather: any
}) {
  useEffect(() => {
    if (isOptimizing) {
      const timer = setTimeout(() => {
        setIsOptimizing(false)
        setSuccess(true)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [isOptimizing])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#E8E0D8] flex items-center justify-between bg-[#FFFBF7]">
          <h3 className="font-bold text-[#1A1A1A] text-lg flex items-center gap-2">
            <CloudRain className="text-[#EA580C]" size={20} />
            <span>Weather-Aware Optimizer</span>
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#E8E0D8] rounded-lg transition-colors text-[#6B6B6B]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 text-center space-y-4">
          {isOptimizing ? (
            <div className="py-6 space-y-4">
              <div className="w-12 h-12 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div>
                <p className="font-bold text-[#1A1A1A]">Analyzing weather forecast & cloud cover...</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Re-scheduling outdoor blocks to avoid peak rain periods...</p>
              </div>
            </div>
          ) : success ? (
            <div className="space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-[#1A1A1A]">Optimization Complete!</h4>
                <p className="text-[13px] text-[#6B6B6B] leading-relaxed mt-2">
                  AI successfully optimized your day-to-day plan:
                </p>
                <ul className="text-left text-[12px] text-[#6B6B6B] list-disc pl-5 mt-3 space-y-1">
                  <li>Moved outdoor walks to pleasant mornings.</li>
                  <li>Scheduled indoor dining/museum tours during forecast showers.</li>
                  <li>Added extra buffer times for transport delays.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                Click below to restructure your daily itinerary dynamically. Our AI will rearrange sightseeing and outdoor plans to fit the best forecast windows.
              </p>
              <button
                onClick={() => setIsOptimizing(true)}
                className="w-full bg-[#EA580C] hover:bg-[#C2410C] py-3 rounded-xl font-bold text-white text-sm"
              >
                Start Weather Optimization
              </button>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-[#E8E0D8] bg-[#FFFBF7] flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline px-5 py-2 border-[#E8E0D8] text-[#6B6B6B] hover:bg-white text-sm">
            Cancel
          </button>
          {success && (
            <button
              onClick={onApply}
              className="btn-primary bg-[#EA580C] hover:bg-[#C2410C] px-6 py-2 rounded-xl text-white font-bold text-sm"
            >
              Apply to Plan
            </button>
          )}
        </div>
      </div>

      {/* Hotel Detail Modal */}
      <HotelDetailModal />
    </div>
  )
}

function VisaGuidanceModal({
  isInternational,
  visaConfig,
  destination,
  tripContext,
  onClose,
  onOfficial,
}: {
  isInternational: boolean
  visaConfig: any
  destination: string
  tripContext: any
  onClose: () => void
  onOfficial: () => void
}) {
  const destinationCity = destination.split(',')[0].trim()

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#E8E0D8] flex items-center justify-between bg-[#FFFBF7]">
          <h3 className="font-bold text-[#1A1A1A] text-lg">
            {isInternational ? (
              <span className="flex items-center gap-2">
                <ShieldAlert className="text-[#EA580C]" size={20} />
                <span>Visa Guidance – {visaConfig?.country}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plane className="text-[#EA580C]" size={20} />
                <span>Domestic Travel Guidelines</span>
              </span>
            )}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#E8E0D8] rounded-lg transition-colors text-[#6B6B6B]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-left">
          {isInternational ? (
            <div className="space-y-5">
              <div className="bg-[#FFFBF7] border border-[#F2ECE4] rounded-xl p-4 flex justify-between items-start">
                <div>
                  <p className="text-xs text-[#9CA3AF] uppercase">Visa Type</p>
                  <p className="text-base font-bold text-[#1A1A1A] mt-1">{visaConfig.visaStatus}</p>
                </div>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                  style={{
                    color: visaConfig.badgeColor,
                    background: visaConfig.badgeBg,
                    borderColor: visaConfig.badgeBorder
                  }}
                >
                  {visaConfig.badge}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#E8E0D8] rounded-xl p-3">
                  <p className="text-xs text-[#9CA3AF] uppercase">Processing Time</p>
                  <p className="text-sm font-semibold text-[#1A1A1A] mt-1">{visaConfig.processingTime}</p>
                </div>
                <div className="border border-[#E8E0D8] rounded-xl p-3">
                  <p className="text-xs text-[#9CA3AF] uppercase">Passport Validity</p>
                  <p className="text-sm font-semibold text-[#1A1A1A] mt-1">Minimum 6 months</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">Step-by-Step Instructions</p>
                <ol className="text-[13px] text-[#6B6B6B] list-decimal pl-5 space-y-2 leading-relaxed">
                  <li>Ensure your passport has at least 2 blank pages and is valid for 6 months from entry.</li>
                  <li>Gather all required documents as shown in the checklist.</li>
                  <li>
                    Fill out the online application form on the{' '}
                    <button onClick={onOfficial} className="text-[#EA580C] hover:underline font-semibold inline-flex items-center gap-0.5">
                      official portal <ExternalLink size={10} />
                    </button>.
                  </li>
                  <li>Pay the visa fee online or prepare the exact amount in cash (USD/local currency) if paying on arrival.</li>
                  <li>Keep printed copies of your visa approval letter, flights, and hotel bookings ready for immigration check.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">Required Checklist</p>
                <div className="bg-[#F5F5F4] rounded-xl p-4 space-y-2">
                  {visaConfig.docs.map((doc: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-[12px] text-[#6B6B6B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-4 flex gap-3">
                <Check size={18} className="text-[#16A34A] shrink-0 mt-0.5" strokeWidth={3} />
                <div>
                  <p className="text-[13px] font-bold text-[#14532D]">No Visa Required</p>
                  <p className="text-[12px] text-[#166534] leading-relaxed mt-1">
                    You are traveling domestically within India. No passport visa control is required.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">Identity & Check-in Rules</p>
                <ul className="text-[13px] text-[#6B6B6B] list-disc pl-5 space-y-2 leading-relaxed">
                  <li><strong>Airport Check-in:</strong> Carry a physical or digital copy of your Aadhaar Card, Passport, or Voter ID. Airport entry requires matching names on ticket and ID.</li>
                  <li><strong>Hotel Stay:</strong> All guests must provide valid government photo ID upon checking in. PAN card is usually not accepted as address proof.</li>
                  <li><strong>Travel Permits:</strong> Certain border zones (e.g. parts of Ladakh or Sikkim) require Inner Line Permits (ILP) which must be applied for separately.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-[#E8E0D8] bg-[#FFFBF7] flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline px-5 py-2 border-[#E8E0D8] text-[#6B6B6B] hover:bg-white text-sm">
            Close
          </button>
          {isInternational && (
            <button
              onClick={onOfficial}
              className="btn-primary bg-[#EA580C] hover:bg-[#C2410C] px-6 py-2 rounded-xl text-white font-bold text-sm flex items-center gap-1"
            >
              Open portal <ExternalLink size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Weather Readiness Card ────────────────────────────────────────────────────

function WeatherReadinessCard({
  weather,
  datesText,
  destination,
  weatherConfig,
  loading,
  onAdjustClick,
  onForecastClick,
}: {
  weather: any
  datesText: string | null
  destination: string
  weatherConfig: any
  loading: boolean
  onAdjustClick: () => void
  onForecastClick: () => void
  packExpanded?: boolean
  setPackExpanded?: (val: boolean) => void
  isMobile?: boolean
}) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 h-[320px]">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!weather || !weatherConfig) return null

  const destinationCity = destination ? destination.split(',')[0].replace(/[^a-zA-Z\s]/g, '').trim() : 'Destination'
  const displayDates = datesText ? datesText.replace(/[^\x00-\x7F]/g, ' ').replace(/\s+/g, ' ').trim() : ''

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between h-full min-h-[220px] text-left relative overflow-hidden group">

      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-sky-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100/80 p-2 flex items-center justify-center text-[#EA580C] shrink-0 border border-orange-200/60">
              <CloudSun size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Weather Readiness</h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                {destinationCity} {displayDates ? `• ${displayDates}` : ''}
              </p>
            </div>
          </div>

          <span
            className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs shrink-0"
            style={{
              color: weatherConfig.badgeColor,
              background: weatherConfig.badgeBg,
              borderColor: weatherConfig.badgeBorder,
            }}
          >
            {weatherConfig.status}
          </span>
        </div>

        {/* Temperature & Rain */}
        <div className="grid grid-cols-2 gap-2.5 bg-gradient-to-r from-orange-50/70 to-amber-50/70 border border-orange-200/50 rounded-xl p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#EA580C] shrink-0">
              <Sun size={16} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Temp</span>
              <span className="text-base font-black text-slate-900 leading-none block mt-0.5 font-mono">
                {weather.temperature}°C
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 border-l border-orange-200/60 pl-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
              <CloudRain size={16} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Rain Chance</span>
              <span className="text-base font-black text-slate-900 leading-none block mt-0.5 font-mono">
                {weather.percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* 5-Hour Forecast Strip */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-between text-center gap-1">
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[8px] font-bold text-slate-400 block">09:00</span>
            <Sun size={14} className="text-amber-500 my-0.5" />
            <span className="text-[11px] font-black text-slate-800 block">26°</span>
          </div>
          <div className="w-[1px] h-5 bg-slate-200" />
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[8px] font-bold text-slate-400 block">12:00</span>
            <CloudSun size={14} className="text-amber-500 my-0.5" />
            <span className="text-[11px] font-black text-slate-800 block">28°</span>
          </div>
          <div className="w-[1px] h-5 bg-slate-200" />
          <div className="flex-1 bg-orange-100/60 rounded-md py-0.5 border border-orange-200/50 flex flex-col items-center">
            <span className="text-[8px] font-extrabold text-[#EA580C] block">15:00</span>
            <CloudLightning size={14} className="text-[#EA580C] my-0.5" />
            <span className="text-[11px] font-black text-[#EA580C] block">24°</span>
          </div>
          <div className="w-[1px] h-5 bg-slate-200" />
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[8px] font-bold text-slate-400 block">18:00</span>
            <CloudRain size={14} className="text-blue-500 my-0.5" />
            <span className="text-[11px] font-black text-slate-800 block">23°</span>
          </div>
          <div className="w-[1px] h-5 bg-slate-200" />
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[8px] font-bold text-slate-400 block">21:00</span>
            <CloudSun size={14} className="text-amber-500 my-0.5" />
            <span className="text-[11px] font-black text-slate-800 block">25°</span>
          </div>
        </div>

        {/* Outdoor Window */}
        <div className="flex items-center justify-between text-[11px] text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
          <span className="font-extrabold text-[#EA580C] flex items-center gap-1">
            <Clock size={13} /> {weatherConfig.bestWindow}
          </span>
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Umbrella size={12} className="text-blue-500" /> Umbrella • Raincoat
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex gap-2 relative z-10">
        <button
          onClick={onAdjustClick}
          className="flex-1 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:shadow-md hover:shadow-orange-500/20 rounded-xl transition-all text-center cursor-pointer active:scale-[0.98]"
        >
          Adjust Itinerary →
        </button>
        <button
          onClick={onForecastClick}
          className="flex-1 py-2 text-xs font-extrabold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all text-center cursor-pointer active:scale-[0.98]"
        >
          View Forecast
        </button>
      </div>
    </div>
  )
}

// ── Visa Readiness Card ───────────────────────────────────────────────────────

function VisaReadinessCard({
  isInternational,
  destination,
  tripContext,
  visaConfig,
  loading,
  onGuidanceClick,
  onOfficialClick,
}: {
  isInternational: boolean
  destination: string
  tripContext: any
  visaConfig: any
  loading: boolean
  onGuidanceClick: () => void
  onOfficialClick: () => void
  docsExpanded?: boolean
  setDocsExpanded?: (val: boolean) => void
  isMobile?: boolean
}) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 h-[320px]">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!isInternational) {
    const destinationCity = destination ? destination.split(',')[0].replace(/[^a-zA-Z\s]/g, '').trim() : 'Destination'
    const startCity = tripContext.startLocation ? tripContext.startLocation.split(',')[0].replace(/[^a-zA-Z\s]/g, '').trim() : 'Origin'
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between h-full min-h-[220px] text-left relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 p-2 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200/60">
                <Plane size={20} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Travel Readiness</h3>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{startCity} → {destinationCity}</p>
              </div>
            </div>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 shadow-xs">
              READY
            </span>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-xl p-3 flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-950">No Visa Required</p>
              <p className="text-[11px] text-emerald-800 font-medium leading-tight mt-0.5">
                Hassle-free domestic travel within India.
              </p>
            </div>
          </div>

          <div className="space-y-1.5 bg-slate-50 border border-slate-100 rounded-xl p-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mandatory Travel IDs</span>
            <div className="space-y-1 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Govt Issued Photo ID (Aadhaar / Passport / License)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Airline Boarding Pass / Ticket Confirmation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 relative z-10">
          <button
            onClick={onGuidanceClick}
            className="w-full py-2 text-xs font-extrabold text-emerald-700 border border-emerald-300 hover:bg-emerald-50 rounded-xl transition-all text-center cursor-pointer active:scale-[0.98]"
          >
            Check Domestic Guidelines →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between h-full min-h-[220px] text-left relative overflow-hidden group">
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100/80 p-2 flex items-center justify-center text-[#EA580C] shrink-0 border border-orange-200/60">
              <ShieldAlert size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Visa Readiness</h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                Passport → {visaConfig?.country || destination}
              </p>
            </div>
          </div>
          <span
            className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs shrink-0"
            style={{
              color: visaConfig?.badgeColor || '#EA580C',
              background: visaConfig?.badgeBg || '#FFF7ED',
              borderColor: visaConfig?.badgeBorder || '#FFEDD5',
            }}
          >
            {visaConfig?.badge || 'Visa Check'}
          </span>
        </div>

        <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider block">Visa Status</span>
          <p className="text-xs font-black text-slate-900">{visaConfig?.visaStatus || 'Visa Required on Arrival'}</p>
        </div>

        <div className="space-y-1.5 bg-slate-50 border border-slate-100 rounded-xl p-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Required Documents</span>
          <p className="text-xs font-medium text-slate-700 leading-relaxed">
            Valid Passport (6 months validity), Return Flight Ticket, Proof of Hotel Booking.
          </p>
        </div>
      </div>

      <div className="pt-2 flex gap-2 relative z-10">
        <button
          onClick={onGuidanceClick}
          className="flex-1 py-2 text-xs font-extrabold text-[#EA580C] border border-[#EA580C] hover:bg-orange-50 rounded-xl transition-all text-center cursor-pointer active:scale-[0.98]"
        >
          View Guidance
        </button>
        <button
          onClick={onOfficialClick}
          className="flex-1 py-2 text-xs font-extrabold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-xl transition-all text-center cursor-pointer active:scale-[0.98]"
        >
          Official Portal
        </button>
      </div>
    </div>
  )
}

// ── Transit Comparison Card (with visual price bars) ─────────────────────────

function TransitComparisonCard({
  transport,
  loading,
  onTabChange,
  fmt,
}: {
  transport: any[]
  loading: boolean
  onTabChange: (tab: string) => void
  fmt: (price: number) => string
}) {
  const comparisonData = useMemo(() => {
    if (!transport || transport.length === 0) return []

    const modes = ['flight', 'train', 'bus', 'car'] as const
    const labelMap = { flight: 'Flight', train: 'Train', bus: 'Bus', car: 'Cab/Car' }
    const iconMap = { flight: Plane, train: Train, bus: Bus, car: Car }

    return modes.map(mode => {
      const options = transport.filter(t => t.type === mode)
      if (options.length === 0) return null

      const cheapest = options.reduce((min, cur) => cur.price < min.price ? cur : min, options[0])

      const getDurationMinutes = (durationStr: string) => {
        let mins = 0
        const hMatch = durationStr.match(/(\d+)\s*h/)
        const mMatch = durationStr.match(/(\d+)\s*m/)
        if (hMatch) mins += parseInt(hMatch[1]) * 60
        if (mMatch) mins += parseInt(mMatch[1])
        return mins || 99999
      }
      const fastest = options.reduce((fast, cur) => {
        const curMins = getDurationMinutes(cur.duration || '')
        const fastMins = getDurationMinutes(fast.duration || '')
        return curMins < fastMins ? cur : fast
      }, options[0])

      return {
        type: mode,
        label: labelMap[mode],
        icon: iconMap[mode],
        price: cheapest.price,
        duration: fastest.duration || 'N/A',
      }
    }).filter(Boolean) as Array<{
      type: 'flight' | 'train' | 'bus' | 'car'
      label: string
      icon: any
      price: number
      duration: string
    }>
  }, [transport])

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-left hover:-translate-y-0.5 transition-all duration-300">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (comparisonData.length === 0) return null

  const maxPrice = Math.max(...comparisonData.map(d => d.price))
  const cheapestPrice = Math.min(...comparisonData.map(d => d.price))
  const parseDuration = (dStr: string) => {
    let mins = 0
    const hMatch = dStr.match(/(\d+)\s*h/)
    const mMatch = dStr.match(/(\d+)\s*m/)
    if (hMatch) mins += parseInt(hMatch[1]) * 60
    if (mMatch) mins += parseInt(mMatch[1])
    return mins || 99999
  }
  const fastestDuration = Math.min(...comparisonData.map(d => parseDuration(d.duration)))

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-left">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
          <Sparkles className="text-[#EA580C]" size={14} />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-slate-900 leading-tight">Transit Mode Comparison</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Cheapest & fastest transit options side-by-side</p>
        </div>
      </div>

      <div className="space-y-3">
        {comparisonData.map((item) => {
          const IconComp = item.icon
          const isCheapest = item.price === cheapestPrice
          const isFastest = parseDuration(item.duration) === fastestDuration
          const barPct = maxPrice > 0 ? (item.price / maxPrice) * 100 : 0
          const barColor = isCheapest ? '#16A34A' : isFastest ? '#0284C7' : item.type === 'train' ? '#0D9488' : '#94A3B8'

          let badgeText = ''
          let badgeStyle = 'text-slate-600 bg-slate-50 border-slate-200'
          if (isCheapest) { badgeText = 'Cheapest'; badgeStyle = 'text-emerald-700 bg-emerald-50 border-emerald-200' }
          else if (isFastest) { badgeText = 'Fastest'; badgeStyle = 'text-sky-700 bg-sky-50 border-sky-200' }
          else if (item.type === 'train') { badgeText = 'Eco'; badgeStyle = 'text-teal-700 bg-teal-50 border-teal-200' }

          return (
            <div
              key={item.type}
              onClick={() => onTabChange(item.type === 'flight' ? 'transport' : item.type === 'train' ? 'trains' : item.type === 'bus' ? 'buses' : 'cars')}
              className="group/row rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50/80 p-2.5 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover/row:bg-white flex items-center justify-center text-slate-600 shrink-0 transition-colors border border-transparent group-hover/row:border-slate-200">
                    <IconComp size={15} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">{item.label}</p>
                    <p className="text-[10px] text-slate-400">{item.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {badgeText && (
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${badgeStyle}`}>
                      {badgeText}
                    </span>
                  )}
                  <span className="text-[13px] font-black text-slate-800">{fmt(item.price)}</span>
                </div>
              </div>
              {/* Visual price bar */}
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${barPct}%`, background: barColor }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Trip Perks Card (Fills Bottom Right Gap) ───────────────────────────────────

function TripPerksCard({ onDownloadPDF, pdfGenerating }: { onDownloadPDF: () => void; pdfGenerating: boolean }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 text-left relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <ShieldCheck size={15} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Trip Guarantee & Extras</p>
        </div>
        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
          ACTIVE
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center text-[#EA580C]">
              <Banknote size={13} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-none">Price Drop Guarantee</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Monitoring fare drops 24/7</p>
            </div>
          </div>
          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
        </div>

        <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <Sparkles size={13} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-none">24/7 AI Concierge</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Weather & plan adjustments</p>
            </div>
          </div>
          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
        </div>
      </div>

      <button
        onClick={onDownloadPDF}
        disabled={pdfGenerating}
        className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
      >
        <FileDown size={14} />
        <span>{pdfGenerating ? 'Generating PDF...' : 'Download Offline Itinerary (PDF)'}</span>
      </button>
    </div>
  )
}

// ── ROOT COMPONENT ────────────────────────────────────────────────────────────

function OverviewTab({
  transport, hotels, weather, itinerary, bookingStatus,
  destination, loading, onTabChange, onShare, onSave,
}: Props) {
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const { userProfile, tripContext } = useTripStore()
  const sym = SYMBOLS[currency] ?? currency
  const locale = currency === 'INR' ? 'en-IN' : 'en-US'

  const [showForecast, setShowForecast] = useState(false)
  const [showWeatherOpt, setShowWeatherOpt] = useState(false)
  const [showVisaGuidance, setShowVisaGuidance] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optSuccess, setOptSuccess] = useState(false)
  const [packExpanded, setPackExpanded] = useState(false)
  const [docsExpanded, setDocsExpanded] = useState(false)
  const [pdfGenerating, setPdfGenerating] = useState(false)

  const handleDownloadPDF = async () => {
    const element = document.getElementById('trip-board-overview')
    if (!element) {
      toast.error("Trip board contents not found for export.")
      return
    }

    setPdfGenerating(true)
    const loadToast = toast.loading("Generating your travel plan PDF...")

    try {
      const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFBF7',
        logging: false
      }

      const canvas = await html2canvas(element, options)
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const destName = (tripContext.destination || destination || 'MyTrip').split(',')[0].trim().replace(/\s+/g, '_')
      pdf.save(`${destName}_Itinerary_TripSage.pdf`)
      toast.dismiss(loadToast)
      toast.success("PDF downloaded successfully!")
    } catch (err) {
      console.error(err)
      toast.dismiss(loadToast)
      toast.error("Could not generate PDF.")
    } finally {
      setPdfGenerating(false)
    }
  }

  const destClean = (tripContext.destination || destination || '').toLowerCase()
  const domesticCities = [
    'goa', 'manali', 'kerala', 'rishikesh', 'jaipur', 'kashmir', 'andaman', 'delhi', 'mumbai', 'hyderabad', 'bangalore', 'bengaluru', 'agra', 'varanasi', 'kochi', 'udaipur', 'shimla', 'darjeeling', 'amritsar', 'mysuru', 'srinagar', 'ooty', 'visakhapatnam', 'coimbatore', 'bhopal', 'indore', 'chandigarh', 'nagpur', 'lucknow', 'patna'
  ]
  const isDestDomestic = domesticCities.some(city => destClean.includes(city)) || destClean.includes('india')
  const isInternational = !isDestDomestic && destClean.length > 0

  const visaConfig = useMemo(() => {
    if (!isInternational) return null
    return getVisaInfo(destClean)
  }, [isInternational, destClean])

  const weatherConfig = useMemo(() => {
    if (!weather) return null

    const temp = weather.temperature
    const cond = (weather.condition || '').toLowerCase()
    const pct = weather.percentage || 0

    let status = 'Clear'
    let badgeColor = '#16A34A'
    let badgeBg = '#F0FDF4'
    let badgeBorder = '#BBF7D0'
    let bestWindow = 'All day outdoor activities'
    let pack = ['Comfortable walking shoes', 'Sunglasses', 'Light layers']
    let impact = 'High outdoor confidence! Perfect weather for walking tours, beach visits, and sightseeing.'

    if (pct > 50 || cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunderstorm') || cond.includes('shower')) {
      status = 'Rain-aware'
      badgeColor = '#EA580C'
      badgeBg = '#FFF7ED'
      badgeBorder = '#FED7AA'
      bestWindow = 'Before 12 PM or indoor visits during showers'
      pack = ['Umbrella', 'Sandals / quick-dry footwear', 'Light rain jacket', 'Waterproof phone pouch']
      impact = 'Keep beaches and outdoor activities flexible. Add indoor cafes, museums, or temple/heritage visits as backup.'
    } else if (temp > 32) {
      status = 'Hot'
      badgeColor = '#DC2626'
      badgeBg = '#FEF2F2'
      badgeBorder = '#FCA5A5'
      bestWindow = 'Early morning (7 AM - 10 AM) & Late evening (after 5 PM)'
      pack = ['Sunscreen (SPF 50+)', 'Hat / Cap', 'Sun glasses', 'Light cotton clothing', 'Refillable water bottle']
      impact = 'Avoid peak afternoon sun. Plan early starts and keep indoor museum breaks/shopping between 12 PM and 4 PM.'
    } else if (temp < 15) {
      status = 'Cold'
      badgeColor = '#2563EB'
      badgeBg = '#EFF6FF'
      badgeBorder = '#BFDBFE'
      bestWindow = 'Midday (11 AM - 3 PM) when sun is out'
      pack = ['Fleece jacket or warm coat', 'Thermals', 'Woolen socks', 'Moisturizer / Lip balm']
      impact = 'Dress in warm layers. Outdoor activities are great during midday, but wrap up early as temperatures drop fast post-sunset.'
    } else {
      status = 'Pleasant'
      badgeColor = '#16A34A'
      badgeBg = '#F0FDF4'
      badgeBorder = '#BBF7D0'
      bestWindow = 'All day sightseeing is comfortable'
      pack = ['Comfortable walking shoes', 'Light breathable layers', 'Sunglasses', 'Camera']
      impact = 'Excellent weather for exploring! High outdoor confidence. Make the most of walking tours, viewpoint treks, and open-air sights.'
    }

    return { status, badgeColor, badgeBg, badgeBorder, bestWindow, pack, impact }
  }, [weather])

  const travelers = userProfile?.members ?? 2
  const budget = userProfile?.budget ?? 0

  const days = useMemo(() => {
    if (tripContext.startDate && tripContext.endDate) {
      return Math.max(1, getDaysBetween(tripContext.startDate, tripContext.endDate))
    }
    return itinerary.length || 3
  }, [tripContext.startDate, tripContext.endDate, itinerary.length])

  const nights = Math.max(1, days - 1)

  const { fmt, travel, stay, activities, totalEstimated, remaining, perPerson, pctUsed } =
    useBudgetBreakdown(budget, nights, travelers, currency)

  const hasSearched = !!(tripContext.destination || destination)

  if (!hasSearched && !loading) {
    return <EmptyState onTabChange={onTabChange} />
  }

  const routeText = useMemo(() => {
    if (tripContext.isMultiCity && tripContext.stops && tripContext.stops.length > 0) {
      const stopCities = tripContext.stops.map(s => s.city.split(',')[0].trim()).join(' → ')
      const origin = (tripContext.startLocation || 'Origin').split(',')[0].trim()
      return `${origin} → ${stopCities} → ${origin}`
    }
    return tripContext.startLocation && tripContext.destination
      ? `${tripContext.startLocation.split(',')[0].trim()} → ${tripContext.destination.split(',')[0].trim()}`
      : tripContext.destination || destination || 'Your Trip'
  }, [tripContext.isMultiCity, tripContext.stops, tripContext.startLocation, tripContext.destination, destination])

  const datesText = tripContext.startDate && tripContext.endDate
    ? `${formatDate(tripContext.startDate)} – ${formatDate(tripContext.endDate)} · ${days}d`
    : null

  const budgetDisplay = budget > 0 ? `${sym}${Math.round(budget).toLocaleString(locale)}` : null

  const hasTransport = transport && transport.length > 0
  const hasHotels = hotels && hotels.length > 0

  return (
    <div id="trip-board-overview">
      {/* Keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(100%) }
        }
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0px); }
        }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .card-enter { animation: float-up 0.4s ease forwards; }
      `}</style>

      {/* ── OFFICIAL TRIPSAGE BRAND HEADER (Included in PDF Exports) ── */}
      <div className="mb-4 p-4 bg-white border border-[#E8E0D8] rounded-2xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="TripSage"
            className="w-9 h-9 rounded-xl object-contain shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-black text-[#1A1A1A] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                TripSage
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-50 text-[#EA580C] border border-orange-200 uppercase tracking-wider">
                Official AI Travel Itinerary
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Verified travel intelligence, weather forecast, transit comparison & readiness summary
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm font-extrabold text-[#1A1A1A] block">{routeText}</span>
          {datesText && (
            <span className="text-xs font-semibold text-[#EA580C] block mt-0.5">{datesText}</span>
          )}
        </div>
      </div>

      {/* DESKTOP LAYOUT — PERFECT BALANCED DASHBOARD */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-12 gap-5 items-start">

          {/* MAIN (LEFT 8 COLS) */}
          <div className="col-span-8 space-y-4">
            <div className="card-enter" style={{ animationDelay: '0ms' }}>
              <TripStoryCard
                loading={loading}
                perPerson={perPerson}
                budget={budget}
                sym={sym}
                fmt={fmt}
                travelers={travelers}
                destination={tripContext.destination || destination || ''}
                origin={tripContext.startLocation || ''}
                nights={nights}
                onFlights={() => onTabChange('transport')}
                onAdjust={() => onTabChange('optimizer')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 card-enter" style={{ animationDelay: '80ms' }}>
              <WeatherReadinessCard
                weather={weather}
                datesText={datesText}
                destination={tripContext.destination || destination || ''}
                weatherConfig={weatherConfig}
                loading={loading}
                onAdjustClick={() => { setOptSuccess(false); setIsOptimizing(false); setShowWeatherOpt(true); }}
                onForecastClick={() => setShowForecast(true)}
                packExpanded={packExpanded}
                setPackExpanded={setPackExpanded}
              />
              <VisaReadinessCard
                isInternational={isInternational}
                destination={tripContext.destination || destination || ''}
                tripContext={tripContext}
                visaConfig={visaConfig}
                loading={loading}
                onGuidanceClick={() => setShowVisaGuidance(true)}
                onOfficialClick={() => {
                  if (visaConfig?.officialLink) {
                    window.open(visaConfig.officialLink, '_blank')
                  }
                }}
                docsExpanded={docsExpanded}
                setDocsExpanded={setDocsExpanded}
              />
            </div>

            <div className="card-enter" style={{ animationDelay: '160ms' }}>
              <TransitComparisonCard
                transport={transport}
                loading={loading}
                onTabChange={onTabChange}
                fmt={fmt}
              />
            </div>
          </div>

          {/* ASIDE (RIGHT 4 COLS) */}
          <div className="col-span-4 space-y-4">
            <div className="card-enter" style={{ animationDelay: '40ms' }}>
              <BudgetCompass
                loading={loading}
                budget={budget}
                totalEstimated={totalEstimated}
                remaining={remaining}
                travel={travel}
                stay={stay}
                activities={activities}
                pctUsed={pctUsed}
                fmt={fmt}
                sym={sym}
              />
            </div>
            <div className="card-enter" style={{ animationDelay: '120ms' }}>
              <TripMoodPanel weather={weather} remaining={remaining} fmt={fmt} loading={loading} />
            </div>
            <div className="card-enter" style={{ animationDelay: '200ms' }}>
              <JourneyFlowVertical loading={loading} hasTransport={hasTransport} hasHotels={hasHotels} />
            </div>
            <div className="card-enter" style={{ animationDelay: '240ms' }}>
              <TripPerksCard onDownloadPDF={handleDownloadPDF} pdfGenerating={pdfGenerating} />
            </div>
          </div>

        </div>
      </div>

      {/* ── MOBILE LAYOUT — MOBILE-FIRST APP EXPERIENCE ───────────────────── */}
      <div className="lg:hidden pb-[140px] space-y-4">

        {/* Mobile Header Route Text */}
        <div className="px-4 pt-1 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#1A1A1A] leading-tight">
              {routeText}
            </h2>
            {datesText && (
              <p className="text-xs text-[#6B6B6B] mt-0.5 font-semibold">
                {datesText} {travelers ? `· ${travelers} traveler${travelers > 1 ? 's' : ''}` : ''}
              </p>
            )}
          </div>
          {budgetDisplay && (
            <span className="text-sm font-extrabold text-[#EA580C] bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200 shrink-0">
              {budgetDisplay}
            </span>
          )}
        </div>

        {/* Mobile Mood Pills */}
        <div>
          <MobileMoodPills loading={loading} remaining={remaining} fmt={fmt} />
        </div>

        {/* Hero Story Card */}
        <div className="px-4">
          <TripStoryCard
            loading={loading}
            perPerson={perPerson}
            budget={budget}
            sym={sym}
            fmt={fmt}
            travelers={travelers}
            destination={tripContext.destination || destination || ''}
            origin={tripContext.startLocation || ''}
            nights={nights}
            onFlights={() => onTabChange('transport')}
            onAdjust={() => onTabChange('optimizer')}
          />
        </div>

        {/* ── MOBILE HORIZONTAL SNAP CAROUSEL (Swipeable Cards) ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-4">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
              <Sparkles size={12} className="text-[#EA580C]" /> Swipe Cards & Intelligence
            </span>
            <span className="text-[10px] font-bold text-slate-400">Swipe →</span>
          </div>

          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar px-4 pb-2">
            {/* Slide 1: Weather Readiness */}
            <div className="snap-center shrink-0 w-[86vw] max-w-[340px]">
              <WeatherReadinessCard
                weather={weather}
                datesText={datesText}
                destination={tripContext.destination || destination || ''}
                weatherConfig={weatherConfig}
                loading={loading}
                onAdjustClick={() => { setOptSuccess(false); setIsOptimizing(false); setShowWeatherOpt(true); }}
                onForecastClick={() => setShowForecast(true)}
                packExpanded={packExpanded}
                setPackExpanded={setPackExpanded}
                isMobile={true}
              />
            </div>

            {/* Slide 2: Travel & Visa Readiness */}
            <div className="snap-center shrink-0 w-[86vw] max-w-[340px]">
              <VisaReadinessCard
                isInternational={isInternational}
                destination={tripContext.destination || destination || ''}
                tripContext={tripContext}
                visaConfig={visaConfig}
                loading={loading}
                onGuidanceClick={() => setShowVisaGuidance(true)}
                onOfficialClick={() => {
                  if (visaConfig?.officialLink) {
                    window.open(visaConfig.officialLink, '_blank')
                  }
                }}
                docsExpanded={docsExpanded}
                setDocsExpanded={setDocsExpanded}
                isMobile={true}
              />
            </div>

            {/* Slide 3: Transit Mode Comparison */}
            <div className="snap-center shrink-0 w-[86vw] max-w-[340px]">
              <TransitComparisonCard
                transport={transport}
                loading={loading}
                onTabChange={onTabChange}
                fmt={fmt}
              />
            </div>
          </div>
        </div>

        {/* Mobile Budget Compass */}
        <div className="px-4">
          <BudgetCompass
            loading={loading}
            budget={budget}
            totalEstimated={totalEstimated}
            remaining={remaining}
            travel={travel}
            stay={stay}
            activities={activities}
            pctUsed={pctUsed}
            fmt={fmt}
            sym={sym}
          />
        </div>

        {/* Mobile Perks Card */}
        <div className="px-4">
          <TripPerksCard onDownloadPDF={handleDownloadPDF} pdfGenerating={pdfGenerating} />
        </div>
      </div>

      {/* ── MOBILE STICKY BOTTOM ── */}
      <div className="lg:hidden fixed bottom-[60px] left-0 right-0 z-40 px-4 pb-3 pt-4 bg-gradient-to-t from-[#FFFBF7] via-[#FFFBF7]/95 to-transparent">
        <button
          onClick={() => onTabChange('transport')}
          className="w-full h-[52px] bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white font-bold text-[15px] rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-colors"
        >
          See transport options <ArrowRight size={16} />
        </button>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E0D8] z-50 h-[60px] flex items-center"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {[
          { id: 'overview', label: 'Overview', Icon: Icon3DOverview },
          { id: 'transport', label: 'Transport', Icon: Icon3DTransport },
          { id: 'hotels', label: 'Stay', Icon: Icon3DStay },
          { id: 'itinerary', label: 'Plan', Icon: Icon3DItinerary },
        ].map(({ id, label, Icon }) => {
          const isActive = id === 'overview'
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full relative transition-colors"
              style={{ color: isActive ? '#EA580C' : '#9CA3AF' }}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-[#EA580C] rounded-b-full" />
              )}
              <Icon size={24} active={isActive} />
              <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Forecast Modal */}
      {showForecast && (
        <WeatherForecastModal
          weather={weather}
          destination={tripContext.destination || destination || ''}
          onClose={() => setShowForecast(false)}
        />
      )}

      {/* Weather AI Optimization Modal */}
      {showWeatherOpt && (
        <WeatherOptModal
          weather={weather}
          isOptimizing={isOptimizing}
          setIsOptimizing={setIsOptimizing}
          success={optSuccess}
          setSuccess={setOptSuccess}
          onClose={() => { setShowWeatherOpt(false); setOptSuccess(false); }}
          onApply={() => {
            setShowWeatherOpt(false)
            setOptSuccess(false)
            onTabChange('itinerary')
            toast.success("Itinerary adjusted for weather successfully!")
          }}
        />
      )}

      {/* Visa Guidance Modal */}
      {showVisaGuidance && (
        <VisaGuidanceModal
          isInternational={isInternational}
          visaConfig={visaConfig}
          destination={tripContext.destination || destination || ''}
          tripContext={tripContext}
          onClose={() => setShowVisaGuidance(false)}
          onOfficial={() => {
            if (visaConfig?.officialLink) {
              window.open(visaConfig.officialLink, '_blank')
            }
          }}
        />
      )}
    </div>
  )
}

export default memo(OverviewTab)
