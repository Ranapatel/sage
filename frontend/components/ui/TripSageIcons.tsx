'use client'

import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  active?: boolean
  className?: string
}

/**
 * TripSage Apple & Google Level 3D Isometric Custom Icon Suite
 * Designed with multi-stop gradients, 3D depth, isometric perspective, lighting highlights & soft shadows.
 */

// 1. OVERVIEW / DASHBOARD (3D Isometric AI Control Center)
export function Icon3DOverview({ size = 28, active = false, className = '', ...props }: IconProps) {
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
      <defs>
        <linearGradient id="ov_base" x1="8" y1="12" x2="56" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF7A00" />
          <stop offset="100%" stopColor="#E64A19" />
        </linearGradient>
        <linearGradient id="ov_card1" x1="16" y1="18" x2="48" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFE0B2" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="ov_card2" x1="20" y1="32" x2="52" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFCC80" />
          <stop offset="100%" stopColor="#FF6D00" />
        </linearGradient>
        <filter id="ov_shadow" x="0" y="4" width="64" height="58" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#E64A19" floodOpacity="0.3" />
        </filter>
      </defs>
      
      {/* 3D Base Plate */}
      <g filter="url(#ov_shadow)">
        <path d="M32 10L54 22V42L32 54L10 42V22L32 10Z" fill="url(#ov_base)" />
        <path d="M32 10L54 22L32 34L10 22L32 10Z" fill="#FFA726" fillOpacity="0.7" />
        <path d="M32 34V54L54 42V22L32 34Z" fill="#D84315" fillOpacity="0.4" />
      </g>

      {/* Floating 3D Gauge Card */}
      <path d="M18 24L38 14L50 20L30 30L18 24Z" fill="url(#ov_card1)" />
      
      {/* 3D Bar Graph Pillars */}
      <path d="M24 28V36L28 38V30L24 28Z" fill="#FF6D00" />
      <path d="M30 25V38L34 40V27L30 25Z" fill="#FF9100" />
      <path d="M36 21V40L40 42V23L36 21Z" fill="#FFFFFF" />

      {/* AI Glowing Star Sparkle */}
      <path d="M44 14L45.5 18L49.5 19.5L45.5 21L44 25L42.5 21L38.5 19.5L42.5 18L44 14Z" fill="#FFF" />
    </svg>
  )
}

// 2. TRANSPORT / FLIGHTS (3D Isometric Supersonic Jet & Transit)
export function Icon3DTransport({ size = 28, active = false, className = '', ...props }: IconProps) {
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
      <defs>
        <linearGradient id="tr_sky" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="tr_plane" x1="20" y1="12" x2="48" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0F2FE" />
        </linearGradient>
        <linearGradient id="tr_wing" x1="12" y1="28" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <filter id="tr_shadow" x="0" y="4" width="64" height="58" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#0284C7" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Cloud & Vapor Trail */}
      <g filter="url(#tr_shadow)">
        <path d="M12 46C12 46 20 40 32 44C44 48 52 40 52 40" stroke="#7DD3FC" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 4" />
        <ellipse cx="22" cy="46" rx="12" ry="6" fill="#0284C7" fillOpacity="0.3" />
      </g>

      {/* 3D Isometric Airplane Fuselage */}
      <path d="M48 12C50 14 50 18 44 24L30 38C26 42 20 44 16 42L12 40L20 34L34 20L48 12Z" fill="url(#tr_plane)" />
      
      {/* 3D Main Wings */}
      <path d="M32 22L14 26L24 34L38 28L32 22Z" fill="url(#tr_wing)" />
      <path d="M44 16L40 34L44 38L48 24L44 16Z" fill="#0284C7" />

      {/* Tail Fin */}
      <path d="M18 36L12 44L18 42L22 38L18 36Z" fill="#F97316" />

      {/* Cockpit Window */}
      <path d="M44 14C45 15 45 17 43 19L41 17L44 14Z" fill="#0284C7" />
    </svg>
  )
}

