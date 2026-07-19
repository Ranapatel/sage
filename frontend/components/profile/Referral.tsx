'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import { Copy, Check, Send, Award, Gift } from 'lucide-react'

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
  
  const referralLink = `https://tripsage.in/signup?ref=${userId || 'guest'}`

  const fetchReferrals = async () => {
    try {
      const token = await getToken()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await axios.get(`${apiUrl}/api/profile/referrals`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data?.success) {
        setReferrals(response.data.data)
      }
    } catch (err) {
      console.error('Error fetching referrals:', err)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter a friend\'s email')

    setLoading(true)
    const refToast = toast.loading('Sending referral...')

    try {
      const token = await getToken()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await axios.post(
        `${apiUrl}/api/profile/referrals`,
        { referredEmail: email, reward: 100.0 },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data?.success) {
        toast.success('Successfully referred! Both of you got reward points.', { id: refToast })
        setEmail('')
        fetchReferrals()
      } else {
        toast.error(response.data?.message || 'Failed to refer.', { id: refToast })
      }
    } catch (err: any) {
      console.error('Error sending referral:', err)
      toast.error(err.response?.data?.message || err.message || 'Failed to refer.', { id: refToast })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Referral Link Copy Panel */}
      <div className="card p-6 md:p-8 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-white border border-[#E8E0D8] rounded-3xl relative overflow-hidden shadow-sm">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] text-[#EA580C] font-black uppercase tracking-widest flex items-center gap-1.5 justify-center md:justify-start">
              <Gift size={13} /> Invite Friends, Earn Rewards
            </span>
            <h2 className="text-xl font-black text-[#1A1A1A] leading-tight">
              Share TripSage & Get 100 Sage Points!
            </h2>
            <p className="text-slate-500 text-xs max-w-md font-medium">
              Invite friends to TripSage. You will receive <span className="font-extrabold text-[#EA580C]">100 Sage Points</span> and they will get <span className="font-extrabold text-[#EA580C]">50 Sage Points</span> signup bonus once they verify their account!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-[#E8E0D8] p-2 rounded-2xl w-full md:w-auto min-w-[280px]">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="bg-transparent border-none text-[0.7rem] text-slate-500 font-bold px-3 select-all focus:outline-none flex-1 truncate"
            />
            <button
              onClick={handleCopy}
              className="p-3 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl shadow transition-all cursor-pointer flex-shrink-0"
              title="Copy referral link"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Referral Invite Form */}
        <div className="card p-6 md:p-8 bg-white border border-[#E8E0D8] rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-[#1A1A1A] flex items-center gap-2">
              ✉_ Send Email Referral
            </h3>
            <p className="text-slate-500 text-xs font-medium">
              Know someone planning a trip? Enter their email below to send an invite.
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
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white font-bold text-xs rounded-2xl shadow transition-all cursor-pointer"
            >
              <Send size={13} /> {loading ? 'Sending Invite...' : 'Send Referral Invitation'}
            </button>
          </form>
        </div>

        {/* Invited Referrals History */}
        <div className="card p-6 md:p-8 bg-white border border-[#E8E0D8] rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-black text-[#1A1A1A] flex items-center gap-2">
            🥇 Referral History
          </h3>
          
          {referrals.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-[#E8E0D8] rounded-2xl">
              <Award className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-500">No referrals yet</h4>
              <p className="text-slate-500 text-[0.65rem] mt-1">Start sharing your referral link to earn points!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {referrals.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 rounded-xl border border-[#E8E0D8]/80 bg-[#FFFBF7]/60">
                  <div>
                    <h5 className="text-xs font-bold text-[#1A1A1A] leading-tight">
                      {record.referredUser.firstName || 'Traveler'}
                    </h5>
                    <span className="text-[0.65rem] text-slate-500 font-medium">
                      {record.referredUser.email}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 uppercase tracking-wider">
                      +{record.reward} Pts
                    </span>
                    <span className="text-[0.6rem] text-slate-400 font-bold block mt-0.5 capitalize">
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
