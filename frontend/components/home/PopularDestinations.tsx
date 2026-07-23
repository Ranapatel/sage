'use client'

import { getOptimizedImageUrl } from '@/lib/imageUtils'

const DESTINATIONS = [
  {
    name: 'Goa, India',
    city: 'Goa',
    country: 'India',
    img: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80',
    link: '/seo/goa-trip-under-10000',
  },
  {
    name: 'Bali, Indonesia',
    city: 'Bali',
    country: 'Indonesia',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
    link: '/seo/budget-bali-trip',
  },
  {
    name: 'Dubai, UAE',
    city: 'Dubai',
    country: 'UAE',
    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    link: '',
  },
  {
    name: 'Singapore',
    city: 'Singapore',
    country: 'Singapore',
    img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80',
    link: '',
  },
]

interface Props {
  onSelect: (destination: string) => void
  isMobile?: boolean
}

export default function PopularDestinations({ onSelect, isMobile = false }: Props) {
  return (
    <section id="destinations" className="py-16 px-4 sm:px-6 bg-[#FAFAFA] border-t border-[#E2E8F0]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold text-[#111827] mb-6">Popular destinations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DESTINATIONS.map(d => (
            <button
              key={d.name}
              type="button"
              onClick={() => onSelect(d.name)}
              className="group text-left rounded-2xl border border-[#E8E0D8] bg-white overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FED7AA]"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={getOptimizedImageUrl(d.img, isMobile)}
                  alt={d.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-[#111827]">{d.city}</p>
                <p className="text-xs text-[#6B7280]">{d.country}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