// 3. STAY / HOTELS (3D Isometric Luxury Resort & Architecture)
export function Icon3DStay({ size = 28, active = false, className = '', ...props }: IconProps) {
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
      <defs>
        <linearGradient id="st_main" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <linearGradient id="st_side" x1="32" y1="18" x2="52" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="st_glass" x1="16" y1="20" x2="32" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0E7FF" />
          <stop offset="100%" stopColor="#C7D2FE" />
        </linearGradient>
        <filter id="st_shadow" x="0" y="4" width="64" height="58" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#4338CA" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* 3D Base Podium & Pool */}
      <g filter="url(#st_shadow)">
        <path d="M32 10L54 21V43L32 54L10 43V21L32 10Z" fill="url(#st_main)" />
        <path d="M32 10L54 21L32 32L10 21L32 10Z" fill="#A5B4FC" fillOpacity="0.8" />
        <path d="M32 32V54L54 43V21L32 32Z" fill="url(#st_side)" />
      </g>

      {/* 3D Tower Block */}
      <path d="M22 18L32 13L42 18V38L32 43L22 38V18Z" fill="url(#st_glass)" />
      <path d="M32 13L42 18L32 23L22 18L32 13Z" fill="#FFFFFF" />
      <path d="M32 23V43L42 38V18L32 23Z" fill="#818CF8" />

      {/* Hotel Windows Grid */}
      <rect x="25" y="21" width="3" height="4" rx="0.5" fill="#4338CA" />
      <rect x="25" y="27" width="3" height="4" rx="0.5" fill="#4338CA" />
      <rect x="25" y="33" width="3" height="4" rx="0.5" fill="#4338CA" />

      <rect x="35" y="23" width="3" height="4" rx="0.5" fill="#EEF2FF" />
      <rect x="35" y="29" width="3" height="4" rx="0.5" fill="#EEF2FF" />

      {/* Entrance Crown Star */}
      <path d="M32 6L33.5 9L37 9.5L34.5 12L35 15L32 13.5L29 15L29.5 12L27 9.5L30.5 9L32 6Z" fill="#F59E0B" />
    </svg>
  )
}

// 4. ITINERARY / JOURNEY (3D Isometric Folded Map & Waypoint Pin)
export function Icon3DItinerary({ size = 28, active = false, className = '', ...props }: IconProps) {
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
      <defs>
        <linearGradient id="it_emerald" x1="8" y1="12" x2="56" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="it_pin" x1="28" y1="8" x2="48" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
        <filter id="it_shadow" x="0" y="4" width="64" height="58" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#047857" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* 3D Folded Map Base */}
      <g filter="url(#it_shadow)">
        <path d="M12 20L26 14L38 20L52 14V42L38 48L26 42L12 48V20Z" fill="url(#it_emerald)" />
        <path d="M26 14L38 20V48L26 42V14Z" fill="#34D399" fillOpacity="0.4" />
        <path d="M12 20L26 14V42L12 48V20Z" fill="#065F46" fillOpacity="0.3" />
      </g>

      {/* Dotted Trail */}
      <path d="M18 34C22 30 30 38 36 32C40 28 44 26 46 24" stroke="#ECFDF5" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 3" />

      {/* Floating 3D Map Pin */}
      <g filter="url(#it_shadow)">
        <path d="M38 12C32.4772 12 28 16.4772 28 22C28 29.5 38 38 38 38C38 38 48 29.5 48 22C48 16.4772 43.5228 12 38 12Z" fill="url(#it_pin)" />
        <circle cx="38" cy="21" r="4" fill="#FFFFFF" />
      </g>
    </svg>
  )
}

