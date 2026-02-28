import Script from 'next/script';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gruppocestari.com';

// Organization schema
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Gruppo Cestari',
  alternateName: 'Cestari Group',
  url: BASE_URL,
  logo: `${BASE_URL}/images/brand/logo-gruppo-cestari.png`,
  brand: {
    '@type': 'Brand',
    name: 'Gruppo Cestari',
  },
  image: `${BASE_URL}/og-image.jpg`,
  description:
    'Gruppo Cestari è una holding multisettoriale leader in consulenza finanziaria, cooperazione internazionale, sviluppo sostenibile ed energie rinnovabili.',
  foundingDate: '1980',
  founder: {
    '@type': 'Person',
    name: 'Ing. Alfredo C. Cestari',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Via Don Minzoni, 1',
    addressLocality: 'Fisciano',
    postalCode: '84084',
    addressRegion: 'SA',
    addressCountry: 'IT',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+39-089-952889',
      contactType: 'customer service',
      availableLanguage: ['Italian', 'English', 'French'],
    },
  ],
  sameAs: [
    'https://www.linkedin.com/in/gruppo-cestari-599423266/',
    'https://www.facebook.com/cestarigroup/',
    'https://www.instagram.com/cestari.group/',
    'https://www.youtube.com/@CestariGroup',
  ],
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: 40.6824,
      longitude: 14.7681,
    },
    geoRadius: '10000',
  },
  knowsAbout: [
    'Consulenza Finanziaria',
    'Finanziamenti Europei',
    'Energie Rinnovabili',
    'Comunità Energetiche Rinnovabili',
    'Cooperazione Internazionale',
    'Sviluppo Sostenibile',
  ],
};

// WebSite schema
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Gruppo Cestari',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/it/news?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export function OrganizationStructuredData() {
  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
    </>
  );
}

// Article schema for news pages
interface ArticleStructuredDataProps {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  slug: string;
  locale: string;
}

function ArticleStructuredData({
  title,
  description,
  image,
  datePublished,
  dateModified,
  author = 'Gruppo Cestari',
  slug,
  locale,
}: ArticleStructuredDataProps) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image.startsWith('http') ? image : `${BASE_URL}${image}`,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: author,
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Gruppo Cestari',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/brand/logo-gruppo-cestari.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/${locale}/news/${slug}`,
    },
  };

  return (
    <Script
      id={`article-schema-${slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(articleSchema),
      }}
    />
  );
}

// BreadcrumbList schema
interface BreadcrumbItem {
  name: string;
  href: string;
}

function BreadcrumbStructuredData({
  items,
  locale,
}: {
  items: BreadcrumbItem[];
  locale: string;
}) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}/${locale}${item.href}`,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbSchema),
      }}
    />
  );
}
