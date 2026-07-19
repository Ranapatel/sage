'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import { Landmark, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  type: string
  reason: string
  createdAt: string
}

export default function Wallet() {
  const { getToken } = useAuth()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const token = await getToken()
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
        const response = await axios.get(`${apiUrl}/api/profile/wallet`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data?.success) {
          setBalance(response.data.data.balance)
          setTransactions(response.data.data.transactions)
        }
      } catch (err: any) {
        console.error('Error fetching wallet:', err)
        toast.error('Failed to load wallet ledger.')
      } finally {
        setLoading(false)
      }
    }
    fetchWallet()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="shimmer h-40 w-full rounded-3xl"></div>
        <div className="shimmer h-60 w-full rounded-3xl"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sage Points Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E8E0D8] bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-white p-6 shadow-sm">
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-orange-500/5 blur-2xl"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] text-[#EA580C] font-black uppercase tracking-widest">
              Sage Points Wallet
            </span>
            <div className="text-3xl font-black text-[#1A1A1A] tracking-tight flex items-center gap-2">
              🪙 {balance.toLocaleString()}
            </div>
            <span className="text-[0.65rem] text-slate-500 font-medium block">
              1 Sage Point = $1 Reward Balance
            </span>
          </div>
          <div className="text-2xl bg-orange-50 border border-orange-100 p-2.5 rounded-2xl">
            💳
          </div>
        </div>

        <div className="mt-8 flex justify-between items-end border-t border-[#E8E0D8] pt-4 relative z-10">
          <div>
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Account holder</span>
            <span className="text-xs font-bold text-[#1A1A1A] mt-0.5 block">TripSage Explorer</span>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#EA580C] bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">
              Active Wallet
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="card p-6 md:p-8 bg-white border border-[#E8E0D8] rounded-3xl shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
            📊 Transaction Ledger
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Track credit bonuses and travel redemptions on TripSage.
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[#E8E0D8] rounded-2xl">
            <Landmark className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-700">No transaction logs</h3>
            <p className="text-slate-500 text-[0.65rem] mt-1">Transactions appear when you invite friends or claim cashback.</p>
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
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A1A]">{tx.reason}</h4>
                      <span className="text-[0.65rem] text-slate-500 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-black font-mono ${
                    isCredit ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {isCredit ? '+' : '-'}{tx.amount} Points
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
