'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { isRakhiCampaignActive, RAKHI_CAMPAIGN } from '@/lib/campaignConfig'
import { Flame, Sparkles, Gift } from 'lucide-react'

// ── Inner component that reads searchParams (must be inside Suspense) ────────
function SignUpContent() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref')
  const isRakhiActive = isRakhiCampaignActive()
  const bonusCredits = isRakhiActive ? RAKHI_CAMPAIGN.refereeCredits : RAKHI_CAMPAIGN.standardRefereeCredits

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#6B6B6B] flex flex-col items-center justify-center p-4 relative overflow-hidden font-body">
      {/* Soft Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#FFEDD5]/50 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* TripSage Brand Header */}
        <div className="text-center space-y-1.5 mb-2">
          <Link href="/" className="inline-flex items-center gap-2 justify-center group cursor-pointer">
            <Image
              src="/logo.png"
              alt="TripSage"
              width={36}
              height={36}
              className="rounded-xl shadow-xs object-contain group-hover:scale-105 transition-transform"
            />
            <span className="font-display font-extrabold text-2xl text-[#1A1A1A] tracking-tight">
              TripSage
            </span>
          </Link>
          <p className="text-xs font-semibold text-[#6B6B6B]">
            Your AI Travel Operating System
          </p>
        </div>

        {/* ── Referral Welcome Banner (shown only when ?ref= is present) ── */}
        {refCode && (
          <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left shadow-sm ${
            isRakhiActive
              ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border border-[#F59E0B]/50'
              : 'bg-orange-50 border border-orange-200'
          }`}>
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow ${
              isRakhiActive
                ? 'bg-gradient-to-br from-[#EA580C] to-[#F59E0B] text-white'
                : 'bg-[#EA580C] text-white'
            }`}>
              {isRakhiActive ? <Flame size={20} className="text-yellow-100 animate-pulse" /> : <Gift size={18} className="text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-extrabold text-[#1A1A1A]">
                  {isRakhiActive ? '🎀 Raksha Bandhan Special Gift!' : 'You were referred! 🎉'}
                </p>
                {isRakhiActive && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#EA580C] text-white uppercase">2X BONUS</span>
                )}
              </div>
              <p className="text-[11px] text-[#6B6B6B] font-medium leading-snug mt-0.5">
                Sign up now and get <span className="font-extrabold text-[#EA580C]">+{bonusCredits} Free Sage Credits</span> gifted to your travel wallet!
              </p>
            </div>
          </div>
        )}

        {/* Clerk Sign Up Container */}
        <div className="flex justify-center">
          <SignUp
            // Pass ref code into Clerk unsafeMetadata so the webhook can read it
            unsafeMetadata={refCode ? { referredBy: refCode, campaign: isRakhiActive ? 'raksha-bandhan-2026' : undefined, bonusCredits } : {}}
            appearance={{
              variables: {
                colorPrimary: '#EA580C',
                colorBackground: '#FFFFFF',
                colorText: '#1A1A1A',
                colorTextSecondary: '#6B6B6B',
                colorInputBackground: '#FFFBF7',
                colorInputText: '#1A1A1A',
                borderRadius: '16px',
              },
              elements: {
                card: 'bg-white border border-[#E8E0D8] shadow-[0_12px_40px_rgba(0,0,0,0.06)] rounded-2xl p-6 md:p-8 w-full text-left',
                headerTitle: 'font-display font-extrabold text-xl text-[#1A1A1A]',
                headerSubtitle: 'text-xs font-medium text-[#6B6B6B]',
                formButtonPrimary: 'bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold shadow-md shadow-orange-500/20 rounded-xl h-11 text-sm transition-all cursor-pointer',
                socialButtonsBlockButton: 'bg-[#FFFBF7] border border-[#E8E0D8] text-[#1A1A1A] hover:bg-[#FFF4EE] font-bold rounded-xl h-11 transition-all cursor-pointer',
                socialButtonsBlockButtonText: 'text-[#1A1A1A] font-bold text-xs',
                formFieldLabel: 'text-xs font-bold text-[#1A1A1A] uppercase tracking-wider',
                formFieldInput: 'bg-[#FFFBF7] border border-[#E8E0D8] text-[#1A1A1A] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] rounded-xl text-sm font-semibold',
                footerActionText: 'text-xs text-[#6B6B6B]',
                footerActionLink: 'text-[#EA580C] font-extrabold hover:underline',
                dividerLine: 'bg-[#E8E0D8]',
                dividerText: 'text-xs font-bold text-[#9CA3AF]',
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Page wrapper with Suspense boundary (required for useSearchParams) ────────
export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFFBF7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignUpContent />
    </Suspense>
  )
}
