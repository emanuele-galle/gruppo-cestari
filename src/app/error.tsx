'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ErrorBoundary] Application error:', error);
    console.error('[ErrorBoundary] Error name:', error.name);
    console.error('[ErrorBoundary] Error message:', error.message);
    console.error('[ErrorBoundary] Error stack:', error.stack);
    console.error('[ErrorBoundary] Error digest:', error.digest);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Si è verificato un errore
          </h1>
          <p className="text-slate-600 mb-2">
            Ci scusiamo per il disagio. Si è verificato un problema durante il caricamento della pagina.
          </p>
          {error.digest && (
            <p className="text-sm text-slate-500">
              Codice errore: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Riprova
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Torna alla Home
          </Button>
        </div>
      </div>
    </div>
  );
}
