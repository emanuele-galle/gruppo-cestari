'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Save,
  Loader2,
  Camera,
  Shield,
  Bell,
  Key,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const t = useTranslations('portal.profile');
  const [activeTab, setActiveTab] = useState<'personal' | 'company' | 'security' | 'notifications'>('personal');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [companyData, setCompanyData] = useState({
    companyName: '',
    vatNumber: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
  });

  const [notifications, setNotifications] = useState({
    emailNewBandi: true,
    emailApplicationUpdates: true,
    emailNewDocuments: true,
    emailNewsletter: false,
  });

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Avatar upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Fetch profile data
  const { data: profile, isLoading: isLoadingProfile } = trpc.portal.getProfile.useQuery();

  // Update mutation
  const updateMutation = trpc.portal.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(t('saved'));
      setMessage({ type: 'success', text: t('saved') });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante il salvataggio');
      setMessage({ type: 'error', text: error.message || 'Errore durante il salvataggio' });
    },
  });

  // Change password mutation
  const changePasswordMutation = trpc.portal.changePassword.useMutation({
    onSuccess: () => {
      toast.success('Password aggiornata con successo');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      setShowPasswordForm(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Errore durante il cambio password');
    },
  });

  // Populate form when profile data is loaded
  useEffect(() => {
    if (profile) {
      setPersonalData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.profile?.phone || '',
      });
      setCompanyData({
        companyName: profile.profile?.companyName || '',
        vatNumber: profile.profile?.vatNumber || '',
        address: profile.profile?.address || '',
        city: profile.profile?.city || '',
        zipCode: profile.profile?.zipCode || '',
        country: profile.profile?.country || '',
      });
    }
  }, [profile]);

  const handleSave = () => {
    setMessage(null);

    updateMutation.mutate({
      name: personalData.name,
      profile: {
        companyName: companyData.companyName,
        vatNumber: companyData.vatNumber,
        phone: personalData.phone,
        address: companyData.address,
        city: companyData.city,
        country: companyData.country,
        zipCode: companyData.zipCode,
      },
    });
  };

  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Inserisci la password attuale';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'Inserisci la nuova password';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'La password deve avere almeno 8 caratteri';
    } else {
      const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
      const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
      const hasNumbers = /\d/.test(passwordData.newPassword);
      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        errors.newPassword = 'Deve contenere maiuscola, minuscola e numero';
      }
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Conferma la nuova password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Le password non coincidono';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = () => {
    if (!validatePasswordForm()) return;

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword,
    });
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo di file non supportato. Usa JPG, PNG, GIF o WebP.');
      return;
    }

    // Validate file size (2MB max for avatars)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File troppo grande (max 2MB)');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Upload to MinIO
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatars');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Upload fallito');
      }

      // Update profile with new avatar URL
      await updateMutation.mutateAsync({
        image: result.data.url,
      });

      toast.success('Avatar aggiornato con successo');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Errore durante l\'upload');
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle avatar removal
  const handleRemoveAvatar = async () => {
    if (!profile?.image) return;

    try {
      await updateMutation.mutateAsync({
        image: '',
      });
      toast.success('Avatar rimosso');
    } catch (error) {
      toast.error('Errore durante la rimozione dell\'avatar');
    }
  };

  const tabs = [
    { key: 'personal', label: t('tabs.personal'), icon: User },
    { key: 'company', label: t('tabs.company'), icon: Building2 },
    { key: 'security', label: t('tabs.security'), icon: Shield },
    { key: 'notifications', label: t('tabs.notifications'), icon: Bell },
  ];

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{t('title')}</h1>
        <p className="text-[15px] text-slate-500 mt-1">{t('subtitle')}</p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-destructive/10 text-destructive'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="text-[14px]">{message.text}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto overflow-hidden">
                  {profile?.image ? (
                    <Image
                      src={profile.image}
                      alt={profile.name || 'Avatar'}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-primary" />
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                {/* Upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                  title="Cambia avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
                {/* Remove button (if has avatar) */}
                {profile?.image && !isUploadingAvatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    title="Rimuovi avatar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                JPG, PNG, GIF o WebP (max 2MB)
              </p>
              <h2 className="mt-4 font-semibold text-slate-800">
                {profile?.name || session?.user?.name || 'Utente'}
              </h2>
              <p className="text-[14px] text-slate-500">{profile?.email || session?.user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-[13px] font-medium rounded-full">
                {t('role.client')}
              </span>
            </div>

            {/* Tabs - vertical on desktop */}
            <nav className="mt-6 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] transition-colors ${
                      activeTab === tab.key
                        ? 'bg-primary text-white'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200">
            {/* Personal tab */}
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-6">
                  {t('tabs.personal')}
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[14px] font-medium text-slate-800 mb-2">
                        {t('fields.name')}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="text"
                          value={personalData.name}
                          onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-background border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-slate-800 mb-2">
                        {t('fields.email')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="email"
                          value={personalData.email}
                          disabled
                          className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[13px] text-slate-500 mt-1">
                        L&apos;email non può essere modificata
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-slate-800 mb-2">
                      {t('fields.phone')}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="tel"
                        value={personalData.phone}
                        onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                        placeholder="+39 333 1234567"
                        className="w-full pl-11 pr-4 py-3 bg-background border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Company tab */}
            {activeTab === 'company' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-6">
                  {t('tabs.company')}
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[14px] font-medium text-slate-800 mb-2">
                        {t('fields.companyName')}
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="text"
                          value={companyData.companyName}
                          onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                          placeholder="Ragione sociale"
                          className="w-full pl-11 pr-4 py-3 bg-background border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-slate-800 mb-2">
                        {t('fields.vatNumber')}
                      </label>
                      <input
                        type="text"
                        value={companyData.vatNumber}
                        onChange={(e) => setCompanyData({ ...companyData, vatNumber: e.target.value })}
                        placeholder="IT12345678901"
                        className="w-full px-4 py-3 bg-background border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-slate-800 mb-2">
                      {t('fields.address')}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={companyData.address}
                        onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                        placeholder="Via Roma 123"
                        className="w-full pl-11 pr-4 py-3 bg-background border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[14px] font-medium text-slate-800 mb-2">
                        {t('fields.city')}
                      </label>
                      <input
                        type="text"
                        value={companyData.city}
                        onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                        placeholder="Milano"
                        className="w-full px-4 py-3 bg-background border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-slate-800 mb-2">
                        {t('fields.postalCode')}
                      </label>
                      <input
                        type="text"
                        value={companyData.zipCode}
                        onChange={(e) => setCompanyData({ ...companyData, zipCode: e.target.value })}
                        placeholder="20100"
                        className="w-full px-4 py-3 bg-background border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-slate-800 mb-2">
                        {t('fields.country')}
                      </label>
                      <input
                        type="text"
                        value={companyData.country}
                        onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })}
                        placeholder="Italia"
                        className="w-full px-4 py-3 bg-background border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-6">
                  {t('tabs.security')}
                </h3>
                <div className="space-y-6">
                  <div className="p-4 bg-slate-100/30 rounded-lg border border-slate-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Key className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{t('security.changePassword')}</h4>
                        <p className="text-[14px] text-slate-500 mt-1">
                          {t('security.changePasswordDesc')}
                        </p>

                        {!showPasswordForm ? (
                          <button
                            onClick={() => setShowPasswordForm(true)}
                            className="mt-3 px-4 py-2 text-[14px] text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            {t('security.changePasswordButton')}
                          </button>
                        ) : (
                          <div className="mt-4 space-y-4">
                            <div>
                              <label className="block text-[14px] font-medium text-slate-700 mb-1">
                                Password attuale
                              </label>
                              <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800 ${
                                  passwordErrors.currentPassword ? 'border-red-500' : 'border-slate-200'
                                }`}
                                placeholder="Inserisci la password attuale"
                              />
                              {passwordErrors.currentPassword && (
                                <p className="mt-1 text-[13px] text-red-500">{passwordErrors.currentPassword}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-[14px] font-medium text-slate-700 mb-1">
                                Nuova password
                              </label>
                              <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800 ${
                                  passwordErrors.newPassword ? 'border-red-500' : 'border-slate-200'
                                }`}
                                placeholder="Minimo 8 caratteri"
                              />
                              {passwordErrors.newPassword && (
                                <p className="mt-1 text-[13px] text-red-500">{passwordErrors.newPassword}</p>
                              )}
                              <p className="mt-1 text-[12px] text-slate-500">
                                Deve contenere almeno una maiuscola, una minuscola e un numero
                              </p>
                            </div>
                            <div>
                              <label className="block text-[14px] font-medium text-slate-700 mb-1">
                                Conferma nuova password
                              </label>
                              <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-800 ${
                                  passwordErrors.confirmPassword ? 'border-red-500' : 'border-slate-200'
                                }`}
                                placeholder="Ripeti la nuova password"
                              />
                              {passwordErrors.confirmPassword && (
                                <p className="mt-1 text-[13px] text-red-500">{passwordErrors.confirmPassword}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                              <button
                                onClick={handleChangePassword}
                                disabled={changePasswordMutation.isPending}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                              >
                                {changePasswordMutation.isPending && (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                Aggiorna Password
                              </button>
                              <button
                                onClick={() => {
                                  setShowPasswordForm(false);
                                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                  setPasswordErrors({});
                                }}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                Annulla
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-100/30 rounded-lg border border-slate-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{t('security.twoFactor')}</h4>
                        <p className="text-[14px] text-slate-500 mt-1">
                          {t('security.twoFactorDesc')}
                        </p>
                        <button
                          className="mt-3 px-4 py-2 text-[14px] bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                          disabled
                          title="Funzionalità in arrivo"
                        >
                          {t('security.enable2FA')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-100/30 rounded-lg border border-slate-200">
                    <h4 className="font-medium text-slate-800 mb-3">{t('security.sessions')}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                            <div className="w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-slate-800">Sessione corrente</p>
                            <p className="text-[13px] text-slate-500">{t('security.currentSession')}</p>
                          </div>
                        </div>
                        <span className="text-[13px] text-emerald-700 dark:text-emerald-400 font-medium">
                          {t('security.active')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications tab */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-6">
                  {t('tabs.notifications')}
                </h3>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-slate-100/30 rounded-lg border border-slate-200"
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          {t(`notifications.${key}`)}
                        </p>
                        <p className="text-[14px] text-slate-500">
                          {t(`notifications.${key}Desc`)}
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [key]: !value })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          value ? 'bg-primary' : 'bg-slate-100'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            value ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[14px] text-slate-500">
                  Le preferenze di notifica saranno disponibili a breve.
                </p>
              </motion.div>
            )}

            {/* Save button */}
            <div className="p-6 border-t border-slate-200 bg-slate-100/20">
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {t('save')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
