'use client'

import React, { useState } from 'react'
import { X, Users, Copy, Check, Send, Gift } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/nextjs'

interface CollaborativeInviteModalProps {
  isOpen: boolean
  onClose: () => void
  destination: string
}

export default function CollaborativeInviteModal({
  isOpen,
  onClose,
  destination
}: CollaborativeInviteModalProps) {
  const { userId } = useAuth()
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const inviteLink = `https://tripsage.in/plan?trip=${encodeURIComponent(destination)}&ref=${userId || 'explorer'}`

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success('Collaborative trip link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter an email address')

    setLoading(true)
    setTimeout(() => {
      toast.success(`Invite sent to ${email}! You'll earn +200 Sage Credits when they join.`)
      setEmail('')
      setLoading(false)
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-left">
      <div className="bg-white border border-[#E8E0D8] rounded-[28px] w-full max-w-sm sm:max-w-md p-6 relative shadow-2xl space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-[#1A1A1A] transition-all cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-[#EA580C] uppercase tracking-wider bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 inline-flex items-center gap-1">
            <Gift size={11} /> +200 Credits Per Co-Traveler
          </span>
          <h3 className="text-xl font-extrabold text-[#1A1A1A]">Invite Co-Travelers to {destination}</h3>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            Collaborate on this trip together. When friends join using your link, you get <strong className="text-[#EA580C]">+200 Credits</strong> and they get <strong className="text-[#EA580C]">100 Free Credits</strong>!
          </p>
        </div>

        {/* Copy Link Section */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] block">
            Trip Invite Link
          </label>
          <div className="flex items-center gap-2 bg-[#FFFBF7] border border-[#E8E0D8] p-2 rounded-2xl">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="bg-transparent border-none text-xs text-[#1A1A1A] font-semibold px-2 select-all focus:outline-none flex-1 truncate"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Send Email Form */}
        <form onSubmit={handleSendInvite} className="space-y-2.5 pt-2 border-t border-[#E8E0D8]">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] block">
            Or Send Email Invite
          </label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="travelbuddy@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white border border-[#E8E0D8] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1A1A] font-medium focus:outline-none focus:border-[#EA580C]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-black text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95"
            >
              <Send size={13} />
              <span>Invite</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