// 5. EXPLORE / DISCOVERY (3D Isometric Hot Air Balloon & Compass)
export function Icon3DExplore({ size = 28, active = false, className = '', ...props }: IconProps) {
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
      <defs>
        <linearGradient id="ex_balloon" x1="16" y1="6" x2="48" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="50%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
        <linearGradient id="ex_stripe" x1="24" y1="6" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF" />
          <stop offset="100%" stopColor="#FFE4E6" />
        </linearGradient>
        <filter id="ex_shadow" x="0" y="4" width="64" height="58" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#E11D48" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Cloud Base */}
      <g filter="url(#ex_shadow)">
        <path d="M14 48C14 44.6863 16.6863 42 20 42C21.2 42 22.3 42.35 23.2 43C24.5 40 27.5 38 31 38C35.4 38 39 41.6 39 46C40.2 46 41.3 46.5 42 47.4C42.9 46.5 44.1 46 45.5 46C48.5 46 51 48.5 51 51.5C51 54.5 48.5 57 45.5 57H20C16.6863 57 14 54.3137 14 51V48Z" fill="#FFF" fillOpacity="0.9" />
      </g>

      {/* 3D Balloon Body */}
      <path d="M32 6C20.9543 6 12 14.9543 12 26C12 33 18 38 24 42H40C46 38 52 33 52 26C52 14.9543 43.0457 6 32 6Z" fill="url(#ex_balloon)" />
      
      {/* Stripes */}
      <path d="M26 7C22 12 20 18 20 26C20 33 24 39 26 41.5V7Z" fill="url(#ex_stripe)" />
      <path d="M38 7C42 12 44 18 44 26C44 33 40 39 38 41.5V7Z" fill="url(#ex_stripe)" />
      
      {/* Woven Basket */}
      <rect x="28" y="46" width="8" height="7" rx="2" fill="#D97706" />
      <line x1="26" y1="42" x2="29" y2="46" stroke="#78350F" strokeWidth="1.5" />
      <line x1="38" y1="42" x2="35" y2="46" stroke="#78350F" strokeWidth="1.5" />

      {/* Shimmering Star */}
      <path d="M50 10L51.5 14L55.5 15.5L51.5 17L50 21L48.5 17L44.5 15.5L48.5 14L50 10Z" fill="#FBBF24" />
    </svg>
  )
}

