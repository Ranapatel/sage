'use client'

import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/currency'
import { trackEvent } from '@/lib/analytics'

interface Props {
  item: any
}

export default function CarCard({ item }: Props) {
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const displayPrice = formatPrice(item.price, currency)

  const handleBook = () => {
    // Analytics tracking event
    console.log('Event Tracked: car_affiliate_click', { provider: item.name, price: item.price, url: item.bookingLink })
    trackEvent('booking_click', { type: 'car', name: item.name, price: item.price })
  }

  return (
    <div className="card overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/10 p-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        
        {/* Left side: details */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-[var(--text-primary)]">{item.name}</span>
            <span className="text-[0.65rem] bg-[var(--bg-elevated)] px-2 py-0.5 rounded text-[var(--text-muted)] border border-[var(--border)]">
              {item.carType}
            </span>
            <span className="text-[0.65rem] bg-[var(--bg-elevated)] px-2 py-0.5 rounded text-[var(--text-muted)] border border-[var(--border)]">
              {item.capacity}
            </span>
          </div>
          
          <div className="mt-3">
             <span className={`text-[0.6rem] px-1.5 py-0.5 rounded font-semibold ${item.liveStatus === 'Available' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {item.liveStatus}
            </span>
          </div>
          
          {item.offers?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.offers.map((o: string, i: number) => (
                <span key={i} className="badge badge-amber text-[0.65rem]">🏷️ {o}</span>
              ))}
            </div>
          )}
        </div>

        {/* Right side: pricing and CTA */}
        <div className="flex flex-col items-end justify-between min-w-[120px] sm:border-l sm:border-[var(--border)] sm:pl-4">
          <div className="text-right w-full flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
            <span className="text-[0.65rem] text-[var(--text-muted)]">per day</span>
            <div className="text-xl font-black font-mono text-[var(--primary)] leading-tight">{displayPrice}</div>
          </div>
          
          <a
            href={item.bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleBook}
            className="w-full text-center py-2 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white hover:opacity-90 transition-opacity mt-4 sm:mt-0"
          >
            Book Now
          </a>
        </div>
      </div>
    </div>
  )
}
