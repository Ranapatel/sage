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

  // Hide on desktop (md:hidden)
  return (
    <>
      {/* Spacer to prevent content from hiding behind the fixed navbar */}
      <div className="md:hidden h-[calc(64px+env(safe-area-inset-bottom))]" />
      
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E7E5E4] z-[9999] flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
        style={{ 
          height: 'calc(64px + env(safe-area-inset-bottom))',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        {tabs.map((tab) => {
          // Exact match for Home, prefix match for others (e.g. /plan/something matches Search)
          const isActive = tab.href === '/' 
            ? pathname === '/' 
            : pathname?.startsWith(tab.href)

          const Icon = tab.icon

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="relative flex flex-col items-center justify-center w-16 h-full"
            >
              <div className="relative flex flex-col items-center justify-center h-full pt-1">
                <Icon 
                  size={20} 
                  strokeWidth={1.5}
                  className={`transition-colors duration-300 ${isActive ? 'text-[#1C1917]' : 'text-[#57534E]'}`} 
                />

                {/* Active Label with Spring Animation */}
                {isActive && (
                  <motion.span
                    layoutId="mobileNavLabel"
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="text-[10px] font-bold text-[#1C1917] mt-1 whitespace-nowrap absolute -bottom-1"
                  >
                    {tab.name}
                  </motion.span>
                )}
                
                {/* Visual indicator dot for active state (optional, adds polish) */}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavDot"
                    className="absolute -top-3 w-1 h-1 bg-[#1C1917] rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
