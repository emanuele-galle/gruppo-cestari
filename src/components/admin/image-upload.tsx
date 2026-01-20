'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = 'images',
  className,
  aspectRatio = 'video',
  placeholder = 'Carica un\'immagine o inserisci un URL',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
  }[aspectRatio];

  const handleUpload = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || 'Errore durante l\'upload');
        return;
      }

      onChange(result.data.url);
    } catch {
      setError('Errore di connessione');
    } finally {
      setIsUploading(false);
    }
  }, [folder, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    } else {
      setError('Tipo di file non supportato');
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  }, [urlInput, onChange]);

  const handleRemove = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className={cn('space-y-3', className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'url')}>
        <TabsList className="w-full bg-slate-100/50 border border-slate-200/30">
          <TabsTrigger value="upload" className="flex-1 gap-2 data-[state=active]:bg-slate-50">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="flex-1 gap-2 data-[state=active]:bg-slate-50">
            <LinkIcon className="w-4 h-4" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          {value ? (
            <div className={cn('relative rounded-xl overflow-hidden border border-slate-200/50 bg-slate-100/30', aspectRatioClass)}>
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setError('Impossibile caricare l\'immagine')}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            <motion.div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative rounded-xl border-2 border-dashed transition-all cursor-pointer',
                aspectRatioClass,
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200/50 bg-slate-100/30 hover:border-primary/50 hover:bg-slate-100/50',
                isUploading && 'pointer-events-none opacity-50'
              )}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                {isUploading ? (
                  <>
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-sm text-slate-500">Caricamento in corso...</p>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <ImageIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-800">
                        Trascina un&apos;immagine qui
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        oppure clicca per selezionare
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      PNG, JPG, GIF, WebP (max 10MB)
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="url" className="mt-3 space-y-3">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://esempio.com/immagine.jpg"
              className="bg-slate-50/50 border-slate-200/50"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <Button
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              className="shrink-0"
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>

          {value && (
            <div className={cn('relative rounded-xl overflow-hidden border border-slate-200/50 bg-slate-100/30', aspectRatioClass)}>
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setError('Impossibile caricare l\'immagine')}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
