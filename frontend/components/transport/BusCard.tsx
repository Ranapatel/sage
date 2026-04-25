'use client'

import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/currency'

interface Props {
  item: any
}

export default function BusCard({ item }: Props) {
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const displayPrice = formatPrice(item.price, currency)

  const handleBook = () => {
    // Analytics tracking event
    console.log('Event Tracked: bus_affiliate_click', { operator: item.name, price: item.price, url: item.bookingLink })
  }

  return (
    <div className="card overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/10 p-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        
        {/* Left side: details */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-[var(--text-primary)]">{item.name}</span>
            <span className="text-[0.65rem] bg-[var(--bg-elevated)] px-2 py-0.5 rounded text-[var(--text-muted)] border border-[var(--border)]">
              {item.busType}
            </span>
            <span className={`text-[0.6rem] px-1.5 py-0.5 rounded font-semibold ${item.liveStatus === 'Available' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {item.liveStatus}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mt-3">
            <div className="flex flex-col">
              <span className="font-bold text-[var(--text-primary)]">{item.departure}</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-[0.65rem]">{item.duration}</span>
              <div className="w-full h-px bg-[var(--border)] relative my-1">
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-[var(--bg-card)] px-1 text-[10px]">🚌</div>
              </div>
            </div>
            <div className="flex flex-col text-right">
              <span className="font-bold text-[var(--text-primary)]">{item.arrival}</span>
            </div>
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
            <span className="text-[0.65rem] text-[var(--text-muted)]">per person</span>
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
