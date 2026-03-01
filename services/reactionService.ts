import { prisma } from '@/lib/prisma';
import { ReactionType } from '@prisma/client';

// =============================================================================
// Reaction Service
// =============================================================================
// This service handles all business logic related to user reactions
// ("I'm in" or "Pass") to ideas. These reactions power the discovery
// algorithm and prevent showing the same idea twice.
// =============================================================================

// Type for reaction with idea data
export interface ReactionWithIdea {
  id: string;
  type: ReactionType;
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

/**
 * Creates or updates a user's reaction to an idea.
 * If the user has already reacted to this idea, updates the reaction type.
 * This is an upsert operation - creates if doesn't exist, updates if it does.
 *
 * @param userId - The ID of the user reacting
 * @param ideaId - The ID of the idea being reacted to
 * @param type - The reaction type (IN or PASS)
 * @returns The created or updated reaction
 *
 * @example
 * ```typescript
 * // User says "I'm in" to an idea
 * const reaction = await createOrUpdateReaction('user_123', 'idea_456', 'IN');
 *
 * // User passes on an idea
 * const reaction = await createOrUpdateReaction('user_123', 'idea_456', 'PASS');
 * ```
 */
export async function createOrUpdateReaction(
  userId: string,
  ideaId: string,
  type: ReactionType
) {
  try {
    // Verify the idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new Error('Idea not found');
    }

    // Upsert the reaction (create or update)
    const reaction = await prisma.reaction.upsert({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
      update: {
        type,
      },
      create: {
        userId,
        ideaId,
        type,
      },
    });

    return reaction;
  } catch (error) {
    console.error('Error creating/updating reaction:', error);
    throw error;
  }
}

/**
 * Retrieves all reactions made by a specific user.
 * Includes the idea data for each reaction.
 * Used in the user dashboard to show "Ideas You Liked".
 *
 * @param userId - The ID of the user
 * @returns Array of reactions with idea data
 *
 * @example
 * ```typescript
 * const reactions = await getUserReactions('user_123');
 * reactions.forEach(reaction => {
 *   console.log(`${reaction.idea.title}: ${reaction.type}`);
 * });
 * ```
 */
export async function getUserReactions(
  userId: string
): Promise<ReactionWithIdea[]> {
  const reactions = await prisma.reaction.findMany({
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

  return reactions as ReactionWithIdea[];
}

/**
 * Retrieves reactions for a specific idea.
 * Useful for founders to see who reacted to their idea.
 *
 * @param ideaId - The ID of the idea
 * @returns Array of reactions with user data
 */
export async function getIdeaReactions(ideaId: string) {
  const reactions = await prisma.reaction.findMany({
    where: { ideaId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return reactions;
}

/**
 * Retrieves a specific reaction by user and idea.
 * Returns null if the user hasn't reacted to the idea.
 *
 * @param userId - The ID of the user
 * @param ideaId - The ID of the idea
 * @returns The reaction or null
 */
export async function getReactionByUserAndIdea(
  userId: string,
  ideaId: string
) {
  const reaction = await prisma.reaction.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId,
      },
    },
  });

  return reaction;
}

/**
 * Deletes a user's reaction to an idea.
 * Used if a user wants to "undo" their reaction.
 *
 * @param userId - The ID of the user
 * @param ideaId - The ID of the idea
 * @returns True if deleted, false if reaction didn't exist
 */
export async function deleteReaction(
  userId: string,
  ideaId: string
): Promise<boolean> {
  try {
    await prisma.reaction.delete({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    });

    return true;
  } catch (error) {
    // Reaction doesn't exist
    return false;
  }
}

/**
 * Gets reaction statistics for an idea.
 * Returns counts of IN and PASS reactions.
 *
 * @param ideaId - The ID of the idea
 * @returns Object with IN and PASS counts
 */
export async function getIdeaReactionStats(ideaId: string) {
  const [inCount, passCount] = await Promise.all([
    prisma.reaction.count({
      where: { ideaId, type: ReactionType.IN },
    }),
    prisma.reaction.count({
      where: { ideaId, type: ReactionType.PASS },
    }),
  ]);

  return {
    in: inCount,
    pass: passCount,
    total: inCount + passCount,
  };
}

/**
 * Gets all reaction statistics for a founder's ideas.
 * Used in the founder dashboard.
 *
 * @param founderId - The ID of the founder
 * @returns Array of ideas with their reaction counts
 */
export async function getFounderReactionStats(founderId: string) {
  const ideas = await prisma.idea.findMany({
    where: { founderId },
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          reactions: {
            where: { type: ReactionType.IN },
          },
        },
      },
    },
  });

  return ideas.map((idea) => ({
    id: idea.id,
    title: idea.title,
    interestCount: idea._count.reactions,
  }));
}
