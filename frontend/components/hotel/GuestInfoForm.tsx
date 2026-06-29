'use client'

import React, { useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'

interface Guest {
  firstName: string
  lastName: string
}

interface ContactInfo {
  email: string
  phone: string
}

interface Props {
  rooms?: number
  rateType?: string
  onSubmit: (data: {
    holder: { firstName: string; lastName: string }
    guests: Guest[]
    contact: ContactInfo
  }) => void
  onBack?: () => void
}

function FieldGroup({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '2px' }}>
          ⚠ {error}
        </span>
      )}
    </div>
  )
}

function TextInput({
  id, value, onChange, placeholder, type = 'text', maxLength = 80
}: {
  id: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; maxLength?: number
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{
        width: '100%', padding: '10px 14px',
        background: 'var(--bg-input, rgba(255,255,255,0.05))',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        color: 'var(--text-primary)',
        fontSize: '0.88rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
      }}
      onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
    />
  )
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: '14px',
      border: '1px solid var(--border)', padding: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>{title}</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {children}
      </div>
    </div>
  )
}

export default function GuestInfoForm({ rooms = 1, rateType = 'BOOKABLE', onSubmit, onBack }: Props) {
  const { user } = useAuthStore()

  const [holder, setHolder] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName:  user?.name?.split(' ').slice(1).join(' ') || '',
  })
  const [guests, setGuests] = useState<Guest[]>(
    Array.from({ length: Math.max(0, rooms - 1) }, () => ({ firstName: '', lastName: '' }))
  )
  const [contact, setContact] = useState<ContactInfo>({
    email: user?.email || '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const validate = useCallback(() => {
    const errs: Record<string, string> = {}
    if (!holder.firstName.trim()) errs['holder.firstName'] = 'First name required'
    if (!holder.lastName.trim())  errs['holder.lastName']  = 'Last name required'
    if (!contact.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      errs['contact.email'] = 'Valid email required'
    }
    if (!contact.phone.trim()) {
      errs['contact.phone'] = 'Phone number required'
    } else if (!/^\+?[\d\s\-().]{6,20}$/.test(contact.phone)) {
      errs['contact.phone'] = 'Invalid phone format'
    }
    guests.forEach((g, i) => {
      if (!g.firstName.trim()) errs[`guest.${i}.firstName`] = 'First name required'
      if (!g.lastName.trim())  errs[`guest.${i}.lastName`]  = 'Last name required'
    })
    return errs
  }, [holder, contact, guests])

  const handleSubmit = () => {
    setSubmitted(true)
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onSubmit({ holder, guests, contact })
  }

  const updateGuest = (index: number, field: keyof Guest, value: string) => {
    setGuests(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Lead Guest ──────────────────────────────────────────────────────── */}
      <SectionCard title="Lead Guest" icon="👤">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldGroup label="First Name" error={submitted ? errors['holder.firstName'] : undefined}>
            <TextInput
              id="holder-firstName"
              value={holder.firstName}
              onChange={v => setHolder(prev => ({ ...prev, firstName: v }))}
              placeholder="John"
            />
          </FieldGroup>
          <FieldGroup label="Last Name" error={submitted ? errors['holder.lastName'] : undefined}>
            <TextInput
              id="holder-lastName"
              value={holder.lastName}
              onChange={v => setHolder(prev => ({ ...prev, lastName: v }))}
              placeholder="Doe"
            />
          </FieldGroup>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '-4px' }}>
          ℹ️ Name must match your photo ID / passport exactly.
        </p>
      </SectionCard>

      {/* ── Additional Guests ───────────────────────────────────────────────── */}
      {guests.length > 0 && guests.map((g, i) => (
        <SectionCard key={i} title={`Guest ${i + 2}`} icon="🧳">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FieldGroup label="First Name" error={submitted ? errors[`guest.${i}.firstName`] : undefined}>
              <TextInput
                id={`guest-${i}-firstName`}
                value={g.firstName}
                onChange={v => updateGuest(i, 'firstName', v)}
                placeholder="Jane"
              />
            </FieldGroup>
            <FieldGroup label="Last Name" error={submitted ? errors[`guest.${i}.lastName`] : undefined}>
              <TextInput
                id={`guest-${i}-lastName`}
                value={g.lastName}
                onChange={v => updateGuest(i, 'lastName', v)}
                placeholder="Doe"
              />
            </FieldGroup>
          </div>
        </SectionCard>
      ))}

      {/* ── Contact Information ─────────────────────────────────────────────── */}
      <SectionCard title="Contact Information" icon="📧">
        <FieldGroup label="Email Address" error={submitted ? errors['contact.email'] : undefined}>
          <TextInput
            id="contact-email"
            type="email"
            value={contact.email}
            onChange={v => setContact(prev => ({ ...prev, email: v }))}
            placeholder="john.doe@example.com"
            maxLength={120}
          />
        </FieldGroup>
        <FieldGroup label="Phone Number" error={submitted ? errors['contact.phone'] : undefined}>
          <TextInput
            id="contact-phone"
            type="tel"
            value={contact.phone}
            onChange={v => setContact(prev => ({ ...prev, phone: v }))}
            placeholder="+91 98765 43210"
            maxLength={25}
          />
        </FieldGroup>
      </SectionCard>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              flex: 1, padding: '14px',
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
        )}
        <button
          id="guest-form-submit"
          onClick={handleSubmit}
          className="hotel-cta"
          style={{ flex: 3 }}
        >
          {rateType === 'RECHECK' ? 'Continue to Rate Verification →' : 'Confirm & Book Room →'}
        </button>
      </div>
    </div>
  )
}
