import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

const subscribeSchema = z.object({
  email: z.string().email('Email non valida'),
  name: z.string().optional(),
  locale: z.enum(['it', 'en', 'fr']).optional().default('it'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = subscribeSchema.parse(body);

    // Check if already subscribed
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: validatedData.email },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { success: false, message: 'Sei già iscritto alla newsletter' },
          { status: 400 }
        );
      }

      // Reactivate subscription
      await db.newsletterSubscriber.update({
        where: { email: validatedData.email },
        data: {
          isActive: true,
          unsubscribedAt: null,
          confirmedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'La tua iscrizione è stata riattivata',
      });
    }

    // Create new subscription
    const subscriber = await db.newsletterSubscriber.create({
      data: {
        email: validatedData.email,
        name: validatedData.name || null,
        locale: validatedData.locale,
        source: 'website',
        isActive: true,
        confirmedAt: new Date(),
      },
    });

    // Send welcome email
    try {
      await sendEmail({
        to: validatedData.email,
        subject: 'Benvenuto nella Newsletter di Gruppo Cestari',
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Benvenuto!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="color: #1e293b; font-size: 16px; margin: 0 0 20px 0;">
                          Grazie per esserti iscritto alla newsletter di Gruppo Cestari.
                        </p>
                        <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">
                          Riceverai aggiornamenti su:
                        </p>
                        <ul style="color: #475569; font-size: 15px; line-height: 2; margin: 0 0 25px 0; padding-left: 20px;">
                          <li>Nuovi bandi e opportunità di finanziamento</li>
                          <li>Progetti di cooperazione internazionale</li>
                          <li>Novità su energie rinnovabili e sostenibilità</li>
                          <li>Eventi e iniziative del Gruppo</li>
                        </ul>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                          Visita il nostro sito
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0;">
                        <p style="color: #94a3b8; font-size: 11px; margin: 0; text-align: center;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/newsletter/unsubscribe?email=${encodeURIComponent(validatedData.email)}" style="color: #3b82f6; text-decoration: none;">Annulla iscrizione</a>
                          &nbsp;|&nbsp;
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color: #3b82f6; text-decoration: none;">Privacy Policy</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Iscrizione completata con successo',
        id: subscriber.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email non valida',
          errors: error.issues,
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

// Unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email richiesta' },
        { status: 400 }
      );
    }

    const subscriber = await db.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: 'Email non trovata' },
        { status: 404 }
      );
    }

    await db.newsletterSubscriber.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Disiscrizione completata con successo',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante la disiscrizione' },
      { status: 500 }
    );
  }
}
