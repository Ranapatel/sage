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

// 4. ITINERARY / JOURNEY (30° Isometric Open Travel Journal Agenda & Timeline)
export function Icon3DItinerary({ size = 38, active = false, className = '', ...props }: IconProps) {
  const primaryFill = active ? '#10B981' : '#64748B'
  const headerFill = active ? '#059669' : '#475569'
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
      {/* 3D Isometric Base Book Depth */}
      <path d="M12 28V48L32 58L52 48V28L32 38L12 28Z" fill={headerFill} stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M32 38V58L52 48V28L32 38Z" fill={primaryFill} stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />

      {/* Left Page (White Isometric Canvas) */}
      <path d="M12 24L32 14V34L12 44V24Z" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />

      {/* Right Page (Light Tint Canvas) */}
      <path d="M32 14L52 24V44L32 34V14Z" fill={active ? '#ECFDF5' : '#F8FAFC'} stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />

      {/* Calendar Header Band across top of pages */}
      <path d="M12 24L32 14L52 24L32 29L12 24Z" fill={active ? '#EA580C' : '#94A3B8'} stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />

      {/* Top Binding Spiral Rings */}
      <path d="M19 18V23" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <path d="M32 11V16" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <path d="M45 18V23" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />

      {/* Left Page: Itinerary Day Schedule Checklist Lines */}
      <line x1="17" y1="31" x2="27" y2="26" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      <line x1="17" y1="36" x2="25" y2="32" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="17" y1="41" x2="27" y2="36" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />

      {/* Right Page: Route Timeline Path (A -> B -> C) */}
      <path d="M36 30C39 27 41 33 46 29" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
      <circle cx="36" cy="30" r="2" fill="#EA580C" />
      <circle cx="46" cy="29" r="2.5" fill="#38BDF8" stroke={strokeColor} strokeWidth="1" />

      {/* Floating 3D Clock Badge */}
      <circle cx="46" cy="42" r="7" fill="#F59E0B" stroke={strokeColor} strokeWidth="1.8" />
      <path d="M46 38V42L49 44" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 5. EXPLORE / DISCOVERY (30° Isometric Brass & Sky Blue Navigational Compass)
export function Icon3DExplore({ size = 38, active = false, className = '', ...props }: IconProps) {
  const primaryFill = active ? '#0284C7' : '#64748B'
  const bezelFill = active ? '#F59E0B' : '#94A3B8'
  const needleFill = active ? '#EA580C' : '#CBD5E1'
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
      {/* 3D Isometric Compass Outer Cylinder Side Wall */}
      <path d="M12 28C12 37.9 20.9 46 32 46C43.1 46 52 37.9 52 28V36C52 45.9 43.1 54 32 54C20.9 54 12 45.9 12 36V28Z" fill={primaryFill} stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />

      {/* Outer Golden Bezel Ring (Top Rim) */}
      <ellipse cx="32" cy="28" rx="20" ry="12" fill={bezelFill} stroke={strokeColor} strokeWidth="2.2" />

      {/* Inner Compass Glass Dial Face */}
      <ellipse cx="32" cy="28" rx="16" ry="9.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="1.8" />

      {/* Compass Dial Ticks / Cardinal Points */}
      <line x1="32" y1="19.5" x2="32" y2="21.5" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="34.5" x2="32" y2="36.5" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="28" x2="19" y2="28" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="45" y1="28" x2="47" y2="28" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />

      {/* 3D Dynamic Compass Needle (North = Orange, South = Dark Slate) */}
      <path d="M32 28L37 21L32 16L32 28Z" fill={needleFill} stroke={strokeColor} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M32 28L27 21L32 16L32 28Z" fill="#FFEDD5" stroke={strokeColor} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M32 28L37 35L32 40L32 28Z" fill="#64748B" stroke={strokeColor} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M32 28L27 35L32 40L32 28Z" fill="#94A3B8" stroke={strokeColor} strokeWidth="1.2" strokeLinejoin="round" />

      {/* Center Pivot Pin */}
      <circle cx="32" cy="28" r="2.5" fill="#F59E0B" stroke={strokeColor} strokeWidth="1.2" />

      {/* Floating 3D Sparkle Star (Exploration / AI Discovery) */}
      <path d="M48 8L49.5 12L53.5 13.5L49.5 15L48 19L46.5 15L42.5 13.5L46.5 12L48 8Z" fill="#F59E0B" />
      <path d="M16 10L17 12.5L19.5 13.5L17 14.5L16 17L15 14.5L12.5 13.5L15 12.5L16 10Z" fill="#38BDF8" />
    </svg>
  )
}

