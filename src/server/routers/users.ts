import { z } from 'zod';
import { router, adminProcedure, superadminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { UserRole } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

// Input schemas
const userCreateInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100).optional(),
  role: z.nativeEnum(UserRole).default(UserRole.CLIENT),
  locale: z.enum(['it', 'en', 'fr']).default('it'),
  isActive: z.boolean().default(true),
  profile: z.object({
    companyName: z.string().optional(),
    vatNumber: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

const userUpdateInput = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  name: z.string().min(1).max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  locale: z.enum(['it', 'en', 'fr']).optional(),
  isActive: z.boolean().optional(),
  profile: z.object({
    companyName: z.string().optional(),
    vatNumber: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

const userListInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'email', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const usersRouter = router({
  // List all users (admin)
  list: adminProcedure
    .input(userListInput)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, role, isActive, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
            { profile: { companyName: { contains: search, mode: 'insensitive' as const } } },
          ],
        }),
      };

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            locale: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            profile: true,
            _count: {
              select: {
                documents: true,
                bandoApplications: true,
                consultationForms: true,
              },
            },
          },
        }),
        ctx.prisma.user.count({ where }),
      ]);

      return {
        items: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get user by ID
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          locale: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          profile: true,
          bandoApplications: {
            include: {
              bando: {
                include: {
                  translations: {
                    where: { locale: 'it' },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          documents: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          consultationForms: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          notifications: {
            where: { isRead: false },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utente non trovato',
        });
      }

      return user;
    }),

  // Create user (superadmin only)
  create: superadminProcedure
    .input(userCreateInput)
    .mutation(async ({ ctx, input }) => {
      const { profile, password, ...userData } = input;

      // Check if email is unique
      const existing = await ctx.prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email già in uso',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await ctx.prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          ...(profile && {
            profile: {
              create: profile,
            },
          }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          locale: true,
          isActive: true,
          createdAt: true,
          profile: true,
        },
      });

      return user;
    }),

  // Update user
  update: adminProcedure
    .input(userUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, profile, password, role, ...userData } = input;

      // Check if user exists
      const existing = await ctx.prisma.user.findUnique({
        where: { id },
        include: { profile: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utente non trovato',
        });
      }

      // Check email uniqueness if changing
      if (userData.email && userData.email !== existing.email) {
        const emailExists = await ctx.prisma.user.findUnique({
          where: { email: userData.email },
        });

        if (emailExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email già in uso',
          });
        }
      }

      // Only superadmin can change roles
      const currentUserRole = ctx.session.user.role;
      if (role && currentUserRole !== UserRole.SUPERADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Solo i superadmin possono modificare i ruoli',
        });
      }

      // Prevent demoting yourself
      if (id === ctx.session.user.id && role && role !== existing.role) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Non puoi modificare il tuo ruolo',
        });
      }

      // Hash password if provided
      let hashedPassword: string | undefined;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 12);
      }

      const user = await ctx.prisma.user.update({
        where: { id },
        data: {
          ...userData,
          ...(hashedPassword && { password: hashedPassword }),
          ...(role && { role }),
          ...(profile && {
            profile: existing.profile
              ? { update: profile }
              : { create: profile },
          }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          locale: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          profile: true,
        },
      });

      return user;
    }),

  // Delete user (superadmin only)
  delete: superadminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utente non trovato',
        });
      }

      // Prevent deleting yourself
      if (input.id === ctx.session.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Non puoi eliminare il tuo account',
        });
      }

      // Prevent deleting other superadmins unless you're the same
      if (existing.role === UserRole.SUPERADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Non puoi eliminare altri superadmin',
        });
      }

      await ctx.prisma.user.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle user active status
  toggleActive: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utente non trovato',
        });
      }

      // Prevent deactivating yourself
      if (input.id === ctx.session.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Non puoi disattivare il tuo account',
        });
      }

      // Only superadmin can deactivate admins/superadmins
      if (
        (existing.role === UserRole.ADMIN || existing.role === UserRole.SUPERADMIN) &&
        ctx.session.user.role !== UserRole.SUPERADMIN
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Non hai i permessi per questa azione',
        });
      }

      const user = await ctx.prisma.user.update({
        where: { id: input.id },
        data: {
          isActive: !existing.isActive,
        },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
        },
      });

      return user;
    }),

  // Reset password (generates new random password)
  resetPassword: superadminProcedure
    .input(z.object({
      id: z.string(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utente non trovato',
        });
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 12);

      await ctx.prisma.user.update({
        where: { id: input.id },
        data: { password: hashedPassword },
      });

      return { success: true };
    }),

  // Get user statistics
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [total, active, byRole] = await Promise.all([
      ctx.prisma.user.count(),
      ctx.prisma.user.count({ where: { isActive: true } }),
      ctx.prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
    ]);

    const recentUsers = await ctx.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      total,
      active,
      inactive: total - active,
      byRole: byRole.reduce((acc: Record<UserRole, number>, item: { role: UserRole; _count: { role: number } }) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {} as Record<UserRole, number>),
      recentUsers,
    };
  }),
});
