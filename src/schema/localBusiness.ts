import { absoluteUrl, getSiteUrl } from '../lib/siteUrl';

/** Sitewide LocalBusiness JSON-LD — injected once in Layout (avoid duplicating index.html block). */
export function getLocalBusinessSchema(): Record<string, unknown> {
  const logo = absoluteUrl('/treetek-logo.png');
  const site = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    additionalType: 'https://schema.org/TreeService',
    name: 'TREE TEK',
    url: site,
    image: logo,
    logo,
    description:
      'Licensed and insured tree removal, trimming, crane work, storm cleanup, and stump grinding in Volusia County and Central Florida.',
    telephone: '+13212829795',
    email: 'Landtekbiz@gmail.com',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'FL',
      addressCountry: 'US',
      addressLocality: 'Volusia County',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 29.1383,
      longitude: -80.9956,
    },
    areaServed: [
      { '@type': 'City', name: 'Port Orange', containedInPlace: { '@type': 'State', name: 'Florida' } },
      { '@type': 'City', name: 'Daytona Beach', containedInPlace: { '@type': 'State', name: 'Florida' } },
      { '@type': 'City', name: 'South Daytona', containedInPlace: { '@type': 'State', name: 'Florida' } },
      {
        '@type': 'AdministrativeArea',
        name: 'Volusia County',
        containedInPlace: { '@type': 'State', name: 'Florida' },
      },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
        description: 'Emergency tree service available 24/7; estimates typically Mon–Sat daytime hours.',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Tree services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Tree removal',
            areaServed: 'Volusia County, FL',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Tree trimming and pruning',
            areaServed: 'Volusia County, FL',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Crane-assisted tree removal',
            areaServed: 'Volusia County, FL',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Storm cleanup and emergency tree service',
            areaServed: 'Volusia County, FL',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Stump grinding',
            areaServed: 'Volusia County, FL',
          },
        },
      ],
    },
  };
}

export function getServicePageSchema(input: {
  name: string;
  description: string;
  path: string;
  areaServed: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    provider: {
      '@type': 'LocalBusiness',
      name: 'TREE TEK',
      telephone: '+13212829795',
      url: getSiteUrl(),
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: input.areaServed,
    },
    url: absoluteUrl(input.path),
  };
}
