'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, Card, CardHeader, CardContent, RichTextEditor, ImageUpload, GalleryUpload } from '@/components/admin';
import { ArrowLeft, Save, Eye, Loader2, Trash2, FolderKanban, BarChart3, Calendar, Images } from 'lucide-react';
import type { GalleryImage } from '@/lib/types/gallery';
import { parseGallery } from '@/lib/types/gallery';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Locale = 'it' | 'en' | 'fr';

interface ProjectTranslation {
  locale: Locale;
  title: string;
  subtitle: string;
  description: string;
  challenge: string;
  solution: string;
  results: string;
  client: string;
}

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

const SECTOR_OPTIONS = [
  { value: 'FINANCE', label: 'Finanza' },
  { value: 'COOPERATION', label: 'Cooperazione' },
  { value: 'RENEWABLE_ENERGY', label: 'Energie Rinnovabili' },
  { value: 'DEVELOPMENT', label: 'Sviluppo' },
  { value: 'OTHER', label: 'Altro' },
];

const COUNTRY_OPTIONS = [
  { value: 'IT', label: 'Italia' },
  { value: 'ET', label: 'Etiopia' },
  { value: 'KE', label: 'Kenya' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'MZ', label: 'Mozambico' },
  { value: 'AO', label: 'Angola' },
  { value: 'ZA', label: 'Sud Africa' },
  { value: 'MA', label: 'Marocco' },
  { value: 'EG', label: 'Egitto' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'GH', label: 'Ghana' },
  { value: 'SN', label: 'Senegal' },
  { value: 'CI', label: "Costa d'Avorio" },
  { value: 'CD', label: 'RD Congo' },
  { value: 'UG', label: 'Uganda' },
  { value: 'RW', label: 'Rwanda' },
];

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const locale = useLocale() as Locale;
  const router = useRouter();

  const [slug, setSlug] = useState('');
  const [sector, setSector] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [activeLocale, setActiveLocale] = useState<Locale>(locale);

  const [translations, setTranslations] = useState<Record<Locale, ProjectTranslation>>({
    it: { locale: 'it', title: '', subtitle: '', description: '', challenge: '', solution: '', results: '', client: '' },
    en: { locale: 'en', title: '', subtitle: '', description: '', challenge: '', solution: '', results: '', client: '' },
    fr: { locale: 'fr', title: '', subtitle: '', description: '', challenge: '', solution: '', results: '', client: '' },
  });

  // Get project data
  const { data: project, isLoading } = trpc.projects.getById.useQuery({ id });

  // Update mutation
  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success('Progetto aggiornato con successo');
      router.push(`/${locale}/admin/progetti`);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'aggiornamento');
    },
  });

  // Delete mutation
  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success('Progetto eliminato con successo');
      router.push(`/${locale}/admin/progetti`);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'eliminazione');
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (project) {
      setSlug(project.slug);
      setSector(project.sector);
      setCountry(project.country);
      setFeaturedImage(project.featuredImage || '');
      setGallery(parseGallery(project.gallery));
      setIsPublished(project.isPublished);
      setIsFeatured(project.isFeatured);

      // Populate translations
      const newTranslations: Record<Locale, ProjectTranslation> = {
        it: { locale: 'it', title: '', subtitle: '', description: '', challenge: '', solution: '', results: '', client: '' },
        en: { locale: 'en', title: '', subtitle: '', description: '', challenge: '', solution: '', results: '', client: '' },
        fr: { locale: 'fr', title: '', subtitle: '', description: '', challenge: '', solution: '', results: '', client: '' },
      };

      project.translations.forEach((trans: (typeof project.translations)[number]) => {
        const loc = trans.locale as Locale;
        if (newTranslations[loc]) {
          newTranslations[loc] = {
            locale: loc,
            title: trans.title,
            subtitle: trans.subtitle || '',
            description: trans.description,
            challenge: trans.challenge || '',
            solution: trans.solution || '',
            results: trans.results || '',
            client: trans.client || '',
          };
        }
      });

      setTranslations(newTranslations);
    }
  }, [project]);

  const updateTranslation = (field: keyof ProjectTranslation, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        [field]: value,
      },
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slug) {
      toast.error('Lo slug e obbligatorio');
      return;
    }

    if (!sector) {
      toast.error('Il settore e obbligatorio');
      return;
    }

    if (!country) {
      toast.error('Il paese e obbligatorio');
      return;
    }

    if (!translations.it.title || !translations.it.description) {
      toast.error('Titolo e descrizione in italiano sono obbligatori');
      return;
    }

    const validTranslations = Object.values(translations).filter(
      (t) => t.title && t.description
    );

    if (validTranslations.length === 0) {
      toast.error('Almeno una traduzione e richiesta');
      return;
    }

    updateMutation.mutate({
      id,
      slug,
      sector: sector as 'FINANCE' | 'COOPERATION' | 'RENEWABLE_ENERGY' | 'DEVELOPMENT' | 'OTHER',
      country,
      featuredImage: featuredImage || null,
      gallery,
      isPublished,
      isFeatured,
      translations: validTranslations.map(t => ({
        ...t,
        subtitle: t.subtitle || undefined,
        challenge: t.challenge || undefined,
        solution: t.solution || undefined,
        results: t.results || undefined,
        client: t.client || undefined,
      })),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900">Progetto non trovato</h2>
        <Button variant="link" onClick={() => router.back()}>
          Torna indietro
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <PageHeader
        title="Modifica Progetto"
        description="Aggiorna i dettagli del progetto"
        badge={{ label: 'Modifica', variant: 'warning' }}
      >
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-slate-200 hover:bg-slate-100 text-slate-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4 mr-2" />
              Elimina
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
              <AlertDialogDescription>
                Questa azione non puo essere annullata. Il progetto verra eliminato permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate({ id })}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button variant="outline" disabled className="border-slate-200 text-slate-400">
          <Eye className="h-4 w-4 mr-2" />
          Anteprima
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salva
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
                icon={<FolderKanban className="h-5 w-5" />}
              />
              <CardContent>
                <Tabs value={activeLocale} onValueChange={(v) => setActiveLocale(v as Locale)}>
                  <TabsList className="mb-4">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`title-${loc}`} className="text-slate-900">
                            Titolo {loc === 'it' && <span className="text-destructive">*</span>}
                          </Label>
                          <Input
                            id={`title-${loc}`}
                            value={translations[loc].title}
                            onChange={(e) => updateTranslation('title', e.target.value)}
                            placeholder="Inserisci il titolo"
                            className="bg-white border-slate-300 text-slate-900 focus:border-primary"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`subtitle-${loc}`} className="text-slate-900">
                            Sottotitolo
                          </Label>
                          <Input
                            id={`subtitle-${loc}`}
                            value={translations[loc].subtitle}
                            onChange={(e) => updateTranslation('subtitle', e.target.value)}
                            placeholder="Sottotitolo breve"
                            className="bg-white border-slate-300 text-slate-900 focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`client-${loc}`} className="text-slate-900">
                          Cliente
                        </Label>
                        <Input
                          id={`client-${loc}`}
                          value={translations[loc].client}
                          onChange={(e) => updateTranslation('client', e.target.value)}
                          placeholder="Nome del cliente"
                          className="bg-white border-slate-300 text-slate-900 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">
                          Descrizione {loc === 'it' && <span className="text-destructive">*</span>}
                        </Label>
                        <RichTextEditor
                          content={translations[loc].description}
                          onChange={(content) => updateTranslation('description', content)}
                          placeholder="Descrizione del progetto..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">
                          La Sfida
                        </Label>
                        <RichTextEditor
                          content={translations[loc].challenge}
                          onChange={(content) => updateTranslation('challenge', content)}
                          placeholder="Descrivi la sfida affrontata..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">
                          La Soluzione
                        </Label>
                        <RichTextEditor
                          content={translations[loc].solution}
                          onChange={(content) => updateTranslation('solution', content)}
                          placeholder="Descrivi la soluzione adottata..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">
                          I Risultati
                        </Label>
                        <RichTextEditor
                          content={translations[loc].results}
                          onChange={(content) => updateTranslation('results', content)}
                          placeholder="Descrivi i risultati ottenuti..."
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Gallery */}
            <Card variant="glass" delay={0.15}>
              <CardHeader
                title="Galleria Immagini"
                description="Carica e gestisci le immagini del progetto"
                icon={<Images className="h-5 w-5" />}
              />
              <CardContent>
                <GalleryUpload
                  value={gallery}
                  onChange={setGallery}
                  folder="progetti/gallery"
                  maxImages={20}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Stats */}
            <Card variant="glass" delay={0.2}>
              <CardHeader
                title="Statistiche"
                icon={<BarChart3 className="h-5 w-5" />}
              />
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white border border-slate-300">
                    <span className="text-sm text-slate-600">Creato il</span>
                    <span className="font-medium text-slate-900">
                      {new Date(project.createdAt).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white border border-slate-300">
                    <span className="text-sm text-slate-600">Aggiornato il</span>
                    <span className="font-medium text-slate-900">
                      {new Date(project.updatedAt).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

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

            {/* Meta */}
            <Card variant="glass" delay={0.4}>
              <CardHeader title="Impostazioni" />
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-slate-900">
                      Slug <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(generateSlug(e.target.value))}
                      placeholder="url-del-progetto"
                      className="bg-white border-slate-300 text-slate-900 focus:border-primary"
                    />
                    <p className="text-xs text-slate-600">
                      URL: /progetti/{slug || 'url-del-progetto'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector" className="text-slate-900">
                      Settore <span className="text-destructive">*</span>
                    </Label>
                    <Select value={sector} onValueChange={setSector}>
                      <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                        <SelectValue placeholder="Seleziona settore" />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTOR_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-slate-900">
                      Paese <span className="text-destructive">*</span>
                    </Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                        <SelectValue placeholder="Seleziona paese" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-900">
                      Immagine in evidenza
                    </Label>
                    <ImageUpload
                      value={featuredImage}
                      onChange={setFeaturedImage}
                      folder="progetti"
                      aspectRatio="video"
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
