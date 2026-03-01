'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Heart, X, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

// =============================================================================
// Idea Actions Component
// =============================================================================
// Client component for "I'm in" and "Pass" actions on the public idea page.
// =============================================================================

interface IdeaActionsProps {
  ideaId: string;
}

/**
 * Idea actions component
 */
export default function IdeaActions({ ideaId }: IdeaActionsProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle "I'm in" action
  const handleInterest = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/ideas/${ideaId}/interest`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to record interest');
      }

      toast.success("You're on the waitlist!");
      setShowSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle "Pass" action
  const handlePass = async () => {
    setIsProcessing(true);

    try {
      await fetch(`/api/ideas/${ideaId}/pass`, {
        method: 'POST',
      });

      toast('Passed on this idea');
      router.push('/discovery');
    } catch (error) {
      console.error('Error passing on idea:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Success state
  if (showSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-800 mb-2">
          You&apos;re on the list!
        </h3>
        <p className="text-green-700 mb-4">
          We&apos;ll notify you when there are updates about this idea.
        </p>
        <Button onClick={() => router.push('/discovery')}>
          Discover More Ideas
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Button
        onClick={handleInterest}
        disabled={isProcessing}
        isLoading={isProcessing}
        className="w-full sm:w-auto"
      >
        <Heart className="w-5 h-5 mr-2" />
        I&apos;m In
      </Button>
      <Button
        variant="outline"
        onClick={handlePass}
        disabled={isProcessing}
        className="w-full sm:w-auto"
      >
        <X className="w-5 h-5 mr-2" />
        Pass
      </Button>
    </div>
  );
}
