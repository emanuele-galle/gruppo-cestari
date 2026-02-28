'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  FolderOpen,
  File,
  FileImage,
  FileSpreadsheet,
  Calendar,
  MoreVertical,
  Eye,
  Trash2,
  Grid,
  List,
  Loader2,
  X,
  CheckCircle,
} from 'lucide-react';

interface DocumentItem {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category: string;
  description: string | null;
  applicationId: string | null;
  applicationTitle: string | undefined;
  createdAt: Date | string;
}

const categoryLabels: Record<string, string> = {
  CONTRACT: 'Contratti',
  REPORT: 'Report',
  CERTIFICATE: 'Certificati',
  PRESENTATION: 'Presentazioni',
  APPLICATION: 'Candidature',
  OTHER: 'Altro',
};

const categoryOptions = [
  { key: 'all', label: 'Tutti' },
  { key: 'CONTRACT', label: 'Contratti' },
  { key: 'REPORT', label: 'Report' },
  { key: 'CERTIFICATE', label: 'Certificati' },
  { key: 'PRESENTATION', label: 'Presentazioni' },
  { key: 'APPLICATION', label: 'Candidature' },
  { key: 'OTHER', label: 'Altro' },
];

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.includes('image')) return FileImage;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DocumentsPage() {
  const t = useTranslations('portal.documents');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<string>('OTHER');
  const [uploadDescription, setUploadDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  const { data: documents, isLoading } = trpc.portal.getMyDocuments.useQuery({
    category: selectedCategory !== 'all' ? selectedCategory as "OTHER" | "CONTRACT" | "REPORT" | "CERTIFICATE" | "PRESENTATION" | "APPLICATION" : undefined,
    search: searchQuery || undefined,
  });

  const uploadMutation = trpc.portal.uploadDocument.useMutation({
    onSuccess: () => {
      toast.success('Documento caricato con successo');
      utils.portal.getMyDocuments.invalidate();
      utils.portal.getDashboardStats.invalidate();
      closeUploadModal();
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante il salvataggio');
      setIsUploading(false);
    },
  });

  const deleteMutation = trpc.portal.deleteDocument.useMutation({
    onSuccess: () => {
      toast.success('Documento eliminato');
      utils.portal.getMyDocuments.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'eliminazione');
    },
  });

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setUploadName('');
    setUploadCategory('OTHER');
    setUploadDescription('');
    setIsUploading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      // Pre-fill name with file name (without extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setUploadName(nameWithoutExt);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadName.trim()) {
      toast.error('Seleziona un file e inserisci un nome');
      return;
    }

    setIsUploading(true);

    try {
      // First, upload file to MinIO
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('folder', 'documents');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Errore durante l\'upload del file');
      }

      // Then, save document metadata to database
      await uploadMutation.mutateAsync({
        name: uploadName.trim(),
        originalName: uploadFile.name,
        mimeType: uploadFile.type,
        size: uploadFile.size,
        url: uploadResult.data.url,
        category: uploadCategory as 'CONTRACT' | 'REPORT' | 'CERTIFICATE' | 'PRESENTATION' | 'APPLICATION' | 'OTHER',
        description: uploadDescription.trim() || undefined,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Errore durante l\'upload');
      setIsUploading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo documento?')) {
      deleteMutation.mutate({ id });
    }
    setOpenMenuId(null);
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredDocuments = documents || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{t('title')}</h1>
          <p className="text-[15px] text-slate-500 mt-1">{t('subtitle')}</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Upload className="w-4 h-4" />
          {t('upload')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
          >
            {categoryOptions.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Documents */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-500">{t('noDocuments')}</p>
        </div>
      ) : viewMode === 'list' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/30">
                <th className="text-left px-6 py-4 text-[14px] font-medium text-slate-500">
                  {t('table.name')}
                </th>
                <th className="text-left px-6 py-4 text-[14px] font-medium text-slate-500 hidden md:table-cell">
                  {t('table.category')}
                </th>
                <th className="text-left px-6 py-4 text-[14px] font-medium text-slate-500 hidden sm:table-cell">
                  {t('table.size')}
                </th>
                <th className="text-left px-6 py-4 text-[14px] font-medium text-slate-500 hidden lg:table-cell">
                  {t('table.date')}
                </th>
                <th className="text-right px-6 py-4 text-[14px] font-medium text-slate-500">
                  {t('table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDocuments.map((doc: DocumentItem) => {
                const FileIcon = getFileIcon(doc.mimeType);
                return (
                  <tr key={doc.id} className="hover:bg-slate-100/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <FileIcon className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{doc.name}</p>
                          <p className="text-[13px] text-slate-500 truncate">
                            {doc.description || doc.originalName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-[14px] text-slate-500">
                        {categoryLabels[doc.category] || doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-[14px] text-slate-500">{formatFileSize(doc.size)}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-[14px] text-slate-500">{formatDate(doc.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title={t('actions.view')}
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                        </a>
                        <button
                          onClick={() => handleDownload(doc.url, doc.originalName)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title={t('actions.download')}
                        >
                          <Download className="w-4 h-4 text-slate-500" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-slate-500" />
                          </button>
                          {openMenuId === doc.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg border border-slate-200 shadow-lg z-20">
                                <button
                                  onClick={() => handleDelete(doc.id)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-[14px] text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {t('actions.delete')}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredDocuments.map((doc: DocumentItem) => {
            const FileIcon = getFileIcon(doc.mimeType);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                    <FileIcon className="w-6 h-6 text-slate-500" />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-500" />
                    </button>
                    {openMenuId === doc.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg border border-slate-200 shadow-lg z-20">
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-[14px] text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Elimina
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <h3 className="font-medium text-slate-800 truncate mb-1">{doc.name}</h3>
                <p className="text-[13px] text-slate-500 truncate mb-3">
                  {doc.description || categoryLabels[doc.category]}
                </p>
                <div className="flex items-center justify-between text-[13px] text-slate-500">
                  <span>{formatFileSize(doc.size)}</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-[14px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Visualizza
                  </a>
                  <button
                    onClick={() => handleDownload(doc.url, doc.originalName)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-[14px] text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Scarica
                  </button>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={closeUploadModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-800">Carica Documento</h2>
                  <button
                    onClick={closeUploadModal}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* File Upload Area */}
                  <div>
                    <label className="block text-[14px] font-medium text-slate-800 mb-2">
                      File *
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.jpg,.jpeg,.png,.gif,.webp"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        uploadFile
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-primary hover:bg-slate-100/30'
                      }`}
                    >
                      {uploadFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <CheckCircle className="w-8 h-8 text-primary" />
                          <div className="text-left">
                            <p className="font-medium text-slate-800">{uploadFile.name}</p>
                            <p className="text-[13px] text-slate-500">
                              {formatFileSize(uploadFile.size)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                          <p className="text-[14px] text-slate-500">
                            Clicca per selezionare un file
                          </p>
                          <p className="text-[13px] text-slate-500 mt-1">
                            PDF, Word, Excel, immagini (max 10MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Document Name */}
                  <div>
                    <label className="block text-[14px] font-medium text-slate-800 mb-2">
                      Nome documento *
                    </label>
                    <input
                      type="text"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      placeholder="Es: Contratto di collaborazione"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[14px] font-medium text-slate-800 mb-2">
                      Categoria
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
                    >
                      <option value="CONTRACT">Contratti</option>
                      <option value="REPORT">Report</option>
                      <option value="CERTIFICATE">Certificati</option>
                      <option value="PRESENTATION">Presentazioni</option>
                      <option value="APPLICATION">Candidature</option>
                      <option value="OTHER">Altro</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[14px] font-medium text-slate-800 mb-2">
                      Descrizione (opzionale)
                    </label>
                    <textarea
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="Aggiungi una descrizione..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800 resize-none"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                  <button
                    onClick={closeUploadModal}
                    disabled={isUploading}
                    className="px-4 py-2 text-[14px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!uploadFile || !uploadName.trim() || isUploading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Caricamento...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Carica
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
