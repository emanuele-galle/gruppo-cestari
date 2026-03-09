import { Metadata } from 'next';
import { locales, type Locale } from '@/i18n/routing';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gruppocestari.com';

/**
 * Genera gli alternates (hreflang) per una pagina multilingua
 * @param pathname - Il path della pagina senza locale (es: '/chi-siamo', '/news/slug')
 * @param currentLocale - La locale corrente
 */
function generateAlternates(pathname: string, currentLocale: Locale) {
  // Rimuovi slash iniziale se presente per consistenza
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  // Genera le lingue alternative
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    // Per la homepage, usa solo la locale
    if (cleanPath === '/' || cleanPath === '') {
      languages[locale] = `${BASE_URL}/${locale}`;
    } else {
      languages[locale] = `${BASE_URL}/${locale}${cleanPath}`;
    }
  }

  // x-default punta alla versione italiana (default)
  languages['x-default'] = languages['it'];

  return {
    canonical: languages[currentLocale],
    languages,
  };
}

/**
 * Genera metadata completi per una pagina, inclusi hreflang
 */
interface GeneratePageMetadataParams {
  title: string;
  description: string;
  pathname: string;
  locale: Locale;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
}

function generatePageMetadata({
  title,
  description,
  pathname,
  locale,
  image,
  noIndex = false,
  keywords,
}: GeneratePageMetadataParams): Metadata {
  const alternates = generateAlternates(pathname, locale);
  const ogImage = image || '/og-image.jpg';

  // Usa absolute title per evitare che il template aggiunga "| Gruppo Cestari" alle pagine che già lo includono
  const titleValue = title.includes('Gruppo Cestari')
    ? { absolute: title }
    : title;

  return {
    title: titleValue,
    description,
    keywords,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: localeToOgLocale(locale),
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map(localeToOgLocale),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/**
 * Converte locale in formato OpenGraph (es: 'it' -> 'it_IT')
 */
function localeToOgLocale(locale: Locale): string {
  const mapping: Record<Locale, string> = {
    it: 'it_IT',
    en: 'en_US',
    fr: 'fr_FR',
  };
  return mapping[locale];
}

/**
 * Genera metadata per articoli/news con dati dinamici
 */
interface GenerateArticleMetadataParams {
  title: string;
  description: string;
  slug: string;
  locale: Locale;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}

export function generateArticleMetadata({
  title,
  description,
  slug,
  locale,
  image,
  publishedTime,
  modifiedTime,
  author = 'Gruppo Cestari',
  tags,
}: GenerateArticleMetadataParams): Metadata {
  const pathname = `/news/${slug}`;
  const baseMetadata = generatePageMetadata({
    title,
    description,
    pathname,
    locale,
    image,
  });

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime: modifiedTime || publishedTime,
      authors: [author],
      tags,
    },
  };
}

/**
 * Genera metadata per bandi
 */
export function generateBandoMetadata({
  title,
  description,
  slug,
  locale,
  image,
}: {
  title: string;
  description: string;
  slug: string;
  locale: Locale;
  image?: string;
}): Metadata {
  const pathname = `/bandi/${slug}`;
  return generatePageMetadata({
    title,
    description,
    pathname,
    locale,
    image,
  });
}

/**
 * Metadata predefiniti per le pagine statiche
 */
type PageMetaContent = {
  title: string;
  description: string;
  image?: string;
  keywords?: string[];
};

