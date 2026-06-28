'use client'

import React, { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import VisaGuideTab from '@/components/visa/VisaGuideTab'
import { motion } from 'framer-motion'
import { ShieldCheck, HelpCircle, Palmtree, Building2, Landmark, Utensils, Compass, Sparkles } from 'lucide-react'

const DESTINATIONS = [
  { id: 'indonesia', name: 'Bali (Indonesia)', icon: Palmtree },
  { id: 'uae', name: 'Dubai (UAE)', icon: Building2 },
  { id: 'thailand', name: 'Thailand', icon: Landmark },
  { id: 'vietnam', name: 'Vietnam', icon: Utensils },
  { id: 'maldives', name: 'Maldives', icon: Compass },
  { id: 'singapore', name: 'Singapore', icon: Sparkles },
]

export default function VisaGuideClient() {
  const [selectedCountry, setSelectedCountry] = useState('indonesia')

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1E] text-slate-100 font-sans">
      <Navbar />

      {/* Hero section */}
      <div 
        className="w-full relative overflow-hidden pt-28 pb-12"
        style={{
          background: 'radial-gradient(circle 600px at 0% 100%, rgba(234, 88, 12, 0.08), transparent), radial-gradient(circle 800px at 100% 0%, rgba(99, 102, 241, 0.05), transparent), #0A0F1E',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
            <ShieldCheck size={14} /> Indian Passport Assist
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight mb-4 text-white">
            Visa Compliance Center
          </h1>
          <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
            Verify mandatory entry permits, offline & eVisas, fees, and arrival checklist declarations for Indian citizens traveling to our 6 V2 launch destinations.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow max-w-6xl mx-auto px-6 pb-24 w-full">
        {/* Horizontal Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 p-1.5 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 max-w-4xl mx-auto">
          {DESTINATIONS.map(dest => (
            <button
              key={dest.id}
              onClick={() => setSelectedCountry(dest.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
                selectedCountry === dest.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <dest.icon size={16} />
              <span>{dest.name}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Guide Wrapper */}
        <motion.div
          key={selectedCountry}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 md:p-8 backdrop-blur-md"
        >
          <VisaGuideTab destination={selectedCountry} />
        </motion.div>
        
        {/* Support Section */}
        <div className="mt-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 text-orange-400">
              <HelpCircle size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Have specific visa questions?</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Connect with our AI support agent or visit our support dashboard for personalized outbound guidance.
              </p>
            </div>
          </div>
          <a
            href="/support"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white rounded-xl text-xs font-bold transition-all shrink-0"
          >
            Go to Support
          </a>
        </div>
      </div>

      <Footer />
    </div>
  )
}
