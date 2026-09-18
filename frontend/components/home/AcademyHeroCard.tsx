'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GraduationCap, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import AcademyCard3D from '@/components/academy/AcademyCard3D'
import AcademyButton3D from '@/components/academy/AcademyButton3D'

export default function AcademyHeroCard() {
  return (
    <div className="w-full max-w-2xl mx-auto pt-2 pb-1 px-4 relative z-10">
      <AcademyCard3D
        depth={18}
        className="p-5 sm:p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#FED7AA]/80 shadow-[0_12px_32px_rgba(234,88,12,0.08)] relative overflow-hidden text-center sm:text-left"
      >
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-200/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-md">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#EA580C] text-[11px] font-extrabold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              TripSage Academy
            </div>

            {/* Title & Description */}
            <h3
              className="text-lg sm:text-xl font-extrabold text-[#1A1A1A] tracking-tight leading-snug"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Free AGI Course — Enrollment Now Open
            </h3>

            <p className="text-xs sm:text-[13px] text-[#4B5563] leading-relaxed">
              Learn what AGI really is, how AI systems reason, and where intelligent agents are
              heading.
            </p>

            {/* Small supporting text */}
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] font-semibold text-[#6B7280]">
              <span className="flex items-center gap-1 text-[#EA580C]">
                <Sparkles className="w-3 h-3" /> 5 Episodes
              </span>
              <span>·</span>
              <span>Free</span>
              <span>·</span>
              <span>Beginner Friendly</span>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="shrink-0 flex justify-center sm:justify-end">
            <Link href="/academy">
              <AcademyButton3D size="md" variant="primary">
                Enroll in Free AGI Course →
              </AcademyButton3D>
            </Link>
          </div>
        </div>
      </AcademyCard3D>
    </div>
  )
}
