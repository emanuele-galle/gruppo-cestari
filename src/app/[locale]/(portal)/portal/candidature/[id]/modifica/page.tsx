'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc';
import ApplicationWizard from '@/components/portal/ApplicationWizard';
import { ArrowLeft, Loader2, AlertCircle, Lock } from 'lucide-react';

export default function ModificaCandidaturaPage() {
  const params = useParams();
  const locale = useLocale() as 'it' | 'en' | 'fr';
  const applicationId = params.id as string;

  const { data: application, isLoading, error } = trpc.portal.getApplicationById.useQuery({
    id: applicationId,
    locale,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-slate-600">Caricamento candidatura...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !application) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Candidatura non trovata</h2>
          <p className="text-red-600 mb-6">
            {error?.message || 'La candidatura richiesta non esiste o non hai i permessi per accedervi.'}
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

  // Check if application can be edited (only DRAFT status)
  if (application.status !== 'DRAFT') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-8 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <Lock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-amber-800 mb-2">Candidatura non modificabile</h2>
          <p className="text-amber-600 mb-6">
            Questa candidatura è stata già inviata e non può più essere modificata.
            {application.status === 'SUBMITTED' && ' È attualmente in attesa di revisione.'}
            {application.status === 'UNDER_REVIEW' && ' È attualmente in fase di revisione.'}
            {application.status === 'APPROVED' && ' È stata approvata.'}
            {application.status === 'REJECTED' && ' È stata rifiutata.'}
            {application.status === 'WITHDRAWN' && ' È stata ritirata.'}
          </p>
          <Link
            href="/portal/candidature"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alle candidature
          </Link>
        </div>
      </div>
    );
  }

  // Get bando info for wizard
  const bandoTranslation = application.bando.translations[0];
  const wizardBando = {
    id: application.bando.id,
    code: application.bando.code,
    title: bandoTranslation?.title || application.bando.code,
    closeDate: application.bando.closeDate,
    maxFunding: application.bando.fundingAmount ? Number(application.bando.fundingAmount) : null,
  };

  // Get initial data for wizard
  const initialData = {
    companyName: application.companyName || '',
    contactEmail: application.contactEmail || '',
    contactPhone: application.contactPhone || '',
    projectTitle: application.projectTitle || '',
    projectDescription: application.projectDescription || '',
    requestedAmount: application.requestedAmount,
    notes: application.notes || '',
    documentIds: application.documents?.map((d: { id: string }) => d.id) || [],
  };

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
          <h1 className="text-2xl font-bold text-slate-800">Modifica Candidatura</h1>
          <p className="text-sm text-slate-500">Modifica la tua bozza di candidatura</p>
        </div>
      </div>

      {/* Wizard */}
      <ApplicationWizard
        bando={wizardBando}
        existingApplicationId={applicationId}
        initialData={initialData}
      />
    </div>
  );
}
