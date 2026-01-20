'use client';

import { useEffect, useState } from 'react';

/**
 * Hook per rilevare la preferenza utente per reduced motion.
 * Rispetta l'impostazione di accessibilita del sistema operativo.
 *
 * @returns true se l'utente preferisce animazioni ridotte
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 *
 * // Disabilita animazioni se l'utente preferisce
 * <motion.div animate={prefersReducedMotion ? {} : { scale: 1.1 }} />
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Verifica supporto e preferenza iniziale
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Ascolta cambiamenti della preferenza
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

export default useReducedMotion;
