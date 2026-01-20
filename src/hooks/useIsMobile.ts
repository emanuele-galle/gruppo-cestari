'use client';

import { useEffect, useState } from 'react';

/**
 * Hook per rilevare se il dispositivo e mobile (touch-based).
 * Usa la media query (hover: none) e (pointer: coarse) per detection accurata.
 *
 * @returns true se il dispositivo e touch-based (smartphone/tablet)
 *
 * @example
 * const isMobile = useIsMobile();
 *
 * // Disabilita animazioni pesanti su mobile
 * {!isMobile && <FloatingOrbs />}
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // hover: none = dispositivo senza hover (touch)
      // pointer: coarse = pointer impreciso (dito vs mouse)
      setIsMobile(
        window.matchMedia('(hover: none) and (pointer: coarse)').matches
      );
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/**
 * Hook per rilevare breakpoint mobile basato su larghezza.
 * Utile per logica condizionale basata su viewport width.
 *
 * @param breakpoint - Larghezza in pixel (default 768 = md breakpoint)
 * @returns true se viewport e sotto il breakpoint
 */
export function useIsMobileWidth(breakpoint: number = 768): boolean {
  const [isMobileWidth, setIsMobileWidth] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobileWidth(window.innerWidth < breakpoint);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [breakpoint]);

  return isMobileWidth;
}

export default useIsMobile;
