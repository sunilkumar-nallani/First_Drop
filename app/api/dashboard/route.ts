import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getFounderIdeas } from '@/services/ideaService';
import { getUserWaitlistEntries } from '@/services/waitlistService';

// =============================================================================
// Dashboard API Route
// =============================================================================
// GET /api/dashboard
//
// Returns dashboard data based on user role(s):
// - If isFounder: Returns founderIdeas with stats
// - If isUser: Returns likedIdeas (waitlist entries)
// - If both: Returns both founderIdeas and likedIdeas
//
// Requires authentication.
// =============================================================================

/**
 * GET /api/dashboard
 *
 * Returns personalized dashboard data for the authenticated user.
 * Content varies based on user's role(s).
 *
 * @returns Dashboard data based on user role
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: {
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const isFounder = session.user.isFounder;
    const isUser = session.user.isUser;

    // Fetch full user profile from database for profile fields
    const { prisma } = await import('@/lib/prisma');
    const fullUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isFounder: true,
        isUser: true,
        about: true,
        profilePhoto: true,
        socialHandles: true,
      },
    });

    // Prepare response data
    const response: {
      user: typeof fullUser;
      founderIdeas?: Awaited<ReturnType<typeof getFounderIdeas>>;
      likedIdeas?: Awaited<ReturnType<typeof getUserWaitlistEntries>>;
    } = {
      user: fullUser,
    };

    // Fetch founder ideas if user is a founder
    if (isFounder) {
      const founderIdeas = await getFounderIdeas(userId);
      response.founderIdeas = founderIdeas;
    }

    // Fetch liked ideas if user is a user
    if (isUser) {
      const likedIdeas = await getUserWaitlistEntries(userId);
      response.likedIdeas = likedIdeas;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);

    return NextResponse.json(
      {
        error: {
          message: 'Failed to fetch dashboard data. Please try again.',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
