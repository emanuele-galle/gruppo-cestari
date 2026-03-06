'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, Card, CardHeader, CardContent, RichTextEditor, FileUpload, GalleryUpload } from '@/components/admin';
import { ArrowLeft, Save, Loader2, FileText, Images } from 'lucide-react';
import type { GalleryImage } from '@/lib/types/gallery';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

type Locale = 'it' | 'en' | 'fr';

interface BandoTranslation {
  locale: Locale;
  title: string;
  summary: string;
  description: string;
  requirements: string;
  eligibility: string;
}

const BANDO_TYPES = [
  { value: 'EUROPEAN', label: 'Europeo' },
  { value: 'NATIONAL', label: 'Nazionale' },
  { value: 'REGIONAL', label: 'Regionale' },
  { value: 'PRIVATE', label: 'Privato' },
];

const SECTORS = [
  { value: 'FINANCE', label: 'Finanza' },
  { value: 'COOPERATION', label: 'Cooperazione' },
  { value: 'RENEWABLE_ENERGY', label: 'Energie Rinnovabili' },
  { value: 'DEVELOPMENT', label: 'Sviluppo' },
  { value: 'OTHER', label: 'Altro' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100 },
  },
};

export default function NewBandoPage() {
  const t = useTranslations('admin.bandi');
  const locale = useLocale() as Locale;
  const router = useRouter();

  const [code, setCode] = useState('');
  const [type, setType] = useState<string>('EUROPEAN');
  const [sector, setSector] = useState<string>('');
  const [fundingAmount, setFundingAmount] = useState('');
  const [fundingCurrency, setFundingCurrency] = useState('EUR');
  const [openDate, setOpenDate] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [untilFundsExhausted, setUntilFundsExhausted] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [activeLocale, setActiveLocale] = useState<Locale>(locale);

  const [translations, setTranslations] = useState<Record<Locale, BandoTranslation>>({
    it: { locale: 'it', title: '', summary: '', description: '', requirements: '', eligibility: '' },
    en: { locale: 'en', title: '', summary: '', description: '', requirements: '', eligibility: '' },
    fr: { locale: 'fr', title: '', summary: '', description: '', requirements: '', eligibility: '' },
  });

  // Create mutation
  const createMutation = trpc.bandi.create.useMutation({
    onSuccess: () => {
      toast.success('Bando creato con successo');
      router.push(`/${locale}/admin/bandi`);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante la creazione');
    },
  });

  const updateTranslation = (field: keyof BandoTranslation, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        [field]: value,
      },
    }));
  };

  // Handle file removal - delete from MinIO storage
  const handleFileRemove = async (url: string) => {
    try {
      const key = url.replace('https://s3.muscarivps.cloud/gruppo-cestari/', '');
      await fetch(`/api/upload?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Errore eliminazione file:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      toast.error('Il codice è obbligatorio');
      return;
    }

    if (!type || !['EUROPEAN', 'NATIONAL', 'REGIONAL', 'PRIVATE'].includes(type)) {
      toast.error('Il tipo di bando è obbligatorio');
      return;
    }

    if (!openDate) {
      toast.error('La data di apertura è obbligatoria');
      return;
    }

    if (!untilFundsExhausted && !closeDate) {
      toast.error('Specificare una data di chiusura o selezionare "Fino a esaurimento fondi"');
      return;
    }

    // Validate attachments are valid URLs from allowed domain
    const invalidAttachments = attachments.filter(url => {
      try {
        const parsed = new URL(url);
        return parsed.hostname !== 's3.muscarivps.cloud';
      } catch {
        return true;
      }
    });

    if (invalidAttachments.length > 0) {
      toast.error('Alcuni allegati hanno URL non validi. Rimuovili e ricaricali.');
      return;
    }

    if (!translations.it.title || !translations.it.summary || !translations.it.description) {
      toast.error('Titolo, riassunto e descrizione in italiano sono obbligatori');
      return;
    }

    const validTranslations = Object.values(translations).filter(
      (t) => t.title && t.summary && t.description
    );

    if (validTranslations.length === 0) {
      toast.error('Almeno una traduzione completa è richiesta');
      return;
    }

    createMutation.mutate({
      code,
      type: type as 'EUROPEAN' | 'NATIONAL' | 'REGIONAL' | 'PRIVATE',
      sector: sector ? sector as 'FINANCE' | 'COOPERATION' | 'RENEWABLE_ENERGY' | 'DEVELOPMENT' | 'OTHER' : undefined,
      fundingAmount: fundingAmount ? parseFloat(fundingAmount) : undefined,
      fundingCurrency,
      openDate: new Date(openDate),
      closeDate: closeDate ? new Date(closeDate) : null,
      untilFundsExhausted,
      externalUrl: externalUrl || undefined,
      attachments,
      gallery,
      isPublished,
      isFeatured,
      translations: validTranslations,
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <PageHeader
        title={t('createTitle')}
        description={t('createSubtitle')}
        badge={{ label: 'Nuovo', variant: 'info' }}
      >
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-slate-200 hover:bg-slate-100 text-slate-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createMutation.isPending || isFileUploading}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25"
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : isFileUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isFileUploading ? 'Caricamento...' : 'Salva'}
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Language tabs */}
            <Card variant="glass" delay={0.1}>
              <CardHeader
                title="Contenuto"
                description="Gestisci i contenuti multilingua"
                icon={<FileText className="h-5 w-5" />}
              />
              <CardContent>
                <Tabs value={activeLocale} onValueChange={(v) => setActiveLocale(v as Locale)}>
                  <TabsList className="mb-4 bg-slate-100">
                    <TabsTrigger value="it" className="gap-2">
                      <span>IT</span>
                      {translations.it.title && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
                    </TabsTrigger>
                    <TabsTrigger value="en" className="gap-2">
                      <span>EN</span>
                      {translations.en.title && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
                    </TabsTrigger>
                    <TabsTrigger value="fr" className="gap-2">
                      <span>FR</span>
                      {translations.fr.title && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
                    </TabsTrigger>
                  </TabsList>

                  {(['it', 'en', 'fr'] as Locale[]).map((loc) => (
                    <TabsContent key={loc} value={loc} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`title-${loc}`} className="text-slate-900">
                          Titolo {loc === 'it' && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                          id={`title-${loc}`}
                          value={translations[loc].title}
                          onChange={(e) => updateTranslation('title', e.target.value)}
                          placeholder="Titolo del bando"
                          className="bg-white border-slate-300 text-slate-900 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`summary-${loc}`} className="text-slate-900">
                          Riassunto {loc === 'it' && <span className="text-destructive">*</span>}
                        </Label>
                        <Textarea
                          id={`summary-${loc}`}
                          value={translations[loc].summary}
                          onChange={(e) => updateTranslation('summary', e.target.value)}
                          placeholder="Breve descrizione del bando"
                          rows={3}
                          className="bg-white border-slate-200 focus:border-primary resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">
                          Descrizione {loc === 'it' && <span className="text-destructive">*</span>}
                        </Label>
                        <RichTextEditor
                          content={translations[loc].description}
                          onChange={(content) => updateTranslation('description', content)}
                          placeholder="Descrizione completa del bando..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">Requisiti</Label>
                        <RichTextEditor
                          content={translations[loc].requirements}
                          onChange={(content) => updateTranslation('requirements', content)}
                          placeholder="Requisiti per partecipare..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">Eleggibilità</Label>
                        <RichTextEditor
                          content={translations[loc].eligibility}
                          onChange={(content) => updateTranslation('eligibility', content)}
                          placeholder="Chi può partecipare..."
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card variant="glass" delay={0.2}>
              <CardHeader title="Allegati" description="Carica documenti PDF, DOC, XLSX o altri file" />
              <CardContent>
                <FileUpload
                  value={attachments}
                  onChange={setAttachments}
                  folder="bandi"
                  maxFiles={20}
                  onFileRemove={handleFileRemove}
                  onUploadingChange={setIsFileUploading}
                />
              </CardContent>
            </Card>

            {/* Gallery */}
            <Card variant="glass" delay={0.25}>
              <CardHeader
                title="Galleria Immagini"
                description="Carica immagini per il bando"
                icon={<Images className="h-5 w-5" />}
              />
              <CardContent>
                <GalleryUpload
                  value={gallery}
                  onChange={setGallery}
                  folder="bandi/gallery"
                  maxImages={10}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Publish settings */}
            <Card variant="glass" delay={0.3}>
              <CardHeader title="Pubblicazione" />
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-300">
                    <div>
                      <Label htmlFor="published" className="text-slate-900 font-medium">
                        Pubblicato
                      </Label>
                      <p className="text-xs text-slate-600">Visibile al pubblico</p>
                    </div>
                    <Switch
                      id="published"
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-300">
                    <div>
                      <Label htmlFor="featured" className="text-slate-900 font-medium">
                        In evidenza
                      </Label>
                      <p className="text-xs text-slate-600">Mostrato in homepage</p>
                    </div>
                    <Switch
                      id="featured"
                      checked={isFeatured}
                      onCheckedChange={setIsFeatured}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card variant="glass" delay={0.4}>
              <CardHeader title="Dettagli" />
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-slate-900">
                      Codice <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, '-'))}
                      placeholder="ES: EU-2025-001"
                      className="bg-white border-slate-300 text-slate-900 focus:border-primary"
                    />
                    <p className="text-xs text-slate-500">Gli spazi vengono automaticamente sostituiti con trattini</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-slate-900">Tipo</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BANDO_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector" className="text-slate-900">Settore</Label>
                    <Select value={sector || 'none'} onValueChange={(v) => setSector(v === 'none' ? '' : v)}>
                      <SelectTrigger className="bg-white border-slate-200">
                        <SelectValue placeholder="Seleziona settore" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nessuno</SelectItem>
                        {SECTORS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="funding" className="text-slate-900">Importo</Label>
                      <Input
                        id="funding"
                        type="number"
                        value={fundingAmount}
                        onChange={(e) => setFundingAmount(e.target.value)}
                        placeholder="100000"
                        className="bg-white border-slate-300 text-slate-900 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-slate-900">Valuta</Label>
                      <Select value={fundingCurrency} onValueChange={setFundingCurrency}>
                        <SelectTrigger className="bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="openDate" className="text-slate-900">
                      Data apertura <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="openDate"
                      type="date"
                      value={openDate}
                      onChange={(e) => setOpenDate(e.target.value)}
                      className="bg-white border-slate-300 text-slate-900 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="closeDate" className="text-slate-900">
                      Data chiusura {!untilFundsExhausted && <span className="text-destructive">*</span>}
                    </Label>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-300 mb-2">
                      <div>
                        <Label htmlFor="untilFundsExhausted" className="text-slate-900 font-medium text-sm">
                          Fino a esaurimento fondi
                        </Label>
                        <p className="text-xs text-slate-600">Nessuna data di scadenza</p>
                      </div>
                      <Switch
                        id="untilFundsExhausted"
                        checked={untilFundsExhausted}
                        onCheckedChange={(checked) => {
                          setUntilFundsExhausted(checked);
                          if (checked) setCloseDate('');
                        }}
                      />
                    </div>
                    {!untilFundsExhausted && (
                      <Input
                        id="closeDate"
                        type="date"
                        value={closeDate}
                        onChange={(e) => setCloseDate(e.target.value)}
                        className="bg-white border-slate-300 text-slate-900 focus:border-primary"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="externalUrl" className="text-slate-900">Link esterno</Label>
                    <Input
                      id="externalUrl"
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      placeholder="https://..."
                      className="bg-white border-slate-300 text-slate-900 focus:border-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}
