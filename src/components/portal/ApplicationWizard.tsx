'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Building2,
  Mail,
  Phone,
  FileText,
  Euro,
  Upload,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  File,
  FileImage,
  Calendar,
  Send,
  Save,
} from 'lucide-react';

interface Bando {
  id: string;
  code: string;
  title: string;
  closeDate: Date | string;
  maxFunding: number | null;
}

interface Document {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

interface ApplicationWizardProps {
  bando: Bando;
  existingApplicationId?: string;
  initialData?: {
    companyName: string;
    contactEmail: string;
    contactPhone: string;
    projectTitle: string;
    projectDescription: string;
    requestedAmount: number | null;
    notes: string;
    documentIds: string[];
  };
}

const steps = [
  { key: 'company', label: 'Dati Aziendali', icon: Building2 },
  { key: 'project', label: 'Dettagli Progetto', icon: FileText },
  { key: 'documents', label: 'Documenti', icon: Upload },
  { key: 'summary', label: 'Riepilogo', icon: Check },
];

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.includes('image')) return FileImage;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ApplicationWizard({
  bando,
  existingApplicationId,
  initialData,
}: ApplicationWizardProps) {
  const router = useRouter();
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmData, setConfirmData] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    projectTitle: initialData?.projectTitle || '',
    projectDescription: initialData?.projectDescription || '',
    requestedAmount: initialData?.requestedAmount || null as number | null,
    notes: initialData?.notes || '',
  });

  // Documents state
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(initialData?.documentIds || []);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user profile to pre-fill data
  const { data: profile } = trpc.portal.getProfile.useQuery();

  // Fetch user's documents
  const { data: myDocuments } = trpc.portal.getMyDocuments.useQuery({});

  const utils = trpc.useUtils();

  // Mutations
  const createMutation = trpc.portal.createApplication.useMutation({
    onSuccess: (data) => {
      toast.success('Bozza salvata con successo');
      utils.portal.getMyApplications.invalidate();
      return data;
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante il salvataggio');
      setIsSubmitting(false);
    },
  });

  const updateMutation = trpc.portal.updateApplication.useMutation({
    onSuccess: () => {
      toast.success('Candidatura aggiornata');
      utils.portal.getMyApplications.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'aggiornamento');
      setIsSubmitting(false);
    },
  });

  const submitMutation = trpc.portal.submitApplication.useMutation({
    onSuccess: () => {
      toast.success('Candidatura inviata con successo!');
      utils.portal.getMyApplications.invalidate();
      router.push(`/${locale}/portal/candidature`);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'invio');
      setIsSubmitting(false);
    },
  });

  const uploadDocMutation = trpc.portal.uploadDocument.useMutation({
    onSuccess: (data) => {
      setSelectedDocIds((prev) => [...prev, data.document.id]);
      utils.portal.getMyDocuments.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante il caricamento');
    },
  });

  // Pre-fill from profile
  useEffect(() => {
    if (profile && !initialData) {
      setFormData((prev) => ({
        ...prev,
        companyName: prev.companyName || profile.profile?.companyName || '',
        contactEmail: prev.contactEmail || profile.email || '',
        contactPhone: prev.contactPhone || profile.profile?.phone || '',
      }));
    }
  }, [profile, initialData]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Ragione sociale obbligatoria';
      }
      if (!formData.contactEmail.trim()) {
        newErrors.contactEmail = 'Email obbligatoria';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Email non valida';
      }
    }

    if (step === 1) {
      if (!formData.projectTitle.trim()) {
        newErrors.projectTitle = 'Titolo progetto obbligatorio';
      } else if (formData.projectTitle.length < 3) {
        newErrors.projectTitle = 'Il titolo deve avere almeno 3 caratteri';
      }
      if (!formData.projectDescription.trim()) {
        newErrors.projectDescription = 'Descrizione obbligatoria';
      } else if (formData.projectDescription.length < 10) {
        newErrors.projectDescription = 'La descrizione deve avere almeno 10 caratteri';
      }
      if (formData.requestedAmount !== null && formData.requestedAmount < 0) {
        newErrors.requestedAmount = 'L\'importo non può essere negativo';
      }
      if (bando.maxFunding && formData.requestedAmount && formData.requestedAmount > bando.maxFunding) {
        newErrors.requestedAmount = `L'importo massimo per questo bando è €${bando.maxFunding.toLocaleString()}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingFile(true);

    for (const file of Array.from(files)) {
      try {
        // Upload to MinIO first
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('folder', 'documents');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
          throw new Error(uploadResult.message || 'Errore durante l\'upload');
        }

        // Save to database
        await uploadDocMutation.mutateAsync({
          name: file.name.replace(/\.[^/.]+$/, ''),
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url: uploadResult.data.url,
          category: 'APPLICATION',
        });

        toast.success(`${file.name} caricato`);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Errore caricamento ${file.name}`);
      }
    }

    setIsUploadingFile(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleDocument = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleSaveDraft = async () => {
    if (!validateStep(0) || !validateStep(1)) {
      toast.error('Completa almeno i dati aziendali e del progetto');
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingApplicationId) {
        await updateMutation.mutateAsync({
          id: existingApplicationId,
          companyName: formData.companyName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone || undefined,
          projectTitle: formData.projectTitle,
          projectDescription: formData.projectDescription,
          requestedAmount: formData.requestedAmount || undefined,
          notes: formData.notes || undefined,
          documentIds: selectedDocIds,
        });
      } else {
        await createMutation.mutateAsync({
          bandoId: bando.id,
          companyName: formData.companyName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone || undefined,
          projectTitle: formData.projectTitle,
          projectDescription: formData.projectDescription,
          requestedAmount: formData.requestedAmount || undefined,
          notes: formData.notes || undefined,
          documentIds: selectedDocIds,
        });
      }

      router.push(`/${locale}/portal/candidature`);
    } catch {
      // Error handled in mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirmData) {
      toast.error('Devi confermare i dati inseriti');
      return;
    }

    setIsSubmitting(true);

    try {
      let applicationId = existingApplicationId;

      // If no existing application, create one first
      if (!applicationId) {
        const created = await createMutation.mutateAsync({
          bandoId: bando.id,
          companyName: formData.companyName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone || undefined,
          projectTitle: formData.projectTitle,
          projectDescription: formData.projectDescription,
          requestedAmount: formData.requestedAmount || undefined,
          notes: formData.notes || undefined,
          documentIds: selectedDocIds,
        });
        applicationId = created.application.id;
      } else {
        // Update existing
        await updateMutation.mutateAsync({
          id: applicationId,
          companyName: formData.companyName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone || undefined,
          projectTitle: formData.projectTitle,
          projectDescription: formData.projectDescription,
          requestedAmount: formData.requestedAmount || undefined,
          notes: formData.notes || undefined,
          documentIds: selectedDocIds,
        });
      }

      // Submit the application
      if (applicationId) {
        await submitMutation.mutateAsync({ id: applicationId });
      }
    } catch {
      // Error handled in mutations
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Non specificato';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const selectedDocuments = myDocuments?.filter((doc: Document) =>
    selectedDocIds.includes(doc.id)
  ) || [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Bando Info Header */}
      <div className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-primary font-medium mb-1">Candidatura per il bando</p>
            <h2 className="text-xl font-bold text-slate-800">{bando.title}</h2>
            <p className="text-sm text-slate-500 mt-1">Codice: {bando.code}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>Scadenza: {formatDate(bando.closeDate)}</span>
            </div>
            {bando.maxFunding && (
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <Euro className="w-4 h-4" />
                <span>Max: {formatCurrency(bando.maxFunding)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs sm:text-sm font-medium text-center max-w-[60px] sm:max-w-none truncate sm:whitespace-normal ${
                      isActive ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                    title={step.label}
                  >
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.label.split(' ')[0]}</span>
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 w-8 sm:w-16 md:w-24 mx-1 sm:mx-2 rounded ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Step 1: Company Data */}
          {currentStep === 0 && (
            <motion.div
              key="step-company"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-6">
                Dati Aziendali
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">
                    Ragione Sociale *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                      placeholder="Nome della tua azienda"
                      className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800 ${
                        errors.companyName ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.companyName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      Email Contatto *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, contactEmail: e.target.value })
                        }
                        placeholder="email@azienda.it"
                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800 ${
                          errors.contactEmail ? 'border-red-500' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {errors.contactEmail && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.contactEmail}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      Telefono
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, contactPhone: e.target.value })
                        }
                        placeholder="+39 333 1234567"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-500">
                  * I dati sono stati pre-compilati dal tuo profilo. Puoi modificarli per questa candidatura.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Project Details */}
          {currentStep === 1 && (
            <motion.div
              key="step-project"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-6">
                Dettagli del Progetto
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">
                    Titolo del Progetto *
                  </label>
                  <input
                    type="text"
                    value={formData.projectTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, projectTitle: e.target.value })
                    }
                    placeholder="Un titolo descrittivo per il tuo progetto"
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800 ${
                      errors.projectTitle ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.projectTitle && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.projectTitle}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">
                    Descrizione del Progetto *
                  </label>
                  <textarea
                    value={formData.projectDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, projectDescription: e.target.value })
                    }
                    placeholder="Descrivi il tuo progetto, gli obiettivi e l'impatto atteso..."
                    rows={6}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800 resize-none ${
                      errors.projectDescription ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.projectDescription && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.projectDescription}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-slate-500">
                    {formData.projectDescription.length}/10000 caratteri
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">
                    Importo Richiesto (opzionale)
                  </label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      value={formData.requestedAmount || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requestedAmount: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="0"
                      min="0"
                      className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800 ${
                        errors.requestedAmount ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {errors.requestedAmount && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.requestedAmount}
                    </p>
                  )}
                  {bando.maxFunding && (
                    <p className="mt-1 text-sm text-slate-500">
                      Importo massimo finanziabile: {formatCurrency(bando.maxFunding)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">
                    Note aggiuntive (opzionale)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Eventuali note o informazioni aggiuntive..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800 resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 2 && (
            <motion.div
              key="step-documents"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-6">
                Documenti Allegati
              </h3>

              <div className="space-y-6">
                {/* Selected Documents */}
                {selectedDocuments.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-800 mb-3">
                      Documenti selezionati ({selectedDocuments.length})
                    </p>
                    <div className="space-y-2">
                      {selectedDocuments.map((doc: Document) => {
                        const FileIcon = getFileIcon(doc.mimeType);
                        return (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileIcon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{doc.name}</p>
                                <p className="text-sm text-slate-500">
                                  {formatFileSize(doc.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleDocument(doc.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload New */}
                <div>
                  <p className="text-sm font-medium text-slate-800 mb-3">
                    Carica un nuovo documento
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingFile}
                    className="w-full p-6 border-2 border-dashed border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
                  >
                    {isUploadingFile ? (
                      <>
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <span className="text-sm text-slate-500">Caricamento in corso...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400" />
                        <span className="text-sm text-slate-500">
                          Clicca per caricare o trascina qui i file
                        </span>
                        <span className="text-xs text-slate-400">
                          PDF, Word, Excel, immagini (max 10MB)
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Select from Library */}
                {myDocuments && myDocuments.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-800 mb-3">
                      Oppure seleziona dai tuoi documenti
                    </p>
                    <div className="max-h-64 overflow-y-auto space-y-2 p-1">
                      {myDocuments
                        .filter((doc: Document) => !selectedDocIds.includes(doc.id))
                        .map((doc: Document) => {
                          const FileIcon = getFileIcon(doc.mimeType);
                          return (
                            <button
                              key={doc.id}
                              onClick={() => handleToggleDocument(doc.id)}
                              className="w-full flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <FileIcon className="w-5 h-5 text-slate-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-800 truncate">
                                  {doc.name}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {formatFileSize(doc.size)}
                                </p>
                              </div>
                              <CheckCircle className="w-5 h-5 text-slate-300" />
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                <p className="text-sm text-slate-500">
                  I documenti sono opzionali ma consigliati per una candidatura completa.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 3 && (
            <motion.div
              key="step-summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-6">
                Riepilogo Candidatura
              </h3>

              <div className="space-y-6">
                {/* Company Info */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Dati Aziendali
                  </h4>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-slate-500">Ragione Sociale</dt>
                      <dd className="font-medium text-slate-800">{formData.companyName}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Email Contatto</dt>
                      <dd className="font-medium text-slate-800">{formData.contactEmail}</dd>
                    </div>
                    {formData.contactPhone && (
                      <div>
                        <dt className="text-slate-500">Telefono</dt>
                        <dd className="font-medium text-slate-800">{formData.contactPhone}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Project Info */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Dettagli Progetto
                  </h4>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-slate-500">Titolo</dt>
                      <dd className="font-medium text-slate-800">{formData.projectTitle}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Descrizione</dt>
                      <dd className="text-slate-700 whitespace-pre-wrap">
                        {formData.projectDescription}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Importo Richiesto</dt>
                      <dd className="font-medium text-slate-800">
                        {formatCurrency(formData.requestedAmount)}
                      </dd>
                    </div>
                    {formData.notes && (
                      <div>
                        <dt className="text-slate-500">Note</dt>
                        <dd className="text-slate-700">{formData.notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Documents */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Documenti ({selectedDocuments.length})
                  </h4>
                  {selectedDocuments.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedDocuments.map((doc: Document) => (
                        <li key={doc.id} className="flex items-center gap-2 text-sm">
                          <File className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700">{doc.name}</span>
                          <span className="text-slate-400">({formatFileSize(doc.size)})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">Nessun documento allegato</p>
                  )}
                </div>

                {/* Confirm Checkbox */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmData}
                      onChange={(e) => setConfirmData(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium text-amber-800">
                        Confermo che i dati inseriti sono corretti
                      </span>
                      <p className="text-sm text-amber-700 mt-1">
                        Dichiaro che le informazioni fornite sono veritiere e complete.
                        Una volta inviata, la candidatura non potrà essere modificata.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0 || isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Indietro
          </button>

          <div className="flex items-center gap-3">
            {currentStep === 3 && (
              <button
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Salva Bozza
              </button>
            )}

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Avanti
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !confirmData}
                className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Invia Candidatura
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
