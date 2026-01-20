import { z } from 'zod';
import { router, adminProcedure, superadminProcedure } from '../trpc';
import type { Prisma } from '@/generated/prisma';

// Zod schema for JSON values (Zod 4 compatible)
const jsonValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.record(z.string(), z.unknown()),
  z.array(z.unknown()),
]) as z.ZodType<Prisma.InputJsonValue>;

// Input schemas for settings
const settingSchema = z.object({
  key: z.string().min(1),
  value: jsonValue,
  category: z.string().optional().nullable(),
});

const updateSettingsSchema = z.object({
  settings: z.array(settingSchema),
});

// Settings sub-router
const settingsRouter = router({
  // Get all settings (ADMIN/SUPERADMIN only)
  getAll: superadminProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });

    // Transform to key-value object for easier frontend use
    const settingsMap: Record<string, { value: Prisma.JsonValue; category: string | null }> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = { value: s.value, category: s.category };
    });

    return {
      data: settingsMap,
      raw: settings,
    };
  }),

  // Bulk update settings (ADMIN/SUPERADMIN only)
  update: superadminProcedure
    .input(updateSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      // Use transaction for atomic updates
      await ctx.prisma.$transaction(
        input.settings.map((setting) =>
          ctx.prisma.setting.upsert({
            where: { key: setting.key },
            update: { value: setting.value, category: setting.category },
            create: { key: setting.key, value: setting.value, category: setting.category },
          })
        )
      );

      // Fetch updated settings
      const settings = await ctx.prisma.setting.findMany({
        orderBy: { key: 'asc' },
      });

      return {
        message: 'Impostazioni salvate con successo',
        data: settings,
      };
    }),

  // Create or update single setting (ADMIN/SUPERADMIN only)
  upsert: superadminProcedure
    .input(settingSchema)
    .mutation(async ({ ctx, input }) => {
      const setting = await ctx.prisma.setting.upsert({
        where: { key: input.key },
        update: { value: input.value, category: input.category },
        create: {
          key: input.key,
          value: input.value,
          category: input.category,
        },
      });

      return {
        message: 'Impostazione salvata con successo',
        data: setting,
      };
    }),

  // Delete a setting (ADMIN/SUPERADMIN only)
  delete: superadminProcedure
    .input(z.object({ key: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.setting.delete({
        where: { key: input.key },
      });

      return {
        message: 'Impostazione eliminata con successo',
      };
    }),
});

// Main admin router
export const adminRouter = router({
  // Dashboard stats (EDITOR, ADMIN, SUPERADMIN)
  getStats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get all stats in parallel
    const [
      totalNews,
      publishedNews,
      totalBandi,
      activeBandi,
      totalContacts,
      newContacts,
      totalSubscribers,
      activeSubscribers,
      recentContacts,
      recentNews,
      contactsLast7Days,
      contactsPrev7Days,
      subscribersLast7Days,
      subscribersPrev7Days,
    ] = await Promise.all([
      // News stats
      ctx.prisma.news.count(),
      ctx.prisma.news.count({ where: { isPublished: true } }),

      // Bandi stats
      ctx.prisma.bando.count(),
      ctx.prisma.bando.count({
        where: {
          isPublished: true,
          closeDate: { gte: now },
        },
      }),

      // Contacts stats
      ctx.prisma.contact.count(),
      ctx.prisma.contact.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),

      // Newsletter stats
      ctx.prisma.newsletterSubscriber.count(),
      ctx.prisma.newsletterSubscriber.count({
        where: { isActive: true },
      }),

      // Recent contacts (last 5)
      ctx.prisma.contact.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          status: true,
          createdAt: true,
        },
      }),

      // Recent news (last 5)
      ctx.prisma.news.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          translations: {
            where: { locale: 'it' },
            select: { title: true },
          },
        },
      }),

      // Trends - contacts
      ctx.prisma.contact.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      ctx.prisma.contact.count({
        where: {
          createdAt: {
            gte: fourteenDaysAgo,
            lt: sevenDaysAgo,
          },
        },
      }),

      // Trends - subscribers
      ctx.prisma.newsletterSubscriber.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      ctx.prisma.newsletterSubscriber.count({
        where: {
          createdAt: {
            gte: fourteenDaysAgo,
            lt: sevenDaysAgo,
          },
        },
      }),
    ]);

    // Calculate trends
    const contactsTrend =
      contactsPrev7Days > 0
        ? Math.round(((contactsLast7Days - contactsPrev7Days) / contactsPrev7Days) * 100)
        : contactsLast7Days > 0
        ? 100
        : 0;

    const subscribersTrend =
      subscribersPrev7Days > 0
        ? Math.round(((subscribersLast7Days - subscribersPrev7Days) / subscribersPrev7Days) * 100)
        : subscribersLast7Days > 0
        ? 100
        : 0;

    return {
      overview: {
        news: {
          total: totalNews,
          published: publishedNews,
          draft: totalNews - publishedNews,
        },
        bandi: {
          total: totalBandi,
          active: activeBandi,
          expired: totalBandi - activeBandi,
        },
        contacts: {
          total: totalContacts,
          new: newContacts,
          trend: contactsTrend,
        },
        newsletter: {
          total: totalSubscribers,
          active: activeSubscribers,
          trend: subscribersTrend,
        },
      },
      recentActivity: {
        contacts: recentContacts.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          subject: c.subject,
          status: c.status,
          date: c.createdAt,
        })),
        news: recentNews.map((n) => ({
          id: n.id,
          title: n.translations[0]?.title || 'Senza titolo',
          slug: n.slug,
          published: n.isPublished,
          date: n.publishedAt || n.createdAt,
        })),
      },
    };
  }),

  // Settings sub-router
  settings: settingsRouter,
});
