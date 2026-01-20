'use client';

import { useEffect, useState } from 'react';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    // Defer loading: aspetta 3 secondi O primo scroll/click
    const loadGA = () => {
      if (shouldLoad) return;
      setShouldLoad(true);
    };

    const timeoutId = setTimeout(loadGA, 3000);

    // Carica su prima interazione utente
    const interactionHandler = () => {
      clearTimeout(timeoutId);
      loadGA();
    };

    window.addEventListener('scroll', interactionHandler, { once: true, passive: true });
    window.addEventListener('click', interactionHandler, { once: true });
    window.addEventListener('keydown', interactionHandler, { once: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', interactionHandler);
      window.removeEventListener('click', interactionHandler);
      window.removeEventListener('keydown', interactionHandler);
    };
  }, [shouldLoad]);

  useEffect(() => {
    if (!shouldLoad || !GA_MEASUREMENT_ID) return;

    // Inizializza dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }

    // Default: denied until user gives consent
    gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'wait_for_update': 500
    });

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
      anonymize_ip: true
    });

    // Carica lo script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);
  }, [shouldLoad]);

  return null;
}

// Declare global types
declare global {
  interface Window {
    dataLayer: unknown[];
  }
}