// 6. MAP / TERRAIN (30° Isometric Folded Travel Map & Standing Pin Beacon)
export function Icon3DMap({ size = 38, active = false, className = '', ...props }: IconProps) {
  const mapFill1 = active ? '#8B5CF6' : '#64748B'
  const mapFill2 = active ? '#A78BFA' : '#94A3B8'
  const mapFill3 = active ? '#C4B5FD' : '#CBD5E1'
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
      {/* 3D Map Base Thickness Walls (Paper Depth) */}
      <path d="M10 38V44L24 52V46L10 38Z" fill="#5B21B6" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M24 46V52L38 42V36L24 46Z" fill="#6D28D9" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M38 36V42L54 48V42L38 36Z" fill="#7C3AED" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />

      {/* Tri-Fold Map Panel 1 (Left Panel) */}
      <path d="M10 22L24 30V46L10 38V22Z" fill={mapFill1} stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />

      {/* Tri-Fold Map Panel 2 (Center Panel) */}
      <path d="M24 30L38 20V36L24 46V30Z" fill={mapFill2} stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />

      {/* Tri-Fold Map Panel 3 (Right Panel) */}
      <path d="M38 20L54 26V42L38 36V20Z" fill={mapFill3} stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />

      {/* Topographic Route Line across map panels */}
      <path d="M14 30C18 34 20 38 28 34C34 31 42 32 48 34" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="2.5 2.5" />

      {/* Target Ripple Ellipse under the main Pin */}
      <ellipse cx="33" cy="31" rx="6" ry="3" fill="#F43F5E" fillOpacity="0.3" stroke="#F43F5E" strokeWidth="1" />

      {/* 3D Standing Location Pin Beacon */}
      <path
        d="M33 12C28.5 12 25 15.5 25 20C25 25.5 33 33 33 33C33 33 41 25.5 41 20C41 15.5 37.5 12 33 12Z"
        fill="#EF4444"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Inner Pin White Dot */}
      <circle cx="33" cy="19" r="3" fill="#FFFFFF" stroke={strokeColor} strokeWidth="1" />
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

// 8. TRAIN SUB-TAB (High-Speed Bullet Train Locomotive)
export function Icon3DTrain({ size = 26, active = false, className = '', ...props }: IconProps) {
  const primaryColor = active ? '#10B981' : '#64748B'
  const accentColor = active ? '#059669' : '#475569'
  const windowFill = active ? '#BAE6FD' : '#E2E8F0'
  const strokeColor = active ? '#1E293B' : '#334155'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${active ? 'scale-105' : ''} ${className}`}
      {...props}
    >
      {/* Railway Track Base */}
      <line x1="6" y1="52" x2="58" y2="52" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
      <line x1="14" y1="52" x2="14" y2="56" stroke="#CBD5E1" strokeWidth="2.5" />
      <line x1="28" y1="52" x2="28" y2="56" stroke="#CBD5E1" strokeWidth="2.5" />
      <line x1="42" y1="52" x2="42" y2="56" stroke="#CBD5E1" strokeWidth="2.5" />

      {/* Aerodynamic Bullet Train Body */}
      <path
        d="M8 22H38C48 22 56 28 58 38V48H8V22Z"
        fill={primaryColor}
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Roof Cap */}
      <path d="M8 22H36C44 22 50 25 52 30H8V22Z" fill="#FFFFFF" stroke={strokeColor} strokeWidth="1.8" />

      {/* Speed Stripe */}
      <path d="M8 40H58V48H8V40Z" fill={accentColor} stroke={strokeColor} strokeWidth="1.8" />

      {/* Front Windshield Glass */}
      <path d="M42 26C48 26 53 30 55 36H42V26Z" fill="#38BDF8" stroke={strokeColor} strokeWidth="1.5" />

      {/* Passenger Windows Row */}
      <rect x="12" y="28" width="7" height="6" rx="1.5" fill={windowFill} stroke={strokeColor} strokeWidth="1.2" />
      <rect x="22" y="28" width="7" height="6" rx="1.5" fill={windowFill} stroke={strokeColor} strokeWidth="1.2" />
      <rect x="32" y="28" width="7" height="6" rx="1.5" fill={windowFill} stroke={strokeColor} strokeWidth="1.2" />

      {/* Wheels & Headlight */}
      <circle cx="16" cy="48" r="3" fill="#1E293B" />
      <circle cx="36" cy="48" r="3" fill="#1E293B" />
      <circle cx="54" cy="42" r="2.5" fill="#F59E0B" stroke={strokeColor} strokeWidth="1" />
    </svg>
  )
}

// 9. BUS SUB-TAB (Luxury Intercity Volvo Express Coach)
export function Icon3DBus({ size = 26, active = false, className = '', ...props }: IconProps) {
  const primaryColor = active ? '#EA580C' : '#64748B'
  const roofColor = active ? '#FFEDD5' : '#F1F5F9'
  const windowFill = active ? '#FEF3C7' : '#E2E8F0'
  const strokeColor = active ? '#1E293B' : '#334155'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${active ? 'scale-105' : ''} ${className}`}
      {...props}
    >
      {/* Main Coach Body */}
      <rect x="8" y="14" width="48" height="34" rx="6" fill={primaryColor} stroke={strokeColor} strokeWidth="2.5" />

      {/* Upper Roof Cap */}
      <path d="M12 14H52C54 14 55 16 55 18H9C9 16 10 14 12 14Z" fill={roofColor} stroke={strokeColor} strokeWidth="1.8" />

      {/* Large Front & Side Windows */}
      <rect x="12" y="20" width="10" height="10" rx="2" fill={windowFill} stroke={strokeColor} strokeWidth="1.5" />
      <rect x="25" y="20" width="10" height="10" rx="2" fill={windowFill} stroke={strokeColor} strokeWidth="1.5" />
      <rect x="38" y="20" width="14" height="10" rx="2" fill="#38BDF8" stroke={strokeColor} strokeWidth="1.5" />

      {/* Lower Accent Stripe */}
      <rect x="8" y="34" width="48" height="4" fill="#C2410C" stroke={strokeColor} strokeWidth="1.2" />

      {/* Front Headlight */}
      <circle cx="53" cy="42" r="2.5" fill="#F59E0B" stroke={strokeColor} strokeWidth="1" />

      {/* Dual 3D Wheels */}
      <circle cx="18" cy="48" r="5" fill="#1E293B" stroke={strokeColor} strokeWidth="2" />
      <circle cx="18" cy="48" r="2" fill="#94A3B8" />

      <circle cx="44" cy="48" r="5" fill="#1E293B" stroke={strokeColor} strokeWidth="2" />
      <circle cx="44" cy="48" r="2" fill="#94A3B8" />
    </svg>
  )
}

