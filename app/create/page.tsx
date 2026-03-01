import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import CreateIdeaForm from '@/components/forms/CreateIdeaForm';
import Card from '@/components/ui/Card';

// =============================================================================
// Create Idea Page
// =============================================================================
// Page for founders to list their startup ideas.
// Requires authentication and founder role.
// =============================================================================

export const metadata: Metadata = {
  title: 'List Your Idea',
  description: 'Create a new listing for your startup idea on FirstDrop.',
};

/**
 * Create Idea page component
 *
 * Server Component - checks authentication and role before rendering.
 */
export default async function CreatePage() {
  // Check authentication
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/create');
  }

  // Redirect to dashboard if not a founder
  if (!session.user.isFounder) {
    redirect('/dashboard?error=founder_required');
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            List Your Idea on FirstDrop
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            Share your startup idea with the world and start building your
            waitlist. Be clear and compelling to attract early adopters.
          </p>
        </div>

        {/* Form card */}
        <Card>
          <CreateIdeaForm />
        </Card>
      </div>
    </div>
  );
}
