import { z } from 'zod';
import { router, adminProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Enum values matching Prisma schema
const ProjectSectorEnum = z.enum(['FINANCE', 'COOPERATION', 'RENEWABLE_ENERGY', 'DEVELOPMENT', 'OTHER']);

// Input schemas
const projectCreateInput = z.object({
  slug: z.string().min(1).max(100),
  sector: ProjectSectorEnum,
  country: z.string().length(2), // ISO country code
  featuredImage: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().default(0),
  translations: z.array(z.object({
    locale: z.enum(['it', 'en', 'fr']),
    title: z.string().min(1).max(200),
    subtitle: z.string().optional(),
    description: z.string().min(1),
    challenge: z.string().optional(),
    solution: z.string().optional(),
    results: z.string().optional(),
    client: z.string().optional(),
  })).min(1),
});

const projectUpdateInput = z.object({
  id: z.string(),
  slug: z.string().min(1).max(100).optional(),
  sector: ProjectSectorEnum.optional(),
  country: z.string().length(2).optional(),
  featuredImage: z.string().nullable().optional(),
  gallery: z.array(z.string()).optional(),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().optional(),
  translations: z.array(z.object({
    locale: z.enum(['it', 'en', 'fr']),
    title: z.string().min(1).max(200),
    subtitle: z.string().optional(),
    description: z.string().min(1),
    challenge: z.string().optional(),
    solution: z.string().optional(),
    results: z.string().optional(),
    client: z.string().optional(),
  })).optional(),
});

const projectListInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sector: ProjectSectorEnum.optional(),
  country: z.string().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  locale: z.enum(['it', 'en', 'fr']).default('it'),
  sortBy: z.enum(['createdAt', 'sortOrder', 'startDate']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const projectsRouter = router({
  // List all projects (admin)
  list: adminProcedure
    .input(projectListInput)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, sector, country, isPublished, isFeatured, locale, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(sector && { sector }),
        ...(country && { country }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(search && {
          translations: {
            some: {
              locale,
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
              ],
            },
          },
        }),
      };

      const [projects, total] = await Promise.all([
        ctx.prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            translations: true,
          },
        }),
        ctx.prisma.project.count({ where }),
      ]);

      return {
        items: projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single project by ID (admin)
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.id },
        include: {
          translations: true,
          seoMeta: true,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Progetto non trovato',
        });
      }

      return project;
    }),

  // Get single project by slug (public)
  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
      locale: z.enum(['it', 'en', 'fr']).default('it'),
    }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findFirst({
        where: {
          slug: input.slug,
          isPublished: true,
        },
        include: {
          translations: true,
          seoMeta: true,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Progetto non trovato',
        });
      }

      // Filter translation with fallback to Italian
      const translation = project.translations.find(t => t.locale === input.locale)
        || project.translations.find(t => t.locale === 'it')
        || project.translations[0];

      const seoMeta = project.seoMeta?.find(s => s.locale === input.locale)
        || project.seoMeta?.find(s => s.locale === 'it')
        || project.seoMeta?.[0];

      return {
        ...project,
        translations: translation ? [translation] : [],
        seoMeta: seoMeta ? [seoMeta] : [],
      };
    }),

  // List public projects
  listPublic: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(12),
      sector: ProjectSectorEnum.optional(),
      country: z.string().optional(),
      locale: z.enum(['it', 'en', 'fr']).default('it'),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, sector, country, locale } = input;
      const skip = (page - 1) * limit;

      const where = {
        isPublished: true,
        ...(sector && { sector }),
        ...(country && { country }),
      };

      const [projects, total, featured] = await Promise.all([
        ctx.prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { isFeatured: 'desc' },
            { sortOrder: 'asc' },
            { createdAt: 'desc' },
          ],
          include: {
            translations: true,
          },
        }),
        ctx.prisma.project.count({ where }),
        // Get featured projects separately
        ctx.prisma.project.findMany({
          where: {
            isPublished: true,
            isFeatured: true,
          },
          orderBy: { sortOrder: 'asc' },
          include: {
            translations: true,
          },
        }),
      ]);

      // Helper function for translation fallback
      const getTranslation = <T extends { locale: string }>(translations: T[], targetLocale: string): T | undefined => {
        return translations.find(t => t.locale === targetLocale)
          || translations.find(t => t.locale === 'it')
          || translations[0];
      };

      // Apply translation fallback to project items
      const itemsWithFallback = projects.map(item => ({
        ...item,
        translations: getTranslation(item.translations, locale) ? [getTranslation(item.translations, locale)!] : [],
      }));

      // Apply translation fallback to featured
      const featuredWithFallback = featured.map(item => ({
        ...item,
        translations: getTranslation(item.translations, locale) ? [getTranslation(item.translations, locale)!] : [],
      }));

      return {
        items: itemsWithFallback,
        featured: featuredWithFallback,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get all sectors with count (public)
  listSectors: publicProcedure
    .query(async ({ ctx }) => {
      const sectors = await ctx.prisma.project.groupBy({
        by: ['sector'],
        where: { isPublished: true },
        _count: { sector: true },
      });

      return sectors.map(s => ({
        sector: s.sector,
        count: s._count.sector,
      }));
    }),

  // Get all countries with count (public)
  listCountries: publicProcedure
    .query(async ({ ctx }) => {
      const countries = await ctx.prisma.project.groupBy({
        by: ['country'],
        where: { isPublished: true },
        _count: { country: true },
      });

      return countries.map(c => ({
        country: c.country,
        count: c._count.country,
      }));
    }),

  // Create project
  create: adminProcedure
    .input(projectCreateInput)
    .mutation(async ({ ctx, input }) => {
      const { translations, ...projectData } = input;

      // Check if slug is unique
      const existing = await ctx.prisma.project.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Slug già in uso',
        });
      }

      const project = await ctx.prisma.project.create({
        data: {
          ...projectData,
          translations: {
            create: translations,
          },
        },
        include: {
          translations: true,
        },
      });

      return project;
    }),

  // Update project
  update: adminProcedure
    .input(projectUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, translations, ...projectData } = input;

      // Check if project exists
      const existing = await ctx.prisma.project.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Progetto non trovato',
        });
      }

      // Check slug uniqueness if changing
      if (projectData.slug && projectData.slug !== existing.slug) {
        const slugExists = await ctx.prisma.project.findUnique({
          where: { slug: projectData.slug },
        });

        if (slugExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Slug già in uso',
          });
        }
      }

      const project = await ctx.prisma.project.update({
        where: { id },
        data: {
          ...projectData,
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

      return project;
    }),

  // Delete project
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.project.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Progetto non trovato',
        });
      }

      await ctx.prisma.project.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle publish status
  togglePublish: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.project.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Progetto non trovato',
        });
      }

      const project = await ctx.prisma.project.update({
        where: { id: input.id },
        data: {
          isPublished: !existing.isPublished,
        },
      });

      return project;
    }),

  // Toggle featured status
  toggleFeatured: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.project.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Progetto non trovato',
        });
      }

      const project = await ctx.prisma.project.update({
        where: { id: input.id },
        data: {
          isFeatured: !existing.isFeatured,
        },
      });

      return project;
    }),

  // Update sort order
  updateSortOrder: adminProcedure
    .input(z.object({
      items: z.array(z.object({
        id: z.string(),
        sortOrder: z.number(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(
        input.items.map(item =>
          ctx.prisma.project.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        )
      );

      return { success: true };
    }),
});
