import { z } from 'zod';
import { router, adminProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { BandoType, ProjectSector, ApplicationStatus } from '@/generated/prisma';
import { notifyBandoSubscribers, sendEmail, emailTemplates } from '@/lib/email';

// MinIO URL validation schema - only allow URLs from our S3 domain
const minioUrlSchema = z.string().url().refine(
  (url) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname === 's3.fodivps1.cloud';
    } catch {
      return false;
    }
  },
  { message: 'Solo URL dal dominio s3.fodivps1.cloud sono consentiti' }
);

// Input schemas
const bandoCreateInput = z.object({
  code: z.string().min(1).max(50),
  type: z.nativeEnum(BandoType),
  sector: z.nativeEnum(ProjectSector).optional(),
  fundingAmount: z.number().positive().optional(),
  fundingCurrency: z.string().length(3).default('EUR'),
  openDate: z.date(),
  closeDate: z.date(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  externalUrl: z.string().url().optional(),
  attachments: z.array(minioUrlSchema).default([]),
  translations: z.array(z.object({
    locale: z.enum(['it', 'en', 'fr']),
    title: z.string().min(1).max(200),
    summary: z.string().min(1),
    description: z.string().min(1),
    requirements: z.string().optional(),
    eligibility: z.string().optional(),
  })).min(1),
});

const bandoUpdateInput = z.object({
  id: z.string(),
  code: z.string().min(1).max(50).optional(),
  type: z.nativeEnum(BandoType).optional(),
  sector: z.nativeEnum(ProjectSector).nullable().optional(),
  fundingAmount: z.number().positive().nullable().optional(),
  fundingCurrency: z.string().length(3).optional(),
  openDate: z.date().optional(),
  closeDate: z.date().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  externalUrl: z.string().url().nullable().optional(),
  attachments: z.array(minioUrlSchema).optional(),
  translations: z.array(z.object({
    locale: z.enum(['it', 'en', 'fr']),
    title: z.string().min(1).max(200),
    summary: z.string().min(1),
    description: z.string().min(1),
    requirements: z.string().optional(),
    eligibility: z.string().optional(),
  })).optional(),
});

const bandoListInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.nativeEnum(BandoType).optional(),
  sector: z.nativeEnum(ProjectSector).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['open', 'closed', 'upcoming', 'all']).default('all'),
  locale: z.enum(['it', 'en', 'fr']).default('it'),
  sortBy: z.enum(['createdAt', 'openDate', 'closeDate', 'fundingAmount']).default('closeDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const bandiRouter = router({
  // List all bandi (admin)
  list: adminProcedure
    .input(bandoListInput)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, type, sector, isPublished, isFeatured, status, locale, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;
      const now = new Date();

      const where = {
        ...(type && { type }),
        ...(sector && { sector }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(status === 'open' && {
          openDate: { lte: now },
          closeDate: { gte: now },
        }),
        ...(status === 'closed' && {
          closeDate: { lt: now },
        }),
        ...(status === 'upcoming' && {
          openDate: { gt: now },
        }),
        ...(search && {
          translations: {
            some: {
              locale,
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { summary: { contains: search, mode: 'insensitive' as const } },
              ],
            },
          },
        }),
      };

      const [bandi, total] = await Promise.all([
        ctx.prisma.bando.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            translations: true,
            _count: {
              select: {
                applications: true,
                notifications: true,
              },
            },
          },
        }),
        ctx.prisma.bando.count({ where }),
      ]);

      return {
        items: bandi,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // List public bandi
  listPublic: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(12),
      type: z.nativeEnum(BandoType).optional(),
      sector: z.nativeEnum(ProjectSector).optional(),
      status: z.enum(['open', 'upcoming', 'all']).default('all'),
      locale: z.enum(['it', 'en', 'fr']).default('it'),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, type, sector, status, locale } = input;
      const skip = (page - 1) * limit;
      const now = new Date();

      const where = {
        isPublished: true,
        ...(type && { type }),
        ...(sector && { sector }),
        ...(status === 'open' && {
          openDate: { lte: now },
          closeDate: { gte: now },
        }),
        ...(status === 'upcoming' && {
          openDate: { gt: now },
        }),
      };

      const [bandi, total] = await Promise.all([
        ctx.prisma.bando.findMany({
          where,
          skip,
          take: limit,
          orderBy: { closeDate: 'asc' },
          include: {
            translations: true, // Fetch all translations for fallback
          },
        }),
        ctx.prisma.bando.count({ where }),
      ]);

      // Helper function for translation fallback
      const getTranslation = <T extends { locale: string }>(translations: T[], targetLocale: string): T | undefined => {
        return translations.find(t => t.locale === targetLocale)
          || translations.find(t => t.locale === 'it')
          || translations[0];
      };

      // Apply translation fallback to bandi items
      const itemsWithFallback = bandi.map(item => ({
        ...item,
        translations: getTranslation(item.translations, locale) ? [getTranslation(item.translations, locale)!] : [],
      }));

      return {
        items: itemsWithFallback,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single bando by ID (admin)
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const bando = await ctx.prisma.bando.findUnique({
        where: { id: input.id },
        include: {
          translations: true,
          applications: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          notifications: true,
        },
      });

      if (!bando) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bando non trovato',
        });
      }

      return bando;
    }),

  // Get public bando by code
  getByCode: publicProcedure
    .input(z.object({
      code: z.string(),
      locale: z.enum(['it', 'en', 'fr']).default('it'),
    }))
    .query(async ({ ctx, input }) => {
      // Fetch all translations for fallback
      const bando = await ctx.prisma.bando.findFirst({
        where: {
          code: input.code,
          isPublished: true,
        },
        include: {
          translations: true,
        },
      });

      if (!bando) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bando non trovato',
        });
      }

      // Filter translation with fallback to Italian
      const translation = bando.translations.find(t => t.locale === input.locale)
        || bando.translations.find(t => t.locale === 'it')
        || bando.translations[0];

      return {
        ...bando,
        translations: translation ? [translation] : [],
      };
    }),

  // Get public bando by ID (for portal applications)
  getByIdPublic: publicProcedure
    .input(z.object({
      id: z.string(),
      locale: z.enum(['it', 'en', 'fr']).default('it'),
    }))
    .query(async ({ ctx, input }) => {
      const bando = await ctx.prisma.bando.findFirst({
        where: {
          id: input.id,
          isPublished: true,
        },
        include: {
          translations: true,
        },
      });

      if (!bando) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bando non trovato',
        });
      }

      // Filter translation with fallback to Italian
      const translation = bando.translations.find(t => t.locale === input.locale)
        || bando.translations.find(t => t.locale === 'it')
        || bando.translations[0];

      return {
        ...bando,
        translations: translation ? [translation] : [],
      };
    }),

  // Create bando
  create: adminProcedure
    .input(bandoCreateInput)
    .mutation(async ({ ctx, input }) => {
      const { translations, ...bandoData } = input;

      // Check if code is unique
      const existing = await ctx.prisma.bando.findUnique({
        where: { code: input.code },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Codice bando già in uso',
        });
      }

      // Validate dates
      if (bandoData.closeDate <= bandoData.openDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'La data di chiusura deve essere successiva alla data di apertura',
        });
      }

      const bando = await ctx.prisma.bando.create({
        data: {
          ...bandoData,
          translations: {
            create: translations,
          },
        },
        include: {
          translations: true,
        },
      });

      return bando;
    }),

  // Update bando
  update: adminProcedure
    .input(bandoUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, translations, ...bandoData } = input;

      // Check if bando exists
      const existing = await ctx.prisma.bando.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bando non trovato',
        });
      }

      // Check code uniqueness if changing
      if (bandoData.code && bandoData.code !== existing.code) {
        const codeExists = await ctx.prisma.bando.findUnique({
          where: { code: bandoData.code },
        });

        if (codeExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Codice bando già in uso',
          });
        }
      }

      // Validate dates if both provided
      const openDate = bandoData.openDate ?? existing.openDate;
      const closeDate = bandoData.closeDate ?? existing.closeDate;
      if (closeDate <= openDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'La data di chiusura deve essere successiva alla data di apertura',
        });
      }

      const bando = await ctx.prisma.bando.update({
        where: { id },
        data: {
          ...bandoData,
          ...(translations && {
            translations: {
              deleteMany: {},
              create: translations,
            },
          }),
        },
        include: {
          translations: true,
        },
      });

      return bando;
    }),

  // Delete bando
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.bando.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bando non trovato',
        });
      }

      if (existing._count.applications > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Impossibile eliminare un bando con candidature esistenti',
        });
      }

      await ctx.prisma.bando.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle publish status
  togglePublish: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.bando.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bando non trovato',
        });
      }

      const bando = await ctx.prisma.bando.update({
        where: { id: input.id },
        data: {
          isPublished: !existing.isPublished,
        },
      });

      return bando;
    }),

  // Get applications for a bando
  getApplications: adminProcedure
    .input(z.object({
      bandoId: z.string(),
      status: z.nativeEnum(ApplicationStatus).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { bandoId, status, page, limit } = input;
      const skip = (page - 1) * limit;

      const where = {
        bandoId,
        ...(status && { status }),
      };

      const [applications, total] = await Promise.all([
        ctx.prisma.bandoApplication.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            documents: true,
          },
        }),
        ctx.prisma.bandoApplication.count({ where }),
      ]);

      return {
        items: applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Update application status
  updateApplicationStatus: adminProcedure
    .input(z.object({
      applicationId: z.string(),
      status: z.nativeEnum(ApplicationStatus),
      adminNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { applicationId, status, adminNotes } = input;

      const application = await ctx.prisma.bandoApplication.findUnique({
        where: { id: applicationId },
      });

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Candidatura non trovata',
        });
      }

      const updated = await ctx.prisma.bandoApplication.update({
        where: { id: applicationId },
        data: {
          status,
          ...(adminNotes !== undefined && { adminNotes }),
          reviewedAt: new Date(),
          reviewedBy: ctx.session.user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return updated;
    }),

  // Get bando statistics
  getStats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();

    const [total, published, open, upcoming, closed, totalApplications] = await Promise.all([
      ctx.prisma.bando.count(),
      ctx.prisma.bando.count({ where: { isPublished: true } }),
      ctx.prisma.bando.count({
        where: {
          isPublished: true,
          openDate: { lte: now },
          closeDate: { gte: now },
        },
      }),
      ctx.prisma.bando.count({
        where: {
          isPublished: true,
          openDate: { gt: now },
        },
      }),
      ctx.prisma.bando.count({
        where: {
          closeDate: { lt: now },
        },
      }),
      ctx.prisma.bandoApplication.count(),
    ]);

    const applicationsByStatus = await ctx.prisma.bandoApplication.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return {
      total,
      published,
      open,
      upcoming,
      closed,
      totalApplications,
      applicationsByStatus: applicationsByStatus.reduce((acc: Record<ApplicationStatus, number>, item: { status: ApplicationStatus; _count: { status: number } }) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<ApplicationStatus, number>),
    };
  }),

  // ==========================================
  // NOTIFICATION ENDPOINTS
  // ==========================================

  // Subscribe to bando notifications (public)
  subscribeNotifications: publicProcedure
    .input(z.object({
      email: z.string().email(),
      sectors: z.array(z.nativeEnum(ProjectSector)).default([]),
      types: z.array(z.nativeEnum(BandoType)).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { email, sectors, types } = input;

      // Check if already subscribed
      const existing = await ctx.prisma.bandoNotification.findFirst({
        where: {
          email,
          bandoId: null, // General subscription
        },
      });

      if (existing) {
        // Update preferences
        const updated = await ctx.prisma.bandoNotification.update({
          where: { id: existing.id },
          data: {
            sectors,
            types,
            isActive: true,
          },
        });

        return { success: true, message: 'Preferenze aggiornate', id: updated.id };
      }

      // Create new subscription
      const subscription = await ctx.prisma.bandoNotification.create({
        data: {
          email,
          sectors,
          types,
        },
      });

      // Send confirmation email
      try {
        const emailContent = emailTemplates.bandoSubscriptionConfirmation({
          email,
          sectors: sectors.length > 0 ? sectors : ['Tutti i settori'],
          types: types.length > 0 ? types : ['Tutti i tipi'],
        });

        await sendEmail({
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
      }

      return { success: true, message: 'Iscrizione completata', id: subscription.id };
    }),

  // Unsubscribe from notifications (public)
  unsubscribeNotifications: publicProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { email } = input;

      // Deactivate all subscriptions for this email
      await ctx.prisma.bandoNotification.updateMany({
        where: { email },
        data: { isActive: false },
      });

      return { success: true, message: 'Iscrizione annullata' };
    }),

  // Publish bando and send notifications (admin)
  publishWithNotifications: adminProcedure
    .input(z.object({
      id: z.string(),
      sendNotifications: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, sendNotifications } = input;

      const existing = await ctx.prisma.bando.findUnique({
        where: { id },
        include: {
          translations: true,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bando non trovato',
        });
      }

      if (existing.isPublished) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Il bando è già pubblicato',
        });
      }

      // Publish the bando
      const bando = await ctx.prisma.bando.update({
        where: { id },
        data: {
          isPublished: true,
          publishedAt: new Date(),
        },
        include: {
          translations: true,
        },
      });

      let notificationsSent = 0;

      // Send notifications if requested
      if (sendNotifications) {
        try {
          const result = await notifyBandoSubscribers({
            bando: {
              id: bando.id,
              type: bando.type,
              sectors: bando.sector ? [bando.sector] : [],
              deadline: bando.closeDate,
              translations: bando.translations.map((t: (typeof bando.translations)[number]) => ({
                locale: t.locale,
                title: t.title,
                excerpt: t.summary,
              })),
            },
            prisma: ctx.prisma,
          });
          notificationsSent = result.sent ?? 0;
        } catch (error) {
          console.error('Failed to send notifications:', error);
        }
      }

      return {
        bando,
        notifications: {
          sent: notificationsSent,
        },
      };
    }),

  // Get notification subscribers (admin)
  getNotificationSubscribers: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, isActive } = input;
      const skip = (page - 1) * limit;

      const where = {
        bandoId: null, // Only general subscriptions
        ...(isActive !== undefined && { isActive }),
      };

      const [subscribers, total] = await Promise.all([
        ctx.prisma.bandoNotification.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.bandoNotification.count({ where }),
      ]);

      return {
        items: subscribers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get notification stats (admin)
  getNotificationStats: adminProcedure.query(async ({ ctx }) => {
    const [total, active, bySector, byType] = await Promise.all([
      ctx.prisma.bandoNotification.count({ where: { bandoId: null } }),
      ctx.prisma.bandoNotification.count({ where: { bandoId: null, isActive: true } }),
      ctx.prisma.$queryRaw<Array<{ sector: string; count: bigint }>>`
        SELECT unnest(sectors) as sector, COUNT(*) as count
        FROM bando_notifications
        WHERE bando_id IS NULL AND is_active = true
        GROUP BY sector
      `,
      ctx.prisma.$queryRaw<Array<{ type: string; count: bigint }>>`
        SELECT unnest(types) as type, COUNT(*) as count
        FROM bando_notifications
        WHERE bando_id IS NULL AND is_active = true
        GROUP BY type
      `,
    ]);

    return {
      total,
      active,
      inactive: total - active,
      bySector: bySector.reduce((acc: Record<string, number>, item: { sector: string; count: bigint }) => {
        acc[item.sector] = Number(item.count);
        return acc;
      }, {} as Record<string, number>),
      byType: byType.reduce((acc: Record<string, number>, item: { type: string; count: bigint }) => {
        acc[item.type] = Number(item.count);
        return acc;
      }, {} as Record<string, number>),
    };
  }),

  // Send test notification (admin)
  sendTestNotification: adminProcedure
    .input(z.object({
      bandoId: z.string(),
      testEmail: z.string().email(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { bandoId, testEmail } = input;

      const bando = await ctx.prisma.bando.findUnique({
        where: { id: bandoId },
        include: {
          translations: true,
        },
      });

      if (!bando) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bando non trovato',
        });
      }

      const translation = bando.translations.find((t: (typeof bando.translations)[number]) => t.locale === 'it') || bando.translations[0];

      if (!translation) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Il bando non ha traduzioni',
        });
      }

      const bandoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/it/bandi/${bando.id}`;

      const emailContent = emailTemplates.newBando({
        bandoTitle: translation.title,
        bandoDescription: translation.summary || 'Visita il sito per maggiori dettagli.',
        bandoDeadline: bando.closeDate
          ? bando.closeDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
          : 'Da definire',
        bandoUrl,
        sectors: bando.sector ? [bando.sector] : [],
        bandoType: bando.type,
      });

      try {
        await sendEmail({
          to: testEmail,
          subject: `[TEST] ${emailContent.subject}`,
          html: emailContent.html,
        });

        return { success: true, message: 'Email di test inviata' };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Errore durante l\'invio dell\'email',
        });
      }
    }),
});
