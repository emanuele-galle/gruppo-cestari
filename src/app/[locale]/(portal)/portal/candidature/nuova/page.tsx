'use client';

import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc';
import ApplicationWizard from '@/components/portal/ApplicationWizard';
import { ArrowLeft, Loader2, AlertCircle, Search } from 'lucide-react';

export default function NuovaCandidaturaPage() {
  const searchParams = useSearchParams();
  const locale = useLocale() as 'it' | 'en' | 'fr';

  const bandoId = searchParams.get('bandoId');
  const bandoCode = searchParams.get('bandoCode');

  // Fetch bando by ID if provided
  const { data: bandoById, isLoading: loadingById, error: errorById } = trpc.bandi.getByIdPublic.useQuery(
    { id: bandoId || '', locale },
    { enabled: !!bandoId }
  );

  // Fetch bando by code if provided
  const { data: bandoByCode, isLoading: loadingByCode, error: errorByCode } = trpc.bandi.getByCode.useQuery(
    { code: bandoCode || '', locale },
    { enabled: !!bandoCode && !bandoId }
  );

  // Fetch available bandi for selection if no bando specified
  const { data: availableBandi, isLoading: loadingBandi } = trpc.bandi.listPublic.useQuery(
    { page: 1, limit: 50, status: 'open', locale },
    { enabled: !bandoId && !bandoCode }
  );

  const isLoading = loadingById || loadingByCode || loadingBandi;
  const bando = bandoById || bandoByCode;
  const error = errorById || errorByCode;

  // If bando is found, extract translation and map to wizard format
  const getBandoForWizard = () => {
    if (!bando) return null;

    const translation = bando.translations?.[0];
    if (!translation) return null;

    return {
      id: bando.id,
      code: bando.code,
      title: translation.title,
      closeDate: bando.closeDate,
      untilFundsExhausted: bando.untilFundsExhausted || false,
      maxFunding: bando.fundingAmount ? Number(bando.fundingAmount) : null,
    };
  };

  const wizardBando = getBandoForWizard();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-slate-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Bando non trovato</h2>
          <p className="text-red-600 mb-6">
            Il bando selezionato non esiste o non è più disponibile.
          </p>
          <Link
            href="/portal/candidature"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alle candidature
          </Link>
        </div>
      </div>
    );
  }

  // If no bando specified, show selection
  if (!bandoId && !bandoCode) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/portal/candidature"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Nuova Candidatura
            </h1>
            <p className="text-slate-500 mt-1">
              Seleziona un bando aperto per iniziare
            </p>
          </div>
        </div>

        {/* Search hint */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-800 font-medium">Seleziona un bando</p>
            <p className="text-blue-600 text-sm mt-1">
              Scegli tra i bandi aperti disponibili per avviare la tua candidatura.
              Puoi anche accedere direttamente dalla pagina di dettaglio del bando.
            </p>
          </div>
        </div>

        {/* Available Bandi */}
        {availableBandi && availableBandi.items.length > 0 ? (
          <div className="grid gap-4">
            {availableBandi.items.map((item) => {
              const translation = item.translations[0];
              if (!translation) return null;

              const daysRemaining = item.closeDate && !item.untilFundsExhausted
                ? Math.ceil((new Date(item.closeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <Link
                  key={item.id}
                  href={`/portal/candidature/nuova?bandoId=${item.id}`}
                  className="block"
                >
                  <div className="p-6 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {item.code}
                          </span>
                          {daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0 && (
                            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                              {daysRemaining} giorni rimanenti
                            </span>
                          )}
                          {item.untilFundsExhausted && (
                            <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                              Fino a esaurimento fondi
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                          {translation.title}
                        </h3>
                        {translation.summary && (
                          <p className="text-sm text-slate-500 line-clamp-2">
                            {translation.summary}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {item.fundingAmount && (
                          <p className="text-sm font-medium text-primary">
                            Max: {Number(item.fundingAmount).toLocaleString()} EUR
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          {item.untilFundsExhausted ? 'Fino a esaurimento fondi' : item.closeDate ? `Scade: ${new Date(item.closeDate).toLocaleDateString(locale)}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-12 bg-white border border-slate-200 rounded-xl text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">Nessun bando aperto disponibile</p>
            <p className="text-sm text-slate-500">
              Torna più tardi per vedere i nuovi bandi disponibili.
            </p>
          </div>
        )}

        {/* Link to all bandi */}
        <div className="text-center">
          <Link
            href="/bandi"
            className="text-primary hover:underline text-sm font-medium"
          >
            Vedi tutti i bandi disponibili
          </Link>
        </div>
      </div>
    );
  }

  // If bando not found after loading
  if (!wizardBando) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-8 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-amber-800 mb-2">Bando non disponibile</h2>
          <p className="text-amber-600 mb-6">
            Il bando selezionato potrebbe essere chiuso o non accettare candidature.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/portal/candidature/nuova"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Seleziona un altro bando
            </Link>
            <Link
              href="/portal/candidature"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Torna alle candidature
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if bando is still open (untilFundsExhausted bandi never expire based on date)
  const isExpired = wizardBando.closeDate && !wizardBando.untilFundsExhausted
    ? new Date(wizardBando.closeDate) < new Date()
    : false;
  if (isExpired) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Bando scaduto</h2>
          <p className="text-red-600 mb-6">
            Il termine per presentare candidature a questo bando è scaduto il{' '}
            {wizardBando.closeDate && new Date(wizardBando.closeDate).toLocaleDateString(locale)}.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/portal/candidature/nuova"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Vedi altri bandi
            </Link>
            <Link
              href="/portal/candidature"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Le mie candidature
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render wizard
  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div className="flex items-center gap-4">
        <Link
          href="/portal/candidature"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nuova Candidatura</h1>
          <p className="text-sm text-slate-500">Compila il form per candidarti al bando</p>
        </div>
      </div>

      {/* Wizard */}
      <ApplicationWizard bando={wizardBando} />
    </div>
  );
}
