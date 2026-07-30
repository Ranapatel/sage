'use client'

import React, { useEffect, useState } from 'react'
import { useTripStore } from '@/store/tripStore'
import { tripAPI, VoucherData } from '@/lib/api'
import { formatPrice } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { Printer, MapPin, Phone } from 'lucide-react'

export default function VoucherPage() {
  const { bookingFlow, setBookingFlowStep } = useTripStore()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const record = bookingFlow.bookingRecord

  const [loading, setLoading] = useState(true)
  const [voucher, setVoucher] = useState<VoucherData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!record?.bookingId) {
      Promise.resolve().then(() => {
        setError('No booking record found to generate voucher.')
        setLoading(false)
      })
      return
    }

    let isMounted = true
    const fetchVoucher = async () => {
      try {
        const response = await tripAPI.getBookingVoucher(record.bookingId)
        if (!isMounted) return

        if (response.success && response.data) {
          setVoucher(response.data)
        } else {
          throw new Error(response.error || 'Failed to fetch voucher data')
        }
      } catch (err: any) {
        if (!isMounted) return
        setError(err.message || 'Failed to fetch voucher data. Please retry.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchVoucher()
    return () => { isMounted = false }
  }, [record])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    if (!voucher) return
    setDownloading(true)
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
    script.onload = () => {
      const element = document.querySelector('.printable-voucher')
      if (element) {
        const opt = {
          margin:       [10, 10, 10, 10],
          filename:     `voucher-${voucher.bookingReference || 'tripsage'}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, logging: false },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }
        // @ts-ignore
        window.html2pdf().from(element).set(opt).save().then(() => {
          setDownloading(false)
        }).catch((err: any) => {
          console.error('[Voucher PDF] Error compiling PDF:', err)
          toast.error('Failed to download PDF. Please use the Print option.')
          setDownloading(false)
        })
      } else {
        setDownloading(false)
      }
    }
    script.onerror = () => {
      toast.error('Could not load PDF library. Please print the voucher instead.')
      setDownloading(false)
    }
    document.body.appendChild(script)
  }

  if (loading) {
    return (
      <div style={{ padding: '50px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '36px', height: '36px',
          border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Generating print-ready voucher...</p>
      </div>
    )
  }

  if (error || !voucher) {
    return (
      <div style={{ padding: '30px 20px', textAlign: 'center', color: '#ef4444' }}>
        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>⚠ {error || 'Voucher generation failed'}</p>
        <button
          onClick={() => setBookingFlowStep('confirmed')}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          ← Return to Confirmation
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Print stylesheet injected dynamically */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-voucher, .printable-voucher * {
            visibility: visible !important;
          }
          .printable-voucher {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #fff !important;
            color: #000 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Action buttons (hidden on print) */}
      <div className="no-print" style={{ display: 'flex', gap: '10px', background: 'var(--bg-card-hover)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <button
          onClick={() => setBookingFlowStep('confirmed')}
          style={{
            flex: 1, padding: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontWeight: 600, fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>

        <button
          onClick={handlePrint}
          style={{
            flex: 1, padding: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontWeight: 600, fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Printer size={15} />
          <span>Print Voucher</span>
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          style={{
            flex: 1, padding: '10px',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700, fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            opacity: downloading ? 0.7 : 1
          }}
        >
          {downloading ? (
            <>
              <div style={{
                width: '12px', height: '12px',
                border: '2px solid #fff', borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Downloading...
            </>
          ) : (
            <>📥 Download PDF</>
          )}
        </button>
      </div>

      {/* Printable Voucher Paper */}
      <div className="printable-voucher" style={{
        background: '#ffffff',
        color: '#1a1a1a',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '30px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Voucher Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', margin: 0 }}>TripSage</h1>
            <p style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', marginTop: '4px' }}>
              Official Booking Voucher
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#dcfce7',
              color: '#15803d',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              {voucher.status}
            </span>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
              Issued: {new Date(voucher.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* References */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #edf2f7' }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Hotelbeds Confirmation Ref</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>{voucher.bookingReference}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>TripSage Client Ref</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>{voucher.clientReference}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px' }}>
          
          {/* Hotel Information */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>
              Hotel Information
            </h2>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{voucher.hotel.name}</h3>
            <p style={{ fontSize: '0.82rem', color: '#334155', margin: '0 0 4px', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} style={{ color: '#64748b' }} />
              <span>{voucher.hotel.address}</span>
            </p>
            {voucher.hotel.phone && (
              <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={13} style={{ color: '#64748b' }} />
                <span>Phone: {voucher.hotel.phone}</span>
              </p>
            )}
          </div>

          {/* Stay & Room Details */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '10px' }}>
              Reservation Details
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Check-In</span>
                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: '2px 0' }}>
                  {new Date(voucher.hotel.checkIn).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>After {voucher.hotel.checkInTime}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Check-Out</span>
                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: '2px 0' }}>
                  {new Date(voucher.hotel.checkOut).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Before {voucher.hotel.checkOutTime}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.82rem', color: '#334155' }}>
              <div>
                <span style={{ color: '#64748b' }}>Room:</span> <strong style={{ color: '#0f172a' }}>{voucher.room.type}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Meal Plan:</span> <strong style={{ color: '#0f172a' }}>{voucher.room.boardType}</strong>
              </div>
            </div>
          </div>

          {/* Guest Details */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>
              Guest Directory
            </h2>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {voucher.guests.map((g, i) => (
                <li key={i}>
                  <strong>{g.name}</strong> ({g.role === 'Lead' ? 'Lead Guest' : 'Adult Guest'})
                </li>
              ))}
            </ul>
          </div>

          {/* Payment & Cancellation details */}
          <div>
            <h2 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>
              Payment & Policy
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Total Paid:</span>
              <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>
                {formatPrice(voucher.totalPaid.amount, currency)}
              </strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
              <strong>Cancellation:</strong> {voucher.cancellationPolicy}
            </p>
          </div>
        </div>

        {/* Check-In Instructions */}
        {voucher.checkInInstructions && voucher.checkInInstructions.length > 0 && (
          <div style={{ background: '#f0f9ff', borderLeft: '4px solid #0284c7', padding: '16px', borderRadius: '0 8px 8px 0', fontSize: '0.78rem', color: '#0369a1', lineHeight: 1.5, marginBottom: '20px' }}>
            <h4 style={{ fontWeight: 700, color: '#0369a1', margin: '0 0 6px', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
              Special Check-In Instructions
            </h4>
            <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {voucher.checkInInstructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Important Disclosures & Rate Comments */}
        {voucher.rateComments && (
          <div style={{ background: '#fffbeb', borderLeft: '4px solid #d97706', padding: '16px', borderRadius: '0 8px 8px 0', fontSize: '0.78rem', color: '#92400e', lineHeight: 1.5 }}>
            <h4 style={{ fontWeight: 700, color: '#92400e', margin: '0 0 6px', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
              Important Disclosures & Rate Comments
            </h4>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {voucher.rateComments}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div style={{ marginTop: '30px', borderTop: '1px dashed #e2e8f0', paddingTop: '16px', textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8' }}>
          This booking is guaranteed via Hotelbeds API integrations. Please contact engineering@tripsage.ai for integration support.
        </div>
      </div>
    </div>
  )
}
