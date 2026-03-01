import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// =============================================================================
// NextAuth.js Middleware - Route Protection
// =============================================================================
// This middleware protects routes based on authentication status and user roles.
// It runs on every request to protected routes.
//
// Protected Routes:
// - /dashboard/*  → Requires valid session (any authenticated user)
// - /create       → Requires valid session AND isFounder = true
//
// Public Routes (no auth required):
// - /             → Landing page
// - /discovery    → Card discovery
// - /[companySlug] → Public idea pages
// - /login        → Login page
// - /join         → Registration page
// - /api/ideas/*  → Public API routes (GET only)
//
// Docs: https://next-auth.js.org/configuration/nextjs#middleware
// =============================================================================

// Define route matchers
export const config = {
  matcher: [
    // Protected dashboard routes
    '/dashboard/:path*',
    // Profile edit page
    '/profile/:path*',
    // Create idea page (founders only)
    '/create',
    // API routes that require authentication
    '/api/dashboard/:path*',
    '/api/ideas/:path*/interest',
    '/api/ideas/:path*/pass',
    '/api/profile',
  ],
};

// Custom middleware with role-based access control
export default withAuth(
  // `withAuth` augments the request with the user's session
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // If no token, redirect to login (this shouldn't happen due to authorized callback)
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Protect /create route - founders only
    if (pathname === '/create' || pathname.startsWith('/api/ideas') && req.method !== 'GET') {
      if (!token.isFounder) {
        // User is not a founder, redirect to dashboard with error
        const dashboardUrl = new URL('/dashboard', req.url);
        dashboardUrl.searchParams.set('error', 'founder_required');
        return NextResponse.redirect(dashboardUrl);
      }
    }

    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * Authorized callback - determines if the user is allowed to access
       * Returns true if authorized, false otherwise
       */
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;

        // Allow public API routes (GET requests to /api/ideas)
        if (pathname.startsWith('/api/ideas') && req.method === 'GET') {
          return true;
        }

        // All other protected routes require a valid token
        if (token) {
          return true;
        }

        return false;
      },
    },
    pages: {
      // Custom sign-in page
      signIn: '/login',
      // Custom error page (we use the same login page with error query param)
      error: '/login',
    },
  }
);
