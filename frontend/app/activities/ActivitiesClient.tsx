'use client'

import { useState, useCallback } from 'react'
import Script from 'next/script'
import { v4 as uuidv4 } from 'uuid'
import { Compass, Loader2, AlertCircle, SearchX } from 'lucide-react'

import ActivitySearchForm      from '@/components/activities/ActivitySearchForm'
import ActivityCard            from '@/components/activities/ActivityCard'
import ActivityDetailPanel     from '@/components/activities/ActivityDetailPanel'
import ActivityBookingFlow     from '@/components/activities/ActivityBookingFlow'

import { activitiesAPI }      from '@/lib/activitiesApi'
import type {
  Activity, ActivitySearchParams, ActivitySearchResult,
  ActivityDetailsResult, ActivityModality, ReconfirmResult,
} from '@/types/activities'

type ViewState = 'search' | 'results' | 'details' | 'booking' | 'complete'

export default function ActivitiesClient() {
  const [view, setView]                           = useState<ViewState>('search')
  const [searchParams, setSearchParams]           = useState<ActivitySearchParams | null>(null)
  const [searchResult, setSearchResult]           = useState<ActivitySearchResult | null>(null)
  const [searchLoading, setSearchLoading]         = useState(false)
  const [searchError, setSearchError]             = useState<string | null>(null)

  const [selectedActivity, setSelectedActivity]   = useState<Activity | null>(null)
  const [detailsResult, setDetailsResult]         = useState<ActivityDetailsResult | null>(null)
  const [detailsLoading, setDetailsLoading]       = useState(false)
  const [detailsError, setDetailsError]           = useState<string | null>(null)

  // Stable booking ID per detail fetch (rateKey namespace)
  const [detailsBookingId, setDetailsBookingId]   = useState<string>('')
  const [selectedModality, setSelectedModality]   = useState<ActivityModality | null>(null)

  const [confirmedBooking, setConfirmedBooking]   = useState<ReconfirmResult | null>(null)

  // ── Search ─────────────────────────────────────────────────────────────────

  const handleSearch = useCallback(async (params: ActivitySearchParams) => {
    setSearchLoading(true)
    setSearchError(null)
    setSearchResult(null)
    setSearchParams(params)
    try {
      const res = await activitiesAPI.search(params)
      if (!res.success) throw new Error((res as any).error || 'Search failed')
      setSearchResult(res.data)
      setView('results')
    } catch (err: any) {
      setSearchError(err.message)
    } finally {
      setSearchLoading(false)
    }
  }, [])

  // ── Activity selected → fetch details ──────────────────────────────────────

  const handleSelectActivity = useCallback(async (activity: Activity) => {
    setSelectedActivity(activity)
    setDetailsResult(null)
    setDetailsError(null)
    setDetailsLoading(true)
    setView('details')

    const bid = uuidv4()
    setDetailsBookingId(bid)

    try {
      const paxes = searchParams?.paxes || [{ age: 30, type: 'ADULT' as const }]
      const res = await activitiesAPI.getDetails(bid, {
        activityCode: activity.activityCode,
        fromDate:     searchParams?.fromDate || new Date().toISOString().split('T')[0],
        toDate:       searchParams?.toDate   || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        language:     'en',
        paxes,
      })
      if (!res.success) throw new Error((res as any).error || 'Details fetch failed')
      setDetailsResult(res.data)
    } catch (err: any) {
      setDetailsError(err.message)
    } finally {
      setDetailsLoading(false)
    }
  }, [searchParams])

  // ── Proceed to booking ─────────────────────────────────────────────────────

  const handleProceedToBooking = useCallback((modality: ActivityModality) => {
    setSelectedModality(modality)
    setView('booking')
  }, [])

  // ── Booking complete ───────────────────────────────────────────────────────

  const handleBookingComplete = useCallback((booking: ReconfirmResult) => {
    setConfirmedBooking(booking)
    setView('complete')
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Load Razorpay SDK once */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="activities-page">
        {/* Hero */}
        <header className="activities-hero">
          <div className="activities-hero__inner">
            <div className="activities-hero__badge">
              <Compass size={16} />
              Powered by Hotelbeds
            </div>
            <h1 className="activities-hero__title">
              Experiences That<br />
              <span className="activities-hero__title-accent">Move You</span>
            </h1>
            <p className="activities-hero__sub">
              Book tours, adventures &amp; cultural experiences with real-time availability and instant confirmation.
            </p>
          </div>
        </header>

        {/* Search form — always visible */}
        <div className="activities-search-wrap">
          <ActivitySearchForm onSearch={handleSearch} loading={searchLoading} />
        </div>

        {/* Loading */}
        {searchLoading && (
          <div className="activities-loading">
            <Loader2 size={36} className="spin" />
            <p>Searching activities…</p>
          </div>
        )}

        {/* Search error */}
        {searchError && !searchLoading && (
          <div className="activities-error">
            <AlertCircle size={20} />
            <p>{searchError}</p>
            <button onClick={() => setSearchError(null)}>Dismiss</button>
          </div>
        )}

        {/* Results grid */}
        {view === 'results' && searchResult && !searchLoading && (
          <section className="activities-results">
            <div className="activities-results__header">
              <h2 className="activities-results__count">
                {searchResult.total.toLocaleString()} activities found
              </h2>
              {searchParams?.destinationCode && (
                <span className="activities-results__dest">in {searchParams.destinationCode}</span>
              )}
            </div>

            {searchResult.activities.length === 0 ? (
              <div className="activities-empty">
                <SearchX size={48} className="activities-empty__icon" />
                <p>No activities found for your search.</p>
                <p className="activities-empty__hint">Try different dates, a broader destination code, or remove filters.</p>
              </div>
            ) : (
              <div className="activities-grid">
                {searchResult.activities.map(activity => (
                  <ActivityCard
                    key={activity.activityCode}
                    activity={activity}
                    onSelect={handleSelectActivity}
                    fromDate={searchParams?.fromDate || ''}
                    toDate={searchParams?.toDate     || ''}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Detail panel */}
        {view === 'details' && selectedActivity && (
          <ActivityDetailPanel
            activity={selectedActivity}
            details={detailsResult}
            loading={detailsLoading}
            error={detailsError}
            onProceed={(modality) => handleProceedToBooking(modality)}
            onClose={() => setView('results')}
          />
        )}

        {/* Booking flow */}
        {view === 'booking' && selectedActivity && detailsResult && (
          <div className="activities-booking-wrap">
            <ActivityBookingFlow
              activity={selectedActivity}
              detailsResult={detailsResult}
              selectedModality={selectedModality}
              fromDate={searchParams?.fromDate || ''}
              toDate={searchParams?.toDate     || ''}
              onComplete={handleBookingComplete}
              onBack={() => setView('details')}
            />
          </div>
        )}

        {/* Complete */}
        {view === 'complete' && confirmedBooking && (
          <div className="activities-complete">
            <div className="activities-complete__card">
              <div className="activities-complete__check">✓</div>
              <h2>Booking Confirmed!</h2>
              <p>Reference: <strong>{confirmedBooking.hotelbedsReference || 'See email'}</strong></p>
              {confirmedBooking.voucherUrl && (
                <a href={confirmedBooking.voucherUrl} target="_blank" rel="noopener noreferrer" className="activities-complete__voucher">
                  Download Voucher
                </a>
              )}
              <button
                className="activities-complete__new-search"
                onClick={() => { setView('search'); setConfirmedBooking(null) }}
              >
                Search More Activities
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
