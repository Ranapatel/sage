'use client'

import { X } from 'lucide-react'

// ─── Sub-components ──────────────────────────────────────────────────────────

interface BrowserWindowProps {
  tabs: string[]
  activeTab: number
  rotate: string
  offsetY: string
  zIndex: string
  body: React.ReactNode
}

function BrowserWindow({ tabs, activeTab, rotate, offsetY, zIndex, body }: BrowserWindowProps) {
  return (
    <div
      className={`absolute w-[300px] rounded-xl border border-[#E2E8F0] bg-white shadow-xl ${rotate} ${offsetY} ${zIndex}`}
    >
      {/* Traffic lights */}
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
      </div>

      {/* Tab bar */}
      <div className="flex items-end gap-px px-2 overflow-hidden">
        {tabs.map((tab, i) => (
          <div
            key={i}
            className={`shrink-0 max-w-[100px] truncate px-3 py-1.5 rounded-t-md text-[10px] border-t border-x ${
              i === activeTab
                ? 'bg-white border-[#E2E8F0] text-[#1E293B] font-semibold'
                : 'bg-[#F1F5F9] border-transparent text-[#94A3B8] font-medium'
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Address bar */}
      <div className="mx-3 my-2 flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
        <span className="text-[9px] text-[#94A3B8] truncate font-mono">
          {`google.com/search?q=${encodeURIComponent(tabs[activeTab] ?? '').replace(/%20/g, '+')}`}
        </span>
      </div>

      {/* Body content */}
      <div className="px-3 pb-3 pt-1">{body}</div>
    </div>
  )
}

/** Skeleton search-result rows */
function SkeletonResults() {
  const widths = ['75%', '60%', '85%']
  return (
    <div className="space-y-3">
      {widths.map((w, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-2.5 rounded bg-blue-300/40" style={{ width: w }} />
          <div className="h-2 rounded bg-[#E2E8F0]" style={{ width: '90%' }} />
          <div className="h-2 rounded bg-[#E2E8F0]" style={{ width: '55%' }} />
        </div>
      ))}
      <p className="text-[9px] text-[#94A3B8] pt-1">About 4,18,000 results (0.54 seconds)</p>
    </div>
  )
}

/** Fake currency-converter UI */
function CurrencyConverter() {
  return (
    <div className="bg-[#F8FAFC] rounded-lg p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] text-[#94A3B8] uppercase tracking-wide mb-0.5">Indian Rupee</p>
          <p className="text-xl font-bold text-[#1E293B]">45,000</p>
        </div>
        <span className="text-[#94A3B8] text-base select-none">⇌</span>
        <div className="text-right">
          <p className="text-[9px] text-[#94A3B8] uppercase tracking-wide mb-0.5">US Dollar</p>
          <p className="text-xl font-bold text-[#1E293B]">537.82</p>
        </div>
      </div>
      <div className="border-t border-[#E2E8F0] pt-2 text-[9px] text-[#94A3B8] text-center">
        1 USD = 83.67 INR · updated 2 min ago
      </div>
      <div className="text-[9px] text-[#94A3B8] text-center">
        + 3 more conversions open in other tabs…
      </div>
    </div>
  )
}

/** Fake hotel-price comparison rows */
function HotelPrices() {
  const rows = [
    { label: 'Site A', price: '₹12,400', note: '+ taxes' },
    { label: 'Site B', price: '₹11,950', note: 'non-refund' },
    { label: 'Site C', price: '₹13,200', note: '+ fees' },
  ]
  return (
    <div className="space-y-1.5">
      {rows.map(({ label, price, note }) => (
        <div key={label} className="flex items-center justify-between bg-[#F8FAFC] rounded px-2.5 py-2">
          <span className="text-[10px] text-[#64748B]">{label}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#1E293B]">{price}</span>
            <span className="text-[9px] text-red-400">{note}</span>
          </div>
        </div>
      ))}
      <p className="text-[9px] text-[#94A3B8] text-center pt-0.5">+ 8 more sites not compared</p>
    </div>
  )
}

/** A single pain-point list item */
function PainPoint({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
        <X size={10} strokeWidth={3} className="text-red-500" />
      </span>
      <span
        className="text-base text-[#1E293B] leading-snug"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {text}
      </span>
    </li>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ProblemSection() {
  return (
    <section className="bg-[#F8FAFC] py-20 md:py-32" id="problem">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* ── Left: copy ── */}
        <div>
          <p
            className="font-medium text-xs tracking-wider text-[#64748B] uppercase"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            The Old Way
          </p>

          <h2
            className="font-bold text-[#1E293B] text-3xl md:text-4xl leading-tight mt-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Planning a trip used to feel like a second job.
          </h2>

          <p
            className="text-lg text-[#64748B] leading-relaxed mt-6 max-w-md"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Indian travelers open 47 browser tabs, compare prices across 6 sites, and still
            miss hidden gems. You get flights and hotels — but not &ldquo;what to do on Day 3
            in Hanoi when it rains.&rdquo;
          </p>

          <ul className="mt-8 space-y-4">
            <PainPoint text="Budget in ₹? Convert, calculate, cry." />
            <PainPoint text="Visa requirements? Buried in government PDFs." />
            <PainPoint text="Hidden costs? Find out after you land." />
          </ul>
        </div>

        {/* ── Right: chaos visual ── */}
        <div
          className="relative h-[400px] md:h-[460px] flex items-center justify-center select-none"
          aria-hidden="true"
        >
          {/* Soft ambient glow */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 75% 55% at 55% 52%, rgba(203,213,225,0.5) 0%, transparent 75%)',
            }}
          />

          {/* Window 1 — back-left: hotel prices */}
          <BrowserWindow
            tabs={['Bali hotels', 'Flights BOM', 'Reviews']}
            activeTab={0}
            rotate="-rotate-[7deg]"
            offsetY="-translate-y-8"
            zIndex="z-10"
            body={<HotelPrices />}
          />

          {/* Window 2 — centre: currency converter */}
          <BrowserWindow
            tabs={['₹ to USD', 'EUR rates']}
            activeTab={0}
            rotate="rotate-[2deg]"
            offsetY="translate-y-3"
            zIndex="z-20"
            body={<CurrencyConverter />}
          />

          {/* Window 3 — front-right: activity search */}
          <BrowserWindow
            tabs={['things to do ubud', 'visa Indonesia', 'Maps']}
            activeTab={0}
            rotate="rotate-[9deg]"
            offsetY="translate-y-12"
            zIndex="z-30"
            body={<SkeletonResults />}
          />

          {/* Floating sticky note — tab overload */}
          <div className="absolute top-4 right-4 md:-right-2 z-40 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 shadow-md rotate-[3deg] max-w-[128px]">
            <p
              className="text-[11px] text-yellow-800 font-semibold leading-snug"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Tab 47 of 47 😩
            </p>
            <p
              className="text-[10px] text-yellow-600 mt-0.5 leading-snug"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              still no Day 3 plan
            </p>
          </div>

          {/* Floating error toast — PDF fail */}
          <div className="absolute bottom-6 left-2 md:-left-2 z-40 bg-white border border-red-200 rounded-lg px-3 py-2 shadow-md -rotate-[2deg] max-w-[162px]">
            <p
              className="text-[11px] text-red-600 font-semibold leading-snug"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              ⚠ PDF failed to load
            </p>
            <p
              className="text-[10px] text-[#94A3B8] mt-0.5 leading-snug"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              indianvisaonline.gov.in
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
