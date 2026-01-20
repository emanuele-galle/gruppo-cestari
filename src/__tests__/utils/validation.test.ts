import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Test validation schemas similar to those used in the contact form
const contactFormSchema = z.object({
  name: z.string().min(1, 'Nome richiesto').max(100),
  email: z.string().email('Email non valida'),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1, 'Messaggio richiesto').max(5000),
});

describe('Contact Form Validation', () => {
  it('should validate a correct contact form', () => {
    const validData = {
      name: 'Mario Rossi',
      email: 'mario@example.com',
      message: 'Questo è un messaggio di test',
    };

    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const invalidData = {
      name: '',
      email: 'mario@example.com',
      message: 'Test message',
    };

    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const invalidData = {
      name: 'Mario Rossi',
      email: 'not-an-email',
      message: 'Test message',
    };

    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject empty message', () => {
    const invalidData = {
      name: 'Mario Rossi',
      email: 'mario@example.com',
      message: '',
    };

    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should accept optional fields', () => {
    const validData = {
      name: 'Mario Rossi',
      email: 'mario@example.com',
      phone: '+39 123 456 7890',
      company: 'Test Company',
      subject: 'Informazioni',
      message: 'Messaggio di test',
    };

    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject message over 5000 characters', () => {
    const invalidData = {
      name: 'Mario Rossi',
      email: 'mario@example.com',
      message: 'a'.repeat(5001),
    };

    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

// News validation schema
const newsCreateSchema = z.object({
  slug: z.string().min(1).max(100),
  isPublished: z.boolean().default(false),
  translations: z.array(z.object({
    locale: z.enum(['it', 'en', 'fr']),
    title: z.string().min(1).max(200),
    content: z.string().min(1),
  })).min(1),
});

describe('News Validation', () => {
  it('should validate a correct news article', () => {
    const validData = {
      slug: 'articolo-di-test',
      isPublished: false,
      translations: [
        {
          locale: 'it',
          title: 'Titolo di Test',
          content: 'Contenuto dell\'articolo',
        },
      ],
    };

    const result = newsCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty slug', () => {
    const invalidData = {
      slug: '',
      isPublished: false,
      translations: [
        {
          locale: 'it',
          title: 'Titolo',
          content: 'Contenuto',
        },
      ],
    };

    const result = newsCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject empty translations', () => {
    const invalidData = {
      slug: 'test-article',
      isPublished: false,
      translations: [],
    };

    const result = newsCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid locale', () => {
    const invalidData = {
      slug: 'test-article',
      isPublished: false,
      translations: [
        {
          locale: 'de', // Not supported
          title: 'Titel',
          content: 'Inhalt',
        },
      ],
    };

    const result = newsCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
