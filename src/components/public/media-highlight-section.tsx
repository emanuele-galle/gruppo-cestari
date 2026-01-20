'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Tv } from 'lucide-react';
import { VideoPlayer } from './video-player';

// Video Sky TG24
const featuredVideo = {
  id: 'MhOYmsf_bXI',
  title: 'La Sfida dei Migranti e la Cooperazione Italia-Africa',
  subtitle: 'Intervista ad Alfredo Cestari su Sky TG24',
};

export function MediaHighlightSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 relative overflow-hidden">
      {/* Sfondo stile Sky TG24 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/30 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-800/20 via-transparent to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          {/* Badge Sky TG24 sopra il video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <span className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-base font-bold rounded-full shadow-xl shadow-red-900/40">
              <Tv className="w-5 h-5" />
              Sky TG24
            </span>
          </motion.div>

          {/* Video Full-Width 1080p */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
              {isInView && (
                <VideoPlayer
                  videoId={featuredVideo.id}
                  title={featuredVideo.title}
                  showControls={true}
                />
              )}
            </div>
          </motion.div>

          {/* Titolo e sottotitolo sotto il video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-10 lg:mt-12"
          >
            <h3 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4">
              {featuredVideo.title}
            </h3>
            <p className="text-lg md:text-xl lg:text-2xl text-white/70">
              {featuredVideo.subtitle}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
