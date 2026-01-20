import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { sendEmail, emailTemplates } from '@/lib/email';

const contactSchema = z.object({
  name: z.string().min(2, 'Nome richiesto'),
  email: z.string().email('Email non valida'),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Messaggio troppo breve'),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: 'Devi accettare la privacy policy',
  }),
  // Honeypot field - must be empty
  website: z.string().optional(),
  // Turnstile token for bot verification
  turnstileToken: z.string().optional(),
});

// Verify Cloudflare Turnstile token
async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn('Turnstile: TURNSTILE_SECRET_KEY not configured, skipping verification');
    return true; // Skip verification if not configured
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      console.log('Turnstile verification failed:', result['error-codes']);
    }

    return result.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = contactSchema.parse(body);

    // Honeypot check - if website field is filled, it's likely a bot
    if (validatedData.website && validatedData.website.trim() !== '') {
      // Silently reject bot submissions without revealing why
      console.log('Honeypot triggered - bot submission blocked');
      return NextResponse.json(
        { success: true, message: 'Messaggio inviato con successo' },
        { status: 201 }
      );
    }

    // Turnstile verification (if configured)
    const turnstileEnabled = !!process.env.TURNSTILE_SECRET_KEY;
    if (turnstileEnabled) {
      if (!validatedData.turnstileToken) {
        return NextResponse.json(
          { success: false, message: 'Verifica di sicurezza richiesta' },
          { status: 400 }
        );
      }

      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';

      const isValidToken = await verifyTurnstileToken(validatedData.turnstileToken, ip);

      if (!isValidToken) {
        console.log('Turnstile verification failed - bot submission blocked');
        return NextResponse.json(
          { success: false, message: 'Verifica di sicurezza fallita. Riprova.' },
          { status: 400 }
        );
      }
    }

    // Save to database
    const contact = await db.contact.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        company: validatedData.company || null,
        subject: validatedData.subject || null,
        message: validatedData.message,
        source: 'website',
        status: 'NEW',
      },
    });

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    if (adminEmail) {
      try {
        const emailContent = emailTemplates.contactFormNotification({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          company: validatedData.company,
          subject: validatedData.subject,
          message: validatedData.message,
        });

        await sendEmail({
          to: adminEmail,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Messaggio inviato con successo',
        id: contact.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact form error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dati non validi',
          errors: error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Si è verificato un errore. Riprova più tardi.' },
      { status: 500 }
    );
  }
}

// GET - List contacts (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = status ? { status: status as 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED' } : {};

    const [contacts, total] = await Promise.all([
      db.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.contact.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel recupero dei contatti' },
      { status: 500 }
    );
  }
}
