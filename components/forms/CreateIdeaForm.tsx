'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Lightbulb,
  Shield,
  Target,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';
import Input from '../ui/Input';

// =============================================================================
// Create Idea Form Component
// =============================================================================
// A comprehensive form for founders to list their startup ideas.
// Includes all fields from the Idea model.
// =============================================================================

// Zod schema for form validation
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
  mediaUrls: z.string().optional(),
  companyInfo: z
    .string()
    .max(2000, 'Company info must be less than 2000 characters')
    .optional(),
  contactInfo: z
    .string()
    .max(200, 'Contact info must be less than 200 characters')
    .optional(),
});

// Type for form data
type CreateIdeaFormData = z.infer<typeof createIdeaSchema>;

/**
 * Create Idea form component
 *
 * @example
 * ```tsx
 * <CreateIdeaForm />
 * ```
 */
export default function CreateIdeaForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateIdeaFormData>({
    resolver: zodResolver(createIdeaSchema),
    defaultValues: {
      title: '',
      sector: '',
      subSector: '',
      ideaDescription: '',
      moat: '',
      usp: '',
      marketSize: '',
      ask: '',
      isFirstTimeFounder: false,
      mediaUrls: '',
      companyInfo: '',
      contactInfo: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: CreateIdeaFormData) => {
    setIsLoading(true);

    try {
      // Transform mediaUrls from string to array
      const postData = {
        ...data,
        mediaUrls: data.mediaUrls
          ? data.mediaUrls.split('\n').filter((url) => url.trim() !== '')
          : [],
      };

      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create idea');
      }

      // Success
      toast.success('Idea listed successfully!');
      router.push('/dashboard');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create idea';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 max-w-3xl mx-auto"
    >
      {/* Basic Information Section */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="w-5 h-5 text-neutral-900" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Basic Information
          </h3>
        </div>

        <Input
          label="Idea Title"
          type="text"
          placeholder="Give your idea a catchy name"
          error={errors.title?.message}
          fullWidth
          {...register('title')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Sector"
            type="text"
            placeholder="e.g., AI, FinTech, Health"
            error={errors.sector?.message}
            fullWidth
            {...register('sector')}
          />

          <Input
            label="Sub-Sector (optional)"
            type="text"
            placeholder="e.g., Productivity, Payments"
            error={errors.subSector?.message}
            fullWidth
            {...register('subSector')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Idea Description <span className="text-neutral-900">*</span>
          </label>
          <textarea
            rows={5}
            placeholder="Describe your idea in detail. What problem does it solve? Who is it for?"
            className={cn(
              'block w-full rounded-lg border shadow-sm text-neutral-900 placeholder-neutral-400',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-neutral-900/20 focus:border-neutral-900',
              'px-4 py-3 text-base',
              errors.ideaDescription && 'border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10 bg-white'
            )}
            {...register('ideaDescription')}
          />
          {errors.ideaDescription && (
            <p className="mt-1.5 text-sm text-neutral-900-600">
              {errors.ideaDescription.message}
            </p>
          )}
          <p className="mt-1 text-xs text-neutral-500">
            Minimum 50 characters. Be clear and concise.
          </p>
        </div>
      </section>

      {/* Competitive Advantage Section */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-neutral-900" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Competitive Advantage
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Your Moat (Competitive Advantage) <span className="text-neutral-900">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="What makes your idea defensible? Patents, proprietary tech, network effects, exclusive partnerships?"
            className={cn(
              'block w-full rounded-lg border shadow-sm text-neutral-900 placeholder-neutral-400',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-neutral-900/20 focus:border-neutral-900',
              'px-4 py-3 text-base',
              errors.moat && 'border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10 bg-white'
            )}
            {...register('moat')}
          />
          {errors.moat && (
            <p className="mt-1.5 text-sm text-neutral-900-600">
              {errors.moat.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Unique Selling Proposition (USP) <span className="text-neutral-900">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="What makes your solution unique? Why would customers choose you over alternatives?"
            className={cn(
              'block w-full rounded-lg border shadow-sm text-neutral-900 placeholder-neutral-400',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-neutral-900/20 focus:border-neutral-900',
              'px-4 py-3 text-base',
              errors.usp && 'border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10 bg-white'
            )}
            {...register('usp')}
          />
          {errors.usp && (
            <p className="mt-1.5 text-sm text-neutral-900-600">
              {errors.usp.message}
            </p>
          )}
        </div>
      </section>

      {/* Market & Ask Section */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-neutral-900" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Market & Ask
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Market Size (optional)"
            type="text"
            placeholder="e.g., $12B by 2025"
            error={errors.marketSize?.message}
            fullWidth
            {...register('marketSize')}
          />

          <Input
            label="What are you looking for? (optional)"
            type="text"
            placeholder="e.g., Beta testers, feedback, funding"
            error={errors.ask?.message}
            fullWidth
            {...register('ask')}
          />
        </div>

        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
            {...register('isFirstTimeFounder')}
          />
          <span className="text-sm text-neutral-700">
            This is my first time as a founder
          </span>
        </label>
      </section>

      {/* Additional Information Section */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquare className="w-5 h-5 text-neutral-900" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Additional Information
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Media URLs (optional)
          </label>
          <textarea
            rows={3}
            placeholder="Add URLs to images, videos, or demos (one per line)"
            className={cn(
              'block w-full rounded-lg border shadow-sm text-neutral-900 placeholder-neutral-400',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-neutral-900/20 focus:border-neutral-900',
              'px-4 py-3 text-base',
              errors.mediaUrls && 'border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10 bg-white'
            )}
            {...register('mediaUrls')}
          />
          <p className="mt-1 text-xs text-neutral-500">
            Enter one URL per line. These will be displayed on your idea page.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Company Info (optional)
          </label>
          <textarea
            rows={3}
            placeholder="Tell us about your team, traction, funding status, etc."
            className={cn(
              'block w-full rounded-lg border shadow-sm text-neutral-900 placeholder-neutral-400',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-neutral-900/20 focus:border-neutral-900',
              'px-4 py-3 text-base',
              errors.companyInfo && 'border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10 bg-white'
            )}
            {...register('companyInfo')}
          />
        </div>

        <Input
          label="Contact Info (optional)"
          type="text"
          placeholder="How should people reach you? (email, Twitter, etc.)"
          error={errors.contactInfo?.message}
          fullWidth
          {...register('contactInfo')}
        />
      </section>

      {/* Submit button */}
      <div className="pt-6 border-t border-neutral-200">
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          loadingText="Creating idea..."
        >
          List Your Idea
        </Button>
      </div>
    </form>
  );
}
