import nodemailer from 'nodemailer';

// SMTP Configuration from Hostinger
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const recipients = Array.isArray(to) ? to.join(', ') : to;

  try {
    const info = await transporter.sendMail({
      from: `"Gruppo Cestari" <${process.env.SMTP_USER}>`,
      to: recipients,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    throw error;
  }
}

// Email templates
export const emailTemplates = {
  newBando: ({
    bandoTitle,
    bandoDescription,
    bandoDeadline,
    bandoUrl,
    sectors,
    bandoType,
  }: {
    bandoTitle: string;
    bandoDescription: string;
    bandoDeadline: string;
    bandoUrl: string;
    sectors: string[];
    bandoType: string;
  }) => ({
    subject: `Nuovo Bando Disponibile: ${bandoTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuovo Bando Disponibile</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Gruppo Cestari</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Notifica Nuovo Bando</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">
                      ${bandoTitle}
                    </h2>

                    <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="color: #64748b; font-size: 13px;">Tipo:</span>
                            <span style="color: #1e293b; font-size: 14px; font-weight: 500; margin-left: 10px;">${bandoType}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="color: #64748b; font-size: 13px;">Settori:</span>
                            <span style="color: #1e293b; font-size: 14px; font-weight: 500; margin-left: 10px;">${sectors.join(', ')}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="color: #64748b; font-size: 13px;">Scadenza:</span>
                            <span style="color: #dc2626; font-size: 14px; font-weight: 600; margin-left: 10px;">${bandoDeadline}</span>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">
                      ${bandoDescription}
                    </p>

                    <a href="${bandoUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      Visualizza Bando Completo
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0; text-align: center;">
                      Ricevi questa email perché sei iscritto alle notifiche sui bandi di Gruppo Cestari.
                    </p>
                    <p style="color: #94a3b8; font-size: 11px; margin: 0; text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL}/bandi/unsubscribe" style="color: #3b82f6; text-decoration: none;">Annulla iscrizione</a>
                      &nbsp;|&nbsp;
                      <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #3b82f6; text-decoration: none;">Visita il sito</a>
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
  }),

  bandoSubscriptionConfirmation: ({
    email,
    sectors,
    types,
  }: {
    email: string;
    sectors: string[];
    types: string[];
  }) => ({
    subject: 'Iscrizione alle Notifiche Bandi Confermata',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Iscrizione Confermata</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #1e293b; font-size: 16px; margin: 0 0 20px 0;">
                      Ciao,
                    </p>
                    <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">
                      La tua iscrizione alle notifiche sui bandi è stata confermata con successo.
                      Riceverai aggiornamenti quando saranno pubblicati nuovi bandi che corrispondono alle tue preferenze.
                    </p>

                    <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                      <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 14px; font-weight: 600;">Le tue preferenze:</h3>
                      ${sectors.length > 0 ? `
                        <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">
                          <strong>Settori:</strong> ${sectors.join(', ')}
                        </p>
                      ` : ''}
                      ${types.length > 0 ? `
                        <p style="color: #64748b; font-size: 13px; margin: 0;">
                          <strong>Tipi:</strong> ${types.join(', ')}
                        </p>
                      ` : ''}
                    </div>

                    <p style="color: #64748b; font-size: 13px; margin: 0;">
                      Puoi modificare le tue preferenze o annullare l'iscrizione in qualsiasi momento.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0; text-align: center;">
                      Gruppo Cestari - Consulenza e Servizi
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
  }),

  emailVerification: ({
    name,
    verifyUrl,
  }: {
    name: string;
    verifyUrl: string;
  }) => ({
    subject: 'Verifica il tuo indirizzo email - Gruppo Cestari',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Gruppo Cestari</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Verifica Email</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #1e293b; font-size: 16px; margin: 0 0 20px 0;">
                      Ciao${name ? ` ${name}` : ''},
                    </p>
                    <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">
                      Grazie per esserti registrato su Gruppo Cestari!
                      Per completare la registrazione e attivare il tuo account, conferma il tuo indirizzo email cliccando il pulsante qui sotto.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                        Verifica Email
                      </a>
                    </div>

                    <p style="color: #64748b; font-size: 13px; margin: 25px 0 0 0;">
                      Se non hai creato un account, puoi ignorare questa email.
                      Il link e valido per 24 ore.
                    </p>

                    <p style="color: #94a3b8; font-size: 12px; margin: 15px 0 0 0;">
                      Se il pulsante non funziona, copia e incolla questo link nel browser:
                      <br>
                      <a href="${verifyUrl}" style="color: #10b981; word-break: break-all;">${verifyUrl}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0; text-align: center;">
                      Gruppo Cestari - Consulenza e Servizi
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
  }),

  passwordReset: ({
    name,
    resetUrl,
  }: {
    name: string;
    resetUrl: string;
  }) => ({
    subject: 'Reimposta Password - Gruppo Cestari',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Gruppo Cestari</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Reimposta Password</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #1e293b; font-size: 16px; margin: 0 0 20px 0;">
                      Ciao${name ? ` ${name}` : ''},
                    </p>
                    <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">
                      Abbiamo ricevuto una richiesta per reimpostare la password del tuo account.
                      Clicca il pulsante qui sotto per procedere.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                        Reimposta Password
                      </a>
                    </div>

                    <p style="color: #64748b; font-size: 13px; margin: 25px 0 0 0;">
                      Se non hai richiesto il reset della password, puoi ignorare questa email.
                      Il link è valido per 1 ora.
                    </p>

                    <p style="color: #94a3b8; font-size: 12px; margin: 15px 0 0 0;">
                      Se il pulsante non funziona, copia e incolla questo link nel browser:
                      <br>
                      <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0; text-align: center;">
                      Gruppo Cestari - Consulenza e Servizi
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
  }),

  contactFormNotification: ({
    name,
    email,
    phone,
    company,
    subject,
    message,
  }: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    subject?: string;
    message: string;
  }) => ({
    subject: `Nuovo Messaggio da: ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #1e40af; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Nuovo Messaggio di Contatto</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          <strong style="color: #64748b;">Nome:</strong>
                          <span style="color: #1e293b; margin-left: 10px;">${name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          <strong style="color: #64748b;">Email:</strong>
                          <a href="mailto:${email}" style="color: #3b82f6; margin-left: 10px;">${email}</a>
                        </td>
                      </tr>
                      ${phone ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          <strong style="color: #64748b;">Telefono:</strong>
                          <span style="color: #1e293b; margin-left: 10px;">${phone}</span>
                        </td>
                      </tr>
                      ` : ''}
                      ${company ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          <strong style="color: #64748b;">Azienda:</strong>
                          <span style="color: #1e293b; margin-left: 10px;">${company}</span>
                        </td>
                      </tr>
                      ` : ''}
                      ${subject ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          <strong style="color: #64748b;">Oggetto:</strong>
                          <span style="color: #1e293b; margin-left: 10px;">${subject}</span>
                        </td>
                      </tr>
                      ` : ''}
                    </table>

                    <div style="margin-top: 20px; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                      <strong style="color: #64748b; display: block; margin-bottom: 10px;">Messaggio:</strong>
                      <p style="color: #1e293b; margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  }),
};

// Send notification to all subscribers when a new bando is published
export async function notifyBandoSubscribers({
  bando,
  prisma,
}: {
  bando: {
    id: string;
    type: string;
    sectors: string[];
    deadline: Date | null;
    translations: Array<{
      locale: string;
      title: string;
      excerpt: string | null;
    }>;
  };
  prisma: import('@/generated/prisma').PrismaClient;
}) {
  // Get Italian translation for the email
  const translation = bando.translations.find(t => t.locale === 'it') || bando.translations[0];

  if (!translation) {
    return { success: false, error: 'No translation found' };
  }

  // Find subscribers interested in this bando's sectors and type
  const subscribers = await prisma.bandoNotification.findMany({
    where: {
      isActive: true,
      bandoId: null, // General subscriptions, not specific to a bando
      OR: [
        { sectors: { hasSome: bando.sectors as never[] } },
        { types: { has: bando.type as never } },
        // Also include users who haven't specified preferences (all interests)
        {
          AND: [
            { sectors: { isEmpty: true } },
            { types: { isEmpty: true } },
          ],
        },
      ],
    },
    select: {
      email: true,
    },
  });

  if (subscribers.length === 0) {
    return { success: true, sent: 0 };
  }

  const emails: string[] = Array.from(new Set(subscribers.map((s: { email: string }) => s.email)));
  const bandoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/it/bandi/${bando.id}`;

  const emailContent = emailTemplates.newBando({
    bandoTitle: translation.title,
    bandoDescription: translation.excerpt || 'Visita il sito per maggiori dettagli.',
    bandoDeadline: bando.deadline
      ? bando.deadline.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
      : 'Da definire',
    bandoUrl,
    sectors: bando.sectors,
    bandoType: bando.type,
  });

  try {
    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    let sent = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await sendEmail({
        to: batch,
        subject: emailContent.subject,
        html: emailContent.html,
      });
      sent += batch.length;
    }

    return { success: true, sent };
  } catch (error) {
    return { success: false, error };
  }
}
