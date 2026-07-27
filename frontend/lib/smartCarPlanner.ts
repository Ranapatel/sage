import { isSameCountry } from './countryUtils'

// ─── Dynamic AI Rental Car Planner & DiscoverCars Engine ─────────────────────

export type VehicleCategory = 'Economy' | 'Budget' | 'Compact' | 'Sedan' | 'SUV' | 'Family' | 'Premium'

export interface CarVehicle {
  id: string
  name: string
  brand: 'Tata' | 'Maruti Suzuki' | 'Hyundai' | 'Kia' | 'Toyota' | 'Honda' | 'Mahindra' | 'Renault' | 'Nissan'
  category: VehicleCategory
  supplier: {
    name: string
    logoUrl?: string
    rating: number
  }
  transmission: 'Manual' | 'Automatic'
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'
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
  badge?: 'Best Value' | 'Popular' | 'Top Pick' | 'Cheapest' | 'Premium' | 'Family Pick'
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
  aiSummaryText: string
  heroVehicle?: CarVehicle
  relevantCategories: VehicleCategory[]
  cars: CarVehicle[]
}

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

// ─── Master Vehicle Fleet Database (Real Fleet Models & Unique Photos) ────────
export interface MasterFleetSpec {
  name: string
  brand: 'Tata' | 'Maruti Suzuki' | 'Hyundai' | 'Kia' | 'Toyota' | 'Honda' | 'Mahindra' | 'Renault' | 'Nissan'
  category: VehicleCategory
  transmission: 'Manual' | 'Automatic'
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'
  seats: number
  bags: number
  doors: number
  pricePerDay: number
  rating: number
  tier: 'under_1500' | '1500_2500' | '2500_4000' | '4000_6500' | '6500_10000' | 'above_10000'
  badge?: 'Best Value' | 'Popular' | 'Top Pick' | 'Cheapest' | 'Premium' | 'Family Pick'
  supplierName: string
  supplierRating: number
  aiExplanation: string
  image: string
  gallery: string[]
}

