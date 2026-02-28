'use client';

import { useState, useEffect, use } from 'react';
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
import { PageHeader, Card, CardHeader, CardContent, RichTextEditor, ImageUpload, GalleryUpload } from '@/components/admin';
import { ArrowLeft, Save, Eye, Loader2, Trash2, Newspaper, BarChart3, Calendar, Images } from 'lucide-react';
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

interface NewsTranslation {
  locale: Locale;
  title: string;
  excerpt: string;
  content: string;
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

export default function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations('admin.news');
  const locale = useLocale() as Locale;
  const router = useRouter();

  const [slug, setSlug] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [focalPoint, setFocalPoint] = useState<string>('top');
  const [activeLocale, setActiveLocale] = useState<Locale>(locale);

  const [translations, setTranslations] = useState<Record<Locale, NewsTranslation>>({
    it: { locale: 'it', title: '', excerpt: '', content: '' },
    en: { locale: 'en', title: '', excerpt: '', content: '' },
    fr: { locale: 'fr', title: '', excerpt: '', content: '' },
  });

  // Get news data
  const { data: news, isLoading } = trpc.news.getById.useQuery({ id });

  // Get categories
  const { data: categories } = trpc.news.getCategories.useQuery({ locale });

  // Update mutation
  const updateMutation = trpc.news.update.useMutation({
    onSuccess: () => {
      toast.success('News aggiornata con successo');
      router.push(`/${locale}/admin/news`);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'aggiornamento');
    },
  });

  // Delete mutation
  const deleteMutation = trpc.news.delete.useMutation({
    onSuccess: () => {
      toast.success('News eliminata con successo');
      router.push(`/${locale}/admin/news`);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'eliminazione');
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (news) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- populate form from loaded data
      setSlug(news.slug);
      setFeaturedImage(news.featuredImage || '');
      setGallery(parseGallery(news.gallery));
      setCategoryId(news.categoryId || '');
      setIsPublished(news.isPublished);
      setIsFeatured(news.isFeatured);
      setFocalPoint(news.focalPoint || 'top');

      // Populate translations
      const newTranslations: Record<Locale, NewsTranslation> = {
        it: { locale: 'it', title: '', excerpt: '', content: '' },
        en: { locale: 'en', title: '', excerpt: '', content: '' },
        fr: { locale: 'fr', title: '', excerpt: '', content: '' },
      };

      news.translations.forEach((trans: (typeof news.translations)[number]) => {
        const loc = trans.locale as Locale;
        if (newTranslations[loc]) {
          newTranslations[loc] = {
            locale: loc,
            title: trans.title,
            excerpt: trans.excerpt || '',
            content: trans.content,
          };
        }
      });

      setTranslations(newTranslations);
    }
  }, [news]);

  const updateTranslation = (field: keyof NewsTranslation, value: string) => {
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
      toast.error('Lo slug è obbligatorio');
      return;
    }

    if (!translations.it.title || !translations.it.content) {
      toast.error('Titolo e contenuto in italiano sono obbligatori');
      return;
    }

    const validTranslations = Object.values(translations).filter(
      (t) => t.title && t.content
    );

    if (validTranslations.length === 0) {
      toast.error('Almeno una traduzione è richiesta');
      return;
    }

    updateMutation.mutate({
      id,
      slug,
      featuredImage: featuredImage || null,
      gallery,
      categoryId: categoryId || null,
      focalPoint: (focalPoint || 'top') as 'top' | 'center' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
      isPublished,
      isFeatured,
      translations: validTranslations,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900">News non trovata</h2>
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
        title={t('editTitle')}
        description={t('editSubtitle')}
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
                Questa azione non può essere annullata. La news verrà eliminata permanentemente.
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
                icon={<Newspaper className="h-5 w-5" />}
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
                        <Label htmlFor={`excerpt-${loc}`} className="text-slate-900">
                          Riassunto
                        </Label>
                        <Textarea
                          id={`excerpt-${loc}`}
                          value={translations[loc].excerpt}
                          onChange={(e) => updateTranslation('excerpt', e.target.value)}
                          placeholder="Breve descrizione per le anteprime"
                          rows={3}
                          className="bg-white border-slate-200 text-slate-900 focus:border-primary resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">
                          Contenuto {loc === 'it' && <span className="text-destructive">*</span>}
                        </Label>
                        <RichTextEditor
                          content={translations[loc].content}
                          onChange={(content) => updateTranslation('content', content)}
                          placeholder="Scrivi il contenuto dell'articolo..."
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
                description="Carica immagini aggiuntive per l'articolo"
                icon={<Images className="h-5 w-5" />}
              />
              <CardContent>
                <GalleryUpload
                  value={gallery}
                  onChange={setGallery}
                  folder="news/gallery"
                  maxImages={10}
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
                    <span className="text-sm text-slate-600">Visualizzazioni</span>
                    <span className="font-semibold text-slate-900">{news.viewCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white border border-slate-300">
                    <span className="text-sm text-slate-600">Creato il</span>
                    <span className="font-medium text-slate-900">
                      {new Date(news.createdAt).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  {news.publishedAt && (
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white border border-slate-300">
                      <span className="text-sm text-slate-600">Pubblicato il</span>
                      <span className="font-medium text-slate-900">
                        {new Date(news.publishedAt).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  )}
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
                      placeholder="url-della-news"
                      className="bg-white border-slate-300 text-slate-900 focus:border-primary"
                    />
                    <p className="text-xs text-slate-600">
                      URL: /news/{slug || 'url-della-news'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-900">
                      Categoria
                    </Label>
                    <Select value={categoryId || 'none'} onValueChange={(v) => setCategoryId(v === 'none' ? '' : v)}>
                      <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                        <SelectValue placeholder="Seleziona categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nessuna</SelectItem>
                        {categories?.map((cat: NonNullable<typeof categories>[number]) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.translations[0]?.name || cat.slug}
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
                      folder="news"
                      aspectRatio="video"
                    />
                  </div>

                  {/* Focal Point Selector */}
                  {featuredImage && (
                    <div className="space-y-2">
                      <Label className="text-slate-900">
                        Punto focale immagine
                      </Label>
                      <p className="text-xs text-slate-500 mb-2">
                        Seleziona dove centrare l&apos;immagine quando viene ritagliata
                      </p>
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        {/* Preview image */}
                        <img
                          src={featuredImage}
                          alt="Preview"
                          className="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                        {/* Grid overlay */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5 p-1">
                          {[
                            { value: 'top-left', label: 'Alto SX' },
                            { value: 'top', label: 'Alto' },
                            { value: 'top-right', label: 'Alto DX' },
                            { value: 'left', label: 'Sinistra' },
                            { value: 'center', label: 'Centro' },
                            { value: 'right', label: 'Destra' },
                            { value: 'bottom-left', label: 'Basso SX' },
                            { value: 'bottom', label: 'Basso' },
                            { value: 'bottom-right', label: 'Basso DX' },
                          ].map((pos) => (
                            <button
                              key={pos.value}
                              type="button"
                              onClick={() => setFocalPoint(pos.value)}
                              className={`
                                flex items-center justify-center text-xs font-medium rounded transition-all
                                ${focalPoint === pos.value
                                  ? 'bg-primary text-white shadow-lg scale-105'
                                  : 'bg-white/80 text-slate-600 hover:bg-white hover:shadow'
                                }
                              `}
                              title={pos.label}
                            >
                              {focalPoint === pos.value && (
                                <span className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 text-center mt-1">
                        Selezionato: <span className="font-medium text-primary">{focalPoint}</span>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}
