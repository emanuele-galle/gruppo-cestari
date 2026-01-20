import { Link } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Image from 'next/image';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo-gruppo.webp"
              alt="Gruppo Cestari"
              width={180}
              height={60}
              className="brightness-0 invert"
            />
          </Link>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Accedi alla tua Area Riservata
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Gestisci i tuoi documenti, monitora le candidature ai bandi e resta aggiornato sulle opportunità.
            </p>
          </div>

          <p className="text-sm text-white/80">
            © {new Date().getFullYear()} Gruppo Cestari. Tutti i diritti riservati.
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center justify-center">
              <Image
                src="/images/logo-gruppo.webp"
                alt="Gruppo Cestari"
                width={160}
                height={50}
              />
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
