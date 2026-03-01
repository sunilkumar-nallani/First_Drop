import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]/route';
import {
  getIdeasForDiscovery,
  createIdea,
  CreateIdeaInput,
} from '@/services/ideaService';

// =============================================================================
// Ideas API Routes
// =============================================================================
// GET  /api/ideas  → Returns all ideas for discovery
// POST /api/ideas  → Creates a new idea (founders only)
// =============================================================================

// Zod schema for creating an idea
const createIdeaSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  sector: z
    .string()
    .min(2, 'Sector is required')
    .max(100, 'Sector must be less than 100 characters'),
  subSector: z
    .string()
    .max(100, 'Sub-sector must be less than 100 characters')
    .optional(),
  ideaDescription: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  moat: z
    .string()
    .min(20, 'Moat description must be at least 20 characters')
    .max(2000, 'Moat description must be less than 2000 characters'),
  usp: z
    .string()
    .min(20, 'USP must be at least 20 characters')
    .max(2000, 'USP must be less than 2000 characters'),
  marketSize: z
    .string()
    .max(200, 'Market size must be less than 200 characters')
    .optional(),
  ask: z
    .string()
    .max(500, 'Ask must be less than 500 characters')
    .optional(),
  isFirstTimeFounder: z.boolean().default(false),
  mediaUrls: z.array(z.string().url('Invalid URL')).optional(),
  companyInfo: z
    .string()
    .max(2000, 'Company info must be less than 2000 characters')
    .optional(),
  contactInfo: z
    .string()
    .max(200, 'Contact info must be less than 200 characters')
    .optional(),
});

/**
 * GET /api/ideas
 *
 * Returns all ideas for the discovery page.
 * If the user is authenticated, excludes ideas they've already reacted to.
 * Public access - no authentication required.
 */
export async function GET(_request: NextRequest) {
  try {
    // Check if user is authenticated (optional)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Get ideas, filtering out those the user has already reacted to
    const ideas = await getIdeasForDiscovery(userId);

    return NextResponse.json({
      ideas,
      count: ideas.length,
    });
  } catch (error) {
    console.error('Error fetching ideas:', error);

    return NextResponse.json(
      {
        error: {
          message: 'Failed to fetch ideas. Please try again.',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ideas
 *
 * Creates a new idea. Requires authentication and founder role.
 *
 * Request Body: Validated against createIdeaSchema
 * Response: 201 with created idea, or error response
 */
export async function POST(request: NextRequest) {
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

    // Check founder role
    if (!session.user.isFounder) {
      return NextResponse.json(
        {
          error: {
            message: 'Founder role required to create ideas',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createIdeaSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors,
          },
        },
        { status: 400 }
      );
    }

    // Create the idea
    const ideaData: CreateIdeaInput = validationResult.data;
    const idea = await createIdea(ideaData, session.user.id);

    return NextResponse.json(
      {
        message: 'Idea created successfully',
        idea,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating idea:', error);

    return NextResponse.json(
      {
        error: {
          message: 'Failed to create idea. Please try again.',
          code: 'CREATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
