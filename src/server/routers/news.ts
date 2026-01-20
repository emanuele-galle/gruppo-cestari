import { z } from 'zod';
import { router, adminProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Input schemas
const newsCreateInput = z.object({
  slug: z.string().min(1).max(100),
  categoryId: z.string().optional(),
  featuredImage: z.string().url().optional(),
  focalPoint: z.enum(['top', 'center', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  publishedAt: z.date().optional(),
  translations: z.array(z.object({
    locale: z.enum(['it', 'en', 'fr']),
    title: z.string().min(1).max(200),
    excerpt: z.string().optional(),
    content: z.string().min(1),
  })).min(1),
  tagIds: z.array(z.string()).optional(),
});

const newsUpdateInput = z.object({
  id: z.string(),
  slug: z.string().min(1).max(100).optional(),
  categoryId: z.string().nullable().optional(),
  featuredImage: z.string().url().nullable().optional(),
  focalPoint: z.enum(['top', 'center', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).nullable().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  publishedAt: z.date().nullable().optional(),
  translations: z.array(z.object({
    locale: z.enum(['it', 'en', 'fr']),
    title: z.string().min(1).max(200),
    excerpt: z.string().optional(),
    content: z.string().min(1),
  })).optional(),
  tagIds: z.array(z.string()).optional(),
});

const newsListInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  locale: z.enum(['it', 'en', 'fr']).default('it'),
  sortBy: z.enum(['createdAt', 'publishedAt', 'viewCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const newsRouter = router({
  // List all news (admin)
  list: adminProcedure
    .input(newsListInput)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, categoryId, isPublished, isFeatured, locale, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(categoryId && { categoryId }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(search && {
          translations: {
            some: {
              locale,
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { content: { contains: search, mode: 'insensitive' as const } },
              ],
            },
          },
        }),
      };

      const [news, total] = await Promise.all([
        ctx.prisma.news.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            translations: true,
            category: {
              include: {
                translations: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        ctx.prisma.news.count({ where }),
      ]);

      return {
        items: news,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single news by ID (admin)
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const news = await ctx.prisma.news.findUnique({
        where: { id: input.id },
        include: {
          translations: true,
          category: {
            include: {
              translations: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          seoMeta: true,
        },
      });

      if (!news) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'News non trovata',
        });
      }

      return news;
    }),

  // Get single news by slug (public)
  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
      locale: z.enum(['it', 'en', 'fr']).default('it'),
    }))
    .query(async ({ ctx, input }) => {
      // Prima cerca con tutte le traduzioni per fare fallback
      const news = await ctx.prisma.news.findFirst({
        where: {
          slug: input.slug,
          isPublished: true,
        },
        include: {
          translations: true, // Prendi tutte le traduzioni
          category: {
            include: {
              translations: true, // Prendi tutte le traduzioni categoria
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          author: {
            select: {
              name: true,
            },
          },
          seoMeta: true, // Prendi tutti i seoMeta
        },
      });

      if (!news) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'News non trovata',
        });
      }

      // Filtra traduzioni con fallback a italiano
      const translation = news.translations.find(t => t.locale === input.locale)
        || news.translations.find(t => t.locale === 'it')
        || news.translations[0];

      const categoryTranslation = news.category?.translations.find(t => t.locale === input.locale)
        || news.category?.translations.find(t => t.locale === 'it')
        || news.category?.translations[0];

      const seoMeta = news.seoMeta?.find(s => s.locale === input.locale)
        || news.seoMeta?.find(s => s.locale === 'it')
        || news.seoMeta?.[0];

      // Increment view count
      await ctx.prisma.news.update({
        where: { id: news.id },
        data: { viewCount: { increment: 1 } },
      });

      // Ritorna con traduzioni filtrate
      return {
        ...news,
        translations: translation ? [translation] : [],
        category: news.category ? {
          ...news.category,
          translations: categoryTranslation ? [categoryTranslation] : [],
        } : null,
        seoMeta: seoMeta ? [seoMeta] : [],
      };
    }),

  // List public news
  listPublic: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(12),
      categoryId: z.string().optional(),
      locale: z.enum(['it', 'en', 'fr']).default('it'),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, categoryId, locale } = input;
      const skip = (page - 1) * limit;

      const where = {
        isPublished: true,
        ...(categoryId && { categoryId }),
      };

      const [news, total, featured] = await Promise.all([
        ctx.prisma.news.findMany({
          where,
          skip,
          take: limit,
          orderBy: { publishedAt: 'desc' },
          include: {
            translations: true, // Fetch all translations for fallback
            category: {
              include: {
                translations: true, // Fetch all translations for fallback
              },
            },
            author: {
              select: {
                name: true,
              },
            },
          },
        }),
        ctx.prisma.news.count({ where }),
        // Get featured news separately
        ctx.prisma.news.findFirst({
          where: {
            isPublished: true,
            isFeatured: true,
          },
          orderBy: { publishedAt: 'desc' },
          include: {
            translations: true, // Fetch all translations for fallback
            category: {
              include: {
                translations: true, // Fetch all translations for fallback
              },
            },
            author: {
              select: {
                name: true,
              },
            },
          },
        }),
      ]);

      // Helper function for translation fallback
      const getTranslation = <T extends { locale: string }>(translations: T[], targetLocale: string): T | undefined => {
        return translations.find(t => t.locale === targetLocale)
          || translations.find(t => t.locale === 'it')
          || translations[0];
      };

      // Apply translation fallback to news items
      const itemsWithFallback = news.map(item => ({
        ...item,
        translations: getTranslation(item.translations, locale) ? [getTranslation(item.translations, locale)!] : [],
        category: item.category ? {
          ...item.category,
          translations: getTranslation(item.category.translations, locale) ? [getTranslation(item.category.translations, locale)!] : [],
        } : null,
      }));

      // Apply translation fallback to featured
      const featuredWithFallback = featured ? {
        ...featured,
        translations: getTranslation(featured.translations, locale) ? [getTranslation(featured.translations, locale)!] : [],
        category: featured.category ? {
          ...featured.category,
          translations: getTranslation(featured.category.translations, locale) ? [getTranslation(featured.category.translations, locale)!] : [],
        } : null,
      } : null;

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

  // Get public categories with count
  listCategories: publicProcedure
    .input(z.object({
      locale: z.enum(['it', 'en', 'fr']).default('it'),
    }))
    .query(async ({ ctx, input }) => {
      const categories = await ctx.prisma.newsCategory.findMany({
        include: {
          translations: true, // Fetch all translations for fallback
          _count: {
            select: {
              news: {
                where: { isPublished: true },
              },
            },
          },
        },
      });

      // Helper function for translation fallback
      const getTranslation = <T extends { locale: string }>(translations: T[], targetLocale: string): T | undefined => {
        return translations.find(t => t.locale === targetLocale)
          || translations.find(t => t.locale === 'it')
          || translations[0];
      };

      // Apply translation fallback
      return categories.map(category => ({
        ...category,
        translations: getTranslation(category.translations, input.locale)
          ? [getTranslation(category.translations, input.locale)!]
          : [],
      }));
    }),

  // Create news
  create: adminProcedure
    .input(newsCreateInput)
    .mutation(async ({ ctx, input }) => {
      const { translations, tagIds, ...newsData } = input;

      // Check if slug is unique
      const existing = await ctx.prisma.news.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Slug già in uso',
        });
      }

      const news = await ctx.prisma.news.create({
        data: {
          ...newsData,
          authorId: ctx.session.user.id,
          publishedAt: newsData.isPublished ? newsData.publishedAt ?? new Date() : null,
          translations: {
            create: translations,
          },
          ...(tagIds && tagIds.length > 0 && {
            tags: {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            },
          }),
        },
        include: {
          translations: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return news;
    }),

  // Update news
  update: adminProcedure
    .input(newsUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, translations, tagIds, ...newsData } = input;

      // Check if news exists
      const existing = await ctx.prisma.news.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'News non trovata',
        });
      }

      // Check slug uniqueness if changing
      if (newsData.slug && newsData.slug !== existing.slug) {
        const slugExists = await ctx.prisma.news.findUnique({
          where: { slug: newsData.slug },
        });

        if (slugExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Slug già in uso',
          });
        }
      }

      // Set publishedAt when publishing for the first time
      if (newsData.isPublished && !existing.isPublished && !existing.publishedAt) {
        newsData.publishedAt = new Date();
      }

      const news = await ctx.prisma.news.update({
        where: { id },
        data: {
          ...newsData,
          ...(translations && {
            translations: {
              deleteMany: {},
              create: translations,
            },
          }),
          ...(tagIds && {
            tags: {
              deleteMany: {},
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            },
          }),
        },
        include: {
          translations: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return news;
    }),

  // Delete news
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.news.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'News non trovata',
        });
      }

      await ctx.prisma.news.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle publish status
  togglePublish: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.news.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'News non trovata',
        });
      }

      const news = await ctx.prisma.news.update({
        where: { id: input.id },
        data: {
          isPublished: !existing.isPublished,
          publishedAt: !existing.isPublished ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
        },
      });

      return news;
    }),

  // Get categories
  getCategories: adminProcedure
    .input(z.object({
      locale: z.enum(['it', 'en', 'fr']).default('it'),
    }))
    .query(async ({ ctx, input }) => {
      const categories = await ctx.prisma.newsCategory.findMany({
        include: {
          translations: {
            where: { locale: input.locale },
          },
          _count: {
            select: { news: true },
          },
        },
      });

      return categories;
    }),

  // Get all tags
  getTags: adminProcedure.query(async ({ ctx }) => {
    const tags = await ctx.prisma.tag.findMany({
      include: {
        _count: {
          select: { news: true },
        },
      },
    });

    return tags;
  }),

  // Create tag
  createTag: adminProcedure
    .input(z.object({
      slug: z.string().min(1).max(50),
      name: z.string().min(1).max(50),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.tag.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Tag già esistente',
        });
      }

      const tag = await ctx.prisma.tag.create({
        data: input,
      });

      return tag;
    }),
});
