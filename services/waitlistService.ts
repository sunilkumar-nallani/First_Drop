import { prisma } from '@/lib/prisma';

// =============================================================================
// Waitlist Service
// =============================================================================
// This service handles all business logic related to waitlist entries.
// Users join waitlists to express interest in ideas and receive updates.
// =============================================================================

// Type for waitlist entry with idea data
export interface WaitlistEntryWithIdea {
  id: string;
  email: string;
  createdAt: Date;
  idea: {
    id: string;
    title: string;
    slug: string;
    sector: string;
    ideaDescription: string;
    founder: {
      name: string;
    };
  };
}

// Type for waitlist entry with user data (for founder view)
export interface WaitlistEntryWithUser {
  id: string;
  email: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    about: string | null;
    profilePhoto: string | null;
    socialHandles: Record<string, string> | null;
  } | null;
}

/**
 * Adds an email to the waitlist for an idea.
 * If a userId is provided, associates the entry with the user account.
 * If userId is null, creates an anonymous waitlist entry.
 *
 * @param ideaId - The ID of the idea to join the waitlist for
 * @param email - The email address to add
 * @param userId - Optional user ID (null for anonymous entries)
 * @returns The created waitlist entry
 *
 * @example
 * ```typescript
 * // Registered user joins waitlist
 * const entry = await addToWaitlist('idea_123', 'user@example.com', 'user_456');
 *
 * // Anonymous user joins waitlist
 * const entry = await addToWaitlist('idea_123', 'visitor@example.com', null);
 * ```
 */
export async function addToWaitlist(
  ideaId: string,
  email: string,
  userId?: string | null
) {
  try {
    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Verify the idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new Error('Idea not found');
    }

    // Check if email is already on the waitlist for this idea
    const existingEntry = await prisma.waitlistEntry.findUnique({
      where: {
        email_ideaId: {
          email: normalizedEmail,
          ideaId,
        },
      },
    });

    if (existingEntry) {
      throw new Error('Email is already on the waitlist for this idea');
    }

    // Create the waitlist entry
    const entry = await prisma.waitlistEntry.create({
      data: {
        email: normalizedEmail,
        ideaId,
        userId: userId || null,
      },
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            slug: true,
            sector: true,
            ideaDescription: true,
            founder: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return entry;
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    throw error;
  }
}

/**
 * Retrieves all waitlist entries for a specific idea.
 * Used by founders to see who joined their waitlist.
 *
 * @param ideaId - The ID of the idea
 * @returns Array of waitlist entries with user data
 *
 * @example
 * ```typescript
 * const entries = await getWaitlistForIdea('idea_123');
 * entries.forEach(entry => {
 *   console.log(`${entry.email} joined on ${entry.createdAt}`);
 * });
 * ```
 */
export async function getWaitlistForIdea(
  ideaId: string
): Promise<WaitlistEntryWithUser[]> {
  const entries = await prisma.waitlistEntry.findMany({
    where: { ideaId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          about: true,
          profilePhoto: true,
          socialHandles: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return entries as WaitlistEntryWithUser[];
}

/**
 * Retrieves all waitlist entries for a specific user.
 * Used in the user dashboard to show "Ideas You Liked".
 *
 * @param userId - The ID of the user
 * @returns Array of waitlist entries with idea data
 *
 * @example
 * ```typescript
 * const entries = await getUserWaitlistEntries('user_123');
 * entries.forEach(entry => {
 *   console.log(`Joined ${entry.idea.title} waitlist`);
 * });
 * ```
 */
export async function getUserWaitlistEntries(
  userId: string
): Promise<WaitlistEntryWithIdea[]> {
  const entries = await prisma.waitlistEntry.findMany({
    where: { userId },
    include: {
      idea: {
        select: {
          id: true,
          title: true,
          slug: true,
          sector: true,
          ideaDescription: true,
          founder: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return entries as WaitlistEntryWithIdea[];
}

/**
 * Retrieves all waitlist entries by email (for anonymous user lookup).
 * Used when an anonymous user enters their email to see their waitlist.
 *
 * @param email - The email address
 * @returns Array of waitlist entries with idea data
 */
export async function getWaitlistEntriesByEmail(
  email: string
): Promise<WaitlistEntryWithIdea[]> {
  const normalizedEmail = email.toLowerCase().trim();

  const entries = await prisma.waitlistEntry.findMany({
    where: { email: normalizedEmail },
    include: {
      idea: {
        select: {
          id: true,
          title: true,
          slug: true,
          sector: true,
          ideaDescription: true,
          founder: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return entries as WaitlistEntryWithIdea[];
}

/**
 * Checks if an email is already on the waitlist for an idea.
 *
 * @param ideaId - The ID of the idea
 * @param email - The email address to check
 * @returns True if on waitlist, false otherwise
 */
export async function isOnWaitlist(
  ideaId: string,
  email: string
): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();

  const count = await prisma.waitlistEntry.count({
    where: {
      ideaId,
      email: normalizedEmail,
    },
  });

  return count > 0;
}

/**
 * Gets the waitlist count for an idea.
 *
 * @param ideaId - The ID of the idea
 * @returns Number of waitlist entries
 */
export async function getWaitlistCount(ideaId: string): Promise<number> {
  const count = await prisma.waitlistEntry.count({
    where: { ideaId },
  });

  return count;
}

/**
 * Gets waitlist statistics for a founder's ideas.
 * Used in the founder dashboard.
 *
 * @param founderId - The ID of the founder
 * @returns Array of ideas with their waitlist counts
 */
export async function getFounderWaitlistStats(founderId: string) {
  const ideas = await prisma.idea.findMany({
    where: { founderId },
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          waitlistEntries: true,
        },
      },
    },
  });

  return ideas.map((idea) => ({
    id: idea.id,
    title: idea.title,
    waitlistCount: idea._count.waitlistEntries,
  }));
}

/**
 * Removes an email from the waitlist for an idea.
 *
 * @param ideaId - The ID of the idea
 * @param email - The email address to remove
 * @returns True if removed, false if entry didn't exist
 */
export async function removeFromWaitlist(
  ideaId: string,
  email: string
): Promise<boolean> {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    await prisma.waitlistEntry.delete({
      where: {
        email_ideaId: {
          email: normalizedEmail,
          ideaId,
        },
      },
    });

    return true;
  } catch (error) {
    // Entry doesn't exist
    return false;
  }
}

/**
 * Gets founder email for an idea (for notifications).
 *
 * @param ideaId - The ID of the idea
 * @returns Founder's email or null
 */
export async function getFounderEmailForIdea(
  ideaId: string
): Promise<string | null> {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    include: {
      founder: {
        select: {
          email: true,
        },
      },
    },
  });

  return idea?.founder?.email ?? null;
}
