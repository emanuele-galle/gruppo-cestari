import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatDate(date: Date | string, locale: string = 'it'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'it' ? 'it-IT' : locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCurrency(amount: number, currency: string = 'EUR', locale: string = 'it'): string {
  return new Intl.NumberFormat(locale === 'it' ? 'it-IT' : locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 100);
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function absoluteUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}
