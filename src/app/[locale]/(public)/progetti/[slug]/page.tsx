import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { db } from '@/lib/db';
import { ProjectDetailClient } from './ProjectDetailClient';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

// Fetch project server-side
async function getProject(slug: string, locale: 'it' | 'en' | 'fr') {
  const project = await db.project.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      translations: true,
      seoMeta: true,
    },
  });

  if (!project) {
    return null;
  }

  // Filter translation with fallback to Italian
  const translation = project.translations.find(t => t.locale === locale)
    || project.translations.find(t => t.locale === 'it')
    || project.translations[0];

  const seoMeta = project.seoMeta?.find(s => s.locale === locale)
    || project.seoMeta?.find(s => s.locale === 'it')
    || project.seoMeta?.[0];

  return {
    ...project,
    translations: translation ? [translation] : [],
    seoMeta: seoMeta ? [seoMeta] : [],
  };
}

// Generate dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const project = await getProject(slug, locale as 'it' | 'en' | 'fr');

  if (!project) {
    return {
      title: 'Progetto non trovato',
    };
  }

  const translation = project.translations[0];
  const seoMeta = project.seoMeta?.[0];

  const ogImage = seoMeta?.ogImage || project.featuredImage;

  return {
    title: seoMeta?.metaTitle || translation?.title || 'Progetto',
    description: seoMeta?.metaDescription || translation?.subtitle || translation?.description?.substring(0, 160) || undefined,
    openGraph: {
      title: seoMeta?.metaTitle || translation?.title || undefined,
      description: seoMeta?.metaDescription || translation?.subtitle || undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Caricamento progetto...</p>
      </div>
    </div>
  );
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;

  // Required for next-intl to work properly in this route
  setRequestLocale(locale);

  // Fetch project data server-side
  const project = await getProject(slug, locale as 'it' | 'en' | 'fr');

  if (!project) {
    notFound();
  }

  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <ProjectDetailClient slug={slug} initialProject={project} />
    </Suspense>
  );
}
