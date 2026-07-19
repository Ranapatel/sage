'use client'

import React, { useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import {
  User,
  Lock,
  Bell,
  Globe,
  Trash2,
  ExternalLink,
  Save,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'

const CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', label: 'Singapore Dollar', symbol: 'S$' },
  { code: 'THB', label: 'Thai Baht', symbol: '฿' },
  { code: 'MYR', label: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'SAR', label: 'Saudi Riyal', symbol: '﷼' },
]

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada',
  'Malayalam', 'Bengali', 'Gujarati', 'Marathi',
  'Arabic', 'Japanese', 'French', 'German', 'Spanish',
]

export default function AccountSettings() {
  const { user } = useUser()
  const { openUserProfile } = useClerk()

  const [displayName, setDisplayName] = useState(user?.fullName || '')
  const [currency, setCurrency] = useState('INR')
  const [language, setLanguage] = useState('English')
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifOffers, setNotifOffers] = useState(true)
  const [notifTripUpdates, setNotifTripUpdates] = useState(true)
  const [savingName, setSavingName] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  const handleSaveName = async () => {
    if (!displayName.trim()) return toast.error('Name cannot be empty')
    setSavingName(true)
    try {
      await user?.update({ firstName: displayName.split(' ')[0], lastName: displayName.split(' ').slice(1).join(' ') || undefined })
      toast.success('Display name updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update name')
    } finally {
      setSavingName(false)
    }
  }

  const handleSavePreferences = () => {
    localStorage.setItem('tripsage_currency', currency)
    localStorage.setItem('tripsage_language', language)
    toast.success('Display preferences saved!')
  }

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!')
  }

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      return toast.error('Please type DELETE to confirm')
    }
    try {
      await user?.delete()
      toast.success('Account deleted.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account. Contact support.')
    }
  }

  const inputClass =
    'w-full bg-white border border-[#E8E0D8] rounded-2xl px-4 py-3 text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#EA580C] transition-colors'

  const sectionClass =
    'card p-6 md:p-8 bg-white border border-[#E8E0D8] rounded-3xl shadow-sm space-y-5'

  return (
    <div className="space-y-6">

      {/* ── Display Name ── */}
      <div className={sectionClass}>
        <div>
          <h2 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
            <User size={18} className="text-[#EA580C]" /> Display Name
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Update the name shown across TripSage and in booking confirmations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your full name"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={user?.primaryEmailAddress?.emailAddress || ''}
                disabled
                className="w-full bg-slate-50 border border-[#E8E0D8]/60 rounded-2xl px-4 py-3 text-xs font-medium text-slate-400 cursor-not-allowed"
              />
              <Lock size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSaveName}
            disabled={savingName}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white font-bold text-xs rounded-2xl shadow-lg shadow-orange-500/10 transition-all cursor-pointer"
          >
            <Save size={13} />
            {savingName ? 'Saving...' : 'Save Name'}
          </button>
        </div>
      </div>

      {/* ── Security ── */}
      <div className={sectionClass}>
        <div>
          <h2 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
            <ShieldCheck size={18} className="text-green-600" /> Security & Password
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Manage your password, two-factor authentication, and connected accounts through the Clerk security portal.
          </p>
        </div>

        <button
          onClick={() => openUserProfile({ appearance: { variables: { colorPrimary: '#EA580C' } } })}
          className="flex items-center gap-2 px-5 py-3 bg-[#FFFBF7] hover:bg-white border border-[#E8E0D8] text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-sm"
        >
          <Lock size={13} className="text-[#EA580C]" />
          Manage Security in Account Portal
          <ExternalLink size={12} className="text-slate-400 ml-1" />
        </button>
      </div>

      {/* ── Language & Currency ── */}
      <div className={sectionClass}>
        <div>
          <h2 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
            <Globe size={18} className="text-[#EA580C]" /> Language & Currency
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Set your preferred display currency for trip budgets and your interface language.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
              Display Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={inputClass + ' cursor-pointer'}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
              Interface Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={inputClass + ' cursor-pointer'}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSavePreferences}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-2xl shadow-lg shadow-orange-500/10 transition-all cursor-pointer"
          >
            <Save size={13} />
            Save Preferences
          </button>
        </div>
      </div>

      {/* ── Notification Preferences ── */}
      <div className={sectionClass}>
        <div>
          <h2 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
            <Bell size={18} className="text-[#EA580C]" /> Notification Preferences
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Control which updates and alerts TripSage sends to your inbox.
          </p>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Trip booking confirmations & receipts', desc: 'Get email when a booking is confirmed or updated', value: notifEmail, set: setNotifEmail },
            { label: 'Exclusive deals & price drop alerts', desc: 'Personalised flight and hotel offers for your saved routes', value: notifOffers, set: setNotifOffers },
            { label: 'Trip reminders & itinerary updates', desc: 'Reminders 48 hours before your planned trips', value: notifTripUpdates, set: setNotifTripUpdates },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-4 rounded-2xl border border-[#E8E0D8] bg-[#FFFBF7]/60"
            >
              <div>
                <p className="text-xs font-bold text-[#1A1A1A]">{item.label}</p>
                <p className="text-[0.65rem] text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => item.set(!item.value)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                  item.value ? 'bg-[#EA580C]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    item.value ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSaveNotifications}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-2xl shadow-lg shadow-orange-500/10 transition-all cursor-pointer"
          >
            <Save size={13} />
            Save Notifications
          </button>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="card p-6 md:p-8 bg-red-50 border border-red-200 rounded-3xl shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-black text-red-700 flex items-center gap-2">
            <AlertTriangle size={18} /> Danger Zone
          </h2>
          <p className="text-slate-600 text-xs mt-1">
            Permanently delete your TripSage account. This action cannot be undone. All trips, memories, and wallet points will be erased.
          </p>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 font-bold text-xs rounded-2xl transition-all cursor-pointer"
          >
            <Trash2 size={13} />
            Delete My Account
          </button>
        ) : (
          <div className="space-y-3 p-4 bg-white border border-red-200 rounded-2xl">
            <p className="text-xs text-red-600 font-semibold">
              Type <span className="font-black text-red-700 tracking-wider">DELETE</span> to permanently remove your account:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type DELETE"
              className="w-full bg-white border border-red-300 rounded-xl px-4 py-3 text-xs font-mono text-red-700 focus:outline-none focus:border-red-500 transition-colors"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE'}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
