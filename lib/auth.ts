import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from './prisma';

// =============================================================================
// Authentication Helper Functions
// =============================================================================
// This module provides helper functions for server-side authentication.
// Use these in Server Components and API routes.
// =============================================================================

/**
 * Get the current user session from the server-side context.
 * Use this in Server Components to check if a user is logged in.
 *
 * @example
 * ```tsx
 * // In a Server Component
 * const session = await getCurrentUser();
 * if (!session) {
 *   redirect('/login');
 * }
 * ```
 *
 * @returns The session object if authenticated, null otherwise
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session;
}

/**
 * Get the current user's full profile from the database.
 * Use this when you need more than just the session data.
 *
 * @example
 * ```tsx
 * // In a Server Component
 * const user = await getCurrentUserProfile();
 * if (user) {
 *   console.log(user.about); // Access extended profile data
 * }
 * ```
 *
 * @returns The user object without passwordHash, or null if not authenticated
 */
export async function getCurrentUserProfile() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      isFounder: true,
      isUser: true,
      about: true,
      profilePhoto: true,
      socialHandles: true,
      createdAt: true,
      updatedAt: true,
      // Exclude passwordHash for security
    },
  });

  return user;
}

/**
 * Check if the current user has founder permissions.
 * Use this to protect founder-only routes in Server Components.
 *
 * @example
 * ```tsx
 * // In a Server Component
 * const isFounder = await requireFounder();
 * if (!isFounder) {
 *   redirect('/dashboard');
 * }
 * ```
 *
 * @returns true if user is a founder, false otherwise
 */
export async function requireFounder(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.isFounder ?? false;
}

/**
 * Check if the current user has user permissions.
 * Use this to protect user-only routes in Server Components.
 *
 * @returns true if user has user role, false otherwise
 */
export async function requireUser(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.isUser ?? false;
}

/**
 * Require authentication - throws error if not authenticated.
 * Use this in API routes when authentication is mandatory.
 *
 * @example
 * ```tsx
 * // In an API route
 * try {
 *   const session = await requireAuth();
 *   // Proceed with authenticated logic
 * } catch (error) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 * ```
 *
 * @throws Error if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * Get the current user's ID from the session.
 * Returns null if not authenticated.
 *
 * @returns User ID string or null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a session has a valid user
 */
export function hasValidUser(
  session: unknown
): session is { user: { id: string; email: string; isFounder: boolean; isUser: boolean } } {
  return (
    typeof session === 'object' &&
    session !== null &&
    'user' in session &&
    typeof (session as Record<string, unknown>).user === 'object' &&
    (session as Record<string, unknown>).user !== null &&
    'id' in ((session as Record<string, unknown>).user as Record<string, unknown>)
  );
}
