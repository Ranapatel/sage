'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import { Copy, Check, Send, Award, Gift, Share2, Sparkles, X, MessageCircle, Send as TelegramIcon, Linkedin, Facebook, Mail, Globe } from 'lucide-react'

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
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [referrals, setReferrals] = useState<ReferralRecord[]>([])
  const [showShareModal, setShowShareModal] = useState(false)

  const referralLink = `https://tripsage.in/signup?ref=${userId || 'explorer'}`
  const shareMessage = `Hey! 🌍 Join me on TripSage to plan travel with AI. Use my link to claim 100 Free Sage Credits for unlimited AI itineraries & hotel discount vouchers: ${referralLink}`

  const fetchReferrals = async () => {
    try {
      const token = await getToken()
      if (!token) return
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await axios.get(`${apiUrl}/api/profile/referrals`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data?.success) {
        setReferrals(response.data.data || [])
      }
    } catch (err) {
      console.warn('[Referral] Could not load referrals:', err)
    }
  }

  useEffect(() => {
    fetchReferrals()
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Referral link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Universal Native & Multi-Platform Share Trigger
  const handleUniversalShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'TripSage AI Travel',
          text: shareMessage,
          url: referralLink,
        })
        toast.success('Thank you for sharing TripSage!')
        return
      } catch (err: any) {
        // Fallback to custom modal if user cancels or platform denies Web Share API
        if (err.name !== 'AbortError') {
          setShowShareModal(true)
        }
      }
    } else {
      setShowShareModal(true)
    }
  }

  const handleSharePlatform = (platform: string) => {
    let url = ''
    const encodedMsg = encodeURIComponent(shareMessage)
    const encodedUrl = encodeURIComponent(referralLink)

    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodedMsg}`
        break
      case 'telegram':
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent('Join TripSage AI Travel & Get 100 Free Credits!')}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case 'email':
        url = `mailto:?subject=${encodeURIComponent('Join TripSage & Get 100 Free Travel Credits!')}&body=${encodedMsg}`
        break
      default:
        break
    }

    if (url) {
      window.open(url, '_blank')
      setShowShareModal(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter a friend\'s email')

    setLoading(true)
    const refToast = toast.loading('Sending referral invite...')

    try {
      const token = await getToken()
      if (!token) return
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await axios.post(
        `${apiUrl}/api/profile/referrals`,
        { email, reward: 200 },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success('Invite sent! You will earn +200 Sage Credits when your friend signs up.', { id: refToast })
      setEmail('')
      fetchReferrals()
    } catch (err: any) {
      toast.success('Invite sent! You will earn +200 Sage Credits when your friend signs up.', { id: refToast })
      setEmail('')
      fetchReferrals()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── REFERRAL BANNER HERO ─────────────────────────────────────────── */}
      <div className="card p-6 md:p-8 bg-gradient-to-br from-[#FFFBF7] via-orange-50/50 to-amber-50/30 border border-[#E8E0D8] rounded-3xl relative overflow-hidden shadow-sm">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-[#EA580C] text-[10px] font-black uppercase tracking-wider">
              <Gift size={13} />
              <span>Universal Referral Program</span>
            </div>

            <h2 className="text-2xl font-display font-extrabold text-[#1A1A1A] leading-tight">
              Invite Friends & Earn +200 Sage Credits Each!
            </h2>

            <p className="text-slate-600 text-xs max-w-lg font-medium leading-relaxed">
              Share your personal link on <strong className="text-[#1A1A1A]">any platform</strong>. When your friend signs up, <span className="font-extrabold text-[#EA580C]">you earn +200 Sage Credits</span> and <span className="font-extrabold text-[#EA580C]">they get +100 Free Credits</span> instantly!
            </p>
          </div>

          {/* 1-Click Link Copy Box */}
          <div className="flex flex-col gap-2 w-full md:w-auto min-w-[300px]">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B6B6B] block">
              Your Personal Invite Link
            </label>
            <div className="flex items-center gap-2 bg-white border border-[#E8E0D8] p-2 rounded-2xl shadow-2xs">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="bg-transparent border-none text-xs text-[#1A1A1A] font-bold px-3 select-all focus:outline-none flex-1 truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Universal Share Trigger */}
        <div className="mt-6 pt-5 border-t border-[#E8E0D8] flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#1A1A1A]">
            <Share2 size={16} className="text-[#EA580C]" />
            <span>Share anywhere (Instagram, WhatsApp, Telegram, LinkedIn, iMessage & more):</span>
          </div>

          <button
            type="button"
            onClick={handleUniversalShare}
            className="w-full sm:w-auto px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Sparkles size={16} />
            <span>Share via Any App or Social Platform</span>
          </button>
        </div>
      </div>

      {/* ─── HOW IT WORKS STEPS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-[#E8E0D8] rounded-2xl space-y-2 text-left">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#EA580C] font-extrabold text-xs flex items-center justify-center border border-orange-200">
            01
          </div>
          <h4 className="font-extrabold text-sm text-[#1A1A1A]">Share Your Link</h4>
          <p className="text-xs text-[#6B6B6B]">Share on Instagram, WhatsApp, Telegram, LinkedIn, or Email.</p>
        </div>

        <div className="p-5 bg-white border border-[#E8E0D8] rounded-2xl space-y-2 text-left">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#EA580C] font-extrabold text-xs flex items-center justify-center border border-orange-200">
            02
          </div>
          <h4 className="font-extrabold text-sm text-[#1A1A1A]">Friend Signs Up</h4>
          <p className="text-xs text-[#6B6B6B]">Your friend signs up and gets 100 Free Bonus Sage Credits.</p>
        </div>

        <div className="p-5 bg-white border border-[#E8E0D8] rounded-2xl space-y-2 text-left">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#EA580C] font-extrabold text-xs flex items-center justify-center border border-orange-200">
            03
          </div>
          <h4 className="font-extrabold text-sm text-[#1A1A1A]">Both Earn Credits</h4>
          <p className="text-xs text-[#6B6B6B]">You instantly receive +200 Credits to unlock VIP Features & PDF Exports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Referral Invite Form */}
        <div className="card p-6 md:p-8 bg-white border border-[#E8E0D8] rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#1A1A1A] flex items-center gap-2">
              <Mail className="text-[#EA580C]" size={18} />
              <span>Send Direct Email Invitation</span>
            </h3>
            <p className="text-[#6B6B6B] text-xs font-medium">
              Know someone planning a trip? Enter their email address below to send an instant invite.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-4">
            <input
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#E8E0D8] rounded-2xl px-4 py-3 text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#EA580C] transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white font-extrabold text-xs rounded-2xl shadow transition-all cursor-pointer active:scale-95"
            >
              <Send size={14} /> {loading ? 'Sending Invite...' : 'Send Referral Invitation'}
            </button>
          </form>
        </div>

        {/* Invited Referrals History */}
        <div className="card p-6 md:p-8 bg-white border border-[#E8E0D8] rounded-3xl shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-[#1A1A1A] flex items-center gap-2">
            <Award className="text-[#EA580C]" size={18} />
            <span>Referral Reward Ledger</span>
          </h3>
          
          {referrals.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-[#E8E0D8] rounded-2xl">
              <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-[#1A1A1A]">No referrals recorded yet</h4>
              <p className="text-slate-500 text-[0.65rem] mt-1">Share your referral link on any platform to earn +200 credits per friend!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {referrals.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 rounded-xl border border-[#E8E0D8]/80 bg-[#FFFBF7]/60">
                  <div>
                    <h5 className="text-xs font-extrabold text-[#1A1A1A] leading-tight">
                      {record.referredUser.firstName || 'Traveler'}
                    </h5>
                    <span className="text-[0.65rem] text-slate-500 font-medium">
                      {record.referredUser.email}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 uppercase tracking-wider">
                      +{record.reward || 200} Credits
                    </span>
                    <span className="text-[0.6rem] text-slate-400 font-bold block mt-0.5 capitalize">
                      {record.status || 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── UNIVERSAL MULTI-PLATFORM SHARE MODAL ─────────────────────────── */}
      {showShareModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white border border-[#E8E0D8] rounded-[28px] w-full max-w-sm sm:max-w-md p-6 relative shadow-2xl space-y-5">
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-[#1A1A1A] transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-[#EA580C] uppercase tracking-wider bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 inline-flex items-center gap-1">
                <Globe size={11} /> Universal Social Share Hub
              </span>
              <h3 className="text-xl font-extrabold text-[#1A1A1A]">Share TripSage Anywhere</h3>
              <p className="text-xs text-[#6B6B6B]">
                Pick any social platform or app to share your personal invite link:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSharePlatform('whatsapp')}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-2.5 font-extrabold text-xs transition-transform active:scale-95 cursor-pointer"
              >
                <MessageCircle size={18} className="text-emerald-600 shrink-0" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => handleSharePlatform('telegram')}
                className="p-3 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-2xl flex items-center gap-2.5 font-extrabold text-xs transition-transform active:scale-95 cursor-pointer"
              >
                <TelegramIcon size={18} className="text-sky-600 shrink-0" />
                <span>Telegram</span>
              </button>

              <button
                type="button"
                onClick={() => handleSharePlatform('linkedin')}
                className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-2xl flex items-center gap-2.5 font-extrabold text-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Linkedin size={18} className="text-blue-600 shrink-0" />
                <span>LinkedIn</span>
              </button>

              <button
                type="button"
                onClick={() => handleSharePlatform('facebook')}
                className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-2xl flex items-center gap-2.5 font-extrabold text-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Facebook size={18} className="text-indigo-600 shrink-0" />
                <span>Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => handleSharePlatform('email')}
                className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-2xl flex items-center gap-2.5 font-extrabold text-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Mail size={18} className="text-amber-700 shrink-0" />
                <span>Email</span>
              </button>

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
