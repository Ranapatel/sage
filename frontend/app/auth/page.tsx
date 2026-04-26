'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'
import { SYMBOLS } from '@/lib/currency'
import { trackEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'] as const
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'UAE', 'Germany', 'France', 'Singapore', 'Australia', 'Japan']

export default function AuthPage() {
  const router = useRouter()
  const { login, signup, isLoggedIn, loading, error, clearError } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPass, setShowPass] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    currency: 'INR', country: 'India',
  })

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
        toast.success('Welcome back! 🎉')
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
              src="https://res.cloudinary.com/dob5llmb2/image/upload/v1774999435/LOGO_xbwcwe.png"
              alt="TripSage" width={64} height={64} className="rounded-2xl" unoptimized />
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
                {m === 'login' ? '🔑 Sign In' : '🚀 Create Account'}
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
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Currency</label>
                    <select className="input-field" value={form.currency} onChange={e => set('currency', e.target.value)}>
                      {CURRENCIES.map(c => (
                        <option key={c} value={c}>{SYMBOLS[c]} {c}</option>
                      ))}
                    </select>
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
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : mode === 'login' ? '🔑 Sign In' : '🚀 Create Account'}
            </button>

            {mode === 'login' && (
              <p className="text-center text-xs text-[var(--text-muted)]">
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('signup')}
                  className="text-[var(--primary)] hover:underline font-semibold">
                  Create one free →
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-center text-xs text-[var(--text-muted)]">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')}
                  className="text-[var(--primary)] hover:underline font-semibold">
                  Sign in →
                </button>
              </p>
            )}
          </form>

          {/* Demo credentials */}
          <div className="px-6 pb-6">
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xs text-[var(--text-muted)] mb-2">🎯 Try the demo — no signup needed</p>
              <button
                onClick={() => { set('email', 'demo@tripsage.ai'); set('password', 'demo123456'); setMode('login') }}
                className="text-xs text-[var(--primary)] hover:underline font-mono"
              >
                demo@tripsage.ai / demo123456
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          By signing up you agree to our{' '}
          <Link href="/terms-and-conditions" className="text-[var(--primary)] cursor-pointer hover:underline">Terms & Conditions</Link>
        </p>
      </div>
    </div>
  )
}
