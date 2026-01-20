'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, FileText, Link as LinkIcon, Check, Trash2, ExternalLink, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FileInfo {
  url: string;
  name?: string;
  size?: number;
  type?: string;
}

interface FileUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  className?: string;
  maxFiles?: number;
  accept?: string;
  maxSizeMB?: number;
  onFileRemove?: (url: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

const FILE_TYPE_ICONS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'text/plain': 'TXT',
  'text/csv': 'CSV',
};

function getFileExtension(url: string): string {
  const ext = url.split('.').pop()?.toUpperCase() || 'FILE';
  return ext.length <= 4 ? ext : 'FILE';
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  value,
  onChange,
  folder = 'attachments',
  className,
  maxFiles = 10,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar',
  maxSizeMB = 100,
  onFileRemove,
  onUploadingChange,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notify parent when uploading state changes
  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);

    if (value.length + fileArray.length > maxFiles) {
      setError(`Puoi caricare massimo ${maxFiles} file`);
      return;
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(`Caricamento ${i + 1}/${fileArray.length}: ${file.name}`);

        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`File "${file.name}" troppo grande (max ${maxSizeMB}MB)`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.message || `Errore caricamento ${file.name}`);
          continue;
        }

        uploadedUrls.push(result.data.url);
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
      }
    } catch {
      setError('Errore di connessione');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  }, [folder, onChange, value, maxFiles, maxSizeMB]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files);
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
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleUpload]);

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      if (value.length >= maxFiles) {
        setError(`Puoi aggiungere massimo ${maxFiles} file`);
        return;
      }
      if (!value.includes(urlInput.trim())) {
        onChange([...value, urlInput.trim()]);
      }
      setUrlInput('');
    }
  }, [urlInput, onChange, value, maxFiles]);

  const handleRemove = useCallback((url: string) => {
    onChange(value.filter(v => v !== url));
    onFileRemove?.(url);
  }, [onChange, value, onFileRemove]);

  return (
    <div className={cn('space-y-4', className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'url')}>
        <TabsList className="w-full bg-slate-100/50 border border-slate-200/30">
          <TabsTrigger value="upload" className="flex-1 gap-2 data-[state=active]:bg-slate-50">
            <Upload className="w-4 h-4" />
            Carica file
          </TabsTrigger>
          <TabsTrigger value="url" className="flex-1 gap-2 data-[state=active]:bg-slate-50">
            <LinkIcon className="w-4 h-4" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          <motion.div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative rounded-xl border-2 border-dashed transition-all cursor-pointer p-8',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-slate-200/50 bg-slate-100/30 hover:border-primary/50 hover:bg-slate-100/50',
              isUploading && 'pointer-events-none opacity-50'
            )}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              {isUploading ? (
                <>
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm text-slate-500">{uploadProgress || 'Caricamento in corso...'}</p>
                </>
              ) : (
                <>
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-800">
                      Trascina i file qui
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      oppure clicca per selezionare
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, ZIP (max {maxSizeMB}MB)
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="url" className="mt-3 space-y-3">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://esempio.com/documento.pdf"
              className="bg-slate-50/50 border-slate-200/50"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              className="shrink-0"
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* File list */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-600 font-medium">
            File allegati ({value.length}/{maxFiles})
          </p>
          {value.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg group"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg shrink-0">
                <span className="text-xs font-bold text-primary">
                  {getFileExtension(url)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-800 hover:text-primary truncate block flex items-center gap-1"
                >
                  {url.split('/').pop() || url}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                <p className="text-xs text-slate-500 truncate">{url}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(url)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
