import { prisma } from '@/lib/prisma';

// =============================================================================
// User Service
// =============================================================================
// This service handles all business logic related to user management.
// It provides functions for retrieving and updating user profiles.
// =============================================================================

// Type for user without passwordHash (safe to return to client)
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  isFounder: boolean;
  isUser: boolean;
  about: string | null;
  profilePhoto: string | null;
  socialHandles: Record<string, string> | null;
  createdAt: Date;
  updatedAt: Date;
}

// Type for updating user profile
export interface UpdateUserProfileInput {
  name?: string;
  about?: string;
  profilePhoto?: string;
  socialHandles?: Record<string, string>;
}

/**
 * Retrieves a user by their ID.
 * Returns the user without the passwordHash field for security.
 *
 * @param id - The user's unique identifier
 * @returns The user object without passwordHash, or null if not found
 *
 * @example
 * ```typescript
 * const user = await getUserById('user_123');
 * if (user) {
 *   console.log(user.name, user.email);
 * }
 * ```
 */
export async function getUserById(id: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
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
      // Intentionally exclude passwordHash
    },
  });

  return user as SafeUser | null;
}

/**
 * Retrieves a user by their email address.
 * Returns the user without the passwordHash field for security.
 *
 * @param email - The user's email address
 * @returns The user object without passwordHash, or null if not found
 *
 * @example
 * ```typescript
 * const user = await getUserByEmail('user@example.com');
 * if (user) {
 *   console.log(user.name);
 * }
 * ```
 */
export async function getUserByEmail(email: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
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
      // Intentionally exclude passwordHash
    },
  });

  return user as SafeUser | null;
}

/**
 * Updates a user's profile information.
 * Only updates the fields that are provided (partial update).
 *
 * @param id - The user's unique identifier
 * @param data - The profile data to update
 * @returns The updated user object without passwordHash
 *
 * @example
 * ```typescript
 * const updated = await updateUserProfile('user_123', {
 *   name: 'New Name',
 *   about: 'New bio'
 * });
 * ```
 */
export async function updateUserProfile(
  id: string,
  data: UpdateUserProfileInput
): Promise<SafeUser | null> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.about !== undefined && { about: data.about }),
        ...(data.profilePhoto !== undefined && { profilePhoto: data.profilePhoto }),
        ...(data.socialHandles !== undefined && { socialHandles: data.socialHandles }),
      },
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
        // Intentionally exclude passwordHash
      },
    });

    return user as SafeUser;
  } catch (error) {
    // User not found or other error
    console.error('Error updating user profile:', error);
    return null;
  }
}

/**
 * Checks if an email address is already in use.
 * Useful for registration validation.
 *
 * @param email - The email address to check
 * @returns True if the email exists, false otherwise
 *
 * @example
 * ```typescript
 * const exists = await isEmailTaken('user@example.com');
 * if (exists) {
 *   // Show error: Email already registered
 * }
 * ```
 */
export async function isEmailTaken(email: string): Promise<boolean> {
  const count = await prisma.user.count({
    where: { email: email.toLowerCase().trim() },
  });

  return count > 0;
}

/**
 * Retrieves a user's public profile.
 * This is the version shown to other users - minimal information.
 *
 * @param id - The user's unique identifier
 * @returns Public profile data or null if not found
 */
export async function getUserPublicProfile(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      about: true,
      profilePhoto: true,
      socialHandles: true,
      isFounder: true,
      // Exclude email and other private info
    },
  });

  return user;
}

/**
 * Retrieves user statistics for the dashboard.
 * Includes counts of ideas, reactions, and waitlist entries.
 *
 * @param id - The user's unique identifier
 * @returns User statistics or null if not found
 */
export async function getUserStats(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          ideas: true,
          reactions: true,
          waitlistEntries: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    ideaCount: user._count.ideas,
    reactionCount: user._count.reactions,
    waitlistEntryCount: user._count.waitlistEntries,
  };
}

/**
 * Updates a user's role flags.
 * Use this when a user wants to add a role (e.g., become a founder).
 *
 * @param id - The user's unique identifier
 * @param roles - Object with isFounder and/or isUser flags
 * @returns The updated user or null if not found
 *
 * @example
 * ```typescript
 * await updateUserRoles('user_123', { isFounder: true });
 * ```
 */
export async function updateUserRoles(
  id: string,
  roles: { isFounder?: boolean; isUser?: boolean }
): Promise<SafeUser | null> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(roles.isFounder !== undefined && { isFounder: roles.isFounder }),
        ...(roles.isUser !== undefined && { isUser: roles.isUser }),
      },
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
      },
    });

    return user as SafeUser;
  } catch (error) {
    console.error('Error updating user roles:', error);
    return null;
  }
}
