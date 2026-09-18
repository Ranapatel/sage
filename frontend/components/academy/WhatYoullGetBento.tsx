'use client'

import React from 'react'
import { Video, Calendar, Code2, FileText, BarChart3, Award, Sparkles } from 'lucide-react'
import AcademyCard3D from './AcademyCard3D'

const PERKS = [
  {
    icon: Video,
    title: '5 Structured Episodes',
    desc: 'Bite-sized, high-density video lessons breaking down neural architectures, reasoning, and agents.',
    tag: '4K HD · ~45 min total',
    span: 'col-span-1 md:col-span-2',
    accent: 'from-orange-500/10 to-amber-500/10',
    iconColor: 'text-[#EA580C]',
  },
  {
    icon: Calendar,
    title: 'Drip Release Schedule',
    desc: 'Episodes unlock every 3–4 days to ensure deep conceptual retention without cognitive overload.',
    tag: 'Sep 21 – Oct 5',
    span: 'col-span-1',
    accent: 'from-blue-500/10 to-indigo-500/10',
    iconColor: 'text-blue-600',
  },
  {
    icon: Code2,
    title: 'Practical Examples',
    desc: 'Real-world case studies of autonomous agents executing tools, planning, and multi-step reasoning.',
    tag: 'Real Systems',
    span: 'col-span-1',
    accent: 'from-emerald-500/10 to-teal-500/10',
    iconColor: 'text-emerald-600',
  },
  {
    icon: FileText,
    title: 'Course Resources & Notes',
    desc: 'Downloadable architecture diagrams, cognitive frameworks, and executive summaries for every lesson.',
    tag: 'PDF Guides',
    span: 'col-span-1 md:col-span-2',
    accent: 'from-amber-500/10 to-orange-500/10',
    iconColor: 'text-amber-600',
  },
  {
    icon: BarChart3,
    title: 'Interactive Progress Tracking',
    desc: 'Visual 0 to 5 episode completion meter saved securely in MongoDB Atlas across all your devices.',
    tag: 'Cloud Sync',
    span: 'col-span-1',
    accent: 'from-purple-500/10 to-pink-500/10',
    iconColor: 'text-purple-600',
  },
  {
    icon: Award,
    title: 'Official Certificate',
    desc: 'Receive a personalized, verifiable TripSage Academy Foundations of AGI completion credential.',
    tag: 'Upon Completion',
    span: 'col-span-1 md:col-span-2',
    accent: 'from-orange-500/15 via-amber-500/10 to-transparent',
    iconColor: 'text-[#EA580C]',
    highlight: true,
  },
]

export default function WhatYoullGetBento() {
  return (
    <div className="w-full space-y-6 pt-12">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#EA580C] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Curriculum & Benefits
        </div>
        <h2
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1A1A1A] tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          What You’ll Get
        </h2>
        <p className="text-[#6B7280] text-sm">
          Everything you need to master modern AI and understand where general intelligence is heading.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {PERKS.map((perk, i) => {
          const Icon = perk.icon
          return (
            <AcademyCard3D
              key={i}
              depth={16}
              className={`p-6 rounded-2xl bg-white/80 backdrop-blur-xl border border-[#E8E0D8] shadow-sm hover:shadow-md transition-all ${
                perk.span
              } ${perk.highlight ? 'border-orange-300 ring-1 ring-orange-200' : ''}`}
            >
              <div className="flex flex-col h-full justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${perk.accent} flex items-center justify-center ${perk.iconColor} border border-black/5`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                    {perk.tag}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-[#1A1A1A] tracking-tight">
                    {perk.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                    {perk.desc}
                  </p>
                </div>
              </div>
            </AcademyCard3D>
          )
        })}
      </div>
    </div>
  )
}
