import { z } from 'zod';

// Phone validation (Italian and international formats)
export const phoneSchema = z
  .string()
  .regex(
    /^(\+39\s?)?(\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4})$|^(\+\d{1,3}\s?)?\d{6,15}$/,
    'Formato telefono non valido'
  )
  .optional()
  .or(z.literal(''));

// Italian VAT number (Partita IVA)
export const vatSchema = z
  .string()
  .regex(
    /^(IT)?[0-9]{11}$/i,
    'Formato P.IVA non valido (11 cifre, opzionale prefisso IT)'
  )
  .optional()
  .or(z.literal(''));

// Italian Fiscal Code (Codice Fiscale)
export const fiscalCodeSchema = z
  .string()
  .regex(
    /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i,
    'Formato Codice Fiscale non valido'
  )
  .optional()
  .or(z.literal(''));

// Password validation with requirements
export const passwordSchema = z
  .string()
  .min(8, 'La password deve essere di almeno 8 caratteri')
  .regex(/[A-Z]/, 'La password deve contenere almeno una lettera maiuscola')
  .regex(/[a-z]/, 'La password deve contenere almeno una lettera minuscola')
  .regex(/[0-9]/, 'La password deve contenere almeno un numero');

// Simpler password for login (just min length)
export const loginPasswordSchema = z
  .string()
  .min(1, 'La password è obbligatoria');

// Email validation
export const emailSchema = z
  .string()
  .email('Indirizzo email non valido')
  .min(1, 'L\'email è obbligatoria');

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Il nome deve essere di almeno 2 caratteri')
  .max(100, 'Il nome è troppo lungo')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Il nome contiene caratteri non validi');

// Company name validation
export const companyNameSchema = z
  .string()
  .min(2, 'La ragione sociale deve essere di almeno 2 caratteri')
  .max(200, 'La ragione sociale è troppo lunga')
  .optional()
  .or(z.literal(''));

// Address validation
export const addressSchema = z
  .string()
  .max(300, 'L\'indirizzo è troppo lungo')
  .optional()
  .or(z.literal(''));

// City validation
export const citySchema = z
  .string()
  .max(100, 'Il nome della città è troppo lungo')
  .optional()
  .or(z.literal(''));

// ZIP/CAP validation (Italian format)
export const zipCodeSchema = z
  .string()
  .regex(/^[0-9]{5}$/, 'CAP non valido (5 cifre)')
  .optional()
  .or(z.literal(''));

// Country validation (ISO 3166-1 alpha-2 or full name)
export const countrySchema = z
  .string()
  .max(100, 'Il nome del paese è troppo lungo')
  .optional()
  .or(z.literal(''));

// Currency/Amount validation
export const amountSchema = z
  .number()
  .min(0, 'L\'importo non può essere negativo')
  .max(999999999, 'L\'importo è troppo alto')
  .optional();

// URL validation
export const urlSchema = z
  .string()
  .url('URL non valido')
  .optional()
  .or(z.literal(''));

// Profile update schema
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema,
  companyName: companyNameSchema,
  vatNumber: vatSchema,
  address: addressSchema,
  city: citySchema,
  zipCode: zipCodeSchema,
  country: countrySchema,
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: loginPasswordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Le password non corrispondono',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'La nuova password deve essere diversa dalla precedente',
    path: ['newPassword'],
  });

// Registration schema
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Le password non corrispondono',
    path: ['confirmPassword'],
  });

// Application (Candidatura) schema
export const applicationSchema = z.object({
  bandoId: z.string().min(1, 'Seleziona un bando'),
  companyName: z.string().min(2, 'Ragione sociale obbligatoria'),
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  projectTitle: z.string().min(3, 'Titolo progetto obbligatorio').max(200),
  projectDescription: z.string().min(50, 'Descrizione troppo breve (min 50 caratteri)').max(10000),
  requestedAmount: amountSchema,
  notes: z.string().max(2000).optional(),
});

// Partial application schema for updates
export const updateApplicationSchema = applicationSchema.partial().extend({
  id: z.string(),
});

// Helper function to validate Italian VAT number checksum
export function validateItalianVAT(vat: string): boolean {
  const cleanVat = vat.replace(/^IT/i, '').trim();
  if (!/^[0-9]{11}$/.test(cleanVat)) return false;

  const digits = cleanVat.split('').map(Number);
  let sum = 0;

  for (let i = 0; i < 11; i++) {
    if (i % 2 === 0) {
      sum += digits[i];
    } else {
      const doubled = digits[i] * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    }
  }

  return sum % 10 === 0;
}

// Helper function to format phone number
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('39') && cleaned.length > 10) {
    return `+39 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

// Helper function to format VAT
export function formatVAT(vat: string): string {
  const cleaned = vat.replace(/\D/g, '').slice(0, 11);
  return cleaned ? `IT${cleaned}` : '';
}

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
