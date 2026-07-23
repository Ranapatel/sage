'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser, useAuth, useClerk } from '@clerk/nextjs'
import { useAuthStore } from '@/store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileMenu, { ProfileTab } from '@/components/profile/ProfileMenu'
import PersonalProfile from '@/components/profile/PersonalProfile'
import TravelPreferences from '@/components/profile/TravelPreferences'
import SavedItems from '@/components/profile/SavedItems'
import TripHistory from '@/components/profile/TripHistory'
import Memories from '@/components/profile/Memories'
import Wallet from '@/components/profile/Wallet'
import Referral from '@/components/profile/Referral'
import AccountSettings from '@/components/profile/AccountSettings'
import OverviewDashboard from '@/components/profile/OverviewDashboard'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_TABS: ProfileTab[] = [
  'overview', 'personal', 'preferences', 'saved',
  'history', 'memories', 'wallet', 'referrals', 'settings',
]

function isValidTab(tab: string | null): tab is ProfileTab {
  return VALID_TABS.includes(tab as ProfileTab)
}

// ─── Profile Data Types ───────────────────────────────────────────────────────

interface ProfileStats {
  tripsCreated: number
  countriesVisited: number
  memoriesUploaded: number
  walletBalance: number
}

interface PersonalData {
  phoneNumber: string | null
  dateOfBirth: string | null
  gender: string | null
  country: string | null
  city: string | null
  language: string | null
}

interface PreferencesData {
  travelStyle: string | null
  budgetRange: string | null
  interests: string[]
  foodPreference: string[]
  accommodationPreference: string | null
  tripDuration: string | null
}

// ─── Inner component (requires searchParams — must be inside Suspense) ────────

function ProfilePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const { isLoggedIn: isStoreLoggedIn, user: storeUser } = useAuthStore()

  // Derive active tab from URL — default to 'overview'
  const tabParam = searchParams.get('tab')
  const activeTab: ProfileTab = isValidTab(tabParam) ? tabParam : 'overview'

  const displayUser = user
    ? {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.primaryEmailAddress?.emailAddress || '',
        profileImage: user.imageUrl || null,
      }
    : isStoreLoggedIn && storeUser
      ? {
          firstName: storeUser.name.split(' ')[0] || '',
          lastName: storeUser.name.split(' ').slice(1).join(' ') || '',
          email: storeUser.email,
          profileImage: null,
        }
      : null

  // Remote data state
  const [stats, setStats] = useState<ProfileStats>({
    tripsCreated: 0,
    countriesVisited: 0,
    memoriesUploaded: 0,
    walletBalance: 0,
  })
  const [personalData, setPersonalData] = useState<PersonalData | null>(null)
  const [preferencesData, setPreferencesData] = useState<PreferencesData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  // ── Tab navigation: use replace so browser back doesn't loop through tabs ──
  const handleTabChange = (tab: ProfileTab) => {
    router.replace(`/profile?tab=${tab}`, { scroll: false })
  }

  const handleSupportClick = () => router.push('/support')

  const handleSignOutClick = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      router.replace('/')
    } catch {
      toast.error('Error signing out. Please try again.')
    }
  }

  // ── Fetch profile data once user is loaded ──────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return // Wait for Clerk to load first

    const fetchProfileData = async () => {
      // If we don't have a Clerk user and we are not store logged in, don't fetch, just turn off loading
      if (!user && !isStoreLoggedIn) {
        setDataLoading(false)
        return
      }

      setDataLoading(true)
      try {
        const token = user ? await getToken() : 'mock-store-token'
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
        const headers = { Authorization: `Bearer ${token}` }

        const [profileRes, prefsRes, statsRes] = await Promise.allSettled([
          axios.get(`${apiUrl}/api/profile`, { headers }),
          axios.get(`${apiUrl}/api/profile/preferences`, { headers }),
          axios.get(`${apiUrl}/api/profile/stats`, { headers }),
        ])

        if (profileRes.status === 'fulfilled' && profileRes.value.data?.success) {
          setPersonalData(profileRes.value.data.data)
        }
        if (prefsRes.status === 'fulfilled' && prefsRes.value.data?.success) {
          setPreferencesData(prefsRes.value.data.data)
        }
        if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
          setStats(statsRes.value.data.data)
        }
      } catch (err) {
        console.error('[ProfileClient] Error fetching profile data:', err)
      } finally {
        setDataLoading(false)
      }
    }

    fetchProfileData()
  }, [user, isLoaded, isStoreLoggedIn])

  // ── Auth guard — redirect unauthenticated visitors ──────────────────────────
  useEffect(() => {
    if (isLoaded && !user && !isStoreLoggedIn) {
      router.replace('/sign-in')
    }
  }, [isLoaded, user, isStoreLoggedIn, router])

  // ── Loading gate: wait for Clerk to initialise ──────────────────────────────
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center gap-3 text-white">
        <Loader2 className="animate-spin text-blue-400" size={28} />
        <span className="text-sm font-semibold text-slate-400">Loading profile...</span>
      </div>
    )
  }

  if (!user && !isStoreLoggedIn) {
    return null
  }

  // ── Tab content renderer ────────────────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewDashboard
            stats={stats}
            onTabChange={handleTabChange}
          />
        )
      case 'personal':
        return (
          <PersonalProfile
            initialData={personalData}
            onSaveSuccess={() => {}}
          />
        )
      case 'preferences':
        return (
          <TravelPreferences
            initialData={preferencesData}
            onSaveSuccess={() => {}}
          />
        )
      case 'saved':
        return <SavedItems />
      case 'history':
        return <TripHistory />
      case 'memories':
        return <Memories />
      case 'wallet':
        return <Wallet />
      case 'referrals':
        return <Referral />
      case 'settings':
        return <AccountSettings />
      default:
        return (
          <OverviewDashboard
            stats={stats}
            onTabChange={handleTabChange}
          />
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF7] text-[#1A1A1A]">
      <Navbar />

      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">

<<<<<<< HEAD
        {/* ── Profile Header Card ────────────────────────────────────────── */}
        {displayUser && (
          <div className="mb-8">
            <ProfileHeader
              user={displayUser}
              stats={stats}
            />
=======
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
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dietary Preference</label>
                    <select 
                      value={diet} 
                      onChange={e => setDiet(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-orange-500/50 transition-all font-semibold"
                    >
                      <option value="any">Any / No preference</option>
                      <option value="veg">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="halal">Halal</option>
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
>>>>>>> e444a81 (Save local changes)
          </div>
        )}

        {/* ── Two-column layout: sidebar + content ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">

          {/* Sidebar — sticky on desktop */}
          <div className="lg:sticky lg:top-28">
            <ProfileMenu
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onSupportClick={handleSupportClick}
              onSignOutClick={handleSignOutClick}
            />
          </div>

          {/* Main tab content */}
          <div className="min-w-0">
            {dataLoading && (activeTab === 'personal' || activeTab === 'preferences') ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="shimmer h-20 w-full rounded-3xl" />
                ))}
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// ─── Public export — wraps inner component in Suspense for useSearchParams ───

export default function ProfileClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFBF7] flex items-center justify-center gap-3 text-[#1A1A1A]">
          <Loader2 className="animate-spin text-[#EA580C]" size={28} />
          <span className="text-sm font-semibold text-slate-500">Loading profile...</span>
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  )
}
