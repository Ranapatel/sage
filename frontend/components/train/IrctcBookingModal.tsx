'use client'

import React, { useState } from 'react'
import {
  X, ExternalLink, ShieldCheck, Clock, Train, Bus, MapPin,
  CheckCircle2, AlertCircle, Info, Sparkles, ChevronRight, Share2, Copy
} from 'lucide-react'
import {
  SmartTrainRoute, buildIrctcDeepLink, buildOtherTrainBookingLinks, LastMileTransport
} from '@/lib/smartTrainPlanner'
import toast from 'react-hot-toast'

interface IrctcBookingModalProps {
  isOpen: boolean
  onClose: () => void
  route: SmartTrainRoute | null
  dateStr?: string
  passengers?: number
  selectedClass?: string
}

export default function IrctcBookingModal({
  isOpen,
  onClose,
  route,
  dateStr,
  passengers = 1,
  selectedClass = 'SL',
}: IrctcBookingModalProps) {
  const [activeClass, setActiveClass] = useState<string>(selectedClass || 'SL')
  const [quota, setQuota] = useState<string>('GN')

  if (!isOpen || !route) return null

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('IRCTC Booking link copied!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl shadow-2xl overflow-hidden my-8 transition-all">
        
        {/* ── Modal Header ── */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-3 py-1 rounded-full bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles size={13} /> {route.title}
            </span>
            <span className="text-xs text-blue-200 font-semibold">
              AI Confidence: {route.aiConfidenceScore}%
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <span>Complete Journey Details & IRCTC Booking</span>
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-blue-100 font-medium border-t border-blue-800/60 pt-3">
            <span>⏱ Total Duration: <strong className="text-white font-bold">{route.totalDurationStr}</strong></span>
            <span>🔁 Changes: <strong className="text-white font-bold">{route.changesCount}</strong></span>
            <span>💰 Est. Total Cost: <strong className="text-white font-bold">₹{route.totalCostMin.toLocaleString()} - ₹{route.totalCostMax.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* ── Modal Body ── */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* ── Step-By-Step Journey Timeline ── */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Train size={16} className="text-blue-600" />
              Train Itinerary Breakdown
            </h4>

            {route.legs.map((leg, index) => {
              const legIrctcUrl = buildIrctcDeepLink({
                srcStn: leg.fromCode,
                destStn: leg.toCode,
                dateStr: dateStr,
                journeyClass: activeClass,
                quota: quota,
              })

              const otherLinks = buildOtherTrainBookingLinks(leg.fromCode, leg.toCode, dateStr)

              return (
                <div key={leg.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative space-y-4">
                  
                  {/* Leg Title Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {leg.trainName || 'Express Train'} {leg.trainNumber ? `(#${leg.trainNumber})` : ''}
                        </span>
                        <div className="text-xs text-slate-500 font-medium">
                          {leg.fromName} → {leg.toName}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg shrink-0">
                      Duration: {leg.durationStr} ({leg.distanceKm} km)
                    </div>
                  </div>

                  {/* Departure -> Arrival Nodes */}
                  <div className="flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-xl">
                    <div className="text-left">
                      <div className="text-lg font-black text-slate-900 dark:text-white">{leg.departureTime}</div>
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">{leg.fromCode}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{leg.fromName}</div>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-2">
                      <div className="text-[11px] font-bold text-slate-500 mb-1">Direct Leg</div>
                      <div className="w-full flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 bg-white dark:bg-slate-950 shrink-0" />
                        <div className="flex-1 h-[2px] bg-blue-600 relative">
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-blue-600 text-xs font-bold">🚆</span>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900 dark:text-white">{leg.arrivalTime}</div>
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">{leg.toCode}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{leg.toName}</div>
                    </div>
                  </div>

                  {/* IRCTC Leg Action Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      <span>Est. Leg Fare: </span>
                      <strong className="text-slate-900 dark:text-white font-bold">
                        ₹{leg.fares.sleeper ? `${leg.fares.sleeper.min} - ₹${leg.fares.sleeper.max}` : '450 - 900'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(legIrctcUrl)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Copy IRCTC URL"
                      >
                        <Copy size={15} />
                      </button>

                      <a
                        href={legIrctcUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Book Leg {index + 1} on IRCTC</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  {/* Waiting Time Box if transfer exists after this leg */}
                  {route.transfers && route.transfers[index] && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-center gap-3 text-amber-900 dark:text-amber-300 text-xs font-bold">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/80 flex items-center justify-center shrink-0">
                        <Clock size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <span>Waiting Time at {route.transfers[index].stationName} ({route.transfers[index].stationCode}): </span>
                        <strong className="text-amber-700 dark:text-amber-400 font-extrabold text-sm ml-1">
                          {route.transfers[index].waitingTimeStr}
                        </strong>
                      </div>
                    </div>
                  )}

                </div>
              )
            })}

          </div>

          {/* Last Mile Transport Info Box */}
          {route.lastMile && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
                <Bus size={16} className="text-emerald-600" />
                <span>Last-Mile Transport to Destination</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {route.lastMile.fromLocation} → {route.lastMile.toLocation}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {route.lastMile.details}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-3 py-1 rounded-xl">
                    Est. Fare: ₹{route.lastMile.estimatedCostMin} - ₹{route.lastMile.estimatedCostMax}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Official IRCTC Disclaimer & Links Strip ── */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <ShieldCheck size={16} className="text-green-600" />
              <span>Official IRCTC Booking Instructions</span>
            </div>
            <ul className="text-slate-600 dark:text-slate-400 space-y-1 pl-5 list-disc text-[11px]">
              <li>You will be redirected to the official IRCTC portal with origin, destination, date, and quota pre-filled.</li>
              <li>Ensure you login with your registered IRCTC account ID to confirm ticket reservations.</li>
              <li>Carry a valid photo ID proof (Aadhaar, Passport, Driving License) during your train journey.</li>
            </ul>

            {/* Direct IRCTC Master Button */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-medium">
                Direct IRCTC Link (Pre-filled):
              </span>

              <a
                href={buildIrctcDeepLink({
                  srcStn: route.legs[0]?.fromCode || 'HYB',
                  destStn: route.legs[route.legs.length - 1]?.toCode || 'MAO',
                  dateStr: dateStr,
                  journeyClass: activeClass,
                  quota: quota,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Official IRCTC Portal</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Powered by TripSage AI Transport Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}
