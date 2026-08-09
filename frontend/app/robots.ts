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
        '/sign-up',
        '/dashboard',
        '/profile',
        '/my-trips',
        '/trips',
        '/*?*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
