'use client'

import { Sparkles, Search } from 'lucide-react'

// ─── Pure SVG / CSS background — no external images ───────────────────────
//
// The texture is built from two layers:
//   1. An SVG of longitude / latitude arcs that suggest a globe grid
//   2. Radial-gradient "node" blobs at major intersection points
//
// Both are opacity-[0.04] – [0.07] so they read as barely-there atmosphere.
// ────────────────────────────────────────────────────────────────────────────

const GlobeGrid = () => (
  <svg
    viewBox="0 0 1440 900"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute inset-0 w-full h-full"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    {/* ── Latitude arcs (horizontal ellipses) ── */}
    {[180, 270, 360, 450, 540, 630, 720].map((cy, i) => (
      <ellipse
        key={`lat-${i}`}
        cx={720}
        cy={cy}
        rx={680 - i * 30}
        ry={20 + i * 4}
        fill="none"
        stroke="white"
        strokeWidth="0.6"
        opacity={0.35}
      />
    ))}

    {/* ── Longitude arcs (vertical ellipses) ── */}
    {[200, 310, 420, 530, 640, 750, 860, 970, 1080, 1190, 1300].map((cx, i) => (
      <ellipse
        key={`lng-${i}`}
        cx={cx}
        cy={450}
        rx={12}
        ry={390}
        fill="none"
        stroke="white"
        strokeWidth="0.6"
        opacity={0.3}
      />
    ))}

    {/* ── Great-circle style diagonal arcs ── */}
    <path
      d="M 0 600 Q 360 100 720 450 Q 1080 800 1440 300"
      fill="none" stroke="white" strokeWidth="0.8" opacity="0.18"
    />
    <path
      d="M 0 200 Q 480 600 960 250 Q 1200 50 1440 500"
      fill="none" stroke="white" strokeWidth="0.8" opacity="0.15"
    />
    <path
      d="M 200 0 Q 600 400 1000 150 Q 1300 -50 1440 400"
      fill="none" stroke="white" strokeWidth="0.6" opacity="0.12"
    />

    {/* ── Intersection node dots (major cities abstracted) ── */}
    {[
      [720, 300], [480, 420], [960, 380], [300, 520],
      [1100, 250], [620, 560], [820, 180], [380, 300],
      [1050, 480], [550, 200],
    ].map(([cx, cy], i) => (
      <circle
        key={`node-${i}`}
        cx={cx}
        cy={cy}
        r={i % 3 === 0 ? 2.5 : 1.5}
        fill="white"
        opacity={i % 3 === 0 ? 0.5 : 0.3}
      />
    ))}

    {/* ── Connection lines between select nodes ── */}
    <line x1="720" y1="300" x2="480" y2="420" stroke="white" strokeWidth="0.5" opacity="0.2" />
    <line x1="720" y1="300" x2="960" y2="380" stroke="white" strokeWidth="0.5" opacity="0.2" />
    <line x1="480" y1="420" x2="300" y2="520" stroke="white" strokeWidth="0.5" opacity="0.15" />
    <line x1="960" y1="380" x2="1100" y2="250" stroke="white" strokeWidth="0.5" opacity="0.15" />
    <line x1="620" y1="560" x2="820" y2="180" stroke="white" strokeWidth="0.5" opacity="0.12" />
    <line x1="380" y1="300" x2="550" y2="200" stroke="white" strokeWidth="0.5" opacity="0.12" />
    <line x1="1050" y1="480" x2="1100" y2="250" stroke="white" strokeWidth="0.5" opacity="0.15" />
  </svg>
)

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0F172A]"
    >
      {/* ── Layer 1: Globe grid texture — opacity ~5% ── */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none select-none">
        <GlobeGrid />
      </div>

      {/* ── Layer 2: Radial glow nodes — suggests light sources on globe ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 600px 400px at 68% 38%, rgba(242,101,34,0.06) 0%, transparent 70%)',
            'radial-gradient(ellipse 500px 350px at 28% 62%, rgba(99,102,241,0.05) 0%, transparent 70%)',
            'radial-gradient(ellipse 400px 300px at 80% 70%, rgba(14,165,233,0.04) 0%, transparent 70%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      {/* ── Layer 3: Vignette — bottom fade back into navy ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, #0F172A 0%, transparent 35%, transparent 65%, #0F172A 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Layer 4: Side-edge darkening ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, #0F172A 0%, transparent 20%, transparent 80%, #0F172A 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">

        {/* Top badge */}
        <div className="flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 bg-white/5 backdrop-blur-sm">
          {/* Pulsing green live indicator */}
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
          <span
            className="font-medium text-xs tracking-wider text-white/80 uppercase"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Sage Intelligence&nbsp;•&nbsp;Active
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-bold text-white text-4xl md:text-6xl leading-tight max-w-3xl text-center mx-auto mt-8"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Plan Your Entire Trip in{' '}
          <span className="text-[#F26522]">30 Seconds</span>
          {' '}— Not 30 Tabs.
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg md:text-xl text-[#94A3B8] max-w-2xl text-center leading-relaxed mt-6 mx-auto"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          TripSage reads 10,000+ travel blogs, reviews, and real-time prices to build your
          personalized itinerary with exact costs in ₹, visa requirements, and booking links.
        </p>

        {/* Visa assured badge */}
        <div
          className="flex items-center gap-2 border border-[#F26522]/30 bg-[#F26522]/10 rounded-full px-4 py-2 text-[#F26522] text-sm font-medium mx-auto mt-6 w-fit"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <Sparkles size={14} strokeWidth={2} className="text-[#F26522] shrink-0" />
          Indian Visa Assured
        </div>

        {/* Microcopy */}
        <p
          className="text-white/40 text-xs text-center mt-8"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          No signup required&nbsp;•&nbsp;Free during beta
        </p>

        {/* ── Search bar ── */}
        <div className="w-full max-w-2xl mx-auto mt-10 bg-white rounded-full shadow-lg shadow-[#F26522]/10 px-6 py-4 flex flex-col md:flex-row md:items-center gap-3">

          {/* Icon + input row */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Search
              className="text-[#64748B] shrink-0"
              style={{ width: '20px', height: '20px' }}
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="e.g. Mumbai → Dubai, 4 nights, ₹45,000"
              className="flex-1 w-full min-w-0 bg-transparent outline-none text-base text-[#1E293B] placeholder:text-[#64748B]/50 min-h-[44px]"
              style={{ fontFamily: "'Inter', sans-serif" }}
              aria-label="Trip search"
            />
          </div>

          {/* CTA button — stacks below on mobile, inline on md+ */}
          <button
            onClick={() => console.log('Plan trip triggered')}
            className="w-full md:w-auto md:ml-3 shrink-0 bg-[#F26522] hover:bg-[#E55A1A] transition-colors duration-200 text-white rounded-full px-8 py-3 font-semibold text-sm shadow-md min-h-[44px]"
            style={{ fontFamily: "'Inter', sans-serif" }}
            type="button"
          >
            Plan with AI
          </button>

        </div>

      </div>
    </section>
  )
}
