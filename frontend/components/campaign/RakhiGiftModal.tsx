'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Copy, Check, Sparkles, Share2, Send, Mail, MessageSquare,
  Gift, Heart, Coins, ArrowRight, Flame, Globe
} from 'lucide-react'
import {
  FaWhatsapp, FaTelegramPlane, FaFacebookF, FaTwitter
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/nextjs'
import {
  getFestiveSharePayload,
  getCampaignTimeRemaining,
  RAKHI_CAMPAIGN
} from '@/lib/campaignConfig'

interface RakhiGiftModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RakhiGiftModal({ isOpen, onClose }: RakhiGiftModalProps) {
  const { userId } = useAuth()
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(getCampaignTimeRemaining())
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([])

  const sharePayload = getFestiveSharePayload(userId)

  // ── Live Countdown Clock ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const timer = setInterval(() => {
      setTimeLeft(getCampaignTimeRemaining())
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen])

  // ── Close on ESC key ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // ── Copy Link with Festive Confetti Effect ─────────────────────────────────
  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharePayload.referralUrl)
    setCopied(true)
    toast.success('Rakhi gift link copied! Share with your sibling.', {
      icon: '🎁',
      style: {
        borderRadius: '16px',
        background: '#18181B',
        color: '#FFFFFF',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        fontWeight: 'bold',
        fontSize: '13px'
      }
    })

    // Trigger sparkle particles
    const newParticles = Array.from({ length: 18 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      color: ['#F59E0B', '#EA580C', '#E11D48', '#FDE047', '#38BDF8'][Math.floor(Math.random() * 5)]
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 900)
    setTimeout(() => setCopied(false), 2500)
  }

  // ── Universal Native Share ──────────────────────────────────────────────────
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: '🎁 Raksha Bandhan Travel Gift — TripSage',
          text: sharePayload.message,
          url: sharePayload.referralUrl
        })
        toast.success('Thanks for sharing the gift of travel!')
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink()
    }
  }

  const shareChannels = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      url: sharePayload.platforms.whatsapp,
      color: 'from-[#25D366] to-[#128C7E]',
      border: 'border-[#25D366]/40',
      hover: 'hover:bg-[#25D366]/15 hover:border-[#25D366]',
      text: 'text-[#25D366]'
    },
    {
      name: 'Telegram',
      icon: FaTelegramPlane,
      url: sharePayload.platforms.telegram,
      color: 'from-[#229ED9] to-[#0088CC]',
      border: 'border-[#229ED9]/40',
      hover: 'hover:bg-[#229ED9]/15 hover:border-[#229ED9]',
      text: 'text-[#229ED9]'
    },
    {
      name: 'SMS',
      icon: MessageSquare,
      url: sharePayload.platforms.sms,
      color: 'from-[#F59E0B] to-[#D97706]',
      border: 'border-[#F59E0B]/40',
      hover: 'hover:bg-[#F59E0B]/15 hover:border-[#F59E0B]',
      text: 'text-[#F59E0B]'
    },
    {
      name: 'Email',
      icon: Mail,
      url: sharePayload.platforms.email,
      color: 'from-[#EA4335] to-[#B31412]',
      border: 'border-[#EA4335]/40',
      hover: 'hover:bg-[#EA4335]/15 hover:border-[#EA4335]',
      text: 'text-[#EA4335]'
    },
    {
      name: 'X (Twitter)',
      icon: FaTwitter,
      url: sharePayload.platforms.twitter,
      color: 'from-[#38BDF8] to-[#0284C7]',
      border: 'border-[#38BDF8]/40',
      hover: 'hover:bg-[#38BDF8]/15 hover:border-[#38BDF8]',
      text: 'text-[#38BDF8]'
    },
    {
      name: 'Facebook',
      icon: FaFacebookF,
      url: sharePayload.platforms.facebook,
      color: 'from-[#1877F2] to-[#0D65D9]',
      border: 'border-[#1877F2]/40',
      hover: 'hover:bg-[#1877F2]/15 hover:border-[#1877F2]',
      text: 'text-[#1877F2]'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="relative w-full max-w-xl bg-[#0D0D11]/95 border border-[#F59E0B]/30 rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.85)] z-10 text-white font-body my-auto"
          >
            {/* Ambient Radial Golden Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[450px] h-[220px] bg-gradient-to-b from-[#EA580C]/25 via-[#F59E0B]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            {/* ── 3D Banner Header Artwork ── */}
            <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#18181B]">
              <img
                src="/rakhi-campaign-banner.jpg"
                alt="Raksha Bandhan Sibling Travel Gift"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-[#0D0D11]/40 to-transparent" />

              {/* Top Festive Badge */}
              <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181B]/80 backdrop-blur-md border border-[#F59E0B]/50 shadow-lg text-[11px] font-extrabold text-[#F59E0B] uppercase tracking-wider">
                <Flame size={13} className="text-[#EA580C] animate-pulse" />
                <span>2X Festive Multiplier Active</span>
              </div>

              {/* Countdown Pill on Banner */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight leading-none drop-shadow">
                    Sibling Travel Gift Pass 🎀
                  </h2>
                  <p className="text-xs font-semibold text-amber-200/90 mt-1">
                    Gift a travel memory this Raksha Bandhan (Aug 23 – 28)
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono font-bold text-slate-200">
                  <span className="text-[#F59E0B]">⏱</span>
                  <span>{String(timeLeft.days).padStart(2, '0')}d : {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5">

              {/* ── 2X Reward Double Breakdown Card ── */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-white/[0.04] to-transparent border border-[#F59E0B]/30 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-extrabold text-[#F59E0B] uppercase tracking-wider">You Earn</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#EA580C] text-white">2X BONUS</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">400</span>
                    <span className="text-xs font-bold text-amber-200">Credits</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                    Credited to your wallet when your sibling signs up.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-white/[0.04] to-transparent border border-rose-500/30 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-extrabold text-rose-300 uppercase tracking-wider">Sibling Receives</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white">2X GIFT</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">200</span>
                    <span className="text-xs font-bold text-rose-200">Credits</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                    Instant welcome bonus in their wallet upon sign-up.
                  </p>
                </div>
              </div>

              {/* ── Multi-Platform One-Click Share Hub ── */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#F59E0B]" />
                    Share on Any App:
                  </span>
                  <span className="text-[10px] font-bold text-amber-400/90">Instant Pre-filled Message</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {shareChannels.map((ch) => {
                    const IconComponent = ch.icon
                    return (
                      <a
                        key={ch.name}
                        href={ch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/[0.03] border ${ch.border} ${ch.hover} transition-all duration-200 group active:scale-95 text-center cursor-pointer`}
                      >
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center text-white shadow-md mb-1.5 group-hover:scale-110 transition-transform`}>
                          <IconComponent size={16} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 group-hover:text-white truncate max-w-full">
                          {ch.name}
                        </span>
                      </a>
                    )
                  })}
                </div>
              </div>

              {/* ── Link Box + Copy Button ── */}
              <div className="space-y-2">
                <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl p-1.5 pl-3.5 focus-within:border-[#F59E0B]/50 transition-colors">
                  <input
                    type="text"
                    readOnly
                    value={sharePayload.referralUrl}
                    className="w-full bg-transparent text-xs font-mono text-slate-300 outline-none select-all truncate pr-2"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="relative shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#EA580C] via-[#F59E0B] to-[#EA580C] hover:opacity-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Link</span>
                      </>
                    )}

                    {/* Particle burst animation on copy */}
                    {particles.map((p) => (
                      <motion.span
                        key={p.id}
                        initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                        animate={{ opacity: 0, scale: 1.5, x: p.x, y: p.y }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="absolute w-2 h-2 rounded-full pointer-events-none"
                        style={{ backgroundColor: p.color }}
                      />
                    ))}
                  </button>
                </div>
              </div>

              {/* ── Primary Action / Native Device Share ── */}
              <button
                onClick={handleNativeShare}
                className="w-full py-3 px-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Share2 size={15} className="text-[#F59E0B]" />
                <span>More Share Options (Instagram DM, Snapchat, Slack, AirDrop)</span>
              </button>

              {/* Terms Footnote */}
              <p className="text-[10px] text-center text-slate-500 font-medium">
                * 2X Referral Bonus active during Raksha Bandhan week (Aug 23 – Aug 28). Both rewards credit automatically upon successful verified sign-up via your link.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
