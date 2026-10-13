'use client'

import React, { useState } from 'react'
import { ChevronDown, Sparkles, ShieldCheck, CheckCircle2, HeartHandshake, Compass } from 'lucide-react'
import { DUSSEHRA_FAQS } from '@/lib/dussehraConfig'

export default function DussehraFAQTrust() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: FAQ Accordion (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#EA580C] text-[11px] font-bold tracking-wider uppercase mb-3">
              <Sparkles size={12} className="text-[#EA580C]" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-[#1A1A1A] tracking-tight leading-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {DUSSEHRA_FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#E8E0D8] overflow-hidden transition-all duration-200 shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFAQ(idx)}
                    aria-expanded={isOpen}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-[#1A1A1A] hover:text-[#EA580C] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`text-[#6B6B6B] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#EA580C]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-[#6B6B6B] leading-relaxed border-t border-[#E8E0D8]/40 animate-fade-in">
                      <p className="pt-3">{faq.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Trusted by Travelers Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-white to-[#FDFBF7] rounded-3xl border border-[#E8E0D8] p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-black font-display text-[#1A1A1A]">
              Trusted by travelers
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
              Real people. Real trips. Real stories.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white border border-[#E8E0D8]/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EA580C] shrink-0">
                <Compass size={20} strokeWidth={2} />
              </div>
              <div className="space-y-0.5 text-left">
                <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">Personalized itineraries</p>
                <p className="text-[11px] sm:text-xs text-[#6B6B6B]">Tailored to your specific dates, group and budget</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white border border-[#E8E0D8]/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EA580C] shrink-0">
                <CheckCircle2 size={20} strokeWidth={2} />
              </div>
              <div className="space-y-0.5 text-left">
                <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">Verified information</p>
                <p className="text-[11px] sm:text-xs text-[#6B6B6B]">Live connection data from trusted airline and stay partners</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white border border-[#E8E0D8]/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EA580C] shrink-0">
                <ShieldCheck size={20} strokeWidth={2} />
              </div>
              <div className="space-y-0.5 text-left">
                <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">Secure & private</p>
                <p className="text-[11px] sm:text-xs text-[#6B6B6B]">Your travel data stays with you. We never sell your personal information</p>
              </div>
            </div>
          </div>

          {/* Travel More Worry Less Graphic Badge */}
          <div className="bg-[#FFF5ED] rounded-2xl border border-[#FED7AA] p-5 text-center relative overflow-hidden">
            <div className="relative z-10 space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-[#EA580C]">
                TripSage AI Travel OS
              </span>
              <p className="font-display font-black text-xl text-[#1A1A1A] tracking-tight">
                Travel More · Worry Less
              </p>
              <p className="text-[11px] text-[#6B6B6B]">
                Smart planning, transparent pricing, zero clutter.
              </p>
            </div>
            {/* Subtle decorative mountains background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none flex items-end justify-center">
              <svg viewBox="0 0 200 60" className="w-full text-[#EA580C] fill-current">
                <polygon points="0,60 40,20 80,60 120,10 160,50 200,30 200,60" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
