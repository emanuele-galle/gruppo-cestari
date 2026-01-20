'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

// Video YouTube - diversi per desktop e mobile
const DESKTOP_VIDEO_ID = 'Lq05AgFahlw';
const MOBILE_VIDEO_ID = '13Gb-OjupUk';

export function HeroSection() {
  const tCommon = useTranslations('common');
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Rileva dispositivo mobile per video e performance
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lazy load video: carica quando l'utente scrolla
  const triggerVideoLoad = useCallback(() => {
    setShouldLoadVideo(true);
  }, []);

  useEffect(() => {
    // IntersectionObserver per lazy load video (desktop e mobile)
    if (isMobile === null) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Quando l'utente inizia a scrollare (threshold 0.8 = 80% visibile)
          if (entry.intersectionRatio < 0.95 && entry.intersectionRatio > 0) {
            triggerVideoLoad();
            observer.disconnect();
          }
        });
      },
      { threshold: [0, 0.5, 0.8, 0.95, 1] }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isMobile, triggerVideoLoad]);

  // Thumbnail locali per LCP ottimizzato
  const localThumbnail = isMobile
    ? '/images/hero/mobile-thumb.webp'
    : '/images/hero/desktop-thumb.webp';
  const thumbnailUrl = thumbnailError
    ? `https://img.youtube.com/vi/${DESKTOP_VIDEO_ID}/hqdefault.jpg`
    : localThumbnail;

  // SSR: mostra thumbnail desktop come default per LCP ottimizzato
  if (isMobile === null) {
    return (
      <section
        ref={sectionRef}
        className="w-full overflow-hidden"
        style={{ marginBottom: '-1px' }}
      >
        <div
          className="relative w-full overflow-hidden bg-slate-900"
          style={{ aspectRatio: '21/9' }}
        >
          <Image
            src="/images/hero/desktop-thumb.webp"
            alt="Gruppo Cestari Video Background"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            style={{ transform: 'scale(1.28)' }}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </section>
    );
  }

  if (isMobile) {
    // Mobile: thumbnail iniziale, poi video YouTube dopo scroll
    return (
      <section
        ref={sectionRef}
        className="relative w-full min-h-screen-safe overflow-hidden bg-black"
      >
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          {!shouldLoadVideo ? (
            // Thumbnail iniziale per LCP ottimizzato
            <>
              <Image
                src={thumbnailUrl}
                alt="Gruppo Cestari Video Background"
                fill
                priority
                className="object-cover"
                sizes="100vw"
                onError={() => setThumbnailError(true)}
                style={{
                  transform: 'scale(1.5)',
                }}
              />
              <div className="absolute inset-0 bg-black/40" />
            </>
          ) : (
            // Video YouTube Shorts per mobile - caricato dopo scroll
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${MOBILE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${MOBILE_VIDEO_ID}&controls=0&disablekb=1&iv_load_policy=3&modestbranding=1&playsinline=1&rel=0&showinfo=0`}
              title="Gruppo Cestari - Video Hero Mobile"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                border: 'none',
                transform: 'scale(1.5)',
              }}
            />
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 pb-safe left-1/2 -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2 text-white/80 animate-bounce">
            <span className="text-xs uppercase tracking-widest drop-shadow-lg">{tCommon('learnMore')}</span>
            <ChevronDown className="w-5 h-5 drop-shadow-lg" />
          </div>
        </div>
      </section>
    );
  }

  // Desktop: video 21:9 a piena larghezza, scalato per nascondere logo YouTube
  return (
    <section
      ref={sectionRef}
      className="w-full overflow-hidden"
      style={{ marginBottom: '-1px' }}
    >
      <div
        className="relative w-full overflow-hidden bg-slate-900"
        style={{ aspectRatio: '21/9' }}
      >
        {!shouldLoadVideo ? (
          // Thumbnail placeholder - LCP ottimizzato
          <>
            <Image
              src={thumbnailUrl}
              alt="Gruppo Cestari Video Background"
              fill
              priority
              className="object-cover"
              sizes="100vw"
              onError={() => setThumbnailError(true)}
              style={{
                transform: 'scale(1.28)',
              }}
            />
            <div className="absolute inset-0 bg-black/20" />
          </>
        ) : (
          // iframe YouTube - caricato solo dopo scroll (SOLO desktop)
          // allowFullScreen={false} e fs=0 per evitare redirect a YouTube
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${DESKTOP_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${DESKTOP_VIDEO_ID}&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&playsinline=1&rel=0&showinfo=0&start=9`}
            title="Gruppo Cestari - Video Hero"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={false}
            className="absolute pointer-events-none block"
            style={{
              border: 'none',
              top: '50%',
              left: '50%',
              width: '128%',
              height: '128%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>
    </section>
  );
}
