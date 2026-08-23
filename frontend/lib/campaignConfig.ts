/**
 * Raksha Bandhan 2X Referral Campaign Configuration
 * Active: August 23, 2026 00:00 IST to August 28, 2026 23:59:59 IST
 */

export const RAKHI_CAMPAIGN = {
  id: 'raksha-bandhan-2026',
  name: 'Raksha Bandhan 2X Referral Week',
  startDate: '2026-08-23T00:00:00+05:30',
  endDate: '2026-08-28T23:59:59+05:30',
  referrerCredits: 400, // Standard: 200
  refereeCredits: 200,  // Standard: 100
  standardReferrerCredits: 200,
  standardRefereeCredits: 100,
}

/**
 * Checks if the Raksha Bandhan campaign is currently active based on local/system time.
 */
export function isRakhiCampaignActive(): boolean {
  try {
    const now = new Date().getTime()
    const start = new Date(RAKHI_CAMPAIGN.startDate).getTime()
    const end = new Date(RAKHI_CAMPAIGN.endDate).getTime()
    return now >= start && now <= end
  } catch {
    return false
  }
}

/**
 * Calculates remaining time until the campaign ends.
 */
export function getCampaignTimeRemaining() {
  const now = new Date().getTime()
  const end = new Date(RAKHI_CAMPAIGN.endDate).getTime()
  const diff = Math.max(0, end - now)

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
 * Generates custom multi-platform share URLs and messages.
 */
export function getFestiveSharePayload(userId?: string | null) {
  const code = userId || 'explorer'
  const referralUrl = `https://tripsage.in/sign-up?ref=${code}`

  const message = `🎁 Gift your sibling a trip this Raksha Bandhan!\n\nJoin TripSage with my exclusive Rakhi invite link & claim 200 FREE Sage Travel Credits:\n${referralUrl}\n\nLet's plan our next dream vacation together! ✈️✨`

  const emailSubject = `🎁 Happy Raksha Bandhan! Here is 200 Free Travel Credits on TripSage`
  const emailBody = `Hey!\n\nInstead of sweets, I'm gifting you a travel memory this Raksha Bandhan.\n\nSign up on TripSage using my exclusive Rakhi invite link to get 200 FREE Sage Credits added to your travel wallet:\n\n👉 ${referralUrl}\n\nLet's plan our next getaway together!\n\nHappy Raksha Bandhan! ✈️`

  return {
    referralUrl,
    message,
    emailSubject,
    emailBody,
    platforms: {
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent('🎁 Gift your sibling a trip this Raksha Bandhan! Claim 200 FREE Credits:')}`,
      sms: `sms:?&body=${encodeURIComponent(message)}`,
      email: `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
    }
  }
}
