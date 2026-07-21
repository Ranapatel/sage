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

        {/* ── Profile Header Card ────────────────────────────────────────── */}
        {displayUser && (
          <div className="mb-8">
            <ProfileHeader
              user={displayUser}
              stats={stats}
            />
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
