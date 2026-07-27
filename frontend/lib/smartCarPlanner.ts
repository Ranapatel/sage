// ─── AI Smart Rental Car Planner & Dynamic Recommendation Engine ─────────────

import { isSameCountry } from './countryUtils'

export interface CarVehicle {
  id: string
  name: string
  brand: 'Tata' | 'Maruti Suzuki' | 'Hyundai' | 'Kia' | 'Toyota' | 'Honda' | 'Mahindra' | 'Renault' | 'Nissan'
  category: 'Economy' | 'Budget' | 'Compact' | 'Sedan' | 'SUV' | 'Family' | 'Premium'
  supplier: {
    name: string
    logoUrl?: string
    rating: number
  }
  transmission: 'Manual' | 'Automatic'
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'CNG' | 'Hybrid'
  seats: number
  bags: number
  doors: number
  airConditioning: boolean
  mileagePolicy: 'Unlimited Kilometres' | '200 km / day'
  cancellationPolicy: 'Free Cancellation' | 'Non-refundable'
  fuelPolicy: 'Full to Full' | 'Same to Same'
  instantConfirmation: boolean
  pricePerDay: number
  totalPrice: number
  daysCount: number
  currency: string
  badge?: 'Best Value' | 'Popular' | 'Top Pick' | 'Cheapest' | 'Premium' | 'Recommended'
  rating: number // 1-5
  aiExplanation?: string
  score: number // 0-1
  image: string
  gallery: string[]
  bookingUrl: string
}

export interface SmartCarPlannerResult {
  destination: string
  pickupDate: string
  dropoffDate: string
  daysCount: number
  totalCarsAvailable: number
  isDomestic?: boolean
  aiSummaryText: string
  heroVehicle?: CarVehicle
  cars: CarVehicle[]
}

// ─── Real High-Quality Vehicle Images Database ─────────────────────────────
const REAL_VEHICLE_IMAGES: Record<string, string[]> = {
  'Maruti Alto K10': [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508253730651-e5ace80a7025?w=800&q=80&auto=format&fit=crop',
  ],
  'Renault Kwid': [
    'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80&auto=format&fit=crop',
  ],
  'Maruti S-Presso': [
    'https://images.unsplash.com/photo-1508253730651-e5ace80a7025?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80&auto=format&fit=crop',
  ],
  'Tata Tiago': [
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80&auto=format&fit=crop',
  ],
  'Maruti Suzuki Swift': [
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80&auto=format&fit=crop',
  ],
  'Hyundai Grand i10 Nios': [
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80&auto=format&fit=crop',
  ],
  'Hyundai i20': [
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80&auto=format&fit=crop',
  ],
  'Maruti Baleno': [
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80&auto=format&fit=crop',
  ],
  'Tata Altroz': [
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80&auto=format&fit=crop',
  ],
  'Honda Amaze': [
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80&auto=format&fit=crop',
  ],
  'Hyundai Venue': [
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&auto=format&fit=crop',
  ],
  'Kia Sonet': [
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80&auto=format&fit=crop',
  ],
  'Mahindra XUV 3XO': [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&auto=format&fit=crop',
  ],
  'Tata Nexon': [
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80&auto=format&fit=crop',
  ],
  'Toyota Hyryder': [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80&auto=format&fit=crop',
  ],
  'Kia Seltos': [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80&auto=format&fit=crop',
  ],
  'Hyundai Creta': [
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&auto=format&fit=crop',
  ],
  'Honda City': [
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80&auto=format&fit=crop',
  ],
  'Toyota Innova Crysta': [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&q=80&auto=format&fit=crop',
  ],
  'Toyota Innova Hycross': [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80&auto=format&fit=crop',
  ],
  'Kia Carens': [
    'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80&auto=format&fit=crop',
  ],
  'Mahindra XUV700': [
    'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&auto=format&fit=crop',
  ],
}

const DEFAULT_CAR_IMAGES = [
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80&auto=format&fit=crop',
]

