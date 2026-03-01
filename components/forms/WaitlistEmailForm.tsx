'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';
import { useRouter } from 'next/navigation';

// =============================================================================
// Waitlist Email Form Component
// =============================================================================
// A simple form for non-logged-in users to join a waitlist with their email.
// Used on public idea pages.
// =============================================================================

/**
 * Waitlist email form props
 */
interface WaitlistEmailFormProps {
  /** The ID of the idea to join the waitlist for */
  ideaId: string;
  /** Optional CSS class */
  className?: string;
  /** Callback when successfully joined */
  onSuccess?: () => void;
}

// Zod schema for form validation
const waitlistEmailSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase(),
});

// Type for form data
type WaitlistEmailFormData = z.infer<typeof waitlistEmailSchema>;

/**
 * Waitlist email form component
 *
 * @example
 * ```tsx
 * <WaitlistEmailForm ideaId="idea_123" />
 *
 * // With success callback
 * <WaitlistEmailForm
 *   ideaId="idea_123"
 *   onSuccess={() => console.log('Joined waitlist!')}
 * />
 * ```
 */
export default function WaitlistEmailForm({
  ideaId,
  className,
  onSuccess,
}: WaitlistEmailFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WaitlistEmailFormData>({
    resolver: zodResolver(waitlistEmailSchema),
    defaultValues: {
      email: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: WaitlistEmailFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/ideas/${ideaId}/interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error?.code === 'ALREADY_ON_WAITLIST') {
          // Do not throw an error here. Treat as success since they want to be on the list
          console.log('User is already on the waitlist.');
        } else {
          throw new Error(result.error?.message || 'Failed to join waitlist');
        }
      }

      // Success
      setIsSuccess(true);
      toast.success("You're on the waitlist!");
      router.refresh(); // Tell Next.js to dump the cached router state so Home counters update instantly
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to join waitlist';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div
        className={cn(
          'bg-green-50 border border-green-200 rounded-xl p-6 text-center',
          className
        )}
      >
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h4 className="text-lg font-semibold text-green-800 mb-1">
          You&apos;re on the list!
        </h4>
        <p className="text-sm text-green-700">
          We&apos;ll notify you when there are updates about this idea.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-4', className)}
    >
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="email"
            placeholder="you@example.com"
            className={cn(
              'block w-full pl-10 pr-4 py-3 rounded-lg border shadow-sm',
              'text-neutral-900 placeholder-neutral-400',
              'transition-colors duration-200 border-neutral-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-neutral-900/10 focus:border-neutral-900',
              errors.email && 'border-neutral-900 bg-neutral-50'
            )}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-sm text-neutral-900">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        loadingText="Joining..."
      >
        Join Waitlist
      </Button>

      <p className="text-xs text-center text-neutral-500">
        We&apos;ll never share your email. Unsubscribe anytime.
      </p>
    </form>
  );
}
