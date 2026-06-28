'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuthStore } from '@/store/authStore'
import { useTripStore } from '@/store/tripStore'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  User, 
  Settings, 
  Wallet, 
  Coins, 
  ArrowRight, 
  Check, 
  Save, 
  Heart, 
  HelpCircle,
  TrendingUp,
  Share2,
  Lock,
  Gift
} from 'lucide-react'

export default function ProfileClient() {
  const router = useRouter()
  const { user, updateProfile, isLoggedIn } = useAuthStore()
  const { userProfile, setProfile } = useTripStore()

  // Local form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP' | 'AED'>('INR')
  const [diet, setDiet] = useState('any')
  const [travelStyle, setTravelStyle] = useState('adventure')
  const [isSaving, setIsSaving] = useState(false)
  const [showRedeemModal, setShowRedeemModal] = useState(false)
  const [upiId, setUpiId] = useState('')
  const [redeemSuccess, setRedeemSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setCurrency(user.currency || 'INR')
      setDiet(user.preferences?.diet || userProfile.preferences?.[0] || 'any')
      setTravelStyle(user.preferences?.travelStyle || userProfile.travelStyle || 'adventure')
    } else {
      setName('Traveler')
      setEmail('traveler@tripsage.in')
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      // Sync with authentication store
      await updateProfile({
        name,
        currency,
        preferences: {
          ...user?.preferences,
          diet,
          travelStyle
        }
      })

      // Sync with trip search store
      setProfile({
        currency,
        travelStyle,
        preferences: diet !== 'any' ? [diet] : []
      })

      toast.success('Preferences saved successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update preferences.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!upiId.trim() || !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g. name@okhdfcbank)')
      return
    }
    setRedeemSuccess(true)
    setTimeout(() => {
      setShowRedeemModal(false)
      setRedeemSuccess(false)
      setUpiId('')
      toast.success('Cashback payout request of ₹1,850 submitted successfully!')
    }, 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1E] text-slate-100 font-sans">
      <Navbar />

      {/* Main Grid Wrapper */}
      <div 
        className="flex-grow pt-24 pb-20 px-6 max-w-6xl mx-auto w-full"
        style={{
          background: 'radial-gradient(circle 800px at 50% -100px, rgba(234, 88, 12, 0.05), transparent), #0A0F1E'
        }}
      >
        <div className="text-left mb-10">
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
            <User className="text-orange-500" size={32} /> My Account
          </h1>
          <p className="text-slate-400 text-sm mt-1">Configure your travel presets and view rewards wallet.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Column 1 & 2: Profile Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 md:p-8 backdrop-blur-md">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-900 pb-3">
                <Settings size={18} className="text-orange-500" /> Travel Preferences & Profile
              </h2>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Your name" 
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-orange-500/50 transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={email} 
                        disabled
                        className="w-full bg-slate-900/40 border border-slate-800/60 rounded-xl px-4 py-3 text-sm text-slate-500 font-semibold cursor-not-allowed"
                      />
                      <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Currency</label>
                    <select 
                      value={currency} 
                      onChange={e => setCurrency(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-orange-500/50 transition-all font-semibold"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="AED">AED (Dh)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dietary Filter</label>
                    <select 
                      value={diet} 
                      onChange={e => setDiet(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-orange-500/50 transition-all font-semibold"
                    >
                      <option value="any">Any Diet</option>
                      <option value="veg">Pure Veg</option>
                      <option value="jain">Jain Dining</option>
                      <option value="halal">Halal Food</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preferred Travel Style</label>
                    <select 
                      value={travelStyle} 
                      onChange={e => setTravelStyle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-orange-500/50 transition-all font-semibold"
                    >
                      <option value="adventure">Adventure & Explore</option>
                      <option value="luxury">Luxury & Staycation</option>
                      <option value="budget">Backpacker Budget</option>
                      <option value="family">Relaxed Family Outing</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-900/60 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md shadow-orange-500/10 disabled:opacity-50"
                  >
                    <Save size={16} />
                    {isSaving ? 'Saving Changes...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Promo widget */}
            <div className="bg-slate-950/20 border border-slate-900 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
                  <Gift size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Invite friends, earn extra cashback!</h4>
                  <p className="text-xs text-slate-400">Receive flat ₹500 referral credit when they checkout their first trip.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText('https://tripsage.in/invite?code=SAGE99')
                  toast.success('Referral link copied to clipboard!')
                }}
                className="flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold rounded-lg text-xs transition-all"
              >
                <Share2 size={12} /> Share
              </button>
            </div>
          </div>

          {/* Column 3: Cashback Wallet */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-900 pb-3">
                <Wallet size={18} className="text-orange-500" /> Cashback & Rewards Wallet
              </h2>

              <div className="space-y-5">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1">Redeemable Balance</span>
                    <span className="text-2xl font-extrabold text-white">₹1,850 <span className="text-xs font-semibold text-slate-400">INR</span></span>
                  </div>
                  <button 
                    onClick={() => setShowRedeemModal(true)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-orange-500/10"
                  >
                    Withdraw
                  </button>
                </div>

                <div className="flex justify-between items-center text-xs px-1">
                  <span className="text-slate-400 font-medium">Pending Approvals:</span>
                  <span className="text-orange-400 font-bold">₹3,600 INR</span>
                </div>

                <div className="border-t border-slate-900/80 pt-4">
                  <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                    <TrendingUp size={12} className="text-orange-500" /> Ledger Payouts
                  </h3>
                  
                  <div className="space-y-3">
                    
                    {/* Item 1 */}
                    <div className="p-3 bg-slate-900/30 border border-slate-900/60 rounded-xl space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-200">Agoda Hotel Booking</span>
                        <span className="text-xs font-bold text-orange-400">₹3,600</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Hotel in Bali — Grand Resort</p>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-900/30 mt-1">
                        <span className="text-[9px] font-mono text-slate-500">ID: AG_902910</span>
                        <span className="text-[8px] uppercase tracking-widest font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">Pending stay</span>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="p-3 bg-slate-900/30 border border-slate-900/60 rounded-xl space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-200">Skyscanner Flight Booking</span>
                        <span className="text-xs font-bold text-emerald-400">₹1,100</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Delhi to Bali — IndiGo Outbound</p>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-900/30 mt-1">
                        <span className="text-[9px] font-mono text-slate-500">ID: SK_392019</span>
                        <span className="text-[8px] uppercase tracking-widest font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">Approved</span>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="p-3 bg-slate-900/30 border border-slate-900/60 rounded-xl space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-200">Viator Local Activities</span>
                        <span className="text-xs font-bold text-emerald-400">₹750</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Ubud Day Tour — Private Transfer</p>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-900/30 mt-1">
                        <span className="text-[9px] font-mono text-slate-500">ID: VT_482910</span>
                        <span className="text-[8px] uppercase tracking-widest font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">Approved</span>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-[10px] text-slate-400 leading-normal flex items-start gap-2.5">
                  <HelpCircle size={14} className="text-orange-500 shrink-0 mt-0.5" />
                  <span>Affiliate cashbacks become redeemable within 14 days after travel check-out validation has been cleared.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── REDEEM MODAL ── */}
      <AnimatePresence>
        {showRedeemModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowRedeemModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-950 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-5"
            >
              <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto text-orange-500">
                <Coins size={28} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Redeem Cashback Payout</h3>
                <p className="text-xs text-slate-400">Withdraw your ₹1,850 earnings directly to UPI.</p>
              </div>

              {redeemSuccess ? (
                <div className="py-8 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                    <Check size={20} />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">Processing Request...</p>
                </div>
              ) : (
                <form onSubmit={handleRedeem} className="space-y-4">
                  <div className="text-left">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Enter UPI ID</label>
                    <input 
                      type="text" 
                      placeholder="username@bank"
                      required
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-orange-500/50 transition-all font-semibold font-mono"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowRedeemModal(false)}
                      className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 font-bold rounded-xl text-xs transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all"
                    >
                      Confirm Payout
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
