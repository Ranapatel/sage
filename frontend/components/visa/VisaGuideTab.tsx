'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, ExternalLink, Check, FileText, Globe, Clock, ShieldCheck, Heart } from 'lucide-react'

interface VisaDetails {
  country: string
  visaType: string
  fee: string
  processingTime: string
  officialLink: string
  requirements: string[]
  essentialChecklist: string[]
  tips: string[]
}

const VISA_DATA: Record<string, VisaDetails> = {
  indonesia: {
    country: 'Indonesia (Bali)',
    visaType: 'Electronic Visa on Arrival (e-VOA) - B213',
    fee: 'IDR 500,000 (~₹2,750 INR)',
    processingTime: 'Instant to 24 hours online',
    officialLink: 'https://evisa.imigrasi.go.id/',
    requirements: [
      'Passport page copy (valid for at least 6 months from entry date)',
      'Passport-size photo (white background)',
      'Confirmed return flight ticket out of Indonesia',
      'Proof of accommodation (hotel booking confirmation)',
    ],
    essentialChecklist: [
      'Paid Bali Tourist Levy - IDR 150,000 (~₹800 INR) paid online before arrival',
      'Electronic Customs Declaration (ECD) QR Code - Fill online within 3 days before flight',
      'Passport with at least 2 blank pages',
    ],
    tips: [
      'You can apply up to 14 days before your trip on the official portal. Do NOT use unofficial sites charging extra agency fees.',
      'Keep a printout of your e-VOA and the customs QR code on your phone for speedy immigration clearance.',
    ],
  },
  uae: {
    country: 'United Arab Emirates (Dubai)',
    visaType: '30-Day Tourist Visa (Single Entry)',
    fee: 'AED 350 - 400 (~₹7,500 - ₹9,000 INR depending on processing channel)',
    processingTime: '3 to 5 working days',
    officialLink: 'https://smartservices.icp.gov.ae/',
    requirements: [
      'Color copy of Passport first & last page (valid for 6 months)',
      'Passport size photograph (white background)',
      'Confirmed return flight ticket with matching dates',
      'Hotel reservation proof or host details',
    ],
    essentialChecklist: [
      'Travel insurance covering UAE medical expenses',
      'Printed copy of your eVisa upon departure from India',
      'Minors traveling must have birth certificate copy in English',
    ],
    tips: [
      'If you hold a US Visa/Green Card or UK/EU Residence permit, you qualify for Visa-on-Arrival at Dubai Airport.',
      'Check if your airline (e.g. Emirates, flydubai, IndiGo) offers visa application services directly in their booking panel.',
    ],
  },
  thailand: {
    country: 'Thailand',
    visaType: 'Visa Exemption (Visa-Free Entry)',
    fee: '₹0 INR (Free under current bilateral exemptions)',
    processingTime: 'Granted instantly at border control',
    officialLink: 'https://www.immigration.go.th/',
    requirements: [
      'Passport valid for at least 6 months from arrival date',
      'Confirmed return flight ticket showing departure within 30 days',
      'Hotel booking confirmation matching travel dates',
      'Sufficient funds: Min. 10,000 THB (~₹23,000 INR) per person or 20,000 THB per family (cash or equivalent, checked occasionally)',
    ],
    essentialChecklist: [
      'Completed arrival card (if distributed in-flight)',
      'Passport must have at least 2 blank pages',
      'Digital or print copy of hotel vouchers',
    ],
    tips: [
      'Visa-free entry is valid for up to 30 days. You can extend it once for an additional 30 days at any local immigration office for 1,900 THB.',
      'Carry some Cash in THB or USD to satisfy the funds checks at immigration if requested.',
    ],
  },
  vietnam: {
    country: 'Vietnam',
    visaType: 'Electronic Visa (eVisa)',
    fee: '$25 USD (~₹2,100 INR)',
    processingTime: '3 to 4 working days',
    officialLink: 'https://evisa.xuatnhapcanh.gov.vn/',
    requirements: [
      'Passport data page photo (valid for 6 months)',
      'Digital portrait photo without glasses, straight face',
      'Detailed list of entry and exit checkpoints (ports of entry)',
      'Hotel address in Vietnam for the first night',
    ],
    essentialChecklist: [
      'Printed copy of eVisa PDF (immigration retains a copy)',
      'Passport validity exceeding 6 months',
      'Return flights matching eVisa valid dates',
    ],
    tips: [
      'Apply strictly via the government portal (link above). Watch out for lookalike travel agency sites charging $60-$80 for the same service.',
      'Double check your spelling and passport number. Vietnam border control is extremely strict; a minor typo requires a new visa application.',
    ],
  },
  maldives: {
    country: 'Maldives',
    visaType: 'Free Tourist Visa on Arrival',
    fee: '₹0 INR (Free for all arrivals)',
    processingTime: 'Granted on arrival',
    officialLink: 'https://imuga.immigration.gov.mv/',
    requirements: [
      'Passport valid for at least 1 month (6 months recommended)',
      'Confirmed return flight ticket',
      'Pre-booked hotel or resort voucher confirmation',
    ],
    essentialChecklist: [
      'IMUGA Traveler Declaration Form - Must be completed online within 96 hours before arrival and departure',
      'QR Code generated from IMUGA on your phone',
      'Yellow Fever Vaccination Certificate (only if traveling from endemic zones)',
    ],
    tips: [
      'Maldives is visa-on-arrival for all travelers. The IMUGA form is absolutely mandatory—ensure you fill it out online before boarding your flight from India to avoid boarding refusal.',
    ],
  },
  singapore: {
    country: 'Singapore',
    visaType: 'Tourist eVisa (Applied via Authorized Agent/Local Contact)',
    fee: 'SGD 30 (~₹1,850 INR) + agent processing service fees',
    processingTime: '3 to 5 working days',
    officialLink: 'https://eservices.ica.gov.sg/sgarrivalcard/',
    requirements: [
      'Color scan of passport bio-data page (valid for 6 months)',
      'Passport size photograph (matte finish, white background, taken within 3 months)',
      'Confirmed return flight tickets',
      'Hotel accommodation booking confirmation',
    ],
    essentialChecklist: [
      'SG Arrival Card (SGAC) with Electronic Health Declaration - Submit online for free within 3 days before arrival',
      'Valid eVisa approval printout',
      'VACCINATIONS: Routine updates',
    ],
    tips: [
      'Singapore eVisas cannot be submitted by individual tourists directly. You must submit via authorized agents (like MakeMyTrip, Thomas Cook, or specialized visa providers).',
      'Make sure you submit the SG Arrival Card online before landing—it is completely free and mandatory.',
    ],
  },
}

