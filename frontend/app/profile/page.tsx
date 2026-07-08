<<<<<<< HEAD
import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

export const metadata: Metadata = {
  title: 'My Profile & Preferences | TripSage AI Travel',
  description: 'Manage your TripSage travel profile, update dietary options, select preferred currencies, and view your accumulated booking cashback rewards.',
}

export default function ProfilePage() {
  return <ProfileClient />
=======
'use client'

import React, { useState, useEffect } from 'react'
import { UserProfile, useUser, useClerk, useAuth } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Loader2, LayoutDashboard, User, Sliders, Bookmark, Calendar, Image as ImageIcon, Wallet as WalletIcon, Users, Settings } from 'lucide-react'

// Subcomponents
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileMenu, { ProfileTab } from '@/components/profile/ProfileMenu'
import PersonalProfile from '@/components/profile/PersonalProfile'
import TravelPreferences from '@/components/profile/TravelPreferences'
import SavedItems from '@/components/profile/SavedItems'
import TripHistory from '@/components/profile/TripHistory'
import Memories from '@/components/profile/Memories'
import Wallet from '@/components/profile/Wallet'
import Referral from '@/components/profile/Referral'

interface ProfileDataState {
  user: {
    id: string
    clerkUserId: string
    email: string
    firstName: string | null
    lastName: string | null
    profileImage: string | null
  }
  personal: any
  preferences: any
  stats: {
    tripsCreated: number
    countriesVisited: number
    memoriesUploaded: number
    walletBalance: number
  }
}

