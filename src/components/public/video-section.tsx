'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Film } from 'lucide-react';
import { VideoPlayer } from './video-player';

// Video protagonista con parlato
const mainVideo = {
  id: 'nQ-S2Zo6PI4',
  title: 'La Nostra Storia',
  subtitle: 'Oltre 45 anni di eccellenza imprenditoriale',
  description: 'Un viaggio attraverso quattro decenni di innovazione, crescita e impegno per lo sviluppo sostenibile. Dalla fondazione ad oggi, il Gruppo Cestari ha costruito un patrimonio di competenze e relazioni che abbraccia quattro continenti.',
};

export function VideoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-slate-900">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center">
          {/* Video 60% a sinistra */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              {isInView && (
                <VideoPlayer
                  videoId={mainVideo.id}
                  title={mainVideo.title}
                  autoPlay={false}
                  muted={false}
                  showControls={true}
                  thumbnailQuality="hqdefault"
                />
              )}
            </div>
          </motion.div>

          {/* Testo 40% a destra */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
              <Film className="w-4 h-4" />
              Video Istituzionale
            </span>

            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4">
              {mainVideo.title}
            </h2>

            <p className="text-xl lg:text-2xl text-primary font-medium mb-6">
              {mainVideo.subtitle}
            </p>

            <p className="text-lg text-white/70 leading-relaxed">
              {mainVideo.description}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
