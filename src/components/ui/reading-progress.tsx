'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface ReadingProgressProps {
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export function ReadingProgress({
  color = 'bg-primary',
  height = 3,
  showPercentage = false,
}: ReadingProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setPercentage(Math.round(latest * 100));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <>
      {/* Progress bar */}
      <motion.div
        className={`fixed top-0 left-0 right-0 z-50 origin-left ${color}`}
        style={{
          scaleX,
          height: `${height}px`,
        }}
      />

      {/* Percentage indicator */}
      {showPercentage && percentage > 0 && percentage < 100 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-slate-200"
        >
          <span className="text-sm font-medium text-slate-700">{percentage}%</span>
        </motion.div>
      )}
    </>
  );
}
