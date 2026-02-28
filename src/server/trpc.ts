import { initTRPC, TRPCError } from '@trpc/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { UserRole } from '@/generated/prisma';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Session } from 'next-auth';

// Session type from next-auth
interface AuthSession extends Session {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    image?: string | null;
  };
}

// Context type
interface Context {
  prisma: typeof prisma;
  session: AuthSession | null;
}

// Authenticated context type
interface AuthenticatedContext extends Context {
  session: AuthSession;
}

// Create context for each request
export const createContext = async (): Promise<Context> => {
  const session = await auth();
  return {
    prisma,
    session: session as AuthSession | null,
  };
};

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Devi essere autenticato per eseguire questa azione',
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session as AuthSession,
    } satisfies AuthenticatedContext,
  });
});

// Admin procedure - requires EDITOR, ADMIN, or SUPERADMIN role
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Devi essere autenticato per eseguire questa azione',
    });
  }

  const adminRoles: UserRole[] = ['EDITOR', 'ADMIN', 'SUPERADMIN'];
  if (!adminRoles.includes(ctx.session.user.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Non hai i permessi per eseguire questa azione',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session as AuthSession,
    } satisfies AuthenticatedContext,
  });
});

// Superadmin procedure - requires ADMIN or SUPERADMIN role
export const superadminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Devi essere autenticato per eseguire questa azione',
    });
  }

  const superRoles: UserRole[] = ['ADMIN', 'SUPERADMIN'];
  if (!superRoles.includes(ctx.session.user.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Non hai i permessi per eseguire questa azione',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session as AuthSession,
    } satisfies AuthenticatedContext,
  });
});

const createCallerFactory = t.createCallerFactory;
