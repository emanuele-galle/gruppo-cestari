'use client';

import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { RefObject } from 'react';

export function useParallax(
  ref: RefObject<HTMLElement>,
  distance: number = 100
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  return useTransform(scrollYProgress, [0, 1], [-distance, distance]);
}

export function useParallaxOpacity(
  ref: RefObject<HTMLElement>,
  fadeStart: number = 0,
  fadeEnd: number = 0.5
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  return useTransform(scrollYProgress, [fadeStart, fadeEnd], [1, 0]);
}
