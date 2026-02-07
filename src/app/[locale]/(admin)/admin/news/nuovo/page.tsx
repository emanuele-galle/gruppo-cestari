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
import {
  PageHeader,
  Card,
  CardHeader,
  CardContent,
  RichTextEditor,
  ImageUpload,
  GalleryUpload,
  AttachmentsManager,
  VideoManager,
  type AttachmentData,
  type VideoData,
} from '@/components/admin';
import { ArrowLeft, Save, Eye, Loader2, Newspaper, Images } from 'lucide-react';
import type { GalleryImage } from '@/lib/types/gallery';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

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

export default function NewNewsPage() {
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

  // Get categories
  const { data: categories } = trpc.news.getCategories.useQuery({ locale });

  // Create mutation
  const createMutation = trpc.news.create.useMutation({
    onSuccess: () => {
      toast.success('News creata con successo');
      router.push(`/${locale}/admin/news`);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante la creazione');
    },
  });

  const updateTranslation = (field: keyof NewsTranslation, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        [field]: value,
      },
    }));
  };

  // Auto-generate slug from Italian title
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

  const handleTitleChange = (value: string) => {
    updateTranslation('title', value);
    // Auto-generate slug from Italian title
    if (activeLocale === 'it' && !slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!slug) {
      toast.error('Lo slug è obbligatorio');
      return;
    }

    if (!translations.it.title || !translations.it.content) {
      toast.error('Titolo e contenuto in italiano sono obbligatori');
      return;
    }

    // Filter translations with content
    const validTranslations = Object.values(translations).filter(
      (t) => t.title && t.content
    );

    if (validTranslations.length === 0) {
      toast.error('Almeno una traduzione è richiesta');
      return;
    }

    createMutation.mutate({
      slug,
      featuredImage: featuredImage || undefined,
      gallery,
      categoryId: categoryId || undefined,
      focalPoint: (focalPoint || 'top') as 'top' | 'center' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
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
        badge={{ label: 'Nuova', variant: 'info' }}
      >
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-slate-200 hover:bg-slate-100 text-slate-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>
        <Button variant="outline" disabled className="border-border/50">
          <Eye className="h-4 w-4 mr-2" />
          Anteprima
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25"
        >
          {createMutation.isPending ? (
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
                          onChange={(e) => handleTitleChange(e.target.value)}
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
                          className="bg-white border-slate-200 focus:border-primary resize-none"
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
            {/* Publish settings */}
            <Card variant="glass" delay={0.2}>
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
            <Card variant="glass" delay={0.3}>
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
                      <SelectTrigger className="bg-white border-slate-200">
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
