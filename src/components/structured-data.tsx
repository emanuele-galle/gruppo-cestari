// Using native <script> instead of next/script to ensure JSON-LD
// is in the initial HTML (not loaded via JS after hydration)

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
  areaServed: [
    { '@type': 'Country', name: 'Italy' },
    { '@type': 'Country', name: 'Belgium' },
    { '@type': 'Country', name: 'Senegal' },
    { '@type': 'Country', name: 'Kenya' },
    { '@type': 'Country', name: 'Mozambique' },
    { '@type': 'Country', name: 'Brazil' },
  ],
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    minValue: 50,
  },
  knowsAbout: [
    'Consulenza Finanziaria',
    'Finanziamenti Europei',
    'Energie Rinnovabili',
    'Comunità Energetiche Rinnovabili',
    'Cooperazione Internazionale',
    'Sviluppo Sostenibile',
    'PNRR',
    'Business Plan',
    'Finanza Agevolata',
  ],
};

// ProfessionalService schema (for local SEO)
const professionalServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Gruppo Cestari - Consulenza Finanziaria',
  image: `${BASE_URL}/images/brand/logo-gruppo-cestari.png`,
  '@id': `${BASE_URL}/#professional-service`,
  url: BASE_URL,
  telephone: '+39-089-952889',
  priceRange: '€€',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Via Don Minzoni, 1',
    addressLocality: 'Fisciano',
    postalCode: '84084',
    addressRegion: 'SA',
    addressCountry: 'IT',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 40.7736,
    longitude: 14.7681,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '18:00',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servizi di Consulenza',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Consulenza Finanziaria',
          description: 'Accesso a finanziamenti pubblici e privati, analisi di bancabilità, business planning',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Europrogettazione',
          description: 'Progettazione e gestione bandi europei, PNRR, fondi strutturali',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Comunità Energetiche Rinnovabili',
          description: 'Costituzione e gestione CER, impianti fotovoltaici, efficientamento energetico',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Cooperazione Internazionale',
          description: 'Progetti di sviluppo in Africa e America Latina, partnership internazionali',
        },
      },
    ],
  },
};

// WebSite schema
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Gruppo Cestari',
  url: BASE_URL,
  inLanguage: ['it', 'en', 'fr'],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(professionalServiceSchema),
        }}
      />
      <script
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

export function ArticleStructuredData({
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
    <script
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

export function BreadcrumbStructuredData({
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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbSchema),
      }}
    />
  );
}

// FAQPage schema
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQStructuredData({ items }: { items: FAQItem[] }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqSchema),
      }}
    />
  );
}
