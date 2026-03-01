import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// =============================================================================
// Registration API Route
// =============================================================================
// POST /api/auth/register
//
// Creates a new user account with email, password, and role selection.
// Passwords are hashed with bcrypt (12 rounds) before storage.
//
// Request Body:
//   - name: string (required) - User's display name
//   - email: string (required) - User's email address
//   - password: string (required) - User's password (min 8 characters)
//   - isFounder: boolean (optional) - Whether user wants founder role
//   - isUser: boolean (optional) - Whether user wants user role (default: true)
//   - companyName: string (optional) - Company name (founders only)
//
// Response:
//   - 201: User created successfully
//   - 400: Validation error or invalid input
//   - 409: Email already exists
//   - 500: Internal server error
// =============================================================================

// Zod schema for request validation
const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  isFounder: z.boolean().default(false),
  isUser: z.boolean().default(true),
  companyName: z
    .string()
    .max(200, 'Company name must be less than 200 characters')
    .optional(),
});

// POST handler for user registration
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      // Return validation errors
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

    const { name, email, password, isFounder, isUser, companyName } =
      validationResult.data;

    // Validate that at least one role is selected
    if (!isFounder && !isUser) {
      return NextResponse.json(
        {
          error: {
            message: 'Please select at least one role (founder or user)',
            code: 'ROLE_REQUIRED',
          },
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            message: 'An account with this email already exists',
            code: 'EMAIL_EXISTS',
          },
        },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (12 rounds)
    // 12 rounds provides good security while maintaining performance
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        isFounder,
        isUser,
        // Store company name in about field if provided (founders only)
        about: companyName
          ? `Founder at ${companyName}`
          : isFounder
            ? 'Founder'
            : null,
      },
      // Select only safe fields to return (exclude passwordHash)
      select: {
        id: true,
        name: true,
        email: true,
        isFounder: true,
        isUser: true,
        about: true,
        profilePhoto: true,
        createdAt: true,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        message: 'Account created successfully',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Return generic error to avoid leaking implementation details
    return NextResponse.json(
      {
        error: {
          message: 'An unexpected error occurred. Please try again.',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
