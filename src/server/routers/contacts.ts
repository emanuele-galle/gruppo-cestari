import { z } from 'zod';
import { router, adminProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { ContactStatus } from '@/generated/prisma';

// Input schemas
const contactCreateInput = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1).max(5000),
  source: z.string().optional(),
});

const contactUpdateInput = z.object({
  id: z.string(),
  status: z.nativeEnum(ContactStatus).optional(),
  adminNotes: z.string().optional(),
});

const contactListInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.nativeEnum(ContactStatus).optional(),
  starred: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const contactsRouter = router({
  // List all contacts (admin)
  list: adminProcedure
    .input(contactListInput)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, status, starred, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(status && { status }),
        ...(starred !== undefined && { isStarred: starred }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { company: { contains: search, mode: 'insensitive' as const } },
            { subject: { contains: search, mode: 'insensitive' as const } },
            { message: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      };

      const [contacts, total] = await Promise.all([
        ctx.prisma.contact.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        ctx.prisma.contact.count({ where }),
      ]);

      return {
        items: contacts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get contact by ID (admin)
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const contact = await ctx.prisma.contact.findUnique({
        where: { id: input.id },
      });

      if (!contact) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Contatto non trovato',
        });
      }

      // Mark as read if new
      if (contact.status === ContactStatus.NEW) {
        await ctx.prisma.contact.update({
          where: { id: input.id },
          data: { status: ContactStatus.READ },
        });
      }

      return contact;
    }),

  // Create contact (public - from contact form)
  create: publicProcedure
    .input(contactCreateInput)
    .mutation(async ({ ctx, input }) => {
      const contact = await ctx.prisma.contact.create({
        data: input,
      });

      // Note: Admin notification is handled via /api/contacts REST endpoint

      return { success: true, id: contact.id };
    }),

  // Update contact status/notes (admin)
  update: adminProcedure
    .input(contactUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.prisma.contact.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Contatto non trovato',
        });
      }

      const contact = await ctx.prisma.contact.update({
        where: { id },
        data,
      });

      return contact;
    }),

  // Mark as replied
  markAsReplied: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.contact.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Contatto non trovato',
        });
      }

      const contact = await ctx.prisma.contact.update({
        where: { id: input.id },
        data: { status: ContactStatus.REPLIED },
      });

      return contact;
    }),

  // Archive contact
  archive: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.contact.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Contatto non trovato',
        });
      }

      const contact = await ctx.prisma.contact.update({
        where: { id: input.id },
        data: { status: ContactStatus.ARCHIVED },
      });

      return contact;
    }),

  // Bulk archive
  bulkArchive: adminProcedure
    .input(z.object({ ids: z.array(z.string()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.contact.updateMany({
        where: { id: { in: input.ids } },
        data: { status: ContactStatus.ARCHIVED },
      });

      return { success: true, count: input.ids.length };
    }),

  // Delete contact
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.contact.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Contatto non trovato',
        });
      }

      await ctx.prisma.contact.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Bulk delete
  bulkDelete: adminProcedure
    .input(z.object({ ids: z.array(z.string()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.contact.deleteMany({
        where: { id: { in: input.ids } },
      });

      return { success: true, count: input.ids.length };
    }),

  // Toggle star status
  toggleStar: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.contact.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Contatto non trovato',
        });
      }

      const contact = await ctx.prisma.contact.update({
        where: { id: input.id },
        data: { isStarred: !existing.isStarred },
      });

      return contact;
    }),

  // Get contact statistics
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [total, byStatus, recent24h, recent7d, starred] = await Promise.all([
      ctx.prisma.contact.count(),
      ctx.prisma.contact.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      ctx.prisma.contact.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      ctx.prisma.contact.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      ctx.prisma.contact.count({
        where: { isStarred: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc: Record<ContactStatus, number>, item: { status: ContactStatus; _count: { status: number } }) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<ContactStatus, number>),
      recent24h,
      recent7d,
      unread: byStatus.find((s: { status: ContactStatus; _count: { status: number } }) => s.status === ContactStatus.NEW)?._count.status ?? 0,
      starred,
    };
  }),

  // Export contacts as CSV data
  exportCsv: adminProcedure
    .input(z.object({
      status: z.nativeEnum(ContactStatus).optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { status, dateFrom, dateTo } = input;

      const contacts = await ctx.prisma.contact.findMany({
        where: {
          ...(status && { status }),
          ...(dateFrom && { createdAt: { gte: dateFrom } }),
          ...(dateTo && { createdAt: { lte: dateTo } }),
        },
        orderBy: { createdAt: 'desc' },
      });

      // Generate CSV rows
      const headers = ['ID', 'Nome', 'Email', 'Telefono', 'Azienda', 'Oggetto', 'Messaggio', 'Stato', 'Data', 'Note Admin'];
      const rows = contacts.map((c: (typeof contacts)[number]) => [
        c.id,
        c.name,
        c.email,
        c.phone ?? '',
        c.company ?? '',
        c.subject ?? '',
        c.message.replace(/"/g, '""').replace(/\n/g, ' '),
        c.status,
        c.createdAt.toISOString(),
        c.adminNotes?.replace(/"/g, '""').replace(/\n/g, ' ') ?? '',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row: (typeof rows)[number]) => row.map((cell: string | Date) => `"${cell}"`).join(',')),
      ].join('\n');

      return {
        csv,
        filename: `contacts_${new Date().toISOString().split('T')[0]}.csv`,
        count: contacts.length,
      };
    }),
});
