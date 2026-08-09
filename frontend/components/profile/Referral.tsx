'use client'

import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import {
  Copy, Check, Share2, Award, Gift, Sparkles, X,
  MessageCircle, Send as TelegramIcon, Linkedin, Facebook,
  Mail, Globe, Coins, Users, TrendingUp, ArrowRight, CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

interface ReferredUser {
  email: string
  firstName: string | null
  lastName: string | null
}

interface ReferralRecord {
  id: string
  referredUser: ReferredUser
  status: string
  reward: number
}

export default function Referral() {
  const { getToken, userId } = useAuth()
  const [copied, setCopied] = useState(false)
  const [referrals, setReferrals] = useState<ReferralRecord[]>([])
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [loadingReferrals, setLoadingReferrals] = useState(true)
  const [loadingWallet, setLoadingWallet] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)

  const referralLink = `https://tripsage.in/sign-up?ref=${userId || 'explorer'}`
  const shareMessage = `🌍 Discover smart travel with TripSage AI — your personal assistant for custom itineraries and trip planning.

🎁 Join via my exclusive invite link to claim 100 Sage Travel Credits:
${referralLink}

Earn an additional +200 Credits for every traveler you invite!`

  // ── Fetch wallet balance ─────────────────────────────────────────────────────
  const fetchWallet = useCallback(async () => {
    try {
      const token = await getToken()
      if (!token) return
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const res = await axios.get(`${apiUrl}/api/profile/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data?.success && res.data?.data) {
        setWalletBalance(res.data.data.balance ?? 0)
      }
    } catch {
      // silently fail — balance shown from Wallet tab
    } finally {
      setLoadingWallet(false)
    }
  }, [getToken])

  // ── Fetch referrals ──────────────────────────────────────────────────────────
  const fetchReferrals = useCallback(async () => {
    try {
      const token = await getToken()
      if (!token) return
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const res = await axios.get(`${apiUrl}/api/profile/referrals`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data?.success) {
        setReferrals(res.data.data || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoadingReferrals(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchWallet()
    fetchReferrals()
  }, [fetchWallet, fetchReferrals])

  // ── Copy link ────────────────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2500)
  }

  // ── Universal native share / modal fallback ──────────────────────────────────
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'TripSage AI Travel Planner', text: shareMessage, url: referralLink })
        toast.success('Thanks for sharing TripSage!')
        return
      } catch (err: any) {
        if (err.name !== 'AbortError') setShowShareModal(true)
      }
    } else {
      setShowShareModal(true)
    }
  }

  const handleSharePlatform = (platform: string) => {
    const encodedMsg = encodeURIComponent(shareMessage)
    const encodedUrl = encodeURIComponent(referralLink)
    const urls: Record<string, string> = {
      whatsapp: `https://api.whatsapp.com/send?text=${encodedMsg}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMsg}`,
      linkedin:  `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook:  `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      email:     `mailto:?subject=${encodeURIComponent('🎁 100 Free Travel Credits on TripSage AI!')}&body=${encodedMsg}`,
    }
    if (urls[platform]) {
      window.open(urls[platform], '_blank')
      setShowShareModal(false)
    }
  }

  // ── Derived values ───────────────────────────────────────────────────────────
  const totalEarned = referrals.reduce((sum, r) => sum + (r.reward || 200), 0)

  return (
    <div className="space-y-6">

      {/* ── HERO: Credits + Referral Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Current Credit Balance */}
        <div className="sm:col-span-1 relative overflow-hidden rounded-3xl border border-[#E8E0D8] bg-gradient-to-br from-[#FFFBF7] via-orange-50/40 to-amber-50/30 p-6 shadow-sm flex flex-col justify-between">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] bg-orange-100/80 border border-orange-200 px-2.5 py-0.5 rounded-full">
              <Coins size={11} /> Sage Credits
            </div>
            <div className="flex items-end gap-2 pt-1">
              {loadingWallet ? (
                <div className="h-10 w-28 bg-stone-200/60 animate-pulse rounded-xl" />
              ) : (
                <>
                  <span className="text-4xl font-black text-[#1A1A1A] leading-none">
                    {walletBalance.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-400 mb-1">credits</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[#6B6B6B] font-medium leading-relaxed">
              Your current wallet balance. View full history in the{' '}
              <Link href="/profile?tab=wallet" className="text-[#EA580C] font-bold hover:underline">
                Wallet tab →
              </Link>
            </p>
          </div>
        </div>

        {/* Total Earned from Referrals */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <TrendingUp size={11} /> Earned via Referrals
            </div>
            <div className="flex items-end gap-2 pt-1">
              <span className="text-4xl font-black text-emerald-700 leading-none">
                +{totalEarned.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-emerald-500 mb-1">credits</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">
              From {referrals.length} successful referral{referrals.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Friends Invited */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-200 bg-blue-50/40 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-full">
              <Users size={11} /> Friends Joined
            </div>
            <div className="flex items-end gap-2 pt-1">
              <span className="text-4xl font-black text-blue-700 leading-none">
                {referrals.length}
              </span>
              <span className="text-sm font-bold text-blue-400 mb-1">friends</span>
            </div>
            <p className="text-[11px] text-blue-600 font-medium">
              Each friend = +200 for you, +100 for them
            </p>
          </div>
        </div>
      </div>

      {/* ── REFERRAL LINK CARD ───────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-[#E8E0D8] bg-white p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#EA580C] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
              <Gift size={12} /> Your Personal Invite Link
            </div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">
              Invite Friends. Earn Credits. Instantly.
            </h2>
            <p className="text-xs text-[#6B6B6B] font-medium max-w-lg leading-relaxed">
              Share your link on <strong className="text-[#1A1A1A]">WhatsApp, Instagram, Telegram, LinkedIn</strong> or anywhere.
              When they sign up, <span className="font-extrabold text-[#EA580C]">you earn +200 Credits</span> and{' '}
              <span className="font-extrabold text-[#EA580C]">they get +100 Credits</span> — automatically, no action needed.
            </p>
          </div>
        </div>

        {/* Link copy row */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex items-center gap-2 flex-1 bg-[#FFFBF7] border border-[#E8E0D8] rounded-2xl px-4 py-3">
            <span className="text-xs font-mono font-bold text-[#1A1A1A] truncate flex-1 select-all">
              {referralLink}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1A1A1A] hover:bg-black text-white font-extrabold text-xs rounded-2xl shadow transition-all cursor-pointer active:scale-95 shrink-0"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs rounded-2xl shadow transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Share2 size={15} />
            Share
          </button>
        </div>

        {/* How it works steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E8E0D8]">
          {[
            { step: '01', title: 'Copy & Share Link', desc: 'Share on WhatsApp, Telegram, Instagram or anywhere.' },
            { step: '02', title: 'Friend Signs Up',   desc: 'They open your link and create a TripSage account.' },
            { step: '03', title: 'Both Earn Credits', desc: 'You get +200 Credits, they get +100 — instantly & automatically.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-3 p-4 bg-[#FFFBF7] rounded-2xl border border-[#E8E0D8]">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#EA580C] font-black text-[11px] flex items-center justify-center shrink-0 border border-orange-200">
                {step}
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#1A1A1A]">{title}</p>
                <p className="text-[11px] text-[#6B6B6B] mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── REFERRAL HISTORY LEDGER ──────────────────────────────────────────── */}
      <div className="rounded-3xl border border-[#E8E0D8] bg-white p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#1A1A1A] flex items-center gap-2">
              <Award className="text-[#EA580C]" size={18} />
              Referral History
            </h3>
            <p className="text-[11px] text-[#6B6B6B] font-medium mt-0.5">
              Every friend who joined via your link
            </p>
          </div>
          {referrals.length > 0 && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
              {referrals.length} Successful
            </span>
          )}
        </div>

        {loadingReferrals ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 w-full bg-stone-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#E8E0D8] rounded-2xl">
            <div className="w-12 h-12 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users size={20} className="text-[#EA580C]" />
            </div>
            <h4 className="text-sm font-extrabold text-[#1A1A1A]">No referrals yet</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Copy your invite link and share it. Every friend who joins earns you +200 Sage Credits!
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] text-white text-xs font-extrabold rounded-xl shadow cursor-pointer hover:bg-[#C2410C] active:scale-95 transition-all"
            >
              <Copy size={13} /> Copy My Referral Link
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E0D8]/60">
            {referrals.map((record) => (
              <div key={record.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#1A1A1A]">
                      {record.referredUser.firstName
                        ? `${record.referredUser.firstName}${record.referredUser.lastName ? ` ${record.referredUser.lastName}` : ''}`
                        : 'New Traveler'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">{record.referredUser.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                    <Coins size={11} /> +{record.reward || 200} Credits
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5 capitalize">
                    {record.status || 'Completed'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SHARE MODAL ──────────────────────────────────────────────────────── */}
      {showShareModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E8E0D8] rounded-[28px] w-full max-w-sm p-6 relative shadow-2xl space-y-5">
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-[#1A1A1A] transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#EA580C] uppercase tracking-wider bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                <Globe size={11} /> Share Your Link
              </span>
              <h3 className="text-lg font-extrabold text-[#1A1A1A] mt-2">Share TripSage Anywhere</h3>
              <p className="text-xs text-[#6B6B6B] mt-1">
                Pick a platform to share your personal invite link:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'whatsapp', label: 'WhatsApp',  Icon: MessageCircle,  cls: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200' },
                { id: 'telegram', label: 'Telegram',  Icon: TelegramIcon,   cls: 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200' },
                { id: 'linkedin', label: 'LinkedIn',  Icon: Linkedin,       cls: 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200' },
                { id: 'facebook', label: 'Facebook',  Icon: Facebook,       cls: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200' },
                { id: 'email',    label: 'Email',     Icon: Mail,           cls: 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200' },
              ].map(({ id, label, Icon, cls }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSharePlatform(id)}
                  className={`p-3 border rounded-2xl flex items-center gap-2.5 font-extrabold text-xs transition-transform active:scale-95 cursor-pointer ${cls}`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={handleCopy}
                className="p-3 bg-orange-50 hover:bg-orange-100 text-[#EA580C] border border-[#FED7AA] rounded-2xl flex items-center gap-2.5 font-extrabold text-xs transition-transform active:scale-95 cursor-pointer"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
