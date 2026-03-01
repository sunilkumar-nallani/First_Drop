import { NextResponse } from 'next/server';
import { getIdeaBySlug } from '@/services/ideaService';

export const dynamic = 'force-dynamic';

// =============================================================================
// Idea Detail API Route
// =============================================================================
// GET /api/ideas/by-slug/[slug]  -> Returns a single idea by slug
//
// This route is public - no authentication required.
// Used for public idea landing pages.
// =============================================================================

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/ideas/by-slug/[slug]
 *
 * Returns a single idea by its unique slug.
 * Includes founder information and reaction/waitlist counts.
 * Public access - no authentication required.
 *
 * @param request - The incoming request
 * @param params - Route parameters containing the slug
 * @returns The idea object or 404 error
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    // Get slug from params (awaiting as per Next.js 15 async params)
    const { slug } = await params;

    // Validate slug presence
    if (!slug) {
      return NextResponse.json(
        {
          error: {
            message: 'Slug is required',
            code: 'MISSING_SLUG',
          },
        },
        { status: 400 }
      );
    }

    // Decode the slug (in case it was URL encoded)
    const decodedSlug = decodeURIComponent(slug);

    // Fetch the idea
    const idea = await getIdeaBySlug(decodedSlug);

    // Idea not found
    if (!idea) {
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

    // Return the idea
    return NextResponse.json({
      idea,
    });
  } catch (error) {
    console.error('Error fetching idea:', error);

    return NextResponse.json(
      {
        error: {
          message: 'Failed to fetch idea. Please try again.',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