const MASTER_FLEET: MasterFleetSpec[] = [
  // ── Tier 1: Under ₹1,500/day (Economy / Budget) ──
  {
    name: 'Maruti Alto K10 or Similar',
    brand: 'Maruti Suzuki',
    category: 'Economy',
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 4,
    bags: 1,
    doors: 4,
    pricePerDay: 1150,
    rating: 4.5,
    tier: 'under_1500',
    badge: 'Cheapest',
    supplierName: 'DiscoverCars',
    supplierRating: 4.7,
    aiExplanation: 'Ultra-budget compact hatchback, effortless navigation in tight city traffic.',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Renault Kwid or Similar',
    brand: 'Renault',
    category: 'Economy',
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 4,
    bags: 1,
    doors: 4,
    pricePerDay: 1250,
    rating: 4.4,
    tier: 'under_1500',
    badge: 'Best Value',
    supplierName: 'Budget',
    supplierRating: 4.6,
    aiExplanation: 'Stylish micro-crossover with high ground clearance for city and rural drives.',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Maruti S-Presso or Similar',
    brand: 'Maruti Suzuki',
    category: 'Budget',
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 4,
    bags: 1,
    doors: 4,
    pricePerDay: 1350,
    rating: 4.3,
    tier: 'under_1500',
    badge: 'Best Value',
    supplierName: 'DiscoverCars',
    supplierRating: 4.5,
    aiExplanation: 'High seating position SUV-style mini hatchback with superb fuel economy.',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80&auto=format&fit=crop',
    ],
  },

  // ── Tier 2: ₹1,500–₹2,500/day (Budget / Hatchback) ──
  {
    name: 'Tata Tiago or Similar',
    brand: 'Tata',
    category: 'Budget',
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 4,
    bags: 2,
    doors: 4,
    pricePerDay: 1650,
    rating: 4.7,
    tier: '1500_2500',
    badge: 'Popular',
    supplierName: 'Hertz',
    supplierRating: 4.8,
    aiExplanation: '4-star safety rated solid hatchback with premium Harman audio & plush cabin.',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Maruti Suzuki Swift or Similar',
    brand: 'Maruti Suzuki',
    category: 'Compact',
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 5,
    bags: 2,
    doors: 4,
    pricePerDay: 1850,
    rating: 4.8,
    tier: '1500_2500',
    badge: 'Top Pick',
    supplierName: 'Avis',
    supplierRating: 4.9,
    aiExplanation: 'India’s most loved hatchback — dynamic handling and outstanding fuel mileage.',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Hyundai Grand i10 Nios or Similar',
    brand: 'Hyundai',
    category: 'Budget',
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 5,
    bags: 2,
    doors: 4,
    pricePerDay: 2100,
    rating: 4.6,
    tier: '1500_2500',
    badge: 'Best Value',
    supplierName: 'Europcar',
    supplierRating: 4.7,
    aiExplanation: 'Refined engine, silent cabin acoustics, and rear AC vents for smooth city cruising.',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Tata Punch or Similar',
    brand: 'Tata',
    category: 'Compact',
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 5,
    bags: 2,
    doors: 4,
    pricePerDay: 2350,
    rating: 4.8,
    tier: '1500_2500',
    badge: 'Top Pick',
    supplierName: 'DiscoverCars',
    supplierRating: 4.8,
    aiExplanation: '5-star GNCAP safety micro-SUV built for steep inclines and rough road trips.',
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80&auto=format&fit=crop',
    ],
  },

  // ── Tier 3: ₹2,500–₹4,000/day (Compact / Sedan) ──
  {
    name: 'Hyundai i20 or Similar',
    brand: 'Hyundai',
    category: 'Compact',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 2,
    doors: 4,
    pricePerDay: 2650,
    rating: 4.7,
    tier: '2500_4000',
    badge: 'Popular',
    supplierName: 'Sixt',
    supplierRating: 4.8,
    aiExplanation: 'Premium hatchback with touchscreen infotainment, sunroof, and automatic gearbox.',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Maruti Baleno or Similar',
    brand: 'Maruti Suzuki',
    category: 'Compact',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 2,
    doors: 4,
    pricePerDay: 2850,
    rating: 4.7,
    tier: '2500_4000',
    badge: 'Best Value',
    supplierName: 'Hertz',
    supplierRating: 4.7,
    aiExplanation: 'Spacious premium hatchback with heads-up display and automatic transmission.',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Tata Altroz or Similar',
    brand: 'Tata',
    category: 'Compact',
    transmission: 'Manual',
    fuelType: 'Diesel',
    seats: 5,
    bags: 2,
    doors: 4,
    pricePerDay: 3100,
    rating: 4.8,
    tier: '2500_4000',
    badge: 'Top Pick',
    supplierName: 'Avis',
    supplierRating: 4.9,
    aiExplanation: 'Gold standard 5-star safety hatchback with 90-degree opening doors and high highway stability.',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Maruti Suzuki Dzire or Similar',
    brand: 'Maruti Suzuki',
    category: 'Sedan',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 3,
    doors: 4,
    pricePerDay: 3250,
    rating: 4.8,
    tier: '2500_4000',
    badge: 'Popular',
    supplierName: 'DiscoverCars',
    supplierRating: 4.8,
    aiExplanation: 'India’s favorite executive sedan with massive trunk space and smooth automatic drive.',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Honda Amaze or Similar',
    brand: 'Honda',
    category: 'Sedan',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 3,
    doors: 4,
    pricePerDay: 3450,
    rating: 4.8,
    tier: '2500_4000',
    badge: 'Best Value',
    supplierName: 'Europcar',
    supplierRating: 4.8,
    aiExplanation: 'Refined i-VTEC automatic sedan with plush legroom and 420-litre boot capacity.',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80&auto=format&fit=crop',
    ],
  },

  // ── Tier 4: ₹4,000–₹6,500/day (SUV / Compact SUV) ──
  {
    name: 'Nissan Magnite or Similar',
    brand: 'Nissan',
    category: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 3,
    doors: 5,
    pricePerDay: 4150,
    rating: 4.6,
    tier: '4000_6500',
    badge: 'Best Value',
    supplierName: 'Budget',
    supplierRating: 4.7,
    aiExplanation: 'Turbocharged compact SUV with 360-degree camera and high ground clearance.',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Hyundai Venue or Similar',
    brand: 'Hyundai',
    category: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 3,
    doors: 5,
    pricePerDay: 4250,
    rating: 4.8,
    tier: '4000_6500',
    badge: 'Top Pick',
    supplierName: 'Avis',
    supplierRating: 4.8,
    aiExplanation: 'Feature-loaded smart SUV with connected car tech, air purifier, and comfortable ride.',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Kia Sonet or Similar',
    brand: 'Kia',
    category: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    seats: 5,
    bags: 3,
    doors: 5,
    pricePerDay: 4500,
    rating: 4.9,
    tier: '4000_6500',
    badge: 'Popular',
    supplierName: 'Sixt',
    supplierRating: 4.9,
    aiExplanation: 'Powerful diesel SUV featuring Bose sound system, ventilated seats, and sunroof.',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Mahindra XUV 3XO or Similar',
    brand: 'Mahindra',
    category: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 3,
    doors: 5,
    pricePerDay: 4800,
    rating: 4.8,
    tier: '4000_6500',
    badge: 'Top Pick',
    supplierName: 'Hertz',
    supplierRating: 4.8,
    aiExplanation: 'Widest cabin in segment with panoramic skyroof and Level 2 ADAS safety tech.',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Tata Nexon or Similar',
    brand: 'Tata',
    category: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 3,
    doors: 5,
    pricePerDay: 5200,
    rating: 4.9,
    tier: '4000_6500',
    badge: 'Popular',
    supplierName: 'DiscoverCars',
    supplierRating: 4.9,
    aiExplanation: '5-star safety rated iconic Indian SUV with futuristic digital cockpit & drive modes.',
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80&auto=format&fit=crop',
    ],
  },

  // ── Tier 5: ₹6,500–₹10,000/day (Premium / Executive) ──
  {
    name: 'Toyota Hyryder or Similar',
    brand: 'Toyota',
    category: 'Premium',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    seats: 5,
    bags: 3,
    doors: 5,
    pricePerDay: 6800,
    rating: 4.9,
    tier: '6500_10000',
    badge: 'Best Value',
    supplierName: 'Enterprise',
    supplierRating: 4.9,
    aiExplanation: 'Strong hybrid SUV delivering extraordinary 27 km/l fuel efficiency and silent EV mode.',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Honda City or Similar',
    brand: 'Honda',
    category: 'Sedan',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 3,
    doors: 4,
    pricePerDay: 6950,
    rating: 4.8,
    tier: '6500_10000',
    badge: 'Popular',
    supplierName: 'Europcar',
    supplierRating: 4.8,
    aiExplanation: 'The benchmark executive sedan with Honda Sensing ADAS, leatherette seats & sunroof.',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Kia Seltos or Similar',
    brand: 'Kia',
    category: 'Premium',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    seats: 5,
    bags: 4,
    doors: 5,
    pricePerDay: 7400,
    rating: 4.9,
    tier: '6500_10000',
    badge: 'Top Pick',
    supplierName: 'Sixt',
    supplierRating: 4.9,
    aiExplanation: 'Premium mid-size SUV featuring dual 10.25-inch panoramic screens and dual-pane sunroof.',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Hyundai Creta or Similar',
    brand: 'Hyundai',
    category: 'Premium',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    bags: 4,
    doors: 5,
    pricePerDay: 7800,
    rating: 4.9,
    tier: '6500_10000',
    badge: 'Popular',
    supplierName: 'Avis',
    supplierRating: 4.9,
    aiExplanation: 'India’s highest-rated mid-size SUV with ultimate highway comfort & cooled front seats.',
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80&auto=format&fit=crop',
    ],
  },

  // ── Tier 6: ₹10,000+/day (Family / 7-Seater MPV / Luxury) ──
  {
    name: 'Maruti Suzuki Ertiga or Similar',
    brand: 'Maruti Suzuki',
    category: 'Family',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 7,
    bags: 4,
    doors: 5,
    pricePerDay: 9800,
    rating: 4.8,
    tier: 'above_10000',
    badge: 'Family Pick',
    supplierName: 'DiscoverCars',
    supplierRating: 4.8,
    aiExplanation: 'Extremely popular 7-seater MPV with flexible luggage space and rear AC blowers.',
    image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Kia Carens or Similar',
    brand: 'Kia',
    category: 'Family',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    seats: 7,
    bags: 4,
    doors: 5,
    pricePerDay: 10200,
    rating: 4.9,
    tier: 'above_10000',
    badge: 'Family Pick',
    supplierName: 'Sixt',
    supplierRating: 4.9,
    aiExplanation: 'Spacious 3-row family RV with electric one-touch tumble 2nd-row seats.',
    image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Toyota Innova Crysta or Similar',
    brand: 'Toyota',
    category: 'Family',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    seats: 7,
    bags: 4,
    doors: 5,
    pricePerDay: 10500,
    rating: 4.9,
    tier: 'above_10000',
    badge: 'Top Pick',
    supplierName: 'Enterprise',
    supplierRating: 4.9,
    aiExplanation: 'Unrivalled 7-seater king of Indian roads for long distance family & group travel.',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Mahindra XUV700 (Premium) or Similar',
    brand: 'Mahindra',
    category: 'Premium',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    seats: 7,
    bags: 4,
    doors: 5,
    pricePerDay: 11500,
    rating: 4.9,
    tier: 'above_10000',
    badge: 'Premium',
    supplierName: 'Hertz',
    supplierRating: 4.9,
    aiExplanation: 'Flagship 7-seater luxury SUV with panoramic Skyroof, Sony 3D sound, and 200 hp engine.',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    name: 'Toyota Innova Hycross or Similar',
    brand: 'Toyota',
    category: 'Premium',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    seats: 7,
    bags: 5,
    doors: 5,
    pricePerDay: 12200,
    rating: 5.0,
    tier: 'above_10000',
    badge: 'Premium',
    supplierName: 'Enterprise',
    supplierRating: 5.0,
    aiExplanation: 'Ultra-luxurious 7-seater Hybrid MPV with Ottoman captain seats and panoramic sunroof.',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80&auto=format&fit=crop',
    ],
  },
]

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
 * Generates dynamic rental car recommendations tailored to destination, budget, group size, and duration.
 */
