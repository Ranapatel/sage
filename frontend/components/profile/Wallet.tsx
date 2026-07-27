'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import { Landmark, ArrowUpRight, ArrowDownLeft, Sparkles, Download, FileText, Gift, Lock, CheckCircle2, ShieldCheck, Zap, Coins } from 'lucide-react'
import Link from 'next/link'

interface Transaction {
  id: string
  amount: number
  type: string
  reason: string
  createdAt: string
}

interface Perk {
  id: string
  title: string
  desc: string
  cost: number
  icon: any
  badge: string
  unlocked: boolean
}

export default function Wallet() {
  const { getToken } = useAuth()
  const [balance, setBalance] = useState(500)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [unlockedPerks, setUnlockedPerks] = useState<string[]>(['unlimited_ai'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const token = await getToken()
        if (!token) {
          setLoading(false)
          return
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await axios.get(`${apiUrl}/api/profile/wallet`, {
          headers: { Authorization: `Bearer ${token}` }
        })
<<<<<<< HEAD
        if (response.data?.success && response.data?.data) {
          setBalance(response.data.data.balance ?? 500)
          setTransactions(response.data.data.transactions || [])
        } else {
          setBalance(500)
          setTransactions([{
            id: 'tx-1',
            amount: 500,
            type: 'credit',
            reason: 'Welcome Bonus Reward',
            createdAt: new Date().toISOString()
          }])
        }
      } catch (err: any) {
        console.warn('Wallet fetch notice:', err)
        setBalance(500)
        setTransactions([{
          id: 'tx-1',
          amount: 500,
          type: 'credit',
          reason: 'Welcome Bonus Reward',
          createdAt: new Date().toISOString()
        }])
=======
        if (response.data?.success) {
          setBalance(response.data.data?.balance || 500)
          setTransactions(response.data.data?.transactions || [])
        }
      } catch (err: any) {
        console.warn('[Wallet] Could not load wallet:', err.response?.status || err.message)
>>>>>>> 6d14ce1 (Fix itinerary photo upload system improvements)
      } finally {
        setLoading(false)
      }
    }
    fetchWallet()
  }, [])

  const handleRedeemPerk = (perk: Perk) => {
    if (unlockedPerks.includes(perk.id)) {
      toast.success(`${perk.title} is already active!`)
      return
    }
    if (balance < perk.cost) {
      toast.error(`You need ${perk.cost - balance} more Sage Credits! Invite a friend to earn +200 Credits.`)
      return
    }

    setBalance(prev => prev - perk.cost)
    setUnlockedPerks(prev => [...prev, perk.id])
    setTransactions(prev => [
      {
        id: `tx-${Date.now()}`,
        amount: perk.cost,
        type: 'debit',
        reason: `Unlocked: ${perk.title}`,
        createdAt: new Date().toISOString()
      },
      ...prev
    ])

    toast.success(`🎉 Unlocked ${perk.title}! Enjoy your VIP privilege.`)
  }

  const perksList: Perk[] = [
    {
      id: 'unlimited_ai',
      title: 'Unlimited AI Itinerary Generation',
      desc: 'Bypass all daily limits. Generate unlimited AI travel plans & multi-city routes.',
      cost: 300,
      icon: Sparkles,
      badge: 'POPULAR PERK',
      unlocked: unlockedPerks.includes('unlimited_ai')
    },
    {
      id: 'pdf_export',
      title: '1-Click Offline PDF Travel Guide Export',
      desc: 'Download high-res, printable PDF itineraries complete with offline map pins & tips.',
      cost: 200,
      icon: Download,
      badge: 'TRAVEL ESSENTIAL',
      unlocked: unlockedPerks.includes('pdf_export')
    },
    {
      id: 'hotel_vouchers',
      title: 'Exclusive Partner Hotel Vouchers',
      desc: 'Unlock extra 10%–15% discount promo codes at top rated partner stays.',
      cost: 400,
      icon: Gift,
      badge: 'STAY SAVINGS',
      unlocked: unlockedPerks.includes('hotel_vouchers')
    },
    {
      id: 'priority_ai',
      title: 'VIP Fast-Track AI Route Optimizer',
      desc: 'Ultra-fast priority processing for multi-stop route optimization & hidden gems.',
      cost: 250,
      icon: Zap,
      badge: 'FOUNDER STATUS',
      unlocked: unlockedPerks.includes('priority_ai')
    }
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="shimmer h-44 w-full rounded-3xl"></div>
        <div className="shimmer h-60 w-full rounded-3xl"></div>
      </div>
    )
  }

  const nextTierTarget = 1000
  const progressPercent = Math.min(100, Math.round((balance / nextTierTarget) * 100))

  return (
    <div className="space-y-6">
      {/* ─── SAGE TRAVEL CREDITS HERO CARD ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E8E0D8] bg-gradient-to-br from-[#FFFBF7] via-orange-50/40 to-amber-50/30 p-6 md:p-8 shadow-sm">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] bg-orange-100/80 px-2.5 py-0.5 rounded-full border border-orange-200">
                Sage Credits Wallet
              </span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck size={11} /> 100% Free In-App Rewards
              </span>
            </div>

            <div className="text-4xl font-display font-extrabold text-[#1A1A1A] tracking-tight flex items-center gap-2 pt-1">
              <span className="flex items-center gap-1.5">
                <Coins size={32} className="text-amber-500" />
                {balance.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-slate-500">Credits</span>
            </div>

            <p className="text-xs text-[#6B6B6B] font-medium pt-0.5">
              Use Sage Credits to unlock VIP Features, Unlimited AI Itineraries & PDF Exports!
            </p>
          </div>

          <div className="bg-white border border-[#E8E0D8] p-4 rounded-2xl shadow-2xs flex flex-col items-center justify-center min-w-[200px] text-center">
            <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-1">
              Current Explorer Rank
            </span>
            <div className="text-sm font-extrabold text-[#EA580C] flex items-center gap-1.5">
              <Sparkles size={15} />
              <span>{balance >= 1000 ? 'GlobeTrotter VIP' : balance >= 300 ? 'Active Traveler' : 'Explorer'}</span>
            </div>
            <Link
              href="/profile?tab=referral"
              className="mt-3 text-[11px] font-bold text-[#EA580C] hover:underline flex items-center gap-1"
            >
              + Earn More Credits ➔
            </Link>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-6 pt-5 border-t border-[#E8E0D8] relative z-10 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-[#1A1A1A]">
            <span>GlobeTrotter VIP Unlocks at {nextTierTarget} Credits</span>
            <span className="text-[#EA580C] font-bold">{progressPercent}% Achieved</span>
          </div>
          <div className="w-full bg-[#E8E0D8]/60 h-2.5 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-orange-400 to-[#EA580C] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── PERKS STORE (REDEEM IN-APP PRIVILEGES) ───────────────────────── */}
      <div className="card p-6 md:p-8 bg-white border border-[#E8E0D8] rounded-3xl shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-extrabold text-[#1A1A1A] flex items-center gap-2">
            <Gift className="text-[#EA580C]" size={20} />
            <span>Redeem In-App Travel Perks</span>
          </h2>
          <p className="text-[#6B6B6B] text-xs mt-1 font-medium">
            Unlock premium TripSage capabilities using your earned Sage Credits — zero cash required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {perksList.map((perk) => {
            const IconComponent = perk.icon
            const isUnlocked = perk.unlocked

            return (
              <div
                key={perk.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                  isUnlocked
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-[#FFFBF7]/60 border-[#E8E0D8] hover:border-[#FED7AA]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-[#EA580C] border border-orange-200">
                      {perk.badge}
                    </span>
                    <span className="text-xs font-extrabold text-[#1A1A1A] flex items-center gap-1">
                      <Coins size={13} className="text-amber-500" /> {perk.cost} Pts
                    </span>
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <div className={`p-2.5 rounded-xl shrink-0 ${isUnlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-[#FFF4EE] text-[#EA580C]'}`}>
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1A1A1A] leading-snug">{perk.title}</h3>
                      <p className="text-[11px] text-[#6B6B6B] mt-1 leading-relaxed">{perk.desc}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRedeemPerk(perk)}
                  disabled={isUnlocked}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isUnlocked
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default'
                      : balance >= perk.cost
                      ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-sm'
                      : 'bg-stone-100 text-slate-400 border border-stone-200 cursor-not-allowed'
                  }`}
                >
                  {isUnlocked ? (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Unlocked & Active</span>
                    </>
                  ) : balance >= perk.cost ? (
                    <>
                      <Sparkles size={15} />
                      <span>Unlock with {perk.cost} Credits</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Requires {perk.cost} Credits</span>
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── TRANSACTION LEDGER ────────────────────────────────────────────── */}
      <div className="card p-6 md:p-8 bg-white border border-[#E8E0D8] rounded-3xl shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-extrabold text-[#1A1A1A] flex items-center gap-2">
            <Landmark className="text-[#EA580C]" size={20} />
            <span>Credits Ledger</span>
          </h2>
          <p className="text-[#6B6B6B] text-xs mt-1 font-medium">
            Track all earned referral bonuses and redeemed travel privileges.
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[#E8E0D8] rounded-2xl">
            <Landmark className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-700">No transactions recorded yet</h3>
            <p className="text-slate-500 text-[0.65rem] mt-1">Earn +200 Sage Credits for every friend you invite!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E0D8]/60">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'credit'
              return (
                <div key={tx.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${
                      isCredit
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-orange-50 border-orange-200 text-[#EA580C]'
                    }`}>
                      {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#1A1A1A]">{tx.reason}</h4>
                      <span className="text-[0.65rem] text-slate-500 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-black ${
                    isCredit ? 'text-emerald-700' : 'text-[#EA580C]'
                  }`}>
                    {isCredit ? '+' : '-'}{tx.amount} Credits
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
