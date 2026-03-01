import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]/route';
import { updateUserProfile } from '@/services/userService';

// =============================================================================
// Profile API Route
// =============================================================================
// PUT /api/profile
//
// Updates the authenticated user's profile information.
// Supports partial updates - only provided fields are updated.
//
// Requires authentication.
// =============================================================================

// Zod schema for profile updates
const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  about: z
    .string()
    .max(2000, 'About must be less than 2000 characters')
    .optional()
    .nullable(),
  profilePhoto: z
    .string()
    .url('Please enter a valid URL')
    .max(500, 'Photo URL must be less than 500 characters')
    .optional()
    .nullable(),
  socialHandles: z
    .record(z.string().max(100))
    .optional(),
});

/**
 * PUT /api/profile
 *
 * Updates the current user's profile.
 * Only updates fields that are provided in the request body.
 *
 * @param request - The incoming request with profile updates
 * @returns Updated user profile
 */
export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);

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

    // Filter out undefined values for partial update
    const updateData: Record<string, unknown> = {};
    const data = validationResult.data;

    if (data.name !== undefined) updateData.name = data.name;
    if (data.about !== undefined) updateData.about = data.about;
    if (data.profilePhoto !== undefined) updateData.profilePhoto = data.profilePhoto;
    if (data.socialHandles !== undefined) updateData.socialHandles = data.socialHandles;

    // If no fields to update, return error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error: {
            message: 'No fields to update',
            code: 'NO_CHANGES',
          },
        },
        { status: 400 }
      );
    }

    // Update profile
    const updatedUser = await updateUserProfile(userId, updateData);

    if (!updatedUser) {
      return NextResponse.json(
        {
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);

    return NextResponse.json(
      {
        error: {
          message: 'Failed to update profile. Please try again.',
          code: 'UPDATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
