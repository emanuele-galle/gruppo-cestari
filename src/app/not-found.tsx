import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Pagina non trovata
          </h2>
          <p className="text-slate-600">
            La pagina che stai cercando non esiste o potrebbe essere stata spostata.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="inline-flex items-center gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Torna alla Home
            </Button>
          </Link>
          <Link href="/it/contatti">
            <Button variant="outline" className="inline-flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4" />
              Contattaci
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-4">
            Potrebbero interessarti:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/it/chi-siamo"
              className="text-primary hover:underline text-sm inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Chi Siamo
            </Link>
            <Link
              href="/it/servizi"
              className="text-primary hover:underline text-sm inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Servizi
            </Link>
            <Link
              href="/it/news"
              className="text-primary hover:underline text-sm inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              News
            </Link>
            <Link
              href="/it/bandi"
              className="text-primary hover:underline text-sm inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Bandi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
