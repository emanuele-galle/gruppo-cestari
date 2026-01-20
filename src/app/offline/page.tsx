'use client';

import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-200 mb-6">
            <WifiOff className="w-10 h-10 text-slate-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Sei offline
          </h1>
          <p className="text-slate-600 mb-2">
            Non sei connesso a Internet. Verifica la tua connessione e riprova.
          </p>
          <p className="text-sm text-slate-500">
            Alcune funzionalità potrebbero non essere disponibili offline.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleReload}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Riprova
          </Button>
          <Link href="/">
            <Button variant="outline" className="inline-flex items-center gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Torna alla Home
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Se il problema persiste, contattaci al{' '}
            <a href="tel:+39089952889" className="text-primary hover:underline">
              +39 089 952889
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
