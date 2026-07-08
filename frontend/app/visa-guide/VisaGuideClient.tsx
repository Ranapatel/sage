'use client'

import React from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { Globe, ArrowUpRight } from 'lucide-react'

interface VisaCard {
  flag: string
  name: string
  badgeText: string
  badgeType: 'green' | 'orange' | 'red'
  cost: string
  processing: string
  duration: string
  requirement: string
  applyUrl: string
}

const VISA_DATA: VisaCard[] = [
  {
    flag: '🇮🇩',
    name: 'Bali (Indonesia)',
    badgeText: 'Visa on Arrival / E-VOA',
    badgeType: 'green',
    cost: '₹2,700 (IDR 500,000)',
    processing: 'Instant (Arrival) or 24-48 hrs online',
    duration: '30 Days (Extendable once)',
    requirement: 'Passport valid 6 months, return ticket, custom declaration.',
    applyUrl: 'https://molina.imigrasi.go.id/'
  },
  {
    flag: '🇦🇪',
    name: 'Dubai (UAE)',
    badgeText: 'E-Visa Required',
    badgeType: 'orange',
    cost: '₹7,500 (approx. depending on agency)',
    processing: '3 to 5 Working Days',
    duration: '30 Days or 60 Days',
    requirement: 'Passport copy, passport photo, confirmed return flights.',
    applyUrl: 'https://www.gdrfad.gov.ae/'
  },
  {
    flag: '🇹🇭',
    name: 'Thailand',
    badgeText: 'Visa Free / Visa on Arrival',
    badgeType: 'green',
    cost: 'Free (VoA fee currently waived)',
    processing: 'Instant on Arrival',
    duration: '30 Days',
    requirement: 'Passport valid 6 months, return flight, proof of funds.',
    applyUrl: 'https://www.thaievisa.go.th/'
  },
  {
    flag: '🇸🇬',
    name: 'Singapore',
    badgeText: 'Visa Required (Paper/Agent)',
    badgeType: 'red',
    cost: '₹2,500 (approx. agent fee separate)',
    processing: '3 to 5 Working Days',
    duration: '30 Days',
    requirement: 'Visa application form, SG Arrival Card submitted within 3 days before entry.',
    applyUrl: 'https://eservices.ica.gov.sg/sgarrivalcard/'
  },
  {
    flag: '🇲🇻',
    name: 'Maldives',
    badgeText: 'Visa Free on Arrival',
    badgeType: 'green',
    cost: 'Free',
    processing: 'Instant on Arrival',
    duration: '30 Days',
    requirement: 'Passport valid 1 month, hotel voucher, IMUGA traveler declaration.',
    applyUrl: 'https://imuga.immigration.gov.mv/'
  },
  {
    flag: '🇻🇳',
    name: 'Vietnam',
    badgeText: 'E-Visa Required',
    badgeType: 'orange',
    cost: '₹2,100 (USD 25)',
    processing: '3 Working Days',
    duration: '30 Days (Single entry)',
    requirement: 'Passport copy, digital photo, temporary address in Vietnam.',
    applyUrl: 'https://evisa.xuatnhapcanh.gov.vn/'
  }
]

export default function VisaGuideClient() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F5] text-[#71717A] font-body">
      <Navbar />

      {/* Hero section */}
      <section className="bg-white border-b border-[#E4E4E7] pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-left">
          <h1 
            className="text-[40px] font-bold text-[#09090B] leading-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Visa Guide for Indian Travelers
          </h1>
          <p className="text-[#6B7280] text-base mt-2 font-normal">
            Everything you need to know about visas for your international trip
          </p>
        </div>
      </section>

      {/* Main Grid Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VISA_DATA.map((visa, idx) => {
            let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200'
            if (visa.badgeType === 'orange') {
              badgeBg = 'bg-amber-50 text-amber-700 border-amber-200'
            } else if (visa.badgeType === 'red') {
              badgeBg = 'bg-rose-50 text-rose-700 border-rose-200'
            }

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white border border-[#E4E4E7] rounded-xl p-6 shadow-sm hover:shadow-md hover:border-[#D4D4D8] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl select-none" role="img" aria-label={visa.name}>
                      {visa.flag}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${badgeBg}`}>
                      {visa.badgeText}
                    </span>
                  </div>

                  {/* Destination Name */}
                  <h2 
                    className="text-xl font-bold text-[#09090B] mb-4"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    {visa.name}
                  </h2>

                  {/* Visa details list */}
                  <div className="space-y-2.5 text-xs text-[#71717A] border-t border-[#F4F4F5] pt-4 mb-6">
                    <div className="flex justify-between">
                      <span className="font-medium text-[#A1A1AA]">Visa Cost</span>
                      <span className="font-mono text-[#09090B] font-semibold">{visa.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-[#A1A1AA]">Processing Time</span>
                      <span className="text-[#09090B] font-semibold">{visa.processing}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-[#A1A1AA]">Stay Duration</span>
                      <span className="text-[#09090B] font-semibold">{visa.duration}</span>
                    </div>
                    <div className="pt-2 text-[11px] leading-relaxed italic border-t border-dashed border-[#F4F4F5]">
                      <strong className="text-[#09090B] not-italic font-semibold">Requirements:</strong> {visa.requirement}
                    </div>
                  </div>
                </div>

                {/* Apply Now Button */}
                <a
                  href={visa.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white hover:bg-[#F4F4F5] border border-[#E4E4E7] hover:border-[#D4D4D8] text-[#09090B] font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150"
                >
                  Apply Now <ArrowUpRight size={14} strokeWidth={1.5} className="text-[#57534E]" />
                </a>
              </motion.div>
            )
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}
