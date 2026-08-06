import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'

export default function SignUpPage() {
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

        {/* Clerk Sign Up Container */}
        <div className="flex justify-center">
          <SignUp
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
