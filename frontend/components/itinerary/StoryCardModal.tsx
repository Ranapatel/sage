'use client'

import React, { useState, useRef } from 'react'
import { X, Download, Share2, Sparkles, MapPin, Calendar, Compass, ShieldCheck, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/nextjs'

interface StoryCardModalProps {
  isOpen: boolean
  onClose: () => void
  destination: string
  durationDays?: number
  places?: string[]
}

const DESTINATION_IMAGE_MAP: Record<string, string> = {
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=90&auto=format&fit=crop',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=90&auto=format&fit=crop',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=90&auto=format&fit=crop',
  bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=90&auto=format&fit=crop',
  manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=90&auto=format&fit=crop',
  kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=90&auto=format&fit=crop',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=90&auto=format&fit=crop',
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=90&auto=format&fit=crop',
  jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=90&auto=format&fit=crop',
  kashmir: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1200&q=90&auto=format&fit=crop',
  maldives: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=90&auto=format&fit=crop',
  rishikesh: 'https://images.unsplash.com/photo-1603867106100-0d2039fc8757?w=1200&q=90&auto=format&fit=crop',
  andaman: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1200&q=90&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=90&auto=format&fit=crop'
}

export default function StoryCardModal({
  isOpen,
  onClose,
  destination,
  durationDays = 4,
  places = ['Goa Old Town Tour', 'Anjuna Sunset Shacks', 'Night Market Food', 'Baga Beach Watersports']
}: StoryCardModalProps) {
  const { userId } = useAuth()
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const referralLink = `tripsage.in/signup?ref=${userId || 'explorer'}`
  const destLower = (destination || '').toLowerCase()
  const matchingKey = Object.keys(DESTINATION_IMAGE_MAP).find(k => destLower.includes(k)) || 'default'
  const bgImg = DESTINATION_IMAGE_MAP[matchingKey]

  const displayPlaces = places.length > 0 ? Array.from(new Set(places)).slice(0, 5) : [
    'Morning Cultural Walking Tour',
    'Local Gastronomy & Street Food',
    'Sunset Viewpoint & Beach Lounge',
    'Evening Heritage Landmarks',
    'Scenic Coastal Drive'
  ]

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${destination} Trip on TripSage AI`,
          text: `Check out my ${durationDays}-day curated itinerary for ${destination}!`,
          url: `https://${referralLink}`
        })
        toast.success('Shared successfully!')
      } catch (err) {
        // User cancelled share dialog
      }
    } else {
      await navigator.clipboard.writeText(`https://${referralLink}`)
      toast.success('Story referral link copied to clipboard!')
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    const loadToast = toast.loading('Exporting 1080x1920 HD Story card...')

    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1920
      const ctx = canvas.getContext('2d')

      if (ctx) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = bgImg

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = resolve
        })

        ctx.drawImage(img, 0, 0, 1080, 1920)

        const grad = ctx.createLinearGradient(0, 0, 0, 1920)
        grad.addColorStop(0, 'rgba(15, 15, 15, 0.75)')
        grad.addColorStop(0.3, 'rgba(20, 20, 20, 0.5)')
        grad.addColorStop(0.7, 'rgba(10, 10, 10, 0.85)')
        grad.addColorStop(1, 'rgba(5, 5, 5, 0.98)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 1080, 1920)

        // 3. Top Branding Badge (TripSage Emblem)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
        ctx.beginPath()
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(330, 100, 420, 80, 40)
        } else {
          ctx.rect(330, 100, 420, 80)
        }
        ctx.fill()

        ctx.strokeStyle = 'rgba(234, 88, 12, 0.9)'
        ctx.lineWidth = 4
        ctx.stroke()

        ctx.fillStyle = '#FFFFFF'
        ctx.font = '900 46px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('TripSage', 540, 156)

        // 4. Hero Destination Title
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '900 86px sans-serif'
        ctx.textAlign = 'center'
        ctx.shadowColor = 'rgba(0,0,0,0.8)'
        ctx.shadowBlur = 20
        ctx.fillText((destination || 'BANGKOK, THAILAND').toUpperCase(), 540, 340)
        ctx.shadowBlur = 0

        // Sub-badge (Duration)
        ctx.fillStyle = '#EA580C'
        ctx.beginPath()
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(340, 390, 400, 70, 35)
        } else {
          ctx.rect(340, 390, 400, 70)
        }
        ctx.fill()

        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 34px sans-serif'
        ctx.fillText(`🗓️ ${durationDays} DAYS • CURATED TRIP`, 540, 437)

        // 5. Highlights Glass Box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
        ctx.beginPath()
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(100, 510, 880, 960, 44)
        } else {
          ctx.rect(100, 510, 880, 960)
        }
        ctx.fill()

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = 3
        ctx.stroke()

        // Highlights Header
        ctx.fillStyle = '#FED7AA'
        ctx.font = '800 36px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText('📍 FEATURED ROUTE HIGHLIGHTS', 160, 590)

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(160, 620)
        ctx.lineTo(920, 620)
        ctx.stroke()

        // Highlight Items (Up to 5)
        const icons = ['🌅', '🏖️', '🍽️', '🏛️', '🌿']
        displayPlaces.forEach((place, i) => {
          const itemY = 660 + i * 150
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
          ctx.beginPath()
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(140, itemY, 800, 115, 24)
          } else {
            ctx.rect(140, itemY, 800, 115)
          }
          ctx.fill()
          ctx.fillStyle = '#FFFFFF'
          ctx.font = 'bold 36px sans-serif'
          ctx.textAlign = 'left'
          ctx.fillText(`${icons[i % icons.length]}  ${place}`, 180, itemY + 70)
        })

        // 6. Bottom VIP Referral Card
        ctx.fillStyle = 'rgba(234, 88, 12, 0.95)'
        ctx.beginPath()
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(100, 1500, 880, 270, 40)
        } else {
          ctx.rect(100, 1500, 880, 270)
        }
        ctx.fill()

        ctx.fillStyle = '#FFFFFF'
        ctx.font = '900 40px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('TripSage — Smart Trip Planner', 540, 1575)

        ctx.fillStyle = '#FFEDD5'
        ctx.font = '800 36px monospace'
        ctx.fillText(`tripsage.in  •  Ref: ${userId || 'explorer'}`, 540, 1640)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.font = 'bold 26px sans-serif'
        ctx.fillText('🛡️ VERIFIED ITINERARY  |  Get +100 Free Credits On Sign Up', 540, 1715)

        const dataUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `TripSage_${destination || 'Trip'}_Story.png`
        link.href = dataUrl
        link.click()

        toast.success('HD Story Card exported with official TripSage logo!', { id: loadToast })
      }
    } catch (err) {
      toast.error('Failed to generate Story card. Try again!', { id: loadToast })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-fade-in text-left">
      {/* Responsive Compact Card Wrapper - Never Overflows Viewport */}
      <div className="relative w-full max-w-[340px] sm:max-w-[370px] max-h-[96vh] rounded-[28px] bg-[#121212] border border-stone-800 shadow-2xl p-3 sm:p-4 flex flex-col gap-2.5 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-stone-900/90 hover:bg-stone-800 flex items-center justify-center text-white transition-all cursor-pointer z-40 border border-white/20 shadow-md"
          title="Close Modal"
        >
          <X size={16} />
        </button>

        {/* Story Preview Card - Fixed Viewport Height (No Vertical Cut-off) */}
        <div
          ref={cardRef}
          className="w-full h-[460px] sm:h-[500px] max-h-[72vh] rounded-2xl relative overflow-hidden border border-white/20 shadow-2xl flex flex-col justify-between p-3.5 text-center group shrink-0"
        >
          {/* HD Background Photo with Gradient Vignette */}
          <img
            src={bgImg}
            alt={destination}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/35 to-black/90" />

          {/* Top Prominent Brand Logo & Destination Title */}
          <div className="relative z-10 space-y-1.5 pt-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-[#EA580C] text-white shadow-xl">
              <img
                src="/logo.png"
                alt="TripSage"
                className="w-5 h-5 object-contain"
              />
              <span className="font-black text-sm sm:text-base text-white tracking-tight">TripSage</span>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight drop-shadow-md leading-tight">
                {destination}
              </h2>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-[#EA580C] text-white font-black text-[9.5px] rounded-full shadow-md uppercase tracking-wider">
                🗓️ {durationDays} DAYS • CURATED TRIP
              </span>
            </div>
          </div>

          {/* Glass Highlights List (4 Highlights to fit perfectly) */}
          <div className="relative z-10 bg-black/65 backdrop-blur-xl border border-white/20 rounded-xl p-2.5 text-left space-y-1 shadow-xl my-1">
            <span className="text-[8.5px] font-extrabold text-amber-300 uppercase tracking-widest block border-b border-white/15 pb-0.5">
              📍 Featured Highlights
            </span>

            {displayPlaces.slice(0, 4).map((p, idx) => {
              const icons = ['🌅', '🏖️', '🍽️', '🏛️']
              return (
                <div key={idx} className="bg-white/10 px-2 py-1 rounded-lg text-[10px] font-semibold text-white flex items-center gap-1.5 border border-white/10">
                  <span className="text-xs">{icons[idx % icons.length]}</span>
                  <span className="truncate">{p}</span>
                </div>
              )
            })}
          </div>

          {/* Footer Referral Badge */}
          <div className="relative z-10 bg-[#EA580C] p-2 rounded-xl space-y-0.5 text-center shadow-lg border border-orange-400/40">
            <div className="flex items-center justify-between text-[8.5px] text-white/90 font-bold uppercase tracking-wider border-b border-white/20 pb-0.5 mb-0.5">
              <span className="flex items-center gap-1">
                <img src="/logo.png" alt="TripSage" className="w-3 h-3 object-contain" />
                TripSage AI
              </span>
              <span className="flex items-center gap-1 text-amber-200">
                <ShieldCheck size={10} /> Verified
              </span>
            </div>
            <span className="text-[10px] font-black text-white font-mono block underline truncate">
              {referralLink}
            </span>
          </div>
        </div>

        {/* Action Buttons: Download & Share */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Download size={14} />
            <span>{downloading ? 'Exporting...' : 'Download HD'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 border border-white/10"
          >
            <Share2 size={14} />
            <span>Share Story</span>
          </button>
        </div>
      </div>
    </div>
  )
}
