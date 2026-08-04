'use client'

import LocationAutocomplete from '@/components/ui/LocationAutocomplete'
import { SYMBOLS } from '@/lib/currency'
import { MapPin, Calendar, Users, Compass, Coins } from 'lucide-react'

const POPULAR_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'JPY', 'AUD', 'CAD', 'SGD', 'THB', 'MYR', 'SAR']

export interface HomeSearchForm {
  from: string
  to: string
  startDate: string
  endDate: string
  budget: string
  travelers: string
  style: string
  currency: string
}

interface Props {
  form: HomeSearchForm
  onChange: (updates: Partial<HomeSearchForm>) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

export default function HeroSearchForm({ form, onChange, onSubmit, loading }: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="plan-card p-4 sm:p-5 md:p-6 w-full text-left shadow-sm"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="From">
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            <LocationAutocomplete
              className="plan-input !pl-9 min-h-[48px]"
              placeholder="Hyderabad, India"
              value={form.from}
              onChange={val => onChange({ from: val })}
            />
          </div>
        </Field>
        <Field label="To">
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            <LocationAutocomplete
              className="plan-input !pl-9 min-h-[48px]"
              placeholder="Bali, Indonesia"
              value={form.to}
              onChange={val => onChange({ to: val })}
            />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Depart">
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none z-10" />
            <input
              className="plan-input !pl-9 min-h-[48px]"
              type="date"
              value={form.startDate}
              onChange={e => onChange({ startDate: e.target.value })}
              required
            />
          </div>
        </Field>
        <Field label="Return">
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none z-10" />
            <input
              className="plan-input !pl-9 min-h-[48px]"
              type="date"
              value={form.endDate}
              onChange={e => onChange({ endDate: e.target.value })}
            />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <Field label="Budget">
          <div className="flex items-center plan-input min-h-[48px] px-2 sm:px-3 gap-1.5 sm:gap-2">
            <Coins size={16} className="text-[#9CA3AF] shrink-0" />
            <select
              className="bg-transparent border-none outline-none text-xs font-semibold text-[#64748B] cursor-pointer"
              value={form.currency}
              onChange={e => onChange({ currency: e.target.value })}
            >
              {POPULAR_CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="text-[#E2E8F0]">|</span>
            <span className="text-sm text-[#9CA3AF] shrink-0">{SYMBOLS[form.currency]}</span>
            <input
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm font-medium text-[#111827] placeholder:text-[#9CA3AF]"
              placeholder="Amount"
              type="number"
              value={form.budget}
              onChange={e => onChange({ budget: e.target.value })}
            />
          </div>
        </Field>
        <Field label="Travelers">
          <div className="relative">
            <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none z-10" />
            <select
              className="plan-input !pl-9 min-h-[48px] appearance-none cursor-pointer"
              value={form.travelers}
              onChange={e => onChange({ travelers: e.target.value })}
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>
              ))}
            </select>
          </div>
        </Field>
        <Field label="Style">
          <div className="relative">
            <Compass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none z-10" />
            <select
              className="plan-input !pl-9 min-h-[48px] appearance-none cursor-pointer"
              value={form.style}
              onChange={e => onChange({ style: e.target.value })}
            >
              {['adventure', 'luxury', 'budget', 'family', 'romantic', 'cultural'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </Field>
      </div>

      <button
        type="submit"
        className="btn-primary w-full min-h-[48px] py-3 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        disabled={loading || !form.from || !form.to || !form.startDate}
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Planning your trip...
          </>
        ) : (
          'Generate Trip Plan'
        )}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-[#64748B] mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}
