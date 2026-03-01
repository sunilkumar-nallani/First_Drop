'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

// =============================================================================
// Login Form Component
// =============================================================================
// A form component for user login with email and password.
// Includes role selection for dual-role users.
// =============================================================================

// Zod schema for form validation
const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// Type for form data
type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login form component
 *
 * @example
 * ```tsx
 * <LoginForm />
 * ```
 */
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Get error from URL if present
  const error = searchParams.get('error');

  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: searchParams.get('callbackUrl') || '/dashboard',
      });

      if (result?.error) {
        // Handle specific errors
        if (result.error === 'CredentialsSignin') {
          throw new Error('Invalid email or password');
        }
        throw new Error('Login failed. Please try again.');
      }

      // Login successful
      toast.success('Welcome back!');

      // Redirect to callback URL or dashboard
      const callbackUrl = searchParams.get('callbackUrl');
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push('/dashboard');
      }

      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get error message from URL error code
  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      CredentialsSignin: 'Invalid email or password',
      SessionRequired: 'Please sign in to access this page',
      founder_required: 'Founder access required for this page',
      default: 'An error occurred. Please try again.',
    };
    return errorMessages[errorCode] || errorMessages.default;
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 w-full max-w-md mx-auto"
    >
      {/* Form header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-neutral-700" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Welcome Back
        </h2>
        <p className="text-neutral-500">
          Sign in to your FirstDrop account
        </p>
      </div>

      {/* Error message from URL */}
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          role="alert"
        >
          <p className="text-sm">{getErrorMessage(error)}</p>
        </div>
      )}

      {/* Email field */}
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        fullWidth
        autoComplete="email"
        {...register('email')}
      />

      {/* Password field */}
      <div>
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          fullWidth
          autoComplete="current-password"
          {...register('password')}
        />
        <div className="mt-2 text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        loadingText="Signing in..."
        className="mt-6"
      >
        Sign In
      </Button>

      {/* Sign up link */}
      <p className="text-center text-sm text-neutral-500">
        Don&apos;t have an account?{' '}
        <Link href="/join" className="text-neutral-900 hover:text-neutral-700 font-medium">
          Join Now
        </Link>
      </p>
    </form>
  );
}
