'use client'

import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  active?: boolean
  className?: string
}

/**
 * TripSage MakeMyTrip Level Floating 2.5D Isometric Vector Line Art
 * Clean 3D isometric line art icons featuring 2px dark stroke outlines, side-wall depth, and TripSage duotone fills.
 */

// 1. OVERVIEW / DASHBOARD (30° Isometric AI Summary & Pie Chart Gauge)
export function Icon3DOverview({ size = 38, active = false, className = '', ...props }: IconProps) {
  const primaryFill = active ? '#EA580C' : '#64748B'
  const accentFill = active ? '#FFEDD5' : '#F1F5F9'
  const strokeColor = active ? '#1E293B' : '#475569'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 transform ${active ? 'scale-110 drop-shadow-md' : 'group-hover:scale-105'} ${className}`}
      {...props}
    >
      {/* 30° Isometric Base Console Plate */}
      <path d="M32 12L52 22L32 32L12 22L32 12Z" fill={accentFill} stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M12 22V36L32 46V32L12 22Z" fill="#FFF7ED" stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M52 22V36L32 46V32L52 22Z" fill={primaryFill} stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />

      {/* 2.5D Pie Chart Cutout */}
      <path d="M32 18V28L42 23L32 18Z" fill="#38BDF8" stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M32 28L22 23L27 16L32 28Z" fill="#F59E0B" stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round" />

      {/* Floating AI Sparkle Star */}
      <path d="M46 8L47.5 12L51.5 13.5L47.5 15L46 19L44.5 15L40.5 13.5L44.5 12L46 8Z" fill="#F59E0B" />
    </svg>
  )
}

// 2. TRANSPORT / FLIGHTS (30° Isometric Jet Airliner — MakeMyTrip Flight Icon)
export function Icon3DTransport({ size = 38, active = false, className = '', ...props }: IconProps) {
  const wingFill = active ? '#0284C7' : '#64748B'
  const accentWing = active ? '#EA580C' : '#94A3B8'
  const strokeColor = active ? '#1E293B' : '#475569'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 transform ${active ? 'scale-110 drop-shadow-md' : 'group-hover:scale-105'} ${className}`}
      {...props}
    >
      {/* Vapor Motion Trail Arc */}
      <path d="M12 48C20 44 30 36 44 18" stroke="#BAE6FD" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />

      {/* 30° Isometric Jet Plane Fuselage */}
      <path
        d="M52 14C54 16 53 20 45 27L31 41C26 46 19 48 14 45L10 43L19 36L34 22L52 14Z"
        fill="#FFFFFF"
        stroke={strokeColor}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Isometric Main Wings */}
      <path d="M34 22L12 28L22 37L40 30L34 22Z" fill={wingFill} stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M46 18L40 36L46 41L52 26L46 18Z" fill={accentWing} stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />

      {/* Tail Fin */}
      <path d="M17 38L10 47L18 44L22 40L17 38Z" fill="#F59E0B" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />

      {/* Cockpit Window Glass */}
      <path d="M48 16C49 17 49 19 47 21L45 19L48 16Z" fill="#38BDF8" />
    </svg>
  )
}

