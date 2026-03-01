'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Building2, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';
import Input from '../ui/Input';

// =============================================================================
// Registration Form Component
// =============================================================================
// A form component for user registration with role selection.
// Supports both user and founder registration types.
// =============================================================================

/**
 * Registration form type
 */
export type RegisterFormType = 'user' | 'founder';

/**
 * Registration form props
 */
interface RegisterFormProps {
  /** Type of registration form */
  type: RegisterFormType;
  /** Optional CSS class */
  className?: string;
}

// Zod schema for form validation
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters'),
    email: z
      .string()
      .email('Please enter a valid email address')
      .toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters'),
    companyName: z
      .string()
      .max(200, 'Company name must be less than 200 characters')
      .optional(),
    about: z
      .string()
      .max(1000, 'About must be less than 1000 characters')
      .optional(),
    isAlsoUser: z.boolean().default(false),
    isAlsoFounder: z.boolean().default(false),
  });

// Type for form data
type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Registration form component
 *
 * @example
 * ```tsx
 * // User registration
 * <RegisterForm type="user" />
 *
 * // Founder registration
 * <RegisterForm type="founder" />
 * ```
 */
export default function RegisterForm({ type, className }: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      companyName: '',
      about: '',
      isAlsoUser: type === 'user',
      isAlsoFounder: type === 'founder',
    },
  });

  // Form submission handler
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // Determine roles based on form type and checkboxes
      const isFounder = type === 'founder' || data.isAlsoFounder;
      const isUser = type === 'user' || data.isAlsoUser;

      // Register the user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          isFounder,
          isUser,
          companyName: data.companyName,
          about: data.about,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Registration failed');
      }

      // Registration successful - now sign in
      toast.success('Account created! Signing you in...');

      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error('Sign in failed after registration');
      }

      // Redirect based on primary role
      if (type === 'founder') {
        router.push('/dashboard');
      } else {
        router.push('/discovery');
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-5', className)}
    >
      {/* Form header */}
      <div className="flex items-center space-x-3 mb-6">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            type === 'founder' ? 'bg-neutral-900' : 'bg-neutral-100'
          )}
        >
          {type === 'founder' ? (
            <Building2 className="w-6 h-6 text-white" />
          ) : (
            <UserIcon className="w-6 h-6 text-neutral-700" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {type === 'founder' ? 'Register as a Founder' : 'Register as a User'}
          </h3>
          <p className="text-sm text-neutral-500">
            {type === 'founder'
              ? 'List your ideas and build a waitlist'
              : 'Discover and support new ideas'}
          </p>
        </div>
      </div>

      {/* Name field */}
      <Input
        label="Full Name"
        type="text"
        placeholder="John Doe"
        error={errors.name?.message}
        fullWidth
        {...register('name')}
      />

      {/* Email field */}
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        fullWidth
        {...register('email')}
      />

      {/* Password field */}
      <Input
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        error={errors.password?.message}
        helperText="Must be at least 8 characters"
        fullWidth
        {...register('password')}
      />

      {/* Company name (founders only) */}
      {type === 'founder' && (
        <Input
          label="Company Name"
          type="text"
          placeholder="Your company or startup name"
          error={errors.companyName?.message}
          fullWidth
          {...register('companyName')}
        />
      )}

      {/* About field */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          About You{' '}
          <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Tell us a bit about yourself..."
          className={cn(
            'block w-full rounded-lg border shadow-sm text-neutral-900 placeholder-neutral-400',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-neutral-900/20 focus:border-neutral-900',
            'px-4 py-3 text-base',
            errors.about && 'border-red-300 bg-red-50'
          )}
          {...register('about')}
        />
        {errors.about && (
          <p className="mt-1.5 text-sm text-red-600">
            {errors.about.message}
          </p>
        )}
      </div>

      {/* Role checkboxes */}
      <div className="space-y-3 pt-2">
        <p className="text-sm font-medium text-neutral-700">
          I want to: <span className="text-red-500">*</span>
        </p>

        {type === 'founder' && (
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
              {...register('isAlsoUser')}
            />
            <span className="text-sm text-neutral-700">
              I also want to discover ideas (dual role)
            </span>
          </label>
        )}

        {type === 'user' && (
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
              {...register('isAlsoFounder')}
            />
            <span className="text-sm text-neutral-700">
              I am also a founder (dual role)
            </span>
          </label>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        loadingText="Creating account..."
        className="mt-6"
      >
        Create Account
      </Button>

      {/* Login link */}
      <p className="text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-neutral-900 hover:text-neutral-700 font-medium"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
