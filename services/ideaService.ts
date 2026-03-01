import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

// =============================================================================
// Idea Service
// =============================================================================
// This service handles all business logic related to ideas (startup concepts).
// It provides functions for creating, retrieving, and managing ideas.
// =============================================================================

// Type for creating a new idea
export interface CreateIdeaInput {
  title: string;
  sector: string;
  subSector?: string;
  ideaDescription: string;
  moat: string;
  usp: string;
  marketSize?: string;
  ask?: string;
  isFirstTimeFounder?: boolean;
  mediaUrls?: string[];
  companyInfo?: string;
  contactInfo?: string;
}

// Type for idea with counts (used in founder dashboard)
export interface IdeaWithCounts {
  id: string;
  title: string;
  slug: string;
  sector: string;
  subSector: string | null;
  ideaDescription: string;
  createdAt: Date;
  _count: {
    waitlistEntries: number;
    reactions: number;
  };
}

// Type for idea with founder info (used in public pages)
export interface IdeaWithFounder {
  id: string;
  title: string;
  slug: string;
  sector: string;
  subSector: string | null;
  ideaDescription: string;
  moat: string;
  usp: string;
  marketSize: string | null;
  ask: string | null;
  isFirstTimeFounder: boolean;
  mediaUrls: string[] | null;
  companyInfo: string | null;
  contactInfo: string | null;
  createdAt: Date;
  updatedAt: Date;
  founder: {
    id: string;
    name: string;
    about: string | null;
    profilePhoto: string | null;
    socialHandles: Record<string, string> | null;
  };
  _count: {
    waitlistEntries: number;
    reactions: number;
  };
}

/**
 * Generates a unique slug from a title.
 * If the slug already exists, appends a random string to make it unique.
 *
 * @param title - The idea title to slugify
 * @returns A unique slug string
 */
async function generateUniqueSlug(title: string): Promise<string> {
  // Create base slug from title
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()"'!:@]/g,
  });

  // Check if slug exists
  const existingIdea = await prisma.idea.findUnique({
    where: { slug: baseSlug },
  });

  if (!existingIdea) {
    return baseSlug;
  }

  // Slug exists, append random string
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Creates a new idea for a founder.
 *
 * @param data - The idea data to create
 * @param founderId - The ID of the founder creating the idea
 * @returns The created idea with founder information
 *
 * @example
 * ```typescript
 * const idea = await createIdea({
 *   title: 'My Startup Idea',
 *   sector: 'AI',
 *   ideaDescription: '...',
 *   moat: '...',
 *   usp: '...'
 * }, 'user_123');
 * ```
 */
export async function createIdea(
  data: CreateIdeaInput,
  founderId: string
): Promise<IdeaWithFounder> {
  // Generate unique slug from title
  const slug = await generateUniqueSlug(data.title);

  // Create the idea
  const idea = await prisma.idea.create({
    data: {
      title: data.title,
      slug,
      sector: data.sector,
      subSector: data.subSector,
      ideaDescription: data.ideaDescription,
      moat: data.moat,
      usp: data.usp,
      marketSize: data.marketSize,
      ask: data.ask,
      isFirstTimeFounder: data.isFirstTimeFounder ?? false,
      mediaUrls: data.mediaUrls ?? [],
      companyInfo: data.companyInfo,
      contactInfo: data.contactInfo,
      founderId,
    },
    include: {
      founder: {
        select: {
          id: true,
          name: true,
          about: true,
          profilePhoto: true,
          socialHandles: true,
        },
      },
      _count: {
        select: {
          waitlistEntries: true,
          reactions: true,
        },
      },
    },
  });

  return idea as IdeaWithFounder;
}

/**
 * Retrieves all ideas for the discovery page.
 * If a userId is provided, excludes ideas the user has already reacted to.
 *
 * @param userId - Optional user ID to filter out already-reacted ideas
 * @returns Array of ideas with founder information
 *
 * @example
 * ```typescript
 * // Get all ideas (for anonymous users)
 * const ideas = await getIdeasForDiscovery();
 *
 * // Get ideas excluding those the user has reacted to
 * const ideas = await getIdeasForDiscovery('user_123');
 * ```
 */
export async function getIdeasForDiscovery(
  userId?: string
): Promise<IdeaWithFounder[]> {
  // Build where clause
  const where: Record<string, unknown> = {};

  // If userId provided, exclude ideas they've already reacted to
  if (userId) {
    where.NOT = {
      reactions: {
        some: {
          userId,
        },
      },
    };
  }

  const ideas = await prisma.idea.findMany({
    where,
    include: {
      founder: {
        select: {
          id: true,
          name: true,
          about: true,
          profilePhoto: true,
          socialHandles: true,
        },
      },
      _count: {
        select: {
          waitlistEntries: true,
          reactions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return ideas as IdeaWithFounder[];
}

/**
 * Retrieves a single idea by its slug.
 * Used for public idea pages.
 *
 * @param slug - The unique slug of the idea
 * @returns The idea with founder and counts, or null if not found
 *
 * @example
 * ```typescript
 * const idea = await getIdeaBySlug('my-startup-idea');
 * if (idea) {
 *   console.log(idea.title, idea.founder.name);
 * }
 * ```
 */
export async function getIdeaBySlug(
  slug: string
): Promise<IdeaWithFounder | null> {
  const idea = await prisma.idea.findUnique({
    where: { slug },
    include: {
      founder: {
        select: {
          id: true,
          name: true,
          about: true,
          profilePhoto: true,
          socialHandles: true,
        },
      },
      _count: {
        select: {
          waitlistEntries: true,
          reactions: true,
        },
      },
    },
  });

  return idea as IdeaWithFounder | null;
}

/**
 * Retrieves all ideas created by a specific founder.
 * Includes waitlist count and interest count for dashboard display.
 *
 * @param founderId - The ID of the founder
 * @returns Array of ideas with counts
 *
 * @example
 * ```typescript
 * const ideas = await getFounderIdeas('founder_123');
 * ideas.forEach(idea => {
 *   console.log(`${idea.title}: ${idea._count.waitlistEntries} waitlist entries`);
 * });
 * ```
 */
export async function getFounderIdeas(
  founderId: string
): Promise<IdeaWithCounts[]> {
  const ideas = await prisma.idea.findMany({
    where: { founderId },
    include: {
      _count: {
        select: {
          waitlistEntries: true,
          reactions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return ideas as IdeaWithCounts[];
}

/**
 * Retrieves an idea by its ID.
 * Used internally when we need to verify an idea exists.
 *
 * @param id - The idea ID
 * @returns The idea or null if not found
 */
export async function getIdeaById(id: string) {
  return prisma.idea.findUnique({
    where: { id },
  });
}

/**
 * Deletes an idea and all associated data (reactions, waitlist entries).
 * Only the founder who created the idea should be able to delete it.
 *
 * @param id - The idea ID to delete
 * @param founderId - The founder ID (for verification)
 * @returns True if deleted, false if not found or not authorized
 */
export async function deleteIdea(
  id: string,
  founderId: string
): Promise<boolean> {
  try {
    // Verify the idea belongs to the founder
    const idea = await prisma.idea.findFirst({
      where: { id, founderId },
    });

    if (!idea) {
      return false;
    }

    // Delete the idea (cascade will handle reactions and waitlist entries)
    await prisma.idea.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error('Error deleting idea:', error);
    return false;
  }
}