// 3. STAY / HOTELS (30° Isometric Resort Hotel — MakeMyTrip Hotel Icon)
export function Icon3DStay({ size = 38, active = false, className = '', ...props }: IconProps) {
  const wallFill = active ? '#EA580C' : '#64748B'
  const roofFill = active ? '#FFEDD5' : '#F1F5F9'
  const strokeColor = active ? '#1E293B' : '#475569'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 transform ${active ? 'scale-110 drop-shadow-md' : 'group-hover:scale-105'} ${className}`}
      {...props}
    >
      {/* Roof Top Peak */}
      <path d="M16 26L32 16L48 26L32 36L16 26Z" fill={roofFill} stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />

      {/* Front Façade (Left Wall) */}
      <path d="M16 26V52L32 62V36L16 26Z" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />

      {/* Side Perspective Wall (Right Wall) */}
      <path d="M48 26V52L32 62V36L48 26Z" fill={wallFill} stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />

      {/* Windows Grid (Front Wall) */}
      <path d="M21 33L27 36.5V42.5L21 39V33Z" fill="#38BDF8" stroke={strokeColor} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M21 44L27 47.5V53.5L21 50V44Z" fill="#38BDF8" stroke={strokeColor} strokeWidth="1.2" strokeLinejoin="round" />

      {/* Windows Grid (Side Wall) */}
      <path d="M37 36.5L43 33V39L37 42.5V36.5Z" fill="#FED7AA" stroke={strokeColor} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M37 47.5L43 44V50L37 53.5V47.5Z" fill="#FED7AA" stroke={strokeColor} strokeWidth="1.2" strokeLinejoin="round" />

      {/* Entrance Canopy */}
      <path d="M28 50.5L32 52.5V62L28 60V50.5Z" fill="#C2410C" stroke={strokeColor} strokeWidth="1.2" strokeLinejoin="round" />

      {/* Roof Star Badge */}
      <path d="M32 8L33.5 11L37 11.5L34.5 14L35 17L32 15.5L29 17L29.5 14L27 11.5L30.5 11L32 8Z" fill="#F59E0B" />
    </svg>
  )
}

// 4. ITINERARY / JOURNEY (30° Isometric Day-by-Day Calendar Schedule Card)
export function Icon3DItinerary({ size = 38, active = false, className = '', ...props }: IconProps) {
  const cardFill = active ? '#10B981' : '#64748B'
  const strokeColor = active ? '#1E293B' : '#475569'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 transform ${active ? 'scale-110 drop-shadow-md' : 'group-hover:scale-105'} ${className}`}
      {...props}
    >
      {/* 30° Isometric Calendar Card */}
      <path d="M16 20L34 10L48 18V46L30 56L16 48V20Z" fill={cardFill} stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M34 10L48 18V46L34 38V10Z" fill="#047857" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 20L34 10L48 18L30 28L16 20Z" fill="#D1FAE5" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />

      {/* Calendar Binder Rings */}
      <path d="M24 12V18" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 16V22" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />

      {/* Day 1 Schedule Badge Overlay */}
      <circle cx="28" cy="38" r="8" fill="#FFFFFF" stroke={strokeColor} strokeWidth="1.8" />
      <path d="M28 34V38L31 40" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 5. EXPLORE / DISCOVERY (30° Isometric Hot Air Balloon — MakeMyTrip Tours Icon)
export function Icon3DExplore({ size = 38, active = false, className = '', ...props }: IconProps) {
  const balloonFill = active ? '#F43F5E' : '#64748B'
  const strokeColor = active ? '#1E293B' : '#475569'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 transform ${active ? 'scale-110 drop-shadow-md' : 'group-hover:scale-105'} ${className}`}
      {...props}
    >
      {/* 30° Isometric Balloon Envelope */}
      <path
        d="M32 8C20.9 8 12 16.9 12 28C12 35 18 40 24 44H40C46 40 52 35 52 28C52 16.9 43.1 8 32 8Z"
        fill={balloonFill}
        stroke={strokeColor}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Isometric Duotone Stripes */}
      <path d="M26 9C22 14 20 20 20 28C20 35 24 41 26 43.5V9Z" fill="#FFFFFF" fillOpacity="0.85" stroke={strokeColor} strokeWidth="1.2" />
      <path d="M38 9C42 14 44 20 44 28C44 35 40 41 38 43.5V9Z" fill="#FFFFFF" fillOpacity="0.85" stroke={strokeColor} strokeWidth="1.2" />

      {/* Woven Basket */}
      <rect x="28" y="48" width="8" height="7" rx="1.5" fill="#F59E0B" stroke={strokeColor} strokeWidth="1.8" />
      <line x1="26" y1="44" x2="29" y2="48" stroke={strokeColor} strokeWidth="1.8" />
      <line x1="38" y1="44" x2="35" y2="48" stroke={strokeColor} strokeWidth="1.8" />

      {/* Sun / Star Accent */}
      <path d="M50 10L51.5 13.5L55 14.5L51.5 16L50 19.5L48.5 16L45 14.5L48.5 13.5L50 10Z" fill="#F59E0B" />
    </svg>
  )
}

// 6. MAP / TERRAIN (30° Isometric Terrain Grid Platform)
export function Icon3DMap({ size = 38, active = false, className = '', ...props }: IconProps) {
  const mapFill = active ? '#8B5CF6' : '#64748B'
  const strokeColor = active ? '#1E293B' : '#475569'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 transform ${active ? 'scale-110 drop-shadow-md' : 'group-hover:scale-105'} ${className}`}
      {...props}
    >
      {/* 30° Isometric Map Platform */}
      <path d="M32 10L54 22V40L32 52L10 40V22L32 10Z" fill={mapFill} stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M32 10L54 22L32 34L10 22L32 10Z" fill="#C4B5FD" opacity="0.6" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
      <path d="M32 34V52L54 40V22L32 34Z" fill="#6D28D9" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />

      {/* Radar Contour Lines */}
      <path d="M22 22L32 17L42 22L32 27L22 22Z" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />

      {/* 3D Pin Beacon */}
      <circle cx="32" cy="22" r="5" fill="#EF4444" stroke={strokeColor} strokeWidth="1.8" />
      <circle cx="32" cy="22" r="2" fill="#FFFFFF" />
      <path d="M32 22V36" stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  )
}

