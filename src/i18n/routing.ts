import { defineRouting } from 'next-intl/routing';

export const locales = ['it', 'en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'it',
  localePrefix: 'always',
});

export const localeNames: Record<Locale, string> = {
  it: 'Italiano',
  en: 'English',
  fr: 'Français',
};
