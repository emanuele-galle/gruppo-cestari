'use client';

import dynamic from 'next/dynamic';

// Skeleton placeholder per sezioni in caricamento
const SectionSkeleton = ({ height = 'h-96' }: { height?: string }) => (
  <div className={`${height} bg-slate-900 animate-pulse`} />
);

// Below-the-fold sections - lazy loaded per migliorare TTI
const StatsSection = dynamic(
  () => import('@/components/public/stats-section').then(mod => ({ default: mod.StatsSection })),
  { loading: () => <SectionSkeleton height="h-[500px]" />, ssr: false }
);

const ServicesSection = dynamic(
  () => import('@/components/public/services-section').then(mod => ({ default: mod.ServicesSection })),
  { loading: () => <SectionSkeleton height="h-[600px]" />, ssr: true }
);

const VideoBackgroundSection = dynamic(
  () => import('@/components/public/video-background-section').then(mod => ({ default: mod.VideoBackgroundSection })),
  { loading: () => <SectionSkeleton height="h-[400px]" />, ssr: false }
);

const AboutSection = dynamic(
  () => import('@/components/public/about-section').then(mod => ({ default: mod.AboutSection })),
  { loading: () => <SectionSkeleton height="h-[500px]" />, ssr: false }
);

const TimelineSection = dynamic(
  () => import('@/components/public/timeline-section').then(mod => ({ default: mod.TimelineSection })),
  { loading: () => <SectionSkeleton height="h-[600px]" />, ssr: false }
);

const NewsSection = dynamic(
  () => import('@/components/public/news-section').then(mod => ({ default: mod.NewsSection })),
  { loading: () => <SectionSkeleton height="h-[500px]" />, ssr: false }
);

const MediaHighlightSection = dynamic(
  () => import('@/components/public/media-highlight-section').then(mod => ({ default: mod.MediaHighlightSection })),
  { loading: () => <SectionSkeleton height="h-[400px]" />, ssr: false }
);

const CtaSection = dynamic(
  () => import('@/components/public/cta-section').then(mod => ({ default: mod.CtaSection })),
  { loading: () => <SectionSkeleton height="h-[300px]" />, ssr: false }
);

export function BelowFoldSections() {
  return (
    <>
      <StatsSection />
      <ServicesSection />
      <VideoBackgroundSection />
      <AboutSection />
      <TimelineSection />
      <NewsSection />
      <MediaHighlightSection />
      <CtaSection />
    </>
  );
}