// 7. BOOKINGS / PASSES (30° Isometric Passport & Boarding Pass)
export function Icon3DBookings({ size = 38, active = false, className = '', ...props }: IconProps) {
  const ticketFill = active ? '#0EA5E9' : '#64748B'
  const strokeColor = active ? '#1E293B' : '#475569'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 transform ${active ? 'scale-110 drop-shadow-md' : 'group-hover:scale-105'} ${className}`}
      {...props}
    >
      {/* 30° Isometric Pass Cover */}
      <path d="M16 22L34 12L48 19V45L30 55L16 48V22Z" fill="#1E293B" stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M34 12L48 19V45L34 38V12Z" fill="#334155" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />

      {/* Boarding Pass Insert Page */}
      <path d="M22 17L38 9L48 14V28L32 36L22 31V17Z" fill={ticketFill} stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />

      {/* Golden Globe Emblem */}
      <circle cx="28" cy="36" r="5" fill="#F59E0B" stroke={strokeColor} strokeWidth="1.2" />
      <path d="M25 36H31" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  )
}

// 8. TRAIN SUB-TAB (30° Isometric Locomotive)
export function Icon3DTrain({ size = 26, active = false, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-all duration-300 ${active ? 'scale-105' : ''} ${className}`} {...props}>
      <path d="M14 42L22 18L44 14L50 36L38 48H14V42Z" fill="#10B981" stroke="#1E293B" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M28 18H44L40 28H24L28 18Z" fill="#E1F5FE" stroke="#1E293B" strokeWidth="1.5" />
      <circle cx="22" cy="46" r="4" fill="#1E293B" />
      <circle cx="38" cy="46" r="4" fill="#1E293B" />
    </svg>
  )
}

// 9. BUS SUB-TAB (30° Isometric Coach)
export function Icon3DBus({ size = 26, active = false, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-all duration-300 ${active ? 'scale-105' : ''} ${className}`} {...props}>
      <path d="M14 20L34 10L50 18V44L30 54L14 46V20Z" fill="#EA580C" stroke="#1E293B" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M34 10L50 18V44L34 36V10Z" fill="#C2410C" stroke="#1E293B" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M18 24L30 18V28L18 34V24Z" fill="#FFEDD5" stroke="#1E293B" strokeWidth="1.2" />
      <circle cx="22" cy="48" r="4" fill="#1E293B" />
      <circle cx="42" cy="48" r="4" fill="#1E293B" />
    </svg>
  )
}

// 10. CAB / CAR SUB-TAB (30° Isometric Sedan)
export function Icon3DCar({ size = 26, active = false, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-all duration-300 ${active ? 'scale-105' : ''} ${className}`} {...props}>
      <path d="M16 28L26 18H42L50 28V42H16V28Z" fill="#8B5CF6" stroke="#1E293B" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M22 28L26 20H38L42 28H22Z" fill="#EDE9FE" stroke="#1E293B" strokeWidth="1.5" />
      <circle cx="22" cy="42" r="4" fill="#1E293B" />
      <circle cx="44" cy="42" r="4" fill="#1E293B" />
    </svg>
  )
}

// 11. SMART ROUTE / MULTI-MODAL HUB
export function Icon3DSmartRoute({ size = 26, active = false, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-all duration-300 ${active ? 'scale-105' : ''} ${className}`} {...props}>
      <path d="M32 12L52 22L32 32L12 22L32 12Z" fill="#DB2777" stroke="#1E293B" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="24" cy="22" r="4" fill="#FFFFFF" />
      <circle cx="40" cy="22" r="4" fill="#FFFFFF" />
      <circle cx="32" cy="42" r="6" fill="#F59E0B" stroke="#1E293B" strokeWidth="1.8" />
    </svg>
  )
}

// Export Map for easy lookup by Tab ID
export const IconMapById: Record<string, React.FC<IconProps>> = {
  overview: Icon3DOverview,
  transport: Icon3DTransport,
  hotels: Icon3DStay,
  itinerary: Icon3DItinerary,
  explore: Icon3DExplore,
  map: Icon3DMap,
  bookings: Icon3DBookings,
}