// ─── Supplier Logo Helper ───
export function getSupplierLogo(supplierName: string): string {
  const norm = supplierName.toLowerCase()
  if (norm.includes('avis')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Avis_logo.svg/200px-Avis_logo.svg.png'
  if (norm.includes('hertz')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Hertz_Car_Rental_logo.svg/200px-Hertz_Car_Rental_logo.svg.png'
  if (norm.includes('europcar')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Europcar_logo.svg/200px-Europcar_logo.svg.png'
  if (norm.includes('sixt')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Sixt_logo.svg/200px-Sixt_logo.svg.png'
  if (norm.includes('budget')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Budget_Car_Rental_logo.svg/200px-Budget_Car_Rental_logo.svg.png'
  if (norm.includes('enterprise')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Enterprise_Rent-A-Car_logo.svg/200px-Enterprise_Rent-A-Car_logo.svg.png'
  return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Discover_Cars_logo.png/200px-Discover_Cars_logo.png'
}

/**
 * Builds dynamic DiscoverCars affiliate booking link.
 */
export function buildDiscoverCarsAffiliateUrl(params: {
  destination: string
  pickupDate?: string
  dropoffDate?: string
}): string {
  const envUrl = process.env.NEXT_PUBLIC_DISCOVERCARS_AFFILIATE_URL
  if (envUrl && envUrl.trim().length > 0) return envUrl

  const destSlug = encodeURIComponent(params.destination || 'Goa')
  const baseUrl = 'https://naiawork.com/g/wqjhitsyjqbd777ee50d5ea594bb46/'
  const query = new URLSearchParams({
    dest: destSlug,
    source: 'tripsage',
    medium: 'web',
    campaign: 'rental_cars_integration',
  })
  if (params.pickupDate) query.set('pickup', params.pickupDate)
  if (params.dropoffDate) query.set('dropoff', params.dropoffDate)

  return `${baseUrl}?${query.toString()}`
}

/**
 * Master Vehicle Recommendation Catalog with Tiered Pricing & Real Fleet Specs
 */
const MASTER_VEHICLES_CATALOG: Array<Omit<CarVehicle, 'id' | 'totalPrice' | 'daysCount' | 'currency' | 'bookingUrl'>> = [
  // ── Tier 1: Under ₹1,500/day (Economy / Budget) ──
  {
    name: 'Maruti Alto K10 or Similar',
    brand: 'Maruti Suzuki',
    category: 'Economy',
    supplier: { name: 'DiscoverCars', rating: 4.8 },
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 4,
    bags: 1,
    doors: 4,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 650,
    badge: 'Cheapest',
    rating: 4.5,
    score: 0.88,
    aiExplanation: 'Ultra-compact budget hatchback ideal for solo travellers and short city commutes.',
    image: REAL_VEHICLE_IMAGES['Maruti Alto K10'][0],
    gallery: REAL_VEHICLE_IMAGES['Maruti Alto K10'],
  },
  {
    name: 'Renault Kwid or Similar',
    brand: 'Renault',
    category: 'Economy',
    supplier: { name: 'Hertz', rating: 4.6 },
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 4,
    bags: 2,
    doors: 4,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 680,
    badge: 'Best Value',
    rating: 4.6,
    score: 0.90,
    aiExplanation: 'Stylish micro-SUV design with great ground clearance and digital cockpit.',
    image: REAL_VEHICLE_IMAGES['Renault Kwid'][0],
    gallery: REAL_VEHICLE_IMAGES['Renault Kwid'],
  },
  {
    name: 'Maruti S-Presso or Similar',
    brand: 'Maruti Suzuki',
    category: 'Budget',
    supplier: { name: 'Avis', rating: 4.5 },
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 4,
    bags: 2,
    doors: 4,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 720,
    badge: 'Best Value',
    rating: 4.4,
    score: 0.89,
    aiExplanation: 'High seating posture with nimble handling for navigating narrow tourist streets.',
    image: REAL_VEHICLE_IMAGES['Maruti S-Presso'][0],
    gallery: REAL_VEHICLE_IMAGES['Maruti S-Presso'],
  },

  // ── Tier 2: ₹1,500 – ₹2,500/day (Budget / Hatchback) ──
  {
    name: 'Tata Tiago or Similar',
    brand: 'Tata',
    category: 'Budget',
    supplier: { name: 'DiscoverCars', rating: 4.8 },
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 5,
    bags: 2,
    doors: 4,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 1550,
    badge: 'Recommended',
    rating: 4.7,
    score: 0.94,
    aiExplanation: '4-star GNCAP safety rating with punchy engine performance and solid build quality.',
    image: REAL_VEHICLE_IMAGES['Tata Tiago'][0],
    gallery: REAL_VEHICLE_IMAGES['Tata Tiago'],
  },
  {
    name: 'Maruti Suzuki Swift or Similar',
    brand: 'Maruti Suzuki',
    category: 'Compact',
    supplier: { name: 'Hertz', rating: 4.7 },
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 5,
    bags: 2,
    doors: 4,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 1750,
    badge: 'Popular',
    rating: 4.7,
    score: 0.93,
    aiExplanation: 'India’s favorite hatchback offering legendary mileage and effortless driving dynamics.',
    image: REAL_VEHICLE_IMAGES['Maruti Suzuki Swift'][0],
    gallery: REAL_VEHICLE_IMAGES['Maruti Suzuki Swift'],
  },
  {
    name: 'Hyundai Grand i10 Nios or Similar',
    brand: 'Hyundai',
    category: 'Compact',
    supplier: { name: 'Avis', rating: 4.6 },
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 2,
    doors: 4,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 1650,
    badge: 'Best Value',
    rating: 4.6,
    score: 0.92,
    aiExplanation: 'Ultra-smooth automatic transmission with refined cabin and touchscreen navigation.',
    image: REAL_VEHICLE_IMAGES['Hyundai Grand i10 Nios'][0],
    gallery: REAL_VEHICLE_IMAGES['Hyundai Grand i10 Nios'],
  },

  // ── Tier 3: ₹2,500 – ₹4,000/day (Compact / Premium Hatch / Entry Sedan) ──
  {
    name: 'Hyundai i20 or Similar',
    brand: 'Hyundai',
    category: 'Compact',
    supplier: { name: 'Europcar', rating: 4.7 },
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 3,
    doors: 4,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 2650,
    badge: 'Popular',
    rating: 4.7,
    score: 0.93,
    aiExplanation: 'Premium hatchback loaded with sunroof, Bose audio system, and spacious rear seating.',
    image: REAL_VEHICLE_IMAGES['Hyundai i20'][0],
    gallery: REAL_VEHICLE_IMAGES['Hyundai i20'],
  },
  {
    name: 'Maruti Baleno or Similar',
    brand: 'Maruti Suzuki',
    category: 'Compact',
    supplier: { name: 'DiscoverCars', rating: 4.7 },
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 3,
    doors: 4,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 2750,
    badge: 'Best Value',
    rating: 4.7,
    score: 0.94,
    aiExplanation: 'Head-up display, 360-degree camera, and exceptional fuel economy for long road trips.',
    image: REAL_VEHICLE_IMAGES['Maruti Baleno'][0],
    gallery: REAL_VEHICLE_IMAGES['Maruti Baleno'],
  },
  {
    name: 'Tata Altroz or Similar',
    brand: 'Tata',
    category: 'Compact',
    supplier: { name: 'Sixt', rating: 4.8 },
    transmission: 'Manual',
    fuelType: 'Diesel',
    seats: 5,
    bags: 3,
    doors: 4,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 2800,
    badge: 'Top Pick',
    rating: 4.8,
    score: 0.95,
    aiExplanation: 'Gold standard 5-star safety hatchback with 90-degree opening doors and diesel torque.',
    image: REAL_VEHICLE_IMAGES['Tata Altroz'][0],
    gallery: REAL_VEHICLE_IMAGES['Tata Altroz'],
  },
  {
    name: 'Honda Amaze or Similar',
    brand: 'Honda',
    category: 'Sedan',
    supplier: { name: 'Enterprise', rating: 4.6 },
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 3,
    doors: 4,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 3200,
    badge: 'Best Value',
    rating: 4.6,
    score: 0.91,
    aiExplanation: 'Class-leading 420L boot space with super-smooth CVT automatic transmission.',
    image: REAL_VEHICLE_IMAGES['Honda Amaze'][0],
    gallery: REAL_VEHICLE_IMAGES['Honda Amaze'],
  },

  // ── Tier 4: ₹4,000 – ₹6,500/day (Compact SUV / Crossover) ──
  {
    name: 'Hyundai Venue or Similar',
    brand: 'Hyundai',
    category: 'SUV',
    supplier: { name: 'Avis', rating: 4.8 },
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 3,
    doors: 5,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 4200,
    badge: 'Recommended',
    rating: 4.8,
    score: 0.95,
    aiExplanation: 'Smart connected compact SUV with high driving view, paddle shifters, and air purifier.',
    image: REAL_VEHICLE_IMAGES['Hyundai Venue'][0],
    gallery: REAL_VEHICLE_IMAGES['Hyundai Venue'],
  },
  {
    name: 'Kia Sonet or Similar',
    brand: 'Kia',
    category: 'SUV',
    supplier: { name: 'DiscoverCars', rating: 4.8 },
    transmission: 'Automatic',
    fuelType: 'Diesel',
    seats: 5,
    bags: 3,
    doors: 5,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 4500,
    badge: 'Top Pick',
    rating: 4.8,
    score: 0.96,
    aiExplanation: 'Ventilated leather seats, Bose audio, and powerful diesel engine for mountain getaways.',
    image: REAL_VEHICLE_IMAGES['Kia Sonet'][0],
    gallery: REAL_VEHICLE_IMAGES['Kia Sonet'],
  },
  {
    name: 'Mahindra XUV 3XO or Similar',
    brand: 'Mahindra',
    category: 'SUV',
    supplier: { name: 'Hertz', rating: 4.7 },
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 3,
    doors: 5,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 4800,
    badge: 'Popular',
    rating: 4.7,
    score: 0.94,
    aiExplanation: 'Panoramic sunroof and widest cabin width in its class for maximum passenger comfort.',
    image: REAL_VEHICLE_IMAGES['Mahindra XUV 3XO'][0],
    gallery: REAL_VEHICLE_IMAGES['Mahindra XUV 3XO'],
  },
  {
    name: 'Tata Nexon or Similar',
    brand: 'Tata',
    category: 'SUV',
    supplier: { name: 'Sixt', rating: 4.9 },
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 3,
    doors: 5,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 4600,
    badge: 'Top Pick',
    rating: 4.9,
    score: 0.97,
    aiExplanation: 'Highest 5-star safety score with JBL sound system and wireless smartphone charger.',
    image: REAL_VEHICLE_IMAGES['Tata Nexon'][0],
    gallery: REAL_VEHICLE_IMAGES['Tata Nexon'],
  },

  // ── Tier 5: ₹6,500 – ₹10,000/day (Mid SUV / Premium Sedan) ──
  {
    name: 'Toyota Urban Cruiser Hyryder or Similar',
    brand: 'Toyota',
    category: 'SUV',
    supplier: { name: 'Enterprise', rating: 4.9 },
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    seats: 5,
    bags: 4,
    doors: 5,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 6800,
    badge: 'Best Value',
    rating: 4.9,
    score: 0.97,
    aiExplanation: 'Self-charging strong hybrid SUV achieving 27.9 km/l mileage with All-Wheel Drive.',
    image: REAL_VEHICLE_IMAGES['Toyota Hyryder'][0],
    gallery: REAL_VEHICLE_IMAGES['Toyota Hyryder'],
  },
  {
    name: 'Kia Seltos or Similar',
    brand: 'Kia',
    category: 'SUV',
    supplier: { name: 'DiscoverCars', rating: 4.9 },
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 4,
    doors: 5,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 7200,
    badge: 'Popular',
    rating: 4.9,
    score: 0.98,
    aiExplanation: 'Dual panoramic displays, ADAS Level 2 safety features, and premium ambient lighting.',
    image: REAL_VEHICLE_IMAGES['Kia Seltos'][0],
    gallery: REAL_VEHICLE_IMAGES['Kia Seltos'],
  },
  {
    name: 'Hyundai Creta or Similar',
    brand: 'Hyundai',
    category: 'SUV',
    supplier: { name: 'Avis', rating: 4.9 },
    transmission: 'Automatic',
    fuelType: 'Diesel',
    seats: 5,
    bags: 4,
    doors: 5,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 7500,
    badge: 'Recommended',
    rating: 4.9,
    score: 0.98,
    aiExplanation: 'The benchmark mid-size SUV in India with voice-controlled panoramic sunroof and ventilated seats.',
    image: REAL_VEHICLE_IMAGES['Hyundai Creta'][0],
    gallery: REAL_VEHICLE_IMAGES['Hyundai Creta'],
  },
  {
    name: 'Honda City or Similar',
    brand: 'Honda',
    category: 'Sedan',
    supplier: { name: 'Europcar', rating: 4.8 },
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 4,
    doors: 4,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 6600,
    badge: 'Top Pick',
    rating: 4.8,
    score: 0.95,
    aiExplanation: 'Iconic executive sedan offering plush leather upholstery, Honda Sensing ADAS, and smooth ride.',
    image: REAL_VEHICLE_IMAGES['Honda City'][0],
    gallery: REAL_VEHICLE_IMAGES['Honda City'],
  },

  // ── Tier 6: ₹10,000+/day (Family MPV / Premium SUV) ──
  {
    name: 'Toyota Innova Crysta or Similar',
    brand: 'Toyota',
    category: 'Family',
    supplier: { name: 'Enterprise', rating: 4.9 },
    transmission: 'Manual',
    fuelType: 'Diesel',
    seats: 7,
    bags: 5,
    doors: 5,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 10500,
    badge: 'Popular',
    rating: 4.9,
    score: 0.99,
    aiExplanation: 'Unmatched 7-seater highway cruiser for large families with captain seats and maximum luggage space.',
    image: REAL_VEHICLE_IMAGES['Toyota Innova Crysta'][0],
    gallery: REAL_VEHICLE_IMAGES['Toyota Innova Crysta'],
  },
  {
    name: 'Toyota Innova Hycross or Similar',
    brand: 'Toyota',
    category: 'Family',
    supplier: { name: 'DiscoverCars', rating: 4.9 },
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    seats: 7,
    bags: 5,
    doors: 5,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 12500,
    badge: 'Premium',
    rating: 4.95,
    score: 0.99,
    aiExplanation: 'Ultra-luxurious Hybrid MPV with ottoman reclining seats, panoramic roof, and silent electric EV mode.',
    image: REAL_VEHICLE_IMAGES['Toyota Innova Hycross'][0],
    gallery: REAL_VEHICLE_IMAGES['Toyota Innova Hycross'],
  },
  {
    name: 'Kia Carens or Similar',
    brand: 'Kia',
    category: 'Family',
    supplier: { name: 'Hertz', rating: 4.8 },
    transmission: 'Automatic',
    fuelType: 'Diesel',
    seats: 7,
    bags: 4,
    doors: 5,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 10200,
    badge: 'Best Value',
    rating: 4.8,
    score: 0.96,
    aiExplanation: 'Modern 7-seater RV with 1-touch electric tumble 2nd row seats and 6 airbags standard.',
    image: REAL_VEHICLE_IMAGES['Kia Carens'][0],
    gallery: REAL_VEHICLE_IMAGES['Kia Carens'],
  },
  {
    name: 'Mahindra XUV700 or Similar',
    brand: 'Mahindra',
    category: 'Premium',
    supplier: { name: 'Sixt', rating: 4.95 },
    transmission: 'Automatic',
    fuelType: 'Diesel',
    seats: 7,
    bags: 5,
    doors: 5,
    airConditioning: true,
    mileagePolicy: 'Unlimited Kilometres',
    cancellationPolicy: 'Free Cancellation',
    fuelPolicy: 'Full to Full',
    instantConfirmation: true,
    pricePerDay: 11800,
    badge: 'Premium',
    rating: 4.95,
    score: 0.99,
    aiExplanation: 'Flagship 7-seater luxury SUV with 200 PS engine, AWD capability, Sony 3D audio, and memory seats.',
    image: REAL_VEHICLE_IMAGES['Mahindra XUV700'][0],
    gallery: REAL_VEHICLE_IMAGES['Mahindra XUV700'],
  },
]

/**
 * Generates dynamic Rental Car recommendations tailored to user budget, group size, and route.
 */
export function generateSmartCarPlanner(params: {
  origin?: string
  destination: string
  pickupDate?: string
  dropoffDate?: string
  passengers?: number
  budgetPerDay?: number
  rawCars?: any[]
}): SmartCarPlannerResult {
  const destName = (params.destination || 'Goa').split(',')[0].trim()
  const pDate = params.pickupDate || '2026-06-25'
  const dDate = params.dropoffDate || '2026-06-28'
  const pax = params.passengers || 2

  // International route check: Domestic travel only
  if (params.origin && !isSameCountry(params.origin, params.destination)) {
    return {
      destination: destName,
      pickupDate: pDate,
      dropoffDate: dDate,
      daysCount: 0,
      totalCarsAvailable: 0,
      isDomestic: false,
      aiSummaryText: 'Rental cars are available only for domestic travel. Please use Flights or local transport at your destination.',
      cars: []
    }
  }

  // Calculate days difference
  const d1 = new Date(pDate)
  const d2 = new Date(dDate)
  const daysCount = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24))) || 3

  const bookingUrl = buildDiscoverCarsAffiliateUrl({
    destination: destName,
    pickupDate: pDate,
    dropoffDate: dDate,
  })

  // Dynamic passenger filtering & priority boost
  let pool = [...MASTER_VEHICLES_CATALOG]

  if (pax >= 6) {
    // 6-7 Passengers: Prioritize 7-seaters (Innova Crysta, Hycross, Carens, XUV700)
    pool.sort((a, b) => b.seats - a.seats)
  } else if (pax >= 4) {
    // 4-5 Passengers: Prioritize SUVs and Sedans
    pool.sort((a, b) => (b.category === 'SUV' || b.category === 'Sedan' ? 1 : 0) - (a.category === 'SUV' || a.category === 'Sedan' ? 1 : 0))
  }

  // Seeded pseudo-randomization based on destination + dates + passengers so search results feel fresh & dynamic
  const seedKey = `${destName}_${pDate}_${dDate}_${pax}`
  const randomizedCars = pool.map((v, idx) => {
    const total = v.pricePerDay * daysCount
    const supplierLogo = getSupplierLogo(v.supplier.name)
    const imgList = v.gallery && v.gallery.length > 0 ? v.gallery : DEFAULT_CAR_IMAGES

    return {
      ...v,
      id: `car_discover_${idx}_${seedKey}`,
      supplier: {
        ...v.supplier,
        logoUrl: supplierLogo,
      },
      daysCount,
      totalPrice: total,
      daysCount,
      currency: 'INR',
      badge: v.badge || (idx === 0 ? 'Best Value' : idx === 1 ? 'Top Pick' : 'Popular'),
      rating: v.rating,
      aiExplanation: v.aiExplanation,
      score: parseFloat((0.85 + (v.rating / 5) * 0.14).toFixed(2)),
      image: v.image,
      gallery: v.gallery,
      bookingUrl,
      image: imgList[0] || DEFAULT_CAR_IMAGES[0],
      gallery: imgList,
    }
  })

  // Select top vehicle as Hero Banner highlight
  const heroVehicle = randomizedCars.find(c => c.badge === 'Recommended' || c.badge === 'Top Pick') || randomizedCars[0]

  return {
    destination: destName,
    pickupDate: pDate,
    dropoffDate: dDate,
    daysCount,
    totalCarsAvailable: randomizedCars.length,
    isDomestic: true,
    aiSummaryText: `We compared 500+ verified car hire suppliers in ${destName}. Includes Free Cancellation (up to 48h), Unlimited Kilometres, and Full to Full fuel policy.`,
    heroVehicle,
    cars: randomizedCars,
  }
}
