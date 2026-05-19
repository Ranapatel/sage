import React from 'react';

export const metadata = {
  title: 'SEO Dashboard | Admin | TripSage',
  robots: { index: false, follow: false },
};

export default function SEODashboard() {
  const seoPages = [
    { name: 'Dynamic Blog Post', slug: '/blog/[slug]', status: 'Dynamic Pattern', group: 'Blog Pages' },
    
    { name: 'budget bali trip', slug: '/seo/budget-bali-trip', status: 'Active', group: 'Budget Pages' },
    { name: 'budget destination trip', slug: '/seo/budget-[destination]-trip', status: 'Dynamic Pattern', group: 'Budget Pages' },
    { name: 'goa trip under 10000', slug: '/seo/goa-trip-under-10000', status: 'Active', group: 'Budget Pages' },
    { name: 'cheapest international trips from india', slug: '/seo/cheapest-international-trips-from-india', status: 'Active', group: 'Budget Pages' },
    
    { name: 'category travel guide', slug: '/seo/[category]-travel-guide', status: 'Dynamic Pattern', group: 'Category Pages' },
    { name: 'solo travel guide india', slug: '/seo/solo-travel-guide-india', status: 'Active', group: 'Category Pages' },
    
    { name: 'ai trip planner india', slug: '/seo/ai-trip-planner-india', status: 'Active', group: 'Destination Pages' },
    { name: 'destination trip planner', slug: '/seo/[destination]-trip-planner', status: 'Dynamic Pattern', group: 'Destination Pages' },
    { name: 'family trip planner india', slug: '/seo/family-trip-planner-india', status: 'Active', group: 'Destination Pages' },
    { name: 'manali trip planner', slug: '/seo/manali-trip-planner', status: 'Active', group: 'Destination Pages' },
    { name: 'best beaches in india', slug: '/seo/best-beaches-in-india', status: 'Active', group: 'Destination Pages' },
    { name: 'best honeymoon destinations india', slug: '/seo/best-honeymoon-destinations-india', status: 'Active', group: 'Destination Pages' },
    { name: 'weekend trips from hyderabad', slug: '/weekend-trips-from-hyderabad', status: 'Active', group: 'Destination Pages' },
  ];

  const groupedPages = seoPages.reduce((acc, page) => {
    if (!acc[page.group]) acc[page.group] = [];
    acc[page.group].push(page);
    return acc;
  }, {} as Record<string, typeof seoPages>);

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans min-h-screen">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">TripSage SEO Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Internal admin view for managing and tracking all SEO landing pages and dynamic URL structures.
        </p>
      </div>

      {Object.entries(groupedPages).map(([groupName, pages]) => (
        <div key={groupName} className="mb-12">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{groupName}</h2>
            <span className="ml-3 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {pages.length} Page{pages.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Page Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    URL Slug
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pages.map((page, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {page.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-mono">
                      <a href={page.slug} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {page.slug}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          page.status === 'Active'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {page.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
