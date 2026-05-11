'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'
import { SYMBOLS } from '@/lib/currency'
import { trackEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'
import CurrencySelector from '@/components/ui/CurrencySelector'
import LegalModal from '@/components/ui/LegalModal'
import { Key, Rocket, Eye, EyeOff, Target, ArrowRight, Lock, User, Mail, ShieldCheck } from 'lucide-react'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'] as const
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'UAE', 'Germany', 'France', 'Singapore', 'Australia', 'Japan']

export default function AuthClient() {
  const router = useRouter()
  const { login, signup, isLoggedIn, loading, error, clearError } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPass, setShowPass] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    currency: 'INR', country: 'India',
  })
  const [activeLegal, setActiveLegal] = useState<{ title: string; content: React.ReactNode } | null>(null)

  useEffect(() => { if (isLoggedIn) router.push('/plan') }, [isLoggedIn])
  useEffect(() => { if (error) { toast.error(error); clearError() } }, [error])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.includes('@')) { toast.error('Enter a valid email'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        toast.success('Welcome back!')
      } else {
        if (!form.name.trim()) { toast.error('Name is required'); return }
        if (!agreeTerms) { toast.error('You must agree to the Terms & Conditions'); return }
        await signup({ name: form.name, email: form.email, password: form.password, currency: form.currency, country: form.country })
        trackEvent('signup', { method: 'email' })
        toast.success(`Welcome to TripSage, ${form.name}! ✈️`)
      }
      router.push('/plan')
    } catch { /* error handled by store + toast */ }
  }

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'var(--primary)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'var(--accent)' }} />

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <Image
              src="https://res.cloudinary.com/dob5llmb2/image/upload/v1778407506/Primary.JPEG.Logo_1_o0h85v.png"
              alt="TripSage" width={64} height={64} className="rounded-2xl" />
            <h1 className="text-2xl font-bold text-[var(--primary)]">TripSage</h1>
            <p className="text-[var(--text-muted)] text-sm">AI-Powered Travel OS</p>
          </Link>
        </div>

        <div className="card overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-[var(--border)]">
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-all ${
                  mode === m
                    ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-[var(--primary)]/5'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}>
                <div className="flex items-center justify-center gap-2">
                  {m === 'login' ? <Lock size={16} /> : <Rocket size={16} />}
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Full Name</label>
                <input className="input-field" placeholder="Your full name" required autoComplete="name"
                  value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
            )}

            <div>
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Email</label>
              <input className="input-field" type="email" placeholder="you@email.com" required autoComplete="email"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            <div>
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <input className="input-field pr-12" type={showPass ? 'text' : 'password'}
                  placeholder={mode === 'login' ? 'Your password' : 'Min. 6 characters'} required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={form.password} onChange={e => set('password', e.target.value)} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Currency</label>
                    <CurrencySelector value={form.currency} onChange={val => set('currency', val)} />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Country</label>
                    <select className="input-field" value={form.country} onChange={e => set('country', e.target.value)}>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <p className="text-[0.65rem] text-[var(--text-muted)]">
                  All prices will be shown in {form.currency}. You can change this anytime.
                </p>
                <div className="flex items-start gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-[var(--border)] bg-[var(--bg-card)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-[var(--text-muted)] cursor-pointer select-none leading-relaxed">
                    I agree to the <Link href="/terms-and-conditions" className="text-[var(--primary)] hover:underline" target="_blank" onClick={(e) => e.stopPropagation()}>Terms & Conditions</Link>
                  </label>
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'login' ? <Lock size={16} /> : <Rocket size={16} />}
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </span>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {mode === 'login' ? <Lock size={16} /> : <Rocket size={16} />}
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </div>
              )}
            </button>

            {mode === 'login' && (
              <p className="text-center text-xs text-[var(--text-muted)]">
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('signup')}
                  className="text-[var(--primary)] hover:underline font-semibold">
                  Create one free <ArrowRight size={14} className="inline ml-1" />
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-center text-xs text-[var(--text-muted)]">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')}
                  className="text-[var(--primary)] hover:underline font-semibold">
                  Sign in <ArrowRight size={14} className="inline ml-1" />
                </button>
              </p>
            )}
          </form>

          {/* Demo credentials */}
          <div className="px-6 pb-6">
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xs text-[var(--text-muted)] mb-2 flex items-center justify-center gap-2">
                <Target size={14} /> Try the demo — no signup needed
              </p>
              <button
                onClick={() => { set('email', 'demo@tripsage.in'); set('password', 'demo123456'); setMode('login') }}
                className="text-xs text-[var(--primary)] hover:underline font-mono"
              >
                demo@tripsage.in / demo123456
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          By signing up you agree to our{' '}
          <button 
            onClick={() => setActiveLegal({
              title: "Terms & Conditions",
              content: (
                <div className="space-y-4">
                  <p><strong>Effective Date:</strong> 01 April 2026</p>
                  <p>Welcome to TripSage. By accessing or using this platform, you agree to comply with these Terms & Conditions.</p>
                  <p><strong>Service:</strong> TripSage provides AI-powered travel planning, personalized recommendations, and third-party booking links.</p>
                  <div>
                    <p><strong>User Responsibilities:</strong></p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Provide accurate and truthful information when using the platform</li>
                      <li>Do not misuse the platform for any illegal or unauthorized activity</li>
                      <li>Do not attempt to reverse engineer or harm the platform in any way</li>
                    </ul>
                  </div>
                  <p><strong>Third-Party Services:</strong> We are not responsible for bookings, pricing, availability, or services provided by third parties.</p>
                  <p><strong>Liability:</strong> TripSage is not liable for any travel disruptions, losses, damages, or errors arising from use of this platform.</p>
                  <p><strong>Governing Law:</strong> Governed by Indian law under the jurisdiction of Andhra Pradesh.</p>
                  <p><strong>Contact:</strong> <a href="mailto:rana@tripsage.in" className="text-[var(--primary)] hover:underline inline-block cursor-pointer relative z-10">rana@tripsage.in</a></p>
                </div>
              )
            })} 
            className="text-[var(--primary)] cursor-pointer hover:underline font-semibold"
          >
            Terms & Conditions
          </button>
        </p>
      </div>

      <LegalModal 
        isOpen={!!activeLegal} 
        onClose={() => setActiveLegal(null)}
        title={activeLegal?.title || ''}
        content={activeLegal?.content}
      />
    </div>
  )
}
