import { Metadata } from 'next';

export const siteConfig = {
  name: 'TripSage',
  url: 'https://tripsage.in',
  description: 'AI-powered trip planner and travel guide.',
};

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteConfig.url,
    siteName: siteConfig.name,
  },
};

interface GenerateMetadataProps {
  title: string;
  description: string;
  slug: string;
  keywords?: string[];
}

export function generateMetadata({ title, description, slug, keywords = [] }: GenerateMetadataProps): Metadata {
  const url = `${siteConfig.url}${slug.startsWith('/') ? slug : `/${slug}`}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      description,
      url,
    },
  };
}
