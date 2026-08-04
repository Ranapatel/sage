'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Search, Compass, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function MobileBottomNav() {
  const pathname = usePathname()
  
  const tabs = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/plan', icon: Search },
    { name: 'Explore', href: '/blog', icon: Compass },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <>
      {/* Spacer to prevent content from hiding behind fixed bottom nav */}
      <div className="md:hidden h-[calc(68px+max(0.5rem,env(safe-area-inset-bottom)))] pointer-events-none" />
      
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8E0D8] z-[9999] flex items-center justify-between px-3 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
        style={{ 
          height: 'calc(68px + max(0.5rem, env(safe-area-inset-bottom)))',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))'
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.href === '/' 
            ? pathname === '/' 
            : pathname?.startsWith(tab.href)

          const Icon = tab.icon

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="relative flex-1 min-w-[44px] min-h-[44px] h-full flex flex-col items-center justify-center group active:scale-95 transition-transform"
            >
              <div className="relative flex flex-col items-center justify-center h-full pt-1.5 pb-1">
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 2 : 1.75}
                  className={`transition-colors duration-200 ${isActive ? 'text-[#EA580C]' : 'text-[#6B6B6B] group-hover:text-[#1A1A1A]'}`} 
                />

                <span
                  className={`text-[10px] font-bold mt-1 tracking-tight transition-colors duration-200 ${
                    isActive ? 'text-[#EA580C] font-extrabold' : 'text-[#6B6B6B]'
                  }`}
                >
                  {tab.name}
                </span>

                {/* Active pill indicator */}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavDot"
                    className="absolute top-1 w-1.5 h-1.5 bg-[#EA580C] rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                )}
              </div>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