// 10. CAB / CAR SUB-TAB (Sleek Executive SUV / Rental Sedan)
export function Icon3DCar({ size = 26, active = false, className = '', ...props }: IconProps) {
  const primaryColor = active ? '#8B5CF6' : '#64748B'
  const roofColor = active ? '#EDE9FE' : '#F1F5F9'
  const strokeColor = active ? '#1E293B' : '#334155'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${active ? 'scale-105' : ''} ${className}`}
      {...props}
    >
      {/* Car Cabin Roof & Pillars */}
      <path d="M18 24L26 14H42L52 24H18Z" fill={roofColor} stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />

      {/* Main Body Shell (Hood, Bumper, Sides) */}
      <path d="M6 32C6 28 9 24 14 24H50C55 24 58 28 58 32V42H6V32Z" fill={primaryColor} stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" />

      {/* Windshield & Side Windows */}
      <path d="M21 22L27 16H35V22H21Z" fill="#BAE6FD" stroke={strokeColor} strokeWidth="1.2" />
      <path d="M38 16H44L49 22H38V16Z" fill="#38BDF8" stroke={strokeColor} strokeWidth="1.2" />

      {/* Front Headlight */}
      <circle cx="54" cy="32" r="2.5" fill="#F59E0B" stroke={strokeColor} strokeWidth="1" />

      {/* Rear Taillight */}
      <rect x="6" y="30" width="3" height="5" rx="1" fill="#EF4444" />

      {/* Dual Wheels with Chrome Hubcaps */}
      <circle cx="18" cy="42" r="6" fill="#1E293B" stroke={strokeColor} strokeWidth="2" />
      <circle cx="18" cy="42" r="2.5" fill="#E2E8F0" />

      <circle cx="46" cy="42" r="6" fill="#1E293B" stroke={strokeColor} strokeWidth="2" />
      <circle cx="46" cy="42" r="2.5" fill="#E2E8F0" />
    </svg>
  )
}

// 11. SMART ROUTE / MULTI-MODAL HUB (3D Intersecting Node Plate)
export function Icon3DSmartRoute({ size = 26, active = false, className = '', ...props }: IconProps) {
  const primaryColor = active ? '#EC4899' : '#64748B'
  const strokeColor = active ? '#1E293B' : '#334155'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${active ? 'scale-105' : ''} ${className}`}
      {...props}
    >
      {/* 3D Base Diamond Node Plate */}
      <path d="M32 10L56 22L32 34L8 22L32 10Z" fill={active ? '#FCE7F3' : '#F1F5F9'} stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M8 22V30L32 42V34L8 22Z" fill={primaryColor} stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
      <path d="M56 22V30L32 42V34L56 22Z" fill={active ? '#DB2777' : '#475569'} stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />

      {/* Transit Route Nodes */}
      <path d="M18 22L32 27L46 20" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 2" />
      <circle cx="18" cy="22" r="4" fill="#0284C7" stroke={strokeColor} strokeWidth="1.5" />
      <circle cx="32" cy="27" r="4" fill="#10B981" stroke={strokeColor} strokeWidth="1.5" />
      <circle cx="46" cy="20" r="4" fill="#EA580C" stroke={strokeColor} strokeWidth="1.5" />

      {/* Standing Location Pin Star */}
      <path d="M32 6L33.5 10L38 10.5L34.5 13L35.5 17.5L32 15L28.5 17.5L29.5 13L26 10.5L30.5 10L32 6Z" fill="#F59E0B" stroke={strokeColor} strokeWidth="1" />
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
