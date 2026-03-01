import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ReactionType } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { createOrUpdateReaction } from '@/services/reactionService';

// =============================================================================
// Pass API Route ("Pass" Action)
// =============================================================================
// POST /api/ideas/[id]/pass
//
// Records a user's decision to pass on an idea.
// If logged in: Creates PASS reaction
// If not logged in: Returns 200 silently (no record needed)
//
// This helps the discovery algorithm learn user preferences.
// =============================================================================

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/ideas/[id]/pass
 *
 * Records a pass reaction on an idea.
 * - Authenticated users: Creates PASS reaction
 * - Anonymous users: Returns success silently (no action needed)
 *
 * @param request - The incoming request
 * @param params - Route parameters containing the idea ID
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    // Get idea ID from params
    const { id: ideaId } = await params;

    // Validate idea ID
    if (!ideaId) {
      return NextResponse.json(
        {
          error: {
            message: 'Idea ID is required',
            code: 'MISSING_ID',
          },
        },
        { status: 400 }
      );
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (userId) {
      // ===========================================
      // Authenticated User Flow
      // ===========================================

      // Create PASS reaction
      await createOrUpdateReaction(userId, ideaId, ReactionType.PASS);

      return NextResponse.json({
        message: 'Passed on idea',
        reaction: 'PASS',
      });
    } else {
      // ===========================================
      // Anonymous User Flow
      // ===========================================

      // For anonymous users, we don't need to record anything
      // Just return success so the UI can advance to the next card
      return NextResponse.json({
        message: 'Passed on idea',
        reaction: null,
      });
    }
  } catch (error) {
    console.error('Error recording pass:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'Idea not found') {
        return NextResponse.json(
          {
            error: {
              message: 'Idea not found',
              code: 'NOT_FOUND',
            },
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: {
          message: 'Failed to record pass. Please try again.',
          code: 'ERROR',
        },
      },
      { status: 500 }
    );
  }
}