const PAGE_META: Record<string, Record<Locale, PageMetaContent>> = {
  '/': {
    it: {
      title: 'Gruppo Cestari - Consulenza Finanziaria e Cooperazione Internazionale',
      description: 'Holding multisettoriale specializzata in consulenza finanziaria, cooperazione internazionale ed energie rinnovabili. Oltre 40 anni di esperienza al servizio di imprese e territori.',
      keywords: ['consulenza finanziaria', 'cooperazione internazionale', 'energie rinnovabili', 'bandi europei', 'finanziamenti pubblici', 'sviluppo sostenibile', 'PNRR', 'comunità energetiche'],
    },
    en: {
      title: 'Gruppo Cestari - Financial Consulting and International Cooperation',
      description: 'Multisectoral holding specialized in financial consulting, international cooperation and renewable energy. Over 40 years of experience.',
      keywords: ['financial consulting', 'international cooperation', 'renewable energy', 'European grants', 'public funding', 'sustainable development'],
    },
    fr: {
      title: 'Gruppo Cestari - Conseil Financier et Coopération Internationale',
      description: 'Holding multisectorielle spécialisée dans le conseil financier, la coopération internationale et les énergies renouvelables. Plus de 40 ans d\'expérience.',
      keywords: ['conseil financier', 'coopération internationale', 'énergies renouvelables', 'subventions européennes', 'développement durable'],
    },
  },
  '/chi-siamo': {
    it: {
      title: 'Chi Siamo - La Nostra Storia | Gruppo Cestari',
      description: 'Scopri la storia del Gruppo Cestari: oltre 40 anni di esperienza in consulenza finanziaria, cooperazione internazionale e sviluppo sostenibile.',
      image: '/images/photos/chi-siamo-bg.jpg',
    },
    en: {
      title: 'About Us - Our History | Gruppo Cestari',
      description: 'Discover the history of Gruppo Cestari: over 40 years of experience in financial consulting, international cooperation and sustainable development.',
      image: '/images/photos/chi-siamo-bg.jpg',
    },
    fr: {
      title: 'À Propos - Notre Histoire | Gruppo Cestari',
      description: 'Découvrez l\'histoire du Gruppo Cestari: plus de 40 ans d\'expérience dans le conseil financier, la coopération internationale et le développement durable.',
      image: '/images/photos/chi-siamo-bg.jpg',
    },
  },
  '/servizi': {
    it: {
      title: 'I Nostri Servizi | Gruppo Cestari',
      description: 'Consulenza finanziaria, bandi europei, comunità energetiche rinnovabili e cooperazione internazionale. Scopri tutti i servizi del Gruppo Cestari.',
      keywords: ['consulenza finanziaria', 'europrogettazione', 'comunità energetiche rinnovabili', 'studi di fattibilità', 'business plan', 'finanza agevolata'],
    },
    en: {
      title: 'Our Services | Gruppo Cestari',
      description: 'Financial consulting, European grants, renewable energy communities and international cooperation. Discover all Gruppo Cestari services.',
    },
    fr: {
      title: 'Nos Services | Gruppo Cestari',
      description: 'Conseil financier, subventions européennes, communautés d\'énergie renouvelable et coopération internationale. Découvrez tous les services du Gruppo Cestari.',
    },
  },
  '/societa': {
    it: {
      title: 'Le Società del Gruppo | Gruppo Cestari',
      description: 'Scopri le società del Gruppo Cestari: 10 aziende specializzate in diversi settori strategici per lo sviluppo del territorio.',
    },
    en: {
      title: 'Group Companies | Gruppo Cestari',
      description: 'Discover Gruppo Cestari companies: 10 specialized companies in different strategic sectors for territorial development.',
    },
    fr: {
      title: 'Les Sociétés du Groupe | Gruppo Cestari',
      description: 'Découvrez les sociétés du Gruppo Cestari: 10 entreprises spécialisées dans différents secteurs stratégiques pour le développement territorial.',
    },
  },
  '/sostenibilita': {
    it: {
      title: 'Sostenibilità e Sviluppo Sostenibile | Gruppo Cestari',
      description: 'Il nostro impegno per la sostenibilità: comunità energetiche, energie rinnovabili e progetti di sviluppo sostenibile per un futuro migliore.',
      keywords: ['comunità energetiche rinnovabili', 'CER', 'fotovoltaico aziendale', 'efficientamento energetico', 'ESG', 'sviluppo sostenibile'],
    },
    en: {
      title: 'Sustainability and Sustainable Development | Gruppo Cestari',
      description: 'Our commitment to sustainability: energy communities, renewable energy and sustainable development projects for a better future.',
    },
    fr: {
      title: 'Durabilité et Développement Durable | Gruppo Cestari',
      description: 'Notre engagement pour la durabilité: communautés énergétiques, énergies renouvelables et projets de développement durable pour un avenir meilleur.',
    },
  },
  '/progetti': {
    it: {
      title: 'I Nostri Progetti | Gruppo Cestari',
      description: 'Scopri i progetti del Gruppo Cestari in Italia e nel mondo: cooperazione internazionale, energie rinnovabili e sviluppo territoriale.',
    },
    en: {
      title: 'Our Projects | Gruppo Cestari',
      description: 'Discover Gruppo Cestari projects in Italy and worldwide: international cooperation, renewable energy and territorial development.',
    },
    fr: {
      title: 'Nos Projets | Gruppo Cestari',
      description: 'Découvrez les projets du Gruppo Cestari en Italie et dans le monde: coopération internationale, énergies renouvelables et développement territorial.',
    },
  },
  '/news': {
    it: {
      title: 'News e Aggiornamenti | Gruppo Cestari',
      description: 'Le ultime notizie su bandi, finanziamenti europei, energie rinnovabili e cooperazione internazionale dal Gruppo Cestari.',
    },
    en: {
      title: 'News and Updates | Gruppo Cestari',
      description: 'Latest news on grants, European funding, renewable energy and international cooperation from Gruppo Cestari.',
    },
    fr: {
      title: 'Actualités et Mises à Jour | Gruppo Cestari',
      description: 'Les dernières nouvelles sur les subventions, les financements européens, les énergies renouvelables et la coopération internationale du Gruppo Cestari.',
    },
  },
  '/bandi': {
    it: {
      title: 'Bandi e Agevolazioni | Gruppo Cestari',
      description: 'Scopri i bandi attivi per imprese, enti pubblici e PMI: finanziamenti europei, PNRR, agevolazioni regionali e nazionali.',
      keywords: ['bandi europei', 'finanziamenti PNRR', 'agevolazioni imprese', 'fondi strutturali', 'incentivi PMI', 'bandi regionali', 'finanza agevolata'],
    },
    en: {
      title: 'Grants and Incentives | Gruppo Cestari',
      description: 'Discover active grants for businesses, public entities and SMEs: European funding, PNRR, regional and national incentives.',
    },
    fr: {
      title: 'Appels d\'Offres et Subventions | Gruppo Cestari',
      description: 'Découvrez les appels d\'offres actifs pour les entreprises, les entités publiques et les PME: financements européens, PNRR, aides régionales et nationales.',
    },
  },
  '/contatti': {
    it: {
      title: 'Contatti | Gruppo Cestari',
      description: 'Contatta il Gruppo Cestari: sede di Salerno, Milano, Roma, Napoli e Bruxelles. Richiedi una consulenza gratuita.',
    },
    en: {
      title: 'Contact Us | Gruppo Cestari',
      description: 'Contact Gruppo Cestari: offices in Salerno, Milan, Rome, Naples and Brussels. Request a free consultation.',
    },
    fr: {
      title: 'Contactez-Nous | Gruppo Cestari',
      description: 'Contactez le Gruppo Cestari: bureaux à Salerne, Milan, Rome, Naples et Bruxelles. Demandez une consultation gratuite.',
    },
  },
  '/consulenza': {
    it: {
      title: 'Consulenza Finanziaria | Gruppo Cestari',
      description: 'Servizi di consulenza finanziaria strategica per imprese, enti pubblici e start-up. Business plan, finanza agevolata e accesso al credito.',
      keywords: ['consulenza finanziaria Salerno', 'business plan', 'accesso al credito', 'finanza agevolata', 'consulenza strategica imprese'],
    },
    en: {
      title: 'Financial Consulting | Gruppo Cestari',
      description: 'Strategic financial consulting services for businesses, public entities and start-ups. Business plans, subsidized finance and credit access.',
    },
    fr: {
      title: 'Conseil Financier | Gruppo Cestari',
      description: 'Services de conseil financier stratégique pour les entreprises, les entités publiques et les start-ups. Business plans, finance subventionnée et accès au crédit.',
    },
  },
  '/team': {
    it: {
      title: 'Il Nostro Team | Gruppo Cestari',
      description: 'Scopri il team di professionisti del Gruppo Cestari: esperti in finanza, cooperazione internazionale e sviluppo sostenibile.',
    },
    en: {
      title: 'Our Team | Gruppo Cestari',
      description: 'Discover the Gruppo Cestari team of professionals: experts in finance, international cooperation and sustainable development.',
    },
    fr: {
      title: 'Notre Équipe | Gruppo Cestari',
      description: 'Découvrez l\'équipe de professionnels du Gruppo Cestari: experts en finance, coopération internationale et développement durable.',
    },
  },
  '/faq': {
    it: {
      title: 'Domande Frequenti (FAQ) | Gruppo Cestari',
      description: 'Risposte alle domande più frequenti su bandi, finanziamenti, comunità energetiche e servizi del Gruppo Cestari.',
    },
    en: {
      title: 'Frequently Asked Questions (FAQ) | Gruppo Cestari',
      description: 'Answers to frequently asked questions about grants, funding, energy communities and Gruppo Cestari services.',
    },
    fr: {
      title: 'Questions Fréquentes (FAQ) | Gruppo Cestari',
      description: 'Réponses aux questions fréquemment posées sur les subventions, les financements, les communautés énergétiques et les services du Gruppo Cestari.',
    },
  },
};

/**
 * Ottieni i metadata per una pagina statica con hreflang
 */
export function getStaticPageMetadata(pathname: string, locale: Locale): Metadata {
  const pageMeta = PAGE_META[pathname];

  if (!pageMeta) {
    // Fallback per pagine non definite
    return generatePageMetadata({
      title: 'Gruppo Cestari',
      description: 'Holding multisettoriale specializzata in consulenza finanziaria e cooperazione internazionale.',
      pathname,
      locale,
    });
  }

  const meta = pageMeta[locale];

  // Fallback se la locale non è presente per questa pagina
  if (!meta) {
    return generatePageMetadata({
      title: 'Gruppo Cestari',
      description: 'Holding multisettoriale specializzata in consulenza finanziaria e cooperazione internazionale.',
      pathname,
      locale,
    });
  }

  return generatePageMetadata({
    title: meta.title,
    description: meta.description,
    pathname,
    locale,
    image: meta.image,
    keywords: meta.keywords,
  });
}
