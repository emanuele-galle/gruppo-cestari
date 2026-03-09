import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import bcrypt from 'bcryptjs';

export const portalRouter = router({
  // ============================================
  // PROFILE
  // ============================================

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Utente non trovato',
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      locale: user.locale,
      profile: user.profile,
    };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        image: z.string().optional(),
        locale: z.enum(['it', 'en', 'fr']).optional(),
        profile: z
          .object({
            companyName: z.string().optional(),
            vatNumber: z.string().optional(),
            phone: z.string().optional(),
            address: z.string().optional(),
            city: z.string().optional(),
            country: z.string().optional(),
            zipCode: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { profile, ...userData } = input;

      // Update user data
      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: userData,
        include: { profile: true },
      });

      // Update or create profile if provided
      if (profile) {
        await ctx.prisma.userProfile.upsert({
          where: { userId: ctx.session.user.id },
          create: {
            userId: ctx.session.user.id,
            ...profile,
          },
          update: profile,
        });
      }

      return { success: true };
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, 'Password attuale obbligatoria'),
        newPassword: z.string().min(8, 'La nuova password deve avere almeno 8 caratteri'),
        confirmPassword: z.string().min(1, 'Conferma password obbligatoria'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate passwords match
      if (input.newPassword !== input.confirmPassword) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Le password non coincidono',
        });
      }

      // Get user with current password
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { password: true },
      });

      if (!user || !user.password) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Account configurato con accesso social. Usa il recupero password.',
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(input.currentPassword, user.password);
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Password attuale non corretta',
        });
      }

      // Validate new password strength
      const hasUpperCase = /[A-Z]/.test(input.newPassword);
      const hasLowerCase = /[a-z]/.test(input.newPassword);
      const hasNumbers = /\d/.test(input.newPassword);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'La password deve contenere almeno una maiuscola, una minuscola e un numero',
        });
      }

      // Hash and update password
      const hashedPassword = await bcrypt.hash(input.newPassword, 12);
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { password: hashedPassword },
      });

      return { success: true, message: 'Password aggiornata con successo' };
    }),

  // ============================================
  // APPLICATIONS (CANDIDATURE)
  // ============================================

  getMyApplications: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'])
          .optional(),
        search: z.string().optional(),
        locale: z.string().default('it'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, search, locale } = input;

      const applications = await ctx.prisma.bandoApplication.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(status && { status }),
          ...(search && {
            OR: [
              { projectTitle: { contains: search, mode: 'insensitive' } },
              { companyName: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          bando: {
            include: {
              translations: {
                where: { locale },
              },
            },
          },
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return applications.map((app: (typeof applications)[number]) => ({
        id: app.id,
        bandoId: app.bandoId,
        bandoCode: app.bando.code,
        bandoTitle: app.bando.translations[0]?.title || app.bando.code,
        bandoCloseDate: app.bando.closeDate,
        status: app.status,
        companyName: app.companyName,
        projectTitle: app.projectTitle,
        projectDescription: app.projectDescription,
        requestedAmount: app.requestedAmount ? Number(app.requestedAmount) : null,
        documentsCount: app.documents.length,
        submittedAt: app.submittedAt,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      }));
    }),

  getApplicationById: protectedProcedure
    .input(z.object({ id: z.string(), locale: z.string().default('it') }))
    .query(async ({ ctx, input }) => {
      const application = await ctx.prisma.bandoApplication.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id, // Only own applications
        },
        include: {
          bando: {
            include: {
              translations: {
                where: { locale: input.locale },
              },
            },
          },
          documents: true,
        },
      });

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Candidatura non trovata',
        });
      }

      return {
        ...application,
        bandoTitle: application.bando.translations[0]?.title || application.bando.code,
        requestedAmount: application.requestedAmount ? Number(application.requestedAmount) : null,
      };
    }),

  createApplication: protectedProcedure
    .input(
      z.object({
        bandoId: z.string().min(1),
        companyName: z.string().min(2),
        contactEmail: z.string().email(),
        contactPhone: z.string().optional(),
        projectTitle: z.string().min(3).max(200),
        projectDescription: z.string().min(10).max(10000),
        requestedAmount: z.number().min(0).optional(),
        notes: z.string().max(2000).optional(),
        documentIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { documentIds, ...applicationData } = input;

      // Check if bando exists and is still open
      const bando = await ctx.prisma.bando.findUnique({
        where: { id: input.bandoId },
      });

      if (!bando) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bando non trovato',
        });
      }

      if (!bando.isPublished) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Bando non disponibile',
        });
      }

      if (bando.closeDate && bando.closeDate < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Il bando è scaduto',
        });
      }

      // Check if user already has an application for this bando
      const existingApplication = await ctx.prisma.bandoApplication.findFirst({
        where: {
          userId: ctx.session.user.id,
          bandoId: input.bandoId,
          status: { not: 'WITHDRAWN' },
        },
      });

      if (existingApplication) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Hai già una candidatura per questo bando',
        });
      }

      // Create application
      const application = await ctx.prisma.bandoApplication.create({
        data: {
          userId: ctx.session.user.id,
          bandoId: applicationData.bandoId,
          companyName: applicationData.companyName,
          contactEmail: applicationData.contactEmail,
          contactPhone: applicationData.contactPhone || null,
          projectTitle: applicationData.projectTitle,
          projectDescription: applicationData.projectDescription,
          requestedAmount: applicationData.requestedAmount || null,
          notes: applicationData.notes || null,
          status: 'DRAFT',
        },
      });

      // Link documents if provided
      if (documentIds && documentIds.length > 0) {
        await ctx.prisma.document.updateMany({
          where: {
            id: { in: documentIds },
            userId: ctx.session.user.id,
          },
          data: {
            applicationId: application.id,
          },
        });
      }

      return {
        success: true,
        application: {
          id: application.id,
          status: application.status,
        },
      };
    }),

  updateApplication: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        companyName: z.string().min(2).optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        projectTitle: z.string().min(3).max(200).optional(),
        projectDescription: z.string().min(10).max(10000).optional(),
        requestedAmount: z.number().min(0).optional().nullable(),
        notes: z.string().max(2000).optional().nullable(),
        documentIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, documentIds, ...updateData } = input;

      // Get application and verify ownership and status
      const application = await ctx.prisma.bandoApplication.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Candidatura non trovata',
        });
      }

      // Can only edit DRAFT applications
      if (application.status !== 'DRAFT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Puoi modificare solo candidature in bozza',
        });
      }

      // Update application
      await ctx.prisma.bandoApplication.update({
        where: { id },
        data: updateData,
      });

      // Update document links if provided
      if (documentIds !== undefined) {
        // Remove old document links
        await ctx.prisma.document.updateMany({
          where: {
            applicationId: id,
            userId: ctx.session.user.id,
          },
          data: {
            applicationId: null,
          },
        });

        // Add new document links
        if (documentIds.length > 0) {
          await ctx.prisma.document.updateMany({
            where: {
              id: { in: documentIds },
              userId: ctx.session.user.id,
            },
            data: {
              applicationId: id,
            },
          });
        }
      }

      return { success: true };
    }),

  submitApplication: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get application and verify ownership
      const application = await ctx.prisma.bandoApplication.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          bando: true,
          documents: true,
        },
      });

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Candidatura non trovata',
        });
      }

      // Can only submit DRAFT applications
      if (application.status !== 'DRAFT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Questa candidatura è già stata inviata',
        });
      }

      // Check if bando is still open
      if (application.bando.closeDate && application.bando.closeDate < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Il bando è scaduto',
        });
      }

      // Update status to SUBMITTED
      await ctx.prisma.bandoApplication.update({
        where: { id: input.id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      });

      // Create notification for user
      await ctx.prisma.notification.create({
        data: {
          userId: ctx.session.user.id,
          type: 'APPLICATION_STATUS',
          title: 'Candidatura Inviata',
          message: `La tua candidatura per "${application.projectTitle}" è stata inviata con successo.`,
          link: `/portal/candidature/${input.id}`,
        },
      });

      return { success: true };
    }),

  withdrawApplication: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get application and verify ownership
      const application = await ctx.prisma.bandoApplication.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Candidatura non trovata',
        });
      }

      // Can only withdraw SUBMITTED or UNDER_REVIEW applications
      if (!['SUBMITTED', 'UNDER_REVIEW'].includes(application.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Non puoi ritirare questa candidatura',
        });
      }

      // Update status to WITHDRAWN
      await ctx.prisma.bandoApplication.update({
        where: { id: input.id },
        data: {
          status: 'WITHDRAWN',
        },
      });

      return { success: true };
    }),

  deleteApplication: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get application and verify ownership
      const application = await ctx.prisma.bandoApplication.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Candidatura non trovata',
        });
      }

      // Can only delete DRAFT applications
      if (application.status !== 'DRAFT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Puoi eliminare solo candidature in bozza',
        });
      }

      // Unlink documents first
      await ctx.prisma.document.updateMany({
        where: {
          applicationId: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          applicationId: null,
        },
      });

      // Delete application
      await ctx.prisma.bandoApplication.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // ============================================
  // DOCUMENTS
  // ============================================

  getMyDocuments: protectedProcedure
    .input(
      z.object({
        category: z
          .enum(['CONTRACT', 'REPORT', 'CERTIFICATE', 'PRESENTATION', 'APPLICATION', 'OTHER'])
          .optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { category, search } = input;

      const documents = await ctx.prisma.document.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(category && { category }),
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { originalName: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          application: {
            select: {
              id: true,
              projectTitle: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return documents.map((doc: (typeof documents)[number]) => ({
        id: doc.id,
        name: doc.name,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        size: doc.size,
        url: doc.url,
        category: doc.category,
        description: doc.description,
        applicationId: doc.applicationId,
        applicationTitle: doc.application?.projectTitle,
        createdAt: doc.createdAt,
      }));
    }),

  uploadDocument: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        originalName: z.string(),
        mimeType: z.string(),
        size: z.number(),
        url: z.string().url().refine(
          (url) => {
            try {
              return new URL(url).hostname === 's3.muscarivps.cloud';
            } catch {
              return false;
            }
          },
          { message: 'Solo URL dal dominio s3.muscarivps.cloud sono consentiti' }
        ),
        category: z.enum(['CONTRACT', 'REPORT', 'CERTIFICATE', 'PRESENTATION', 'APPLICATION', 'OTHER']),
        description: z.string().optional(),
        applicationId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.prisma.document.create({
        data: {
          name: input.name,
          originalName: input.originalName,
          mimeType: input.mimeType,
          size: input.size,
          url: input.url,
          category: input.category,
          description: input.description || null,
          applicationId: input.applicationId || null,
          userId: ctx.session.user.id,
        },
      });

      return {
        success: true,
        document: {
          id: document.id,
          name: document.name,
          url: document.url,
        },
      };
    }),

  deleteDocument: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const document = await ctx.prisma.document.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Documento non trovato',
        });
      }

      await ctx.prisma.document.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // ============================================
  // NOTIFICATIONS
  // ============================================

  getNotifications: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { unreadOnly, limit } = input;

      const notifications = await ctx.prisma.notification.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(unreadOnly && { isRead: false }),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      const unreadCount = await ctx.prisma.notification.count({
        where: {
          userId: ctx.session.user.id,
          isRead: false,
        },
      });

      return {
        notifications,
        unreadCount,
      };
    }),

  markNotificationRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.notification.updateMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return { success: true };
    }),

  markAllNotificationsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.notification.updateMany({
      where: {
        userId: ctx.session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  }),

  // ============================================
  // DASHBOARD STATS
  // ============================================

  getDashboardStats: protectedProcedure
    .input(z.object({ locale: z.string().default('it') }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get counts
      const [
        totalApplications,
        pendingApplications,
        approvedApplications,
        totalDocuments,
        unreadNotifications,
        recentApplications,
        recentDocuments,
        notifications,
      ] = await Promise.all([
        ctx.prisma.bandoApplication.count({ where: { userId } }),
        ctx.prisma.bandoApplication.count({
          where: { userId, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
        }),
        ctx.prisma.bandoApplication.count({ where: { userId, status: 'APPROVED' } }),
        ctx.prisma.document.count({ where: { userId } }),
        ctx.prisma.notification.count({ where: { userId, isRead: false } }),
        ctx.prisma.bandoApplication.findMany({
          where: { userId },
          include: {
            bando: {
              include: {
                translations: { where: { locale: input.locale } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        ctx.prisma.document.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        ctx.prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

      return {
        stats: {
          totalApplications,
          pendingApplications,
          approvedApplications,
          totalDocuments,
          unreadNotifications,
        },
        recentApplications: recentApplications.map((app: (typeof recentApplications)[number]) => ({
          id: app.id,
          name: app.bando.translations[0]?.title || app.bando.code,
          status: app.status,
          deadline: app.bando.closeDate,
          createdAt: app.createdAt,
        })),
        recentDocuments: recentDocuments.map((doc: (typeof recentDocuments)[number]) => ({
          id: doc.id,
          name: doc.name,
          type: doc.category,
          date: doc.createdAt,
        })),
        notifications: notifications.map((n: (typeof notifications)[number]) => ({
          id: n.id,
          message: n.message,
          time: n.createdAt,
          read: n.isRead,
          link: n.link,
        })),
      };
    }),

  // ============================================
  // BANDI DISPONIBILI (per l'utente)
  // ============================================

  getAvailableBandi: protectedProcedure
    .input(
      z.object({
        locale: z.string().default('it'),
        type: z.enum(['EUROPEAN', 'NATIONAL', 'REGIONAL', 'PRIVATE']).optional(),
        sector: z
          .enum(['FINANCE', 'COOPERATION', 'RENEWABLE_ENERGY', 'DEVELOPMENT', 'OTHER'])
          .optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { locale, type, sector, search } = input;

      const bandi = await ctx.prisma.bando.findMany({
        where: {
          isPublished: true,
          OR: [
            { closeDate: { gte: new Date() } },
            { untilFundsExhausted: true, closeDate: null },
          ],
          ...(type && { type }),
          ...(sector && { sector }),
          ...(search && {
            translations: {
              some: {
                locale,
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { summary: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          }),
        },
        include: {
          translations: { where: { locale } },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { closeDate: 'asc' },
      });

      // Get user's existing applications for these bandi
      const userApplications = await ctx.prisma.bandoApplication.findMany({
        where: {
          userId: ctx.session.user.id,
          bandoId: { in: bandi.map((b: (typeof bandi)[number]) => b.id) },
        },
        select: {
          bandoId: true,
          status: true,
        },
      });

      const applicationMap = new Map(userApplications.map((a: (typeof userApplications)[number]) => [a.bandoId, a.status]));

      return bandi.map((bando: (typeof bandi)[number]) => ({
        id: bando.id,
        code: bando.code,
        title: bando.translations[0]?.title || bando.code,
        summary: bando.translations[0]?.summary,
        type: bando.type,
        sector: bando.sector,
        fundingAmount: bando.fundingAmount ? Number(bando.fundingAmount) : null,
        fundingCurrency: bando.fundingCurrency,
        openDate: bando.openDate,
        closeDate: bando.closeDate,
        isFeatured: bando.isFeatured,
        externalUrl: bando.externalUrl,
        hasApplied: applicationMap.has(bando.id),
        applicationStatus: applicationMap.get(bando.id),
      }));
    }),
});
