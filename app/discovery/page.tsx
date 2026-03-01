'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Heart, X, Clock, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import WaitlistEmailForm from '@/components/forms/WaitlistEmailForm';

// =============================================================================
// Discovery Page
// =============================================================================
// Card-based discovery page for browsing startup ideas.
// Features "I'm in" / "Pass" actions and a 5-minute auto-advance timer.
// =============================================================================

// Timer duration in milliseconds (5 minutes)
const TIMER_DURATION = 5 * 60 * 1000;

// Type for idea from API
interface Idea {
  id: string;
  title: string;
  slug: string;
  sector: string;
  subSector: string | null;
  ideaDescription: string;
  moat: string;
  usp: string;
  marketSize: string | null;
  ask: string | null;
  isFirstTimeFounder: boolean;
  mediaUrls: string[] | null;
  companyInfo: string | null;
  contactInfo: string | null;
  createdAt: string;
  founder: {
    id: string;
    name: string;
    about: string | null;
    profilePhoto: string | null;
    socialHandles: Record<string, string> | null;
  };
  _count: {
    waitlistEntries: number;
    reactions: number;
  };
}

/**
 * Discovery page component (Client Component)
 */
export default function DiscoveryPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Current card index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);

  // Modal state for email form
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Loading states for actions
  const [isProcessing, setIsProcessing] = useState(false);

  // Success state for current card
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch ideas
  const {
    data: ideasData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ideas', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/ideas');
      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }
      return response.json();
    },
  });

  const ideas: Idea[] = ideasData?.ideas || [];
  const currentIdea = ideas[currentIndex];
  const hasMoreIdeas = currentIndex < ideas.length - 1;

  // Handle "I'm in" action
  const handleInterest = useCallback(async () => {
    if (!currentIdea) return;

    setIsProcessing(true);

    try {
      if (session?.user) {
        // Logged in user
        const response = await fetch(`/api/ideas/${currentIdea.id}/interest`, {
          method: 'POST',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Failed to record interest');
        }

        toast.success("You're on the waitlist!");
        setShowSuccess(true);

        // Advance after showing success briefly
        setTimeout(() => {
          if (hasMoreIdeas) {
            setCurrentIndex((prev) => prev + 1);
          }
        }, 1500);
      } else {
        // Not logged in - show email modal
        setShowEmailModal(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [currentIdea, session, hasMoreIdeas]);

  // Handle "Pass" action
  const handlePass = useCallback(async () => {
    if (!currentIdea || isProcessing) return;

    setIsProcessing(true);

    try {
      if (session?.user) {
        // Logged in user - record pass
        await fetch(`/api/ideas/${currentIdea.id}/pass`, {
          method: 'POST',
        });
      }

      // Advance to next card
      if (hasMoreIdeas) {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error passing on idea:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [currentIdea, session, hasMoreIdeas, isProcessing]);

  // Handle email modal success
  const handleEmailSuccess = useCallback(() => {
    setShowEmailModal(false);
    setShowSuccess(true);

    // Advance after showing success briefly
    setTimeout(() => {
      if (hasMoreIdeas) {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 1500);
  }, [hasMoreIdeas]);

  // Timer effect
  useEffect(() => {
    if (!currentIdea || isProcessing || showSuccess) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1000) {
          // Timer expired - auto pass
          clearInterval(timer);
          handlePass();
          return TIMER_DURATION;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIdea, currentIndex, isProcessing, showSuccess, handlePass]);

  // Reset timer when card changes
  useEffect(() => {
    setTimeRemaining(TIMER_DURATION);
    setShowSuccess(false);
  }, [currentIndex]);

  // Format time remaining
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-neutral-900 animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Loading ideas...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            Failed to load ideas
          </h2>
          <p className="text-neutral-500 mb-4">
            Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // No ideas state
  if (ideas.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 lg:py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <Sparkles className="w-16 h-16 text-neutral-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            No ideas yet!
          </h2>
          <p className="text-neutral-500 mb-6">
            There are no ideas to discover right now. Check back soon or be the
            first to list an idea!
          </p>
          {session?.user?.isFounder ? (
            <Button onClick={() => router.push('/create')}>
              List Your Idea
            </Button>
          ) : (
            <Button onClick={() => router.push('/join')}>Join Now</Button>
          )}
        </div>
      </div>
    );
  }

  // All ideas seen state
  if (!hasMoreIdeas && currentIndex >= ideas.length - 1 && !showSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 lg:py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            You&apos;ve seen everything!
          </h2>
          <p className="text-neutral-500 mb-6">
            Check back soon for new ideas. Great job exploring!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setCurrentIndex(0)} variant="outline">
              Start Over
            </Button>
            {session?.user?.isFounder && (
              <Button onClick={() => router.push('/create')}>
                List Your Idea
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 lg:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500">
              Idea {currentIndex + 1} of {ideas.length}
            </span>
            <div className="flex items-center space-x-1 text-sm text-neutral-500">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-neutral-900 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${((TIMER_DURATION - timeRemaining) / TIMER_DURATION) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Idea card */}
        <Card className="relative overflow-hidden">
          {/* Success overlay */}
          {showSuccess && (
            <div className="absolute inset-0 bg-green-50 flex flex-col items-center justify-center z-10">
              <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                You&apos;re on the list!
              </h3>
              <p className="text-green-700">Advancing to next idea...</p>
            </div>
          )}

          {/* Card content */}
          <div className={cn('space-y-6', showSuccess && 'opacity-0')}>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="primary" className="mb-3">
                  {currentIdea.sector}
                </Badge>
                {currentIdea.subSector && (
                  <Badge variant="outline" className="ml-2 mb-3">
                    {currentIdea.subSector}
                  </Badge>
                )}
                <h2 className="text-2xl font-bold text-neutral-900">
                  {currentIdea.title}
                </h2>
              </div>
              <div className="flex items-center space-x-2 text-sm text-navy-500">
                <Heart className="w-4 h-4" />
                <span>{currentIdea._count.waitlistEntries}</span>
              </div>
            </div>

            {/* Founder info */}
            <div className="flex items-center space-x-3 p-4 bg-navy-50 rounded-xl">
              <Avatar
                src={currentIdea.founder.profilePhoto}
                name={currentIdea.founder.name}
                size="md"
              />
              <div>
                <p className="font-medium text-neutral-900">
                  {currentIdea.founder.name}
                </p>
                {currentIdea.isFirstTimeFounder && (
                  <Badge size="sm" variant="secondary">
                    First-time Founder
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                The Idea
              </h3>
              <p className="text-neutral-700 leading-relaxed">
                {currentIdea.ideaDescription}
              </p>
            </div>

            {/* Moat */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Competitive Advantage
              </h3>
              <p className="text-neutral-700 leading-relaxed">
                {currentIdea.moat}
              </p>
            </div>

            {/* USP */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Unique Selling Proposition
              </h3>
              <p className="text-neutral-700 leading-relaxed">
                {currentIdea.usp}
              </p>
            </div>

            {/* Market & Ask */}
            {(currentIdea.marketSize || currentIdea.ask) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentIdea.marketSize && (
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <p className="text-sm text-neutral-500 mb-1">Market Size</p>
                    <p className="font-semibold text-neutral-900">
                      {currentIdea.marketSize}
                    </p>
                  </div>
                )}
                {currentIdea.ask && (
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <p className="text-sm text-neutral-500 mb-1">Looking For</p>
                    <p className="font-semibold text-neutral-900">
                      {currentIdea.ask}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center space-x-4 pt-4 border-t border-neutral-200">
              <Button
                onClick={handleInterest}
                disabled={isProcessing}
                isLoading={isProcessing}
                className="flex-1"
              >
                <Heart className="w-5 h-5 mr-2" />
                I&apos;m In
              </Button>
              <Button
                variant="outline"
                onClick={handlePass}
                disabled={isProcessing}
                className="flex-1"
              >
                <X className="w-5 h-5 mr-2" />
                Pass
              </Button>
            </div>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Link
            href={`/${currentIdea.slug}`}
            className="text-neutral-600 hover:text-neutral-900 font-medium"
          >
            View full idea page →
          </Link>
        </div>
      </div>

      {/* Email modal for non-logged-in users */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-neutral-900">
                Join the Waitlist
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-neutral-400 hover:text-neutral-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-neutral-500 mb-4">
              Enter your email to join the waitlist for{' '}
              <strong>{currentIdea.title}</strong>.
            </p>
            <WaitlistEmailForm
              ideaId={currentIdea.id}
              onSuccess={handleEmailSuccess}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
