import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://tripsage.in'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/plan',
        '/sign-in',
        '/dashboard',
        '/profile',
        '/my-trips',
        '/trips',
        // Block all query-string URLs EXCEPT the referral sign-up link (?ref=)
        '/sign-up/*?*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
