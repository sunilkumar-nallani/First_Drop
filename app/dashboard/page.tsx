import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { getFounderIdeas } from '@/services/ideaService';
import { getUserWaitlistEntries } from '@/services/waitlistService';
import { getUserById } from '@/services/userService';
import DashboardContent from './DashboardContent';

// =============================================================================
// Dashboard Page
// =============================================================================
// User dashboard showing profile, founder ideas, and liked ideas.
// Supports dual-role users with tabs.
// =============================================================================

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your FirstDrop dashboard.',
};

/**
 * Dashboard page component (Server Component)
 */
export default async function DashboardPage() {
  // Check authentication
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const userId = session.user.id;
  const isFounder = session.user.isFounder;
  const isUser = session.user.isUser;

  // Fetch user profile
  const user = await getUserById(userId);

  // Fetch data based on roles
  let founderIdeas = null;
  let likedIdeas = null;

  if (isFounder) {
    founderIdeas = await getFounderIdeas(userId);
  }

  if (isUser) {
    likedIdeas = await getUserWaitlistEntries(userId);
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Section */}
        <DashboardContent
          user={user}
          isFounder={isFounder}
          isUser={isUser}
          founderIdeas={founderIdeas}
          likedIdeas={likedIdeas}
        />
      </div>
    </div>
  );
}
