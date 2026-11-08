/**
 * TripSage Dussehra Campaign Configuration
 * "The Great Dussehra Escape"
 * 
 * Provides configurable campaign metadata, active/post-festival state resolution,
 * destination cards, verified FAQ data, and UTM share generators.
 */

export interface DussehraCampaignConfig {
  id: string
  name: string
  eyebrow: string
  headline: string
  supportingText: string
  secondaryHeadline: string
  bannerBody: string
  ctaLabel: string
  secondaryCtaLabel: string
  startDate: string // ISO 8601
  endDate: string   // ISO 8601
  isFreePlanning: boolean
  freePlanningNote: string
}

export const DUSSEHRA_CAMPAIGN: DussehraCampaignConfig = {
  id: 'dussehra-2026',
  name: 'The Great Dussehra Escape',
  eyebrow: 'THE GREAT DUSSEHRA ESCAPE',
  headline: 'Burn your boring plans. Plan your next adventure.',
  secondaryHeadline: 'Turn your destination, dates and budget into a personalized travel itinerary with TripSage.',
  supportingText: 'Tell TripSage where you want to go, when you want to travel and what you want to spend. Get a personalized starting itinerary and explore your travel options in one place.',
  bannerBody: 'This festive season, give yourself something to look forward to. Create a personalized trip itinerary with TripSage, explore your travel options and start planning your next getaway.',
  ctaLabel: 'Plan My Trip',
  secondaryCtaLabel: 'Explore Destinations',
  startDate: '2026-10-14T00:00:00+05:30',
  endDate: '2026-10-25T23:59:59+05:30',
  isFreePlanning: true,
  freePlanningNote: 'TripSage is free to use.',
}

export type CampaignStatus = 'upcoming' | 'active' | 'post_festival'

/**
 * Dynamically resolves the campaign status based on current time or optional override.
 */
export function getCampaignStatus(now: Date = new Date()): CampaignStatus {
  try {
    const currentTime = now.getTime()
    const start = new Date(DUSSEHRA_CAMPAIGN.startDate).getTime()
    const end = new Date(DUSSEHRA_CAMPAIGN.endDate).getTime()

    if (currentTime < start) return 'upcoming'
    if (currentTime <= end) return 'active'
    return 'post_festival'
  } catch {
    return 'active'
  }
}

/**
 * Returns time remaining until campaign deadline, or expired state.
 */
export function getCampaignTimeRemaining(now: Date = new Date()) {
  const current = now.getTime()
  const end = new Date(DUSSEHRA_CAMPAIGN.endDate).getTime()
  const diff = Math.max(0, end - current)

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return {
    totalMs: diff,
    days,
    hours,
    minutes,
    seconds,
    isExpired: diff <= 0,
  }
}

/**
 * Returns contextual campaign copy based on whether the festival is currently active or has passed.
 * Prevents displaying expired deadlines or claiming a festival is upcoming when it has ended.
 */
export function getContextualCopy(status: CampaignStatus = getCampaignStatus()) {
  if (status === 'post_festival') {
    return {
      eyebrow: 'POST-DUSSEHRA TRAVEL SPECIAL',
      headline: 'Keep the spirit of adventure alive. Plan your getaway.',
      supportingText: 'Turn your destination, dates and budget into a personalized travel itinerary with TripSage. Compare flights, stays and activities in one place.',
      badgeText: 'Post-Festival Getaways & Winter Travel',
      bannerEyebrow: 'POST-FESTIVAL GETAWAYS',
      bannerHeadline: 'The holidays might be over, but your next journey begins now.',
      bannerBody: 'Carry the celebratory joy into your next trip. Create a personalized itinerary with TripSage and explore hassle-free travel across India and beyond.',
    }
  }

  return {
    eyebrow: DUSSEHRA_CAMPAIGN.eyebrow,
    headline: DUSSEHRA_CAMPAIGN.headline,
    supportingText: DUSSEHRA_CAMPAIGN.supportingText,
    badgeText: 'Official Dussehra Festive Special (Oct 14 – Oct 25)',
    bannerEyebrow: DUSSEHRA_CAMPAIGN.eyebrow,
    bannerHeadline: DUSSEHRA_CAMPAIGN.headline,
    bannerBody: DUSSEHRA_CAMPAIGN.bannerBody,
  }
}

/**
 * Verified Popular Destinations for Dussehra getaways
 */
export interface DestinationCardItem {
  id: string
  name: string
  tag: string
  description: string
  img: string
  defaultFrom: string
  defaultBudget: string
  defaultDays: number
}

export const DUSSEHRA_DESTINATIONS: DestinationCardItem[] = [
  {
    id: 'goa',
    name: 'Goa',
    tag: 'Coastal & Relaxation',
    description: 'Beaches, cafes and relaxed coastal days.',
    img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80&auto=format&fit=crop',
    defaultFrom: 'Hyderabad',
    defaultBudget: '15000',
    defaultDays: 4,
  },
  {
    id: 'manali',
    name: 'Manali',
    tag: 'Mountains & Adventure',
    description: 'Mountain views, cafes and outdoor activities.',
    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80&auto=format&fit=crop',
    defaultFrom: 'Delhi',
    defaultBudget: '18000',
    defaultDays: 5,
  },
  {
    id: 'kerala',
    name: 'Kerala',
    tag: 'Nature & Heritage',
    description: 'Backwaters, greenery and slower-paced holidays.',
    img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80&auto=format&fit=crop',
    defaultFrom: 'Bangalore',
    defaultBudget: '22000',
    defaultDays: 5,
  },
  {
    id: 'pondicherry',
    name: 'Pondicherry',
    tag: 'Heritage & Walks',
    description: 'Heritage streets, cafes and coastal walks.',
    img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80&auto=format&fit=crop',
    defaultFrom: 'Chennai',
    defaultBudget: '12000',
    defaultDays: 3,
  },
]

/**
 * Verified FAQ data matching real TripSage behavior
 */
export interface FAQItem {
  question: string
  answer: string
}

export const DUSSEHRA_FAQS: FAQItem[] = [
  {
    question: 'Is TripSage free to use?',
    answer: 'Yes. TripSage is free to use.',
  },
  {
    question: 'Does TripSage book flights and hotels directly?',
    answer: 'The draft does not include live flight or hotel prices, and TripSage does not book travel. Check the airline or hotel before you pay.',
  },
  {
    question: 'Are the prices accurate?',
    answer: 'Figures in a TripSage draft are estimates, not live prices. Check the airline or hotel before you pay.',
  },
  {
    question: 'Do I need to sign up before planning?',
    answer: 'No. You can draft a plan without an account. The planner uses one departure city and one destination.',
  },
  {
    question: 'Can TripSage help me plan within my budget?',
    answer: 'You can enter a budget in rupees. The draft uses it as a cost estimate for one route. It does not look up live fares.',
  },
]

/**
 * Share URLs with UTM tracking parameters
 */
export function getDussehraSharePayload(source = 'share_button') {
  const baseUrl = 'https://www.tripsage.in/dussehra'
  const utmParams = `utm_source=${source}&utm_medium=campaign&utm_campaign=dussehra_2026`
  const fullUrl = `${baseUrl}?${utmParams}`

  const message = `Check The Great Dussehra Escape on TripSage.\nThe planner drafts one destination. It does not book the trip:\n${fullUrl}`

  return {
    url: fullUrl,
    message,
    whatsappUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
    twitterUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
    linkedinUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
  }
}