export default function ProfilePage() {
  const { isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')
  const [profileData, setProfileData] = useState<ProfileDataState | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Synchronize tab state with URL parameter on mount and when URL query changes
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      const validTabs: ProfileTab[] = [
        'overview', 'personal', 'preferences', 'saved', 
        'history', 'memories', 'wallet', 'referrals', 'settings'
      ]
      if (validTabs.includes(tabParam as ProfileTab)) {
        setActiveTab(tabParam as ProfileTab)
      }
    }
  }, [searchParams])

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', tab)
      window.history.pushState({}, '', url.toString())
    }
  }

  const fetchProfileData = async () => {
    try {
      const token = await getToken()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await axios.get(`${apiUrl}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data?.success) {
        setProfileData(response.data.data)
      }
    } catch (err: any) {
      console.error('Error fetching combined profile data:', err.message)
      toast.error('Failed to load profile dashboard.')
    } finally {
      setLoadingProfile(false)
    }
  }

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in')
    } else if (isSignedIn) {
      fetchProfileData()
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn || loadingProfile || !profileData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-white">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <span className="text-xs font-bold text-slate-400">Loading Profile Dashboard...</span>
      </div>
    )
  }

  const handleSupportRedirect = () => {
    router.push('/support')
  }

  const handleSignOut = async () => {
    const outToast = toast.loading('Signing out...')
    await signOut(() => {
      toast.success('Signed out successfully!', { id: outToast })
      router.replace('/')
    })
  }

  // Quick navigation helpers inside the Overview dashboard
  const handleStatQuickNavigate = (tab: ProfileTab) => {
    handleTabChange(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Dynamic header display */}
        <ProfileHeader user={profileData.user} stats={profileData.stats} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu Sidebar */}
          <div className="lg:col-span-1">
            <ProfileMenu
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onSupportClick={handleSupportRedirect}
              onSignOutClick={handleSignOut}
            />
          </div>

          {/* Active Tab Panel */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="card p-6 md:p-8 bg-slate-950/40 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl">
                  <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                  
                  <h2 className="text-xl font-black text-white leading-tight">
                    Welcome back, {profileData.user.firstName || 'Explorer'}! 👋
                  </h2>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Here is an overview of your travel operations. Track your reward balances, customize recommendation filters, and browse recent photo memories.
                  </p>
                </div>

                {/* Quick actions grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: 'Edit Identity Info',
                      desc: 'Update phone number, language preferences, and verify DOB details.',
                      icon: User,
                      tab: 'personal' as ProfileTab,
                      color: 'border-blue-500/20 text-blue-400 bg-blue-500/5'
                    },
                    {
                      title: 'Travel Preferences',
                      desc: 'Customize food preferences, accommodation standards, and budgets.',
                      icon: Sliders,
                      tab: 'preferences' as ProfileTab,
                      color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5'
                    },
                    {
                      title: 'Invite & Refer Friends',
                      desc: 'Earn 100 Sage points ($100 value) for every friend invited to join.',
                      icon: Users,
                      tab: 'referrals' as ProfileTab,
                      color: 'border-purple-500/20 text-purple-400 bg-purple-500/5'
                    }
                  ].map((act, idx) => {
                    const Icon = act.icon
                    return (
                      <button
                        key={idx}
                        onClick={() => handleStatQuickNavigate(act.tab)}
                        className={`card p-5 border rounded-2xl flex flex-col justify-between text-left hover:border-slate-700/80 transition-all duration-300 shadow-md cursor-pointer ${act.color}`}
                      >
                        <div className="space-y-1">
                          <Icon size={20} className="mb-2" />
                          <h4 className="text-xs font-black text-white leading-tight">{act.title}</h4>
                          <p className="text-[0.65rem] text-slate-400 leading-normal">{act.desc}</p>
                        </div>
                        <span className="text-[0.6rem] font-bold text-slate-300 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Configure →
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Quick stats and details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reward Card */}
                  <div
                    onClick={() => handleStatQuickNavigate('wallet')}
                    className="card p-6 bg-slate-900/30 border border-slate-800 rounded-3xl hover:border-amber-500/20 transition-all duration-300 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="text-[0.65rem] text-amber-500 font-bold block uppercase tracking-widest">
                        Sage Wallet
                      </span>
                      <h3 className="text-2xl font-black text-white mt-1 leading-none">
                        🪙 {profileData.stats.walletBalance.toLocaleString()}
                      </h3>
                      <p className="text-[0.65rem] text-slate-400 mt-2 font-medium">Click to view transactions history</p>
                    </div>
                    <div className="text-3xl bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl">
                      💳
                    </div>
                  </div>

                  {/* Memories Card */}
                  <div
                    onClick={() => handleStatQuickNavigate('memories')}
                    className="card p-6 bg-slate-900/30 border border-slate-800 rounded-3xl hover:border-purple-500/20 transition-all duration-300 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="text-[0.65rem] text-purple-400 font-bold block uppercase tracking-widest">
                        Memories Albums
                      </span>
                      <h3 className="text-2xl font-black text-white mt-1 leading-none">
                        📷 {profileData.stats.memoriesUploaded} Saved
                      </h3>
                      <p className="text-[0.65rem] text-slate-400 mt-2 font-medium">Click to upload travel photos</p>
                    </div>
                    <div className="text-3xl bg-purple-500/10 border border-purple-500/20 p-3 rounded-2xl">
                      🌌
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'personal' && (
              <PersonalProfile initialData={profileData.personal} onSaveSuccess={fetchProfileData} />
            )}

            {activeTab === 'preferences' && (
              <TravelPreferences initialData={profileData.preferences} onSaveSuccess={fetchProfileData} />
            )}

            {activeTab === 'saved' && <SavedItems />}

            {activeTab === 'history' && <TripHistory />}

            {activeTab === 'memories' && <Memories />}

            {activeTab === 'wallet' && <Wallet />}

            {activeTab === 'referrals' && <Referral />}

            {activeTab === 'settings' && (
              <div className="flex justify-center bg-slate-950/40 border border-slate-800 p-6 rounded-3xl shadow-2xl">
                <UserProfile
                  routing="hash"
                  appearance={{
                    elements: {
                      card: 'bg-slate-900 border border-slate-800 text-white shadow-xl w-full',
                      navbar: 'border-r border-slate-800 text-slate-300',
                      navbarButton: 'text-slate-300 hover:text-white',
                      headerTitle: 'text-white',
                      headerSubtitle: 'text-slate-400',
                      profileSectionTitle: 'text-slate-300 border-b border-slate-800',
                      formFieldLabel: 'text-slate-300',
                      formFieldInput: 'bg-slate-950 border border-slate-800 text-white',
                      accordionTriggerButton: 'text-slate-300 hover:text-white',
                      badge: 'bg-slate-800 text-slate-300 border border-slate-700',
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
>>>>>>> staging
}