interface Props {
  destination?: string
}

export default function VisaGuideTab({ destination = '' }: Props) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  // Resolve matching key
  const destLower = destination.toLowerCase()
  let matchedKey = ''
  if (destLower.includes('bali') || destLower.includes('indonesia')) matchedKey = 'indonesia'
  else if (destLower.includes('dubai') || destLower.includes('emirates') || destLower.includes('uae')) matchedKey = 'uae'
  else if (destLower.includes('thai') || destLower.includes('bangkok') || destLower.includes('phuket')) matchedKey = 'thailand'
  else if (destLower.includes('viet') || destLower.includes('hanoi') || destLower.includes('vietnam')) matchedKey = 'vietnam'
  else if (destLower.includes('maldives') || destLower.includes('male')) matchedKey = 'maldives'
  else if (destLower.includes('singapore')) matchedKey = 'singapore'

  // Clear checklist when destination changes
  useEffect(() => {
    setCheckedItems({})
  }, [destination])

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (!matchedKey) {
    return (
      <div className="glass p-8 rounded-2xl max-w-4xl mx-auto text-center border-dashed border-2 border-[var(--border)]">
        <Globe size={48} strokeWidth={1.5} className="text-[#57534E] mx-auto mb-4 animate-spin-slow" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Visa Compliance Hub</h3>
        <p className="text-[var(--text-muted)] text-sm mb-6 max-w-lg mx-auto">
          We support automated visa guidelines for Indonesia (Bali), UAE (Dubai), Thailand, Vietnam, Maldives, and Singapore.
        </p>
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs max-w-md mx-auto flex items-start gap-3 text-left">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>Please verify your specific passport jurisdiction details online if traveling outside our primary V2 launch corridors.</span>
        </div>
      </div>
    )
  }

  const guide = VISA_DATA[matchedKey]

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in text-slate-800">
      {/* Header Summary */}
      <div className="glass p-6 rounded-2xl border border-[var(--border)] bg-gradient-to-r from-orange-500/5 to-indigo-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-orange-500 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <ShieldCheck size={14} /> Visa & Compliance Guide
          </span>
          <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">{guide.country} Outbound</h2>
          <p className="text-[var(--text-secondary)] text-xs mt-1">Specialized immigration preparation for Indian passport holders.</p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <a
            href={guide.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="home-btn-cta py-2.5 px-5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0"
          >
            <Globe size={14} /> Official Application Portal <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Quick Stats & Basic Documents */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center gap-2">
              <FileText size={16} className="text-orange-500" /> Visa Summary
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[var(--text-muted)] block mb-0.5 uppercase tracking-widest text-[9px] font-bold">Visa Type</span>
                <span className="font-semibold text-[var(--text-primary)]">{guide.visaType}</span>
              </div>
              
              <div>
                <span className="text-[var(--text-muted)] block mb-0.5 uppercase tracking-widest text-[9px] font-bold">Standard Fee</span>
                <span className="font-semibold text-orange-500">{guide.fee}</span>
              </div>

              <div>
                <span className="text-[var(--text-muted)] block mb-0.5 uppercase tracking-widest text-[9px] font-bold">Processing Speed</span>
                <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1">
                  <Clock size={12} className="text-orange-500" /> {guide.processingTime}
                </span>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl">
            <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-orange-500" /> Smart Travel Tips
            </h3>
            <ul className="space-y-3 text-xs text-[var(--text-secondary)] list-disc pl-4 leading-relaxed">
              {guide.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Columns: Requirements and Checklists */}
        <div className="md:col-span-2 space-y-6">
          {/* Main Requirements */}
          <div className="glass p-6 rounded-2xl">
            <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-orange-500" /> Mandatory Application Documents
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guide.requirements.map((req, i) => (
                <div key={i} className="p-3.5 bg-slate-500/5 rounded-xl border border-[var(--border)] flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5 text-orange-500 font-bold text-xs">
                    {i + 1}
                  </div>
                  <span className="text-xs text-[var(--text-primary)] leading-normal">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Compliance Checklist */}
          <div className="glass p-6 rounded-2xl">
            <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center gap-2 mb-3">
              <Check size={16} className="text-orange-500" /> Departure & Arrival Checklist
            </h3>
            <p className="text-[var(--text-muted)] text-[11px] mb-4">Verify and check off these mandatory items before boarding your flight from India:</p>

            <div className="space-y-3">
              {guide.essentialChecklist.map((item, i) => {
                const id = `chk_${matchedKey}_${i}`
                const checked = !!checkedItems[id]
                return (
                  <div 
                    key={i} 
                    onClick={() => toggleCheck(id)}
                    className={`p-3.5 sm:p-4 min-h-[44px] rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 active:scale-[0.99] ${
                      checked 
                        ? 'bg-green-500/5 border-green-500/30 shadow-sm' 
                        : 'bg-white/50 border-[var(--border)] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 min-w-[24px] min-h-[24px] rounded-lg border flex items-center justify-center transition-all ${
                        checked ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 bg-white shadow-2xs'
                      }`}>
                        {checked && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span className={`text-xs text-left leading-normal ${checked ? 'line-through text-[var(--text-muted)] font-medium' : 'text-[var(--text-primary)] font-semibold'}`}>
                        {item}
                      </span>
                    </div>
                    {checked && (
                      <span className="text-[10px] text-green-500 font-bold tracking-wider uppercase bg-green-500/10 px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