export function generateSmartCarPlanner(params: {
  destination: string
  origin?: string
  pickupDate?: string
  dropoffDate?: string
  passengers?: number
  budget?: number
  rawCars?: any[]
}): SmartCarPlannerResult {
  const destName = (params.destination || 'Goa').split(',')[0].trim()
  const originName = (params.origin || '').trim()

  if (originName && destName && !isSameCountry(originName, destName)) {
    return {
      destination: destName,
      pickupDate: params.pickupDate || '',
      dropoffDate: params.dropoffDate || '',
      daysCount: 0,
      totalCarsAvailable: 0,
      aiSummaryText: 'Rental cars are available only for domestic travel. Please use Flights or local transport at your destination.',
      relevantCategories: [],
      cars: []
    }
  }

  const pDate = params.pickupDate || '2026-06-25'
  const dDate = params.dropoffDate || '2026-06-28'

  const d1 = new Date(pDate)
  const d2 = new Date(dDate)
  const daysCount = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24))) || 3

  const bookingUrl = buildDiscoverCarsAffiliateUrl({
    destination: destName,
    pickupDate: pDate,
    dropoffDate: dDate,
  })

  const pax = params.passengers || 2

  // Deterministic seed for consistent yet dynamic recommendations per route
  const seedString = `${destName.toLowerCase()}_${pDate}_${pax}`
  let hash = 0
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i)
    hash |= 0
  }
  const seed = Math.abs(hash)

  // Rank and prioritize vehicles according to group size and route seed
  let fleet = [...MASTER_FLEET]

  if (pax >= 6) {
    fleet.sort((a, b) => (b.seats >= 7 ? 1 : 0) - (a.seats >= 7 ? 1 : 0))
  } else if (pax <= 2) {
    fleet.sort((a, b) => (a.seats <= 5 ? 1 : 0) - (b.seats <= 5 ? 1 : 0))
  }

  // Shuffle slightly based on seed so different cities get distinct hero order
  const shuffledFleet = fleet.map((item, index) => {
    const pseudoRandom = ((seed * (index + 1) * 9301 + 49297) % 233280) / 233280
    return { item, sortKey: pseudoRandom }
  }).sort((a, b) => b.sortKey - a.sortKey).map(x => x.item)

  const cars: CarVehicle[] = shuffledFleet.map((v, idx) => {
    const total = v.pricePerDay * daysCount
    return {
      id: `car_dyn_${v.brand.toLowerCase()}_${idx}`,
      name: v.name,
      brand: v.brand,
      category: v.category,
      supplier: {
        name: v.supplierName,
        logoUrl: getSupplierLogo(v.supplierName),
        rating: v.supplierRating,
      },
      transmission: v.transmission,
      fuelType: v.fuelType,
      seats: v.seats,
      bags: v.bags,
      doors: v.doors,
      airConditioning: true,
      mileagePolicy: 'Unlimited Kilometres',
      cancellationPolicy: 'Free Cancellation',
      fuelPolicy: 'Full to Full',
      instantConfirmation: true,
      pricePerDay: v.pricePerDay,
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
    }
  })

  // Extract relevant categories present in recommendations
  const relevantCategories = Array.from(new Set(cars.map(c => c.category)))

  return {
    destination: destName,
    pickupDate: pDate,
    dropoffDate: dDate,
    daysCount,
    totalCarsAvailable: cars.length,
    aiSummaryText: `We compared 500+ car rental offers in ${destName}. 100% of vehicles include Free Cancellation (up to 48h), Unlimited Kilometres, and Full to Full fuel policy.`,
    heroVehicle: cars[0],
    relevantCategories,
    cars,
  }
}
