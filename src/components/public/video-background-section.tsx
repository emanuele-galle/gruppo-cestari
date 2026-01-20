'use client';

import { useEffect, useState, useRef } from 'react';
import { YouTubePlayer } from '@/components/ui/youtube-player';

// Video muto/slide - full-width senza bordi
const backgroundVideoId = 'u-AXFosishM';

export function VideoBackgroundSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-black" ref={sectionRef}>
      <div
        className={`w-full transition-opacity duration-700 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Video full-width senza bordi */}
        <div className="relative w-full">
          {isVisible && (
            <YouTubePlayer
              videoId={backgroundVideoId}
              title="Presenza Globale - Gruppo Cestari"
              autoPlay
              muted
              loop
              showControls={false}
              thumbnailQuality="hqdefault"
            />
          )}
        </div>
      </div>
    </section>
  );
}
