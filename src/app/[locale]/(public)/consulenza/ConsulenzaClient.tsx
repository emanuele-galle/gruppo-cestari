'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Upload,
  X,
  Loader2,
  Building2,
  User,
  FileText,
  MessageSquare,
  Check,
} from 'lucide-react';

const steps = [
  { id: 1, key: 'company', icon: Building2 },
  { id: 2, key: 'contact', icon: User },
  { id: 3, key: 'request', icon: FileText },
  { id: 4, key: 'details', icon: MessageSquare },
];

const serviceOptions = [
  'financial',
  'grants',
  'international',
  'energy',
  'training',
  'other',
];

const budgetOptions = [
  'under50k',
  '50k-100k',
  '100k-500k',
  '500k-1m',
  'over1m',
  'unknown',
];

const timelineOptions = ['urgent', '1-3months', '3-6months', '6-12months', 'flexible'];

export function ConsulenzaClient() {
  const t = useTranslations('consultation');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    // Step 1: Company
    companyName: '',
    companyType: '',
    sector: '',
    employees: '',
    revenue: '',
    vatNumber: '',
    // Step 2: Contact
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    // Step 3: Request
    services: [] as string[],
    budget: '',
    timeline: '',
    // Step 4: Details
    description: '',
    goals: '',
    currentSituation: '',
    documents: [] as string[],
    privacy: false,
    newsletter: false,
  });

  const updateFormData = (field: string, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleService = (service: string) => {
    const services = formData.services.includes(service)
      ? formData.services.filter((s) => s !== service)
      : [...formData.services, service];
    updateFormData('services', services);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map((f) => f.name);
      setUploadedFiles((prev) => [...prev, ...fileNames]);
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f !== fileName));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-xl"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              {t('success.title')}
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              {t('success.message')}
            </p>
            <p className="text-sm text-slate-500 mb-8">
              {t('success.nextSteps')}
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t('success.backHome')}
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Prima consulenza gratuita
            </span>
            <h1 className="text-4xl lg:text-5xl text-slate-800 mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-slate-600">
              {t('hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Progress */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-colors ${
                      currentStep >= step.id
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="hidden sm:block ml-3">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.id
                          ? 'text-slate-800'
                          : 'text-slate-500'
                      }`}
                    >
                      {t(`steps.${step.key}.title`)}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`hidden sm:block w-24 h-0.5 mx-4 ${
                        currentStep > step.id ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {/* Step 1: Company Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-lg"
                >
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    {t('steps.company.title')}
                  </h2>
                  <p className="text-slate-600 mb-8">
                    {t('steps.company.subtitle')}
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-2">
                        {t('fields.companyName')} *
                      </label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => updateFormData('companyName', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t('placeholders.companyName')}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-2">
                          {t('fields.companyType')} *
                        </label>
                        <select
                          value={formData.companyType}
                          onChange={(e) => updateFormData('companyType', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                        >
                          <option value="">{t('placeholders.select')}</option>
                          <option value="srl">{t('companyTypes.srl')}</option>
                          <option value="spa">{t('companyTypes.spa')}</option>
                          <option value="snc">{t('companyTypes.snc')}</option>
                          <option value="sas">{t('companyTypes.sas')}</option>
                          <option value="individual">{t('companyTypes.individual')}</option>
                          <option value="cooperative">{t('companyTypes.cooperative')}</option>
                          <option value="other">{t('companyTypes.other')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-2">
                          {t('fields.sector')} *
                        </label>
                        <select
                          value={formData.sector}
                          onChange={(e) => updateFormData('sector', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                        >
                          <option value="">{t('placeholders.select')}</option>
                          <option value="manufacturing">{t('sectors.manufacturing')}</option>
                          <option value="services">{t('sectors.services')}</option>
                          <option value="commerce">{t('sectors.commerce')}</option>
                          <option value="agriculture">{t('sectors.agriculture')}</option>
                          <option value="technology">{t('sectors.technology')}</option>
                          <option value="construction">{t('sectors.construction')}</option>
                          <option value="tourism">{t('sectors.tourism')}</option>
                          <option value="other">{t('sectors.other')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-2">
                          {t('fields.employees')}
                        </label>
                        <select
                          value={formData.employees}
                          onChange={(e) => updateFormData('employees', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                        >
                          <option value="">{t('placeholders.select')}</option>
                          <option value="1-10">1-10</option>
                          <option value="11-50">11-50</option>
                          <option value="51-250">51-250</option>
                          <option value="250+">250+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-2">
                          {t('fields.revenue')}
                        </label>
                        <select
                          value={formData.revenue}
                          onChange={(e) => updateFormData('revenue', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                        >
                          <option value="">{t('placeholders.select')}</option>
                          <option value="under500k">&lt; 500.000</option>
                          <option value="500k-2m">500.000 - 2M</option>
                          <option value="2m-10m">2M - 10M</option>
                          <option value="10m-50m">10M - 50M</option>
                          <option value="over50m">&gt; 50M</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-2">
                        {t('fields.vatNumber')}
                      </label>
                      <input
                        type="text"
                        value={formData.vatNumber}
                        onChange={(e) => updateFormData('vatNumber', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t('placeholders.vatNumber')}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Contact Info */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-lg"
                >
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    {t('steps.contact.title')}
                  </h2>
                  <p className="text-slate-600 mb-8">
                    {t('steps.contact.subtitle')}
                  </p>

                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-2">
                          {t('fields.firstName')} *
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => updateFormData('firstName', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder={t('placeholders.firstName')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-2">
                          {t('fields.lastName')} *
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => updateFormData('lastName', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder={t('placeholders.lastName')}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-2">
                          {t('fields.email')} *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder={t('placeholders.email')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-2">
                          {t('fields.phone')} *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateFormData('phone', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder={t('placeholders.phone')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-2">
                        {t('fields.role')}
                      </label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => updateFormData('role', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder={t('placeholders.role')}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Request */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-lg"
                >
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    {t('steps.request.title')}
                  </h2>
                  <p className="text-slate-600 mb-8">
                    {t('steps.request.subtitle')}
                  </p>

                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-4">
                        {t('fields.services')} *
                      </label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {serviceOptions.map((service) => (
                          <button
                            key={service}
                            type="button"
                            onClick={() => toggleService(service)}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              formData.services.includes(service)
                                ? 'border-primary bg-primary/5'
                                : 'border-slate-200 hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  formData.services.includes(service)
                                    ? 'border-primary bg-primary'
                                    : 'border-slate-400'
                                }`}
                              >
                                {formData.services.includes(service) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="font-medium text-slate-800">
                                {t(`serviceOptions.${service}`)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-4">
                        {t('fields.budget')} *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {budgetOptions.map((budget) => (
                          <button
                            key={budget}
                            type="button"
                            onClick={() => updateFormData('budget', budget)}
                            className={`p-4 rounded-lg border-2 text-center transition-all ${
                              formData.budget === budget
                                ? 'border-primary bg-primary/5'
                                : 'border-slate-200 hover:border-primary/50'
                            }`}
                          >
                            <span className="text-sm font-medium text-slate-800">
                              {t(`budgetOptions.${budget}`)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-4">
                        {t('fields.timeline')} *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {timelineOptions.map((timeline) => (
                          <button
                            key={timeline}
                            type="button"
                            onClick={() => updateFormData('timeline', timeline)}
                            className={`p-4 rounded-lg border-2 text-center transition-all ${
                              formData.timeline === timeline
                                ? 'border-primary bg-primary/5'
                                : 'border-slate-200 hover:border-primary/50'
                            }`}
                          >
                            <span className="text-sm font-medium text-slate-800">
                              {t(`timelineOptions.${timeline}`)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Details */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-lg"
                >
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    {t('steps.details.title')}
                  </h2>
                  <p className="text-slate-600 mb-8">
                    {t('steps.details.subtitle')}
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-2">
                        {t('fields.description')} *
                      </label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary resize-none"
                        placeholder={t('placeholders.description')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-2">
                        {t('fields.goals')}
                      </label>
                      <textarea
                        rows={3}
                        value={formData.goals}
                        onChange={(e) => updateFormData('goals', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary resize-none"
                        placeholder={t('placeholders.goals')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-2">
                        {t('fields.documents')}
                      </label>
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 sm:p-6 text-center">
                        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 mb-3">
                          {t('placeholders.documents')}
                        </p>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                        >
                          {t('buttons.selectFiles')}
                        </label>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {uploadedFiles.map((file) => (
                            <div
                              key={file}
                              className="flex items-center justify-between px-4 py-2 bg-slate-100 rounded-lg"
                            >
                              <span className="text-sm text-slate-800">{file}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(file)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.privacy}
                          onChange={(e) => updateFormData('privacy', e.target.checked)}
                          className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-slate-600">
                          {t('fields.privacy')} *
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.newsletter}
                          onChange={(e) => updateFormData('newsletter', e.target.checked)}
                          className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-slate-600">
                          {t('fields.newsletter')}
                        </span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 text-slate-500 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('buttons.previous')}
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {t('buttons.next')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.privacy}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('buttons.submitting')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {t('buttons.submit')}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
