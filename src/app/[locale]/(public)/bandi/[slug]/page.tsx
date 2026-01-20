'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Euro,
  Clock,
  ArrowLeft,
  CheckCircle,
  Users,
  FileText,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Target,
  Globe,
  Loader2,
  Copy,
  Check,
  Share2,
  Building2,
  Landmark,
  Flag,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  FileDown,
  Info,
  List,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { SocialShare } from '@/components/public/social-share';
import { marked } from 'marked';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  EUROPEAN: 'Europeo',
  NATIONAL: 'Nazionale',
  REGIONAL: 'Regionale',
  PRIVATE: 'Privato',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  EUROPEAN: <Flag className="w-4 h-4" />,
  NATIONAL: <Landmark className="w-4 h-4" />,
  REGIONAL: <Building2 className="w-4 h-4" />,
  PRIVATE: <Target className="w-4 h-4" />,
};

const SECTOR_LABELS: Record<string, string> = {
  ENERGY: 'Energia',
  ENVIRONMENT: 'Ambiente',
  INNOVATION: 'Innovazione',
  AGRICULTURE: 'Agricoltura',
  SOCIAL: 'Sociale',
  INFRASTRUCTURE: 'Infrastrutture',
  DIGITAL: 'Digitale',
  HEALTH: 'Salute',
  EDUCATION: 'Formazione',
  TOURISM: 'Turismo',
  RENEWABLE_ENERGY: 'Energie Rinnovabili',
  COOPERATION: 'Cooperazione',
  DEVELOPMENT: 'Sviluppo',
  FINANCE: 'Finanza',
  OTHER: 'Altro',
};

// Countdown component
function CountdownBadge({ daysRemaining }: { daysRemaining: number }) {
  let bgClass = 'bg-green-500';
  let textLabel = 'giorni rimanenti';

  if (daysRemaining <= 0) {
    bgClass = 'bg-red-500';
    textLabel = 'Scaduto';
  } else if (daysRemaining <= 7) {
    bgClass = 'bg-red-500';
  } else if (daysRemaining <= 30) {
    bgClass = 'bg-amber-500';
  }

  return (
    <div className={`${bgClass} text-white px-4 py-2 rounded-xl flex items-center gap-2`}>
      <Clock className="w-5 h-5" />
      {daysRemaining > 0 ? (
        <span className="font-bold text-lg">{daysRemaining} {textLabel}</span>
      ) : (
        <span className="font-bold">{textLabel}</span>
      )}
    </div>
  );
}

// Collapsible section component
function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  id
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  id: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div id={id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Copy link button
function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          Copiato!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Copia link
        </>
      )}
    </button>
  );
}

// File type icon helper
function getFileIcon(url: string) {
  const ext = url.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'doc':
    case 'docx':
      return <FileText className="w-5 h-5 text-blue-500" />;
    case 'xls':
    case 'xlsx':
      return <FileText className="w-5 h-5 text-green-500" />;
    default:
      return <FileDown className="w-5 h-5 text-slate-500" />;
  }
}

// Get file name from URL
function getFileName(url: string, index: number) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    if (filename && filename.includes('.')) {
      return decodeURIComponent(filename);
    }
  } catch {
    // Invalid URL
  }
  return `Documento ${index + 1}`;
}

