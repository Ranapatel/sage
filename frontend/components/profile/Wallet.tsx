'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import { Landmark, ArrowUpRight, ArrowDownLeft, BadgePercent } from 'lucide-react'

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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
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
      {/* Sage Points Card Mockup */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-600/20 via-amber-950/20 to-slate-950 p-6 shadow-xl">
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl"></div>
        
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">
              Sage Points Wallet
            </span>
            <div className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              🪙 {balance.toLocaleString()}
            </div>
            <span className="text-[0.65rem] text-slate-400 font-medium block">
              1 Sage Point = $1 Reward Balance
            </span>
          </div>
          <div className="text-3xl bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-2xl">
            💳
          </div>
        </div>

        <div className="mt-8 flex justify-between items-end border-t border-amber-500/15 pt-4">
          <div>
            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Account holder</span>
            <span className="text-xs font-bold text-white mt-0.5 block">TripSage Explorer</span>
          </div>
          <div className="flex gap-2">
            <span className="badge badge-amber text-[0.65rem] font-bold">Active Wallet</span>
          </div>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="card p-6 md:p-8 bg-slate-950/40 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            📊 Transaction Ledger
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Track credit bonuses and travel redemptions on TripSage.
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl">
            <Landmark className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-300">No transaction logs</h3>
            <p className="text-slate-500 text-[0.65rem] mt-1">Transactions appear when you invite friends or claim cashback.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'credit'
              return (
                <div key={tx.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${
                      isCredit
                        ? 'bg-green-500/10 border-green-500/10 text-green-400'
                        : 'bg-red-500/10 border-red-500/10 text-red-400'
                    }`}>
                      {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{tx.reason}</h4>
                      <span className="text-[0.65rem] text-slate-500 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-black font-mono ${
                    isCredit ? 'text-green-400' : 'text-red-400'
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
