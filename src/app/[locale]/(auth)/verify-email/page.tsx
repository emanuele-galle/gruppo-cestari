'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Errore durante la verifica');
        }
      } catch {
        setStatus('error');
        setMessage('Errore di connessione. Riprova più tardi.');
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });

      if (response.ok) {
        setResendSuccess(true);
      }
    } catch {
      // Ignore errors silently
    } finally {
      setResending(false);
    }
  };

  // No token - show resend form
  if (status === 'no-token') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Verifica Email
        </h1>
        <p className="text-slate-500 mb-8">
          Inserisci la tua email per ricevere un nuovo link di verifica
        </p>

        {resendSuccess ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle className="w-5 h-5 inline mr-2" />
            Email inviata! Controlla la tua casella di posta.
          </div>
        ) : (
          <form onSubmit={handleResend} className="space-y-4">
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="La tua email"
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="submit"
              disabled={resending}
              className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Invio in corso...
                </>
              ) : (
                'Invia Link di Verifica'
              )}
            </button>
          </form>
        )}

        <p className="mt-8 text-sm text-slate-500">
          <Link href="/login" className="text-primary hover:underline">
            Torna al login
          </Link>
        </p>
      </motion.div>
    );
  }

  // Loading
  if (status === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
        <p className="text-slate-600">Verifica in corso...</p>
      </motion.div>
    );
  }

  // Success
  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Email Verificata!
        </h1>
        <p className="text-slate-500 mb-8">
          {message || 'Il tuo account è stato attivato con successo.'}
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Accedi al tuo account
        </Link>
      </motion.div>
    );
  }

  // Error
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
        <XCircle className="w-10 h-10 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Verifica Fallita
      </h1>
      <p className="text-slate-500 mb-6">
        {message || 'Il link di verifica non è valido o è scaduto.'}
      </p>

      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Inserisci la tua email per ricevere un nuovo link:
        </p>

        {resendSuccess ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle className="w-5 h-5 inline mr-2" />
            Nuovo link inviato!
          </div>
        ) : (
          <form onSubmit={handleResend} className="space-y-3">
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="La tua email"
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="submit"
              disabled={resending}
              className="w-full py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Invio...
                </>
              ) : (
                'Invia Nuovo Link'
              )}
            </button>
          </form>
        )}
      </div>

      <p className="mt-8 text-sm text-slate-500">
        <Link href="/login" className="text-primary hover:underline">
          Torna al login
        </Link>
      </p>
    </motion.div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="text-center">
      <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
      <p className="text-slate-600">Caricamento...</p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
