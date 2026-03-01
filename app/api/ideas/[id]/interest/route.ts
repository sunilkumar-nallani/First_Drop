import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { ReactionType } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { createOrUpdateReaction } from '@/services/reactionService';
import {
  addToWaitlist,
  getFounderEmailForIdea,
} from '@/services/waitlistService';
import { sendFounderNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

// =============================================================================
// Interest API Route ("I'm In" Action)
// =============================================================================
// POST /api/ideas/[id]/interest
//
// Records a user's interest in an idea and adds them to the waitlist.
// If logged in: Creates reaction + waitlist entry
// If not logged in: Requires email in body, creates anonymous waitlist entry
//
// Triggers email notification to the founder.
// =============================================================================

// Zod schema for anonymous interest (email required)
const anonymousInterestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/ideas/[id]/interest
 *
 * Records interest in an idea.
 * - Authenticated users: Creates IN reaction + waitlist entry
 * - Anonymous users: Creates waitlist entry with email only
 *
 * @param request - The incoming request
 * @param params - Route parameters containing the idea ID
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const userEmail = session?.user?.email;

    // Parse request body
    const body = await request.json().catch(() => ({}));

    if (userId) {
      // ===========================================
      // Authenticated User Flow
      // ===========================================

      // Create IN reaction
      await createOrUpdateReaction(userId, ideaId, ReactionType.IN);

      // Add to waitlist (if email exists)
      if (userEmail) {
        try {
          await addToWaitlist(ideaId, userEmail, userId);
        } catch (waitlistError) {
          // User might already be on waitlist, that's okay
          if (
            waitlistError instanceof Error &&
            waitlistError.message.includes('already on the waitlist')
          ) {
            // Do not throw if already on waitlist. We still want to return a success
            // message because their IN reaction might have successfully processed.
            console.log('User already on waitlist, continuing processing');
          } else {
            throw waitlistError;
          }
        }
      }

      // Send notification to founder (async, don't wait)
      const founderEmail = await getFounderEmailForIdea(ideaId);
      if (founderEmail && userEmail) {
        const idea = await import('@/services/ideaService').then((m) =>
          m.getIdeaById(ideaId)
        );
        if (idea) {
          sendFounderNotification(
            founderEmail,
            idea.title,
            userEmail
          ).catch(console.error);
        }
      }

      return NextResponse.json({
        message: "You're on the waitlist!",
        reaction: 'IN',
      });
    } else {
      // ===========================================
      // Anonymous User Flow
      // ===========================================

      // Validate email is provided
      const validationResult = anonymousInterestSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: {
              message: 'Email is required to join the waitlist',
              code: 'EMAIL_REQUIRED',
            },
          },
          { status: 401 }
        );
      }

      const { email } = validationResult.data;

      // Add to waitlist (anonymous - no userId)
      try {
        await addToWaitlist(ideaId, email, null);
      } catch (waitlistError) {
        if (
          waitlistError instanceof Error &&
          waitlistError.message.includes('already on the waitlist')
        ) {
          return NextResponse.json(
            {
              error: {
                message: 'This email is already on the waitlist for this idea',
                code: 'ALREADY_ON_WAITLIST',
              },
            },
            { status: 409 }
          );
        }
        throw waitlistError;
      }

      // Send notification to founder (async, don't wait)
      const founderEmail = await getFounderEmailForIdea(ideaId);
      if (founderEmail) {
        const idea = await import('@/services/ideaService').then((m) =>
          m.getIdeaById(ideaId)
        );
        if (idea) {
          sendFounderNotification(
            founderEmail,
            idea.title,
            email
          ).catch(console.error);
        }
      }

      return NextResponse.json({
        message: "You're on the waitlist!",
        email,
      });
    }
  } catch (error) {
    console.error('Error recording interest:', error);

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
          message: 'Failed to record interest. Please try again.',
          code: 'ERROR',
        },
      },
      { status: 500 }
    );
  }
}