export default function BandoDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const t = useTranslations('grants');
  const locale = useLocale() as 'it' | 'en' | 'fr';
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState<string>('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const { data: bando, isLoading, error } = trpc.bandi.getByCode.useQuery({
    code: resolvedParams.slug,
    locale,
  });

  // Get related bandi (same type and sector when available)
  const { data: relatedData } = trpc.bandi.listPublic.useQuery({
    page: 1,
    limit: 8,
    type: bando?.type,
    sector: bando?.sector || undefined,
    status: 'open',
    locale,
  }, {
    enabled: !!bando,
  });

  // Filter out current bando from related
  const relatedBandi = relatedData?.items.filter(b => b.code !== bando?.code).slice(0, 6) || [];

  // Scroll spy for TOC
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['descrizione', 'requisiti', 'beneficiari', 'allegati'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-slate-600">Caricamento bando...</p>
        </div>
      </div>
    );
  }

  if (error || !bando) {
    notFound();
  }

  const translation = bando.translations[0];
  if (!translation) {
    notFound();
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Da definire';
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} miliardi`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} milioni`;
    }
    return new Intl.NumberFormat('it-IT', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusInfo = () => {
    const now = new Date();
    const openDate = new Date(bando.openDate);
    const closeDate = new Date(bando.closeDate);

    if (closeDate < now) {
      return { label: 'Chiuso', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' };
    }
    if (openDate > now) {
      return { label: 'Prossimamente', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500' };
    }
    const daysRemaining = Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 7) {
      return { label: 'In scadenza', color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' };
    }
    return { label: 'Aperto', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' };
  };

  const getDaysRemaining = () => {
    const closeDate = new Date(bando.closeDate);
    const now = new Date();
    return Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const statusInfo = getStatusInfo();
  const daysRemaining = getDaysRemaining();

  // Helper to check if bando is open for applications
  const isBandoOpen = () => {
    const now = new Date();
    const openDate = new Date(bando.openDate);
    const closeDate = new Date(bando.closeDate);
    return openDate <= now && closeDate >= now;
  };

  // Helper to get application URL with login redirect if needed
  const getApplicationUrl = () => {
    const baseUrl = `/portal/candidature/nuova?bandoCode=${bando.code}`;
    if (!session) {
      return `/${locale}/login?callbackUrl=${encodeURIComponent(`/${locale}${baseUrl}`)}`;
    }
    return baseUrl;
  };

  // Helper to convert markdown to HTML
  const parseContent = (content: string | null | undefined): string => {
    if (!content) return '';
    if (/<[a-z][\s\S]*>/i.test(content)) {
      return content;
    }
    return marked.parse(content, { async: false }) as string;
  };

  const descriptionHtml = parseContent(translation.description);
  const requirementsHtml = parseContent(translation.requirements);
  const eligibilityHtml = parseContent(translation.eligibility);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://gruppocestari.com/bandi/${bando.code}`;

  // TOC sections
  const tocSections = [
    { id: 'descrizione', label: 'Descrizione', show: !!descriptionHtml },
    { id: 'requisiti', label: 'Requisiti', show: !!requirementsHtml },
    { id: 'beneficiari', label: 'Beneficiari', show: !!eligibilityHtml },
    { id: 'allegati', label: 'Allegati', show: bando.attachments && bando.attachments.length > 0 },
  ].filter(s => s.show);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating orbs */}
          <motion.div
            className="absolute top-10 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/30 blur-[100px]"
            animate={{
              scale: [1, 1.15, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-[10%] w-[350px] h-[350px] rounded-full bg-primary/40 blur-[90px]"
            animate={{
              scale: [1.1, 1, 1.1],
              x: [0, -30, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 right-[5%] w-[250px] h-[250px] rounded-full bg-cyan-500/20 blur-[70px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          {/* Animated diagonal lines */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGradientDetail" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.25)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <motion.line
              x1="0" y1="40%" x2="100%" y2="60%"
              stroke="url(#lineGradientDetail)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.line
              x1="100%" y1="25%" x2="0" y2="55%"
              stroke="url(#lineGradientDetail)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
            />
          </svg>

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white/25 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${25 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -25, 0],
                x: [0, i % 2 === 0 ? 15 : -15, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.7,
              }}
            />
          ))}

          {/* Subtle geometric shapes */}
          <motion.div
            className="absolute top-[20%] left-[8%] w-16 h-16 border border-white/10 rounded-lg"
            animate={{
              rotate: [0, 45, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute bottom-[30%] right-[12%] w-12 h-12 border border-white/10 rounded-full"
            animate={{
              rotate: [0, -180, -360],
              scale: [1, 0.9, 1],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-white/60 text-sm mb-6">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/bandi" className="hover:text-white transition-colors">
                Bandi
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">{TYPE_LABELS[bando.type] || bando.type}</span>
            </nav>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusInfo.color}`}>
                <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
                {statusInfo.label}
              </span>
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full flex items-center gap-1.5">
                {TYPE_ICONS[bando.type]}
                {TYPE_LABELS[bando.type] || bando.type}
              </span>
              {bando.sector && (
                <span className="px-3 py-1.5 bg-white/10 text-white/90 text-sm font-medium rounded-full">
                  {SECTOR_LABELS[bando.sector] || bando.sector}
                </span>
              )}
              <span className="px-2 py-1 bg-white/10 text-xs font-mono text-white/70 rounded">
                {bando.code}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl mb-4">
              {translation.title}
            </h1>

            {/* Summary */}
            {translation.summary && (
              <p className="text-lg text-white/80 max-w-3xl mb-8">
                {translation.summary}
              </p>
            )}

            {/* Countdown */}
            {daysRemaining > 0 && (
              <CountdownBadge daysRemaining={daysRemaining} />
            )}
          </motion.div>
        </div>
      </section>

      {/* Key Info Cards */}
      <section className="py-6 bg-white border-b border-slate-200 -mt-6 relative z-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20"
            >
              <div className="flex items-center gap-2 text-primary text-sm mb-2">
                <Euro className="w-4 h-4" />
                Importo Totale
              </div>
              <p className="font-bold text-xl text-slate-800">
                {formatCurrency(bando.fundingAmount ? Number(bando.fundingAmount) : null)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-slate-50 rounded-xl p-5 border border-slate-200"
            >
              <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
                <Calendar className="w-4 h-4" />
                Apertura
              </div>
              <p className="font-semibold text-slate-800">
                {new Date(bando.openDate).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-xl p-5 border ${daysRemaining <= 30 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}
            >
              <div className={`flex items-center gap-2 text-sm mb-2 ${daysRemaining <= 30 ? 'text-amber-700' : 'text-slate-600'}`}>
                <Clock className="w-4 h-4" />
                Scadenza
              </div>
              <p className={`font-semibold ${daysRemaining <= 30 ? 'text-amber-800' : 'text-slate-800'}`}>
                {new Date(bando.closeDate).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              {daysRemaining > 0 && daysRemaining <= 30 && (
                <p className="text-xs text-amber-600 mt-1 font-medium">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {daysRemaining} giorni
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-slate-50 rounded-xl p-5 border border-slate-200"
            >
              <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
                {TYPE_ICONS[bando.type]}
                Tipologia
              </div>
              <p className="font-semibold text-slate-800">
                {TYPE_LABELS[bando.type] || bando.type}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Table of Contents - Desktop Sticky Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden lg:block lg:col-span-1"
            >
              <div className="sticky top-24">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Contenuti
                  </h3>
                  <nav className="space-y-1">
                    {tocSections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === section.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {section.label}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 space-y-3">
                  <CopyLinkButton url={pageUrl} />
                  {bando.externalUrl && (
                    <a
                      href={bando.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Bando ufficiale
                    </a>
                  )}
                </div>
              </div>
            </motion.aside>

            {/* Main Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Description */}
              {descriptionHtml && (
                <div id="descrizione" className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Info className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Descrizione</h2>
                  </div>
                  <div
                    className="prose prose-slate max-w-none
                      prose-headings:text-slate-800 prose-headings:font-bold
                      prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                      prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4
                      prose-ul:my-4 prose-ul:pl-5
                      prose-li:text-slate-600 prose-li:mb-2
                      prose-strong:text-slate-800"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                </div>
              )}

              {/* Requirements */}
              {requirementsHtml && (
                <CollapsibleSection
                  id="requisiti"
                  title="Requisiti"
                  icon={CheckCircle}
                  defaultOpen={true}
                >
                  <div
                    className="prose prose-sm max-w-none prose-p:text-slate-600 prose-li:text-slate-600 prose-ul:pl-5"
                    dangerouslySetInnerHTML={{ __html: requirementsHtml }}
                  />
                </CollapsibleSection>
              )}

              {/* Eligibility */}
              {eligibilityHtml && (
                <CollapsibleSection
                  id="beneficiari"
                  title="Beneficiari Ammissibili"
                  icon={Users}
                  defaultOpen={true}
                >
                  <div
                    className="prose prose-sm max-w-none prose-p:text-slate-600 prose-li:text-slate-600 prose-ul:pl-5"
                    dangerouslySetInnerHTML={{ __html: eligibilityHtml }}
                  />
                </CollapsibleSection>
              )}

              {/* Attachments */}
              {bando.attachments && bando.attachments.length > 0 && (
                <div id="allegati" className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Documenti e Allegati</h3>
                  </div>
                  <div className="space-y-3">
                    {bando.attachments.map((attachment: string, index: number) => (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        {getFileIcon(attachment)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 group-hover:text-primary truncate">
                            {getFileName(attachment, index)}
                          </p>
                          <p className="text-xs text-slate-500">Clicca per scaricare</p>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* External Link - Mobile */}
              {bando.externalUrl && (
                <div className="lg:hidden">
                  <a
                    href={bando.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Vai al bando ufficiale
                  </a>
                </div>
              )}

              {/* Share Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Share2 className="w-5 h-5 text-slate-600" />
                  <h3 className="font-semibold text-slate-800">Condividi questo bando</h3>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <CopyLinkButton url={pageUrl} />
                  <SocialShare
                    url={pageUrl}
                    title={translation.title}
                    description={translation.summary || ''}
                  />
                </div>
              </div>
            </motion.article>

            {/* Right Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 space-y-6">
                {/* CTA Invia Candidatura - Solo se bando aperto */}
                {isBandoOpen() && (
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5" />
                      <h3 className="font-bold">Candidati Ora</h3>
                    </div>
                    <p className="text-white/80 text-sm mb-4">
                      Presenta la tua candidatura per questo bando. Il processo è semplice e guidato.
                    </p>
                    <Link href={getApplicationUrl()}>
                      <button className="w-full py-3 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
                        Invia Candidatura
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                    {!session && (
                      <p className="text-white/60 text-xs mt-2 text-center">
                        Effettua il login per candidarti
                      </p>
                    )}
                  </div>
                )}

                {/* CTA Box Consulenza */}
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-bold">Assistenza Gratuita</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-4">
                    I nostri esperti possono aiutarti a presentare la domanda e gestire tutta la pratica.
                  </p>
                  <Link href="/consulenza">
                    <button className="w-full py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
                      Richiedi Consulenza
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Riepilogo Bando
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Codice</span>
                      <span className="font-mono text-slate-800">{bando.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tipologia</span>
                      <span className="font-medium text-slate-800">{TYPE_LABELS[bando.type]}</span>
                    </div>
                    {bando.sector && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Settore</span>
                        <span className="font-medium text-slate-800">{SECTOR_LABELS[bando.sector]}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Budget</span>
                      <span className="font-medium text-slate-800">
                        {formatCurrency(bando.fundingAmount ? Number(bando.fundingAmount) : null)}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Apertura</span>
                        <span className="text-slate-600">
                          {new Date(bando.openDate).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-slate-500">Scadenza</span>
                        <span className={daysRemaining <= 30 ? 'text-amber-600 font-medium' : 'text-slate-600'}>
                          {new Date(bando.closeDate).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* Related Bandi Carousel */}
      {relatedBandi.length > 0 && (
        <section className="py-12 bg-white border-t border-slate-200">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Bandi Correlati</h2>
                <p className="text-slate-500 mt-1">Altri bandi che potrebbero interessarti</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Carousel Controls - Desktop */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                    disabled={carouselIndex === 0}
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCarouselIndex(Math.min(Math.max(0, relatedBandi.length - 3), carouselIndex + 1))}
                    disabled={carouselIndex >= relatedBandi.length - 3}
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <Link href="/bandi" className="text-primary font-medium hover:underline flex items-center gap-1">
                  Vedi tutti <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Carousel Container */}
            <div className="overflow-hidden">
              <motion.div
                className="flex gap-6"
                animate={{ x: `-${carouselIndex * (100 / 3 + 2)}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {relatedBandi.map((related) => {
                  const relTranslation = related.translations[0];
                  if (!relTranslation) return null;
                  const relDays = Math.ceil((new Date(related.closeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                  return (
                    <Link
                      key={related.id}
                      href={`/bandi/${related.code}`}
                      className="min-w-[calc(100%-1.5rem)] md:min-w-[calc(50%-0.75rem)] lg:min-w-[calc(33.333%-1rem)] shrink-0"
                    >
                      <motion.div
                        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                        className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-primary/30 transition-all h-full group"
                      >
                        {/* Type Badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1.5 bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-1.5 border border-primary/20">
                            {TYPE_ICONS[related.type]}
                            {TYPE_LABELS[related.type]}
                          </span>
                          {relDays > 0 && relDays <= 30 && (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {relDays}g
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-primary transition-colors text-lg">
                          {relTranslation.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-sm text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                          {relTranslation.summary}
                        </p>

                        {/* Footer */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="text-primary font-bold text-lg">
                              {formatCurrency(related.fundingAmount ? Number(related.fundingAmount) : null)}
                            </p>
                            <p className="text-xs text-slate-400">Budget disponibile</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600 font-medium">
                              {new Date(related.closeDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                            </p>
                            <p className="text-xs text-slate-400">Scadenza</p>
                          </div>
                        </div>

                        {/* Hover Arrow */}
                        <div className="mt-4 flex items-center gap-2 text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          Scopri di piu
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </motion.div>
            </div>

            {/* Mobile Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6 md:hidden">
              {relatedBandi.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === carouselIndex ? 'w-6 bg-primary' : 'w-2 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Bandi */}
      <section className="py-8 border-t border-slate-200">
        <div className="container mx-auto px-4 lg:px-8">
          <Link href="/bandi">
            <button className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Torna ai Bandi
            </button>
          </Link>
        </div>
      </section>

      {/* Sticky CTA Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 lg:hidden z-50">
        <div className="flex gap-3">
          {isBandoOpen() && (
            <Link href={getApplicationUrl()} className="flex-1">
              <button className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Candidati
              </button>
            </Link>
          )}
          <Link href="/consulenza" className={isBandoOpen() ? 'flex-1' : 'w-full'}>
            <button className="w-full py-3 bg-primary text-white font-semibold rounded-xl flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              {isBandoOpen() ? 'Consulenza' : 'Richiedi Consulenza Gratuita'}
            </button>
          </Link>
        </div>
      </div>

      {/* Spacer for sticky CTA */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
