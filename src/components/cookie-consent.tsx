'use client';

import { useState, useEffect } from 'react';
import { Cookie, X, Settings, Check } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'cookie-consent';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
        // Small delay for CSS transition to work
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsVisible(true);
          });
        });
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      const savedPreferences = JSON.parse(consent) as CookiePreferences;
      setPreferences(savedPreferences);
      applyConsent(savedPreferences);
    }
  }, []);

  const applyConsent = (prefs: CookiePreferences) => {
    // Enable/disable analytics based on consent
    if (typeof window !== 'undefined') {
      if (prefs.analytics) {
        // Enable Google Analytics
        (window as unknown as { gtag?: (command: string, action: string, params: object) => void }).gtag?.(
          'consent',
          'update',
          { analytics_storage: 'granted' }
        );
      } else {
        // Disable Google Analytics
        (window as unknown as { gtag?: (command: string, action: string, params: object) => void }).gtag?.(
          'consent',
          'update',
          { analytics_storage: 'denied' }
        );
      }

      if (prefs.marketing) {
        // Enable marketing cookies
        (window as unknown as { gtag?: (command: string, action: string, params: object) => void }).gtag?.(
          'consent',
          'update',
          { ad_storage: 'granted' }
        );
      } else {
        // Disable marketing cookies
        (window as unknown as { gtag?: (command: string, action: string, params: object) => void }).gtag?.(
          'consent',
          'update',
          { ad_storage: 'denied' }
        );
      }
    }
  };

  const hideBanner = () => {
    setIsVisible(false);
    // Wait for CSS transition to complete before removing from DOM
    setTimeout(() => {
      setShowBanner(false);
    }, 300);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    applyConsent(prefs);
    hideBanner();
    setShowSettings(false);
  };

  const acceptAll = () => {
    savePreferences({ necessary: true, analytics: true, marketing: true });
  };

  const acceptNecessary = () => {
    savePreferences({ necessary: true, analytics: false, marketing: false });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 transform transition-all duration-300 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Main Banner */}
          {!showSettings ? (
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Utilizziamo i cookie
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Questo sito utilizza cookie per migliorare la tua esperienza di navigazione,
                    analizzare il traffico e personalizzare i contenuti. Puoi accettare tutti i
                    cookie, solo quelli necessari, o personalizzare le tue preferenze.{' '}
                    <Link href="/privacy" className="text-primary underline hover:no-underline font-medium">
                      Scopri di più
                    </Link>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={acceptAll}
                      className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Accetta tutti
                    </button>
                    <button
                      onClick={acceptNecessary}
                      className="px-5 py-2.5 bg-slate-100 text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Solo necessari
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Personalizza
                    </button>
                  </div>
                </div>
                <button
                  onClick={acceptNecessary}
                  className="shrink-0 p-2 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Chiudi"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Settings Panel */
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Preferenze Cookie
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Torna indietro"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Necessary */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                  <div className="shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900">
                        Cookie necessari
                      </span>
                      <span className="text-xs text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                        Sempre attivi
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Essenziali per il funzionamento del sito. Non possono essere disabilitati.
                    </p>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                  <div className="shrink-0 mt-0.5">
                    <button
                      onClick={() =>
                        setPreferences((p) => ({ ...p, analytics: !p.analytics }))
                      }
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        preferences.analytics
                          ? 'bg-primary border-primary'
                          : 'border-slate-300 hover:border-primary'
                      }`}
                      aria-label={preferences.analytics ? 'Disabilita analytics' : 'Abilita analytics'}
                    >
                      {preferences.analytics && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-slate-900 block mb-1">
                      Cookie analitici
                    </span>
                    <p className="text-sm text-slate-600">
                      Ci aiutano a capire come utilizzi il sito per migliorare l'esperienza.
                    </p>
                  </div>
                </div>

                {/* Marketing */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                  <div className="shrink-0 mt-0.5">
                    <button
                      onClick={() =>
                        setPreferences((p) => ({ ...p, marketing: !p.marketing }))
                      }
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        preferences.marketing
                          ? 'bg-primary border-primary'
                          : 'border-slate-300 hover:border-primary'
                      }`}
                      aria-label={preferences.marketing ? 'Disabilita marketing' : 'Abilita marketing'}
                    >
                      {preferences.marketing && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-slate-900 block mb-1">
                      Cookie di marketing
                    </span>
                    <p className="text-sm text-slate-600">
                      Utilizzati per mostrarti contenuti e pubblicità pertinenti.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveCustom}
                  className="flex-1 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Salva preferenze
                </button>
                <button
                  onClick={acceptAll}
                  className="px-5 py-2.5 bg-slate-100 text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Accetta tutti
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
