import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// CSRF Protection - Allowed origins
const TRUSTED_ORIGINS = [
  'https://gruppocestari.com',
  'https://www.gruppocestari.com',
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

// Methods that require CSRF validation
const CSRF_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

// Routes excluded from CSRF (NextAuth handles its own CSRF)
const CSRF_EXCLUDED = ['/api/auth/', '/api/trpc'];

// Rate limiting configuration
const rateLimits: Record<string, { maxRequests: number; windowMs: number }> = {
  '/api/contacts': { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 req per 15 min
  '/api/auth/signin': { maxRequests: 10, windowMs: 15 * 60 * 1000 }, // 10 login attempts per 15 min
  '/api/auth/callback': { maxRequests: 20, windowMs: 15 * 60 * 1000 }, // 20 callbacks per 15 min
  '/api/auth/forgot-password': { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 req per hour (prevent email bombing)
  '/api/auth/reset-password': { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 req per hour
  '/api/auth/register': { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 registrations per hour per IP
  '/api/newsletter': { maxRequests: 3, windowMs: 15 * 60 * 1000 }, // 3 req per 15 min
};

// Routes excluded from rate limiting (high-frequency internal calls)
const rateLimitExcluded = ['/api/auth/session', '/api/auth/providers', '/api/auth/csrf'];

// In-memory rate limit store (resets on server restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Maximum entries to prevent memory leak
const MAX_RATE_LIMIT_ENTRIES = 10000;

function getRateLimitKey(ip: string, path: string): string {
  return `${ip}:${path}`;
}

// LRU cleanup when store exceeds max size
function cleanupRateLimitStore(): void {
  if (rateLimitStore.size < MAX_RATE_LIMIT_ENTRIES) return;

  // Sort by resetTime (oldest first) and remove 20%
  const entries = Array.from(rateLimitStore.entries())
    .sort((a, b) => a[1].resetTime - b[1].resetTime);
  const toDelete = Math.ceil(entries.length * 0.2);

  for (let i = 0; i < toDelete; i++) {
    rateLimitStore.delete(entries[i][0]);
  }
}

function checkRateLimit(ip: string, path: string): { allowed: boolean; remaining: number; resetTime: number } {
  // Find matching rate limit rule
  let config: { maxRequests: number; windowMs: number } | undefined;
  let matchedPath = '';

  for (const [ratePath, rateConfig] of Object.entries(rateLimits)) {
    if (path.startsWith(ratePath)) {
      config = rateConfig;
      matchedPath = ratePath;
      break;
    }
  }

  if (!config) {
    return { allowed: true, remaining: -1, resetTime: 0 };
  }

  const key = getRateLimitKey(ip, matchedPath);
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Cleanup if store is too large (prevent memory leak)
    cleanupRateLimitStore();
    // Reset or create new record
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime: now + config.windowMs };
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  rateLimitStore.set(key, record);
  return { allowed: true, remaining: config.maxRequests - record.count, resetTime: record.resetTime };
}

// Clean up old entries periodically (every 2 minutes for faster cleanup)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 2 * 60 * 1000);

// Routes that require authentication
const protectedRoutes = ['/portal', '/admin'];

// Routes only for unauthenticated users
const authRoutes = ['/login', '/register', '/forgot-password'];

// Admin roles that should redirect to /admin
const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR'];

// Decode JWT payload (without verification - verification happens in layouts)
function decodeJwtPayload(token: string): { role?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return payload;
  } catch {
    return null;
  }
}

// eslint-disable-next-line sonarjs/cognitive-complexity -- complex proxy routing logic
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip intl middleware for API routes - they don't need localization
  if (pathname.startsWith('/api/')) {
    // CSRF Protection for state-changing methods
    const method = request.method;
    const isCSRFExcluded = CSRF_EXCLUDED.some(excluded => pathname.startsWith(excluded));

    if (CSRF_METHODS.includes(method) && !isCSRFExcluded) {
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');

      // Check origin or referer header
      const requestOrigin = origin || (referer ? new URL(referer).origin : null);

      if (requestOrigin && !TRUSTED_ORIGINS.includes(requestOrigin)) {
        return new NextResponse(
          JSON.stringify({
            error: 'CSRF check failed - Invalid origin',
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Apply rate limiting for API routes (exclude high-frequency internal calls)
    if (!rateLimitExcluded.some(excluded => pathname.startsWith(excluded))) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';

      const rateLimit = checkRateLimit(ip, pathname);

      if (!rateLimit.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: 'Troppe richieste. Riprova più tardi.',
            retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(rateLimit.resetTime),
            },
          }
        );
      }
    }
    // Let API requests pass through without intl middleware
    return NextResponse.next();
  }

  // Remove locale prefix for route checking
  const pathnameWithoutLocale = pathname.replace(/^\/(it|en|fr)/, '') || '/';

  // Check if it's an auth route or protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  // Get session token from cookie (NextAuth v5 uses 'authjs' prefix)
  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value;

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !sessionToken) {
    const locale = pathname.match(/^\/(it|en|fr)/)?.[1] || 'it';
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes based on role
  // EXCEPT: allow access to /login if user wants to change account (don't auto-redirect)
  if (isAuthRoute && sessionToken) {
    // Allow users to access login page to switch accounts
    if (pathnameWithoutLocale === '/login' || pathnameWithoutLocale.startsWith('/login')) {
      return intlMiddleware(request);
    }

    const locale = pathname.match(/^\/(it|en|fr)/)?.[1] || 'it';
    const payload = decodeJwtPayload(sessionToken);
    const userRole = payload?.role;

    // Admin/Editor users go to /admin, others go to /portal
    if (userRole && adminRoles.includes(userRole)) {
      return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
    }
    return NextResponse.redirect(new URL(`/${locale}/portal`, request.url));
  }

  // Apply intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Localized routes
    '/',
    '/(it|en|fr)/:path*',
    // API routes with rate limiting
    '/api/contacts/:path*',
    '/api/auth/:path*',
    '/api/newsletter/:path*',
    // Catch-all excluding static files and upload API for better performance
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|documents|videos|sw.js|manifest.json|robots.txt|sitemap.xml|api/upload|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ico|xml|txt|json)$).*)',
  ],
};
