'use client';

import { motion } from 'framer-motion';
import { FileText, Scale, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function TerminiPage() {
  const t = useTranslations('legal.terms');

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-slate-100 border-b border-slate-200">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              {t('badge')}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              {t('title')}
            </h1>
            <p className="text-lg text-slate-700">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Info Cards */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">Legge Italiana</div>
                  <div className="text-xs text-slate-600">D.Lgs. 206/2005</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">Foro Competente</div>
                  <div className="text-xs text-slate-600">Tribunale di Salerno</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">Trasparenza</div>
                  <div className="text-xs text-slate-600">Termini chiari</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 lg:p-12"
            >
              <div
                className="legal-content"
                dangerouslySetInnerHTML={{ __html: t.raw('content') }}
              />
              <div className="mt-12 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  {t('lastUpdate')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .legal-content {
          color: #334155;
          line-height: 1.75;
        }
        .legal-content h2 {
          color: #0f172a;
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .legal-content h2:first-child {
          margin-top: 0;
        }
        .legal-content p {
          color: #475569;
          margin-bottom: 1rem;
        }
        .legal-content ul, .legal-content ol {
          color: #475569;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .legal-content li {
          margin-bottom: 0.5rem;
        }
        .legal-content strong {
          color: #1e293b;
          font-weight: 600;
        }
        .legal-content a {
          color: #153C69;
          text-decoration: none;
        }
        .legal-content a:hover {
          text-decoration: underline;
        }
      `}</style>
    </main>
  );
}