// 6. MAP / TERRAIN (3D Isometric Interactive Radar Map)
export function Icon3DMap({ size = 28, active = false, className = '', ...props }: IconProps) {
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
      <defs>
        <linearGradient id="mp_base" x1="10" y1="12" x2="54" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <filter id="mp_shadow" x="0" y="4" width="64" height="58" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#6D28D9" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* 3D Isometric Map Platform */}
      <g filter="url(#mp_shadow)">
        <path d="M32 10L54 22V42L32 54L10 42V22L32 10Z" fill="url(#mp_base)" />
        <path d="M32 10L54 22L32 34L10 22L32 10Z" fill="#C4B5FD" fillOpacity="0.7" />
        <path d="M32 34V54L54 42V22L32 34Z" fill="#5B21B6" fillOpacity="0.4" />
      </g>

      {/* Radar Contour Lines */}
      <path d="M22 22L32 17L42 22L32 27L22 22Z" stroke="#DDD6FE" strokeWidth="1.5" fill="none" />
      <path d="M16 25L32 17L48 25L32 33L16 25Z" stroke="#EDE9FE" strokeWidth="1" fill="none" strokeDasharray="3 3" />

      {/* 3D Pin Beacon */}
      <circle cx="32" cy="22" r="5" fill="#F43F5E" />
      <circle cx="32" cy="22" r="2" fill="#FFF" />
      <path d="M32 22V36" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// 7. BOOKINGS / PASSES (3D Isometric Wallet & Boarding Pass)
export function Icon3DBookings({ size = 28, active = false, className = '', ...props }: IconProps) {
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
      <defs>
        <linearGradient id="bk_card" x1="12" y1="12" x2="52" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="bk_pass" x1="18" y1="18" x2="48" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <filter id="bk_shadow" x="0" y="4" width="64" height="58" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#1E293B" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* 3D Base Card */}
      <g filter="url(#bk_shadow)">
        <path d="M12 24C12 20 15 17 19 17H45C49 17 52 20 52 24V44C52 48 49 51 45 51H19C15 51 12 48 12 44V24Z" fill="url(#bk_card)" />
      </g>

      {/* 3D Boarding Pass Outset */}
      <path d="M16 13C16 10.7 17.8 9 20 9H44C46.2 9 48 10.7 48 13V28H16V13Z" fill="url(#bk_pass)" />

      {/* Pass Details */}
      <rect x="20" y="14" width="12" height="3" rx="1.5" fill="#FFF" />
      <rect x="20" y="20" width="20" height="2" rx="1" fill="#E0F2FE" />
      
      {/* Golden Verified Seal */}
      <circle cx="42" cy="38" r="7" fill="#F59E0B" />
      <path d="M39 38L41 40L45 36" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 8. TRAIN SUB-TAB (3D Isometric High-Speed Bullet Train)
export function Icon3DTrain({ size = 26, active = false, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-all duration-300 ${active ? 'scale-110' : ''} ${className}`} {...props}>
      <defs>
        <linearGradient id="tr_body" x1="12" y1="12" x2="52" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <path d="M12 44L20 20C22 14 28 10 36 10H48C52 10 54 14 52 20L44 44H12Z" fill="url(#tr_body)" />
      <path d="M30 16H46L42 26H26L30 16Z" fill="#E1F5FE" />
      <path d="M22 30H38L36 36H20L22 30Z" fill="#A7F3D0" />
      <circle cx="20" cy="48" r="4" fill="#374151" />
      <circle cx="36" cy="48" r="4" fill="#374151" />
      <line x1="8" y1="52" x2="56" y2="52" stroke="#6B7280" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

// 9. BUS SUB-TAB (3D Luxury Coach)
export function Icon3DBus({ size = 26, active = false, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-all duration-300 ${active ? 'scale-110' : ''} ${className}`} {...props}>
      <defs>
        <linearGradient id="bus_grad" x1="12" y1="12" x2="52" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
      </defs>
      <rect x="12" y="14" width="40" height="32" rx="6" fill="url(#bus_grad)" />
      <rect x="16" y="18" width="32" height="12" rx="3" fill="#FFF7ED" />
      <circle cx="22" cy="48" r="5" fill="#1F2937" />
      <circle cx="42" cy="48" r="5" fill="#1F2937" />
      <circle cx="22" cy="48" r="2" fill="#9CA3AF" />
      <circle cx="42" cy="48" r="2" fill="#9CA3AF" />
      <rect x="16" y="38" width="6" height="3" rx="1.5" fill="#FEF08A" />
      <rect x="42" y="38" width="6" height="3" rx="1.5" fill="#FEF08A" />
    </svg>
  )
}

// 10. CAB / CAR SUB-TAB (3D SUV / Executive Car)
export function Icon3DCar({ size = 26, active = false, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-all duration-300 ${active ? 'scale-110' : ''} ${className}`} {...props}>
      <defs>
        <linearGradient id="car_grad" x1="10" y1="16" x2="54" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      <path d="M18 22L24 14H40L46 22H54C56.2 22 58 23.8 58 26V38H6V26C6 23.8 7.8 22 10 22H18Z" fill="url(#car_grad)" />
      <path d="M22 22L26 16H38L42 22H22Z" fill="#EDE9FE" />
      <circle cx="18" cy="40" r="5" fill="#1F2937" />
      <circle cx="46" cy="40" r="5" fill="#1F2937" />
      <circle cx="18" cy="40" r="2" fill="#DDD6FE" />
      <circle cx="46" cy="40" r="2" fill="#DDD6FE" />
    </svg>
  )
}

// 11. SMART ROUTE / MULTI-MODAL HUB
export function Icon3DSmartRoute({ size = 26, active = false, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-all duration-300 ${active ? 'scale-110' : ''} ${className}`} {...props}>
      <defs>
        <linearGradient id="sr_grad" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#BE185D" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="8" fill="url(#sr_grad)" />
      <circle cx="46" cy="18" r="8" fill="#3B82F6" />
      <circle cx="32" cy="46" r="10" fill="#10B981" />
      <path d="M24 22L40 22" stroke="#64748B" strokeWidth="3" strokeDasharray="3 3" />
      <path d="M21 24L28 40" stroke="#64748B" strokeWidth="3" strokeDasharray="3 3" />
      <path d="M43 24L36 40" stroke="#64748B" strokeWidth="3" strokeDasharray="3 3" />
      <circle cx="18" cy="18" r="3" fill="#FFF" />
      <circle cx="46" cy="18" r="3" fill="#FFF" />
      <circle cx="32" cy="46" r="4" fill="#FFF" />
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
