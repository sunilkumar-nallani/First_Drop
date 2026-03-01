'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  Lightbulb,
  Heart,
  ExternalLink,
  Plus,
  Edit3,
  Users,
  TrendingUp,
  Twitter,
  Linkedin,
  Globe,
  Github,
} from 'lucide-react';
import { safeJsonParse } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

// =============================================================================
// Dashboard Content Component
// =============================================================================
// Client component for the dashboard content.
// Handles interactive elements like tabs and modals.
// =============================================================================

// Types
interface User {
  id: string;
  name: string;
  email: string;
  isFounder: boolean;
  isUser: boolean;
  about: string | null;
  profilePhoto: string | null;
  socialHandles: Record<string, string> | null;
  createdAt: Date;
}

interface Idea {
  id: string;
  title: string;
  slug: string;
  sector: string;
  subSector: string | null;
  ideaDescription: string;
  createdAt: Date;
  _count: {
    waitlistEntries: number;
    reactions: number;
  };
}

interface WaitlistEntry {
  id: string;
  email: string;
  createdAt: Date;
  idea: {
    id: string;
    title: string;
    slug: string;
    sector: string;
    ideaDescription: string;
    founder: {
      name: string;
    };
  };
}

interface DashboardContentProps {
  user: User | null;
  isFounder: boolean;
  isUser: boolean;
  founderIdeas: Idea[] | null;
  likedIdeas: WaitlistEntry[] | null;
}

/**
 * Dashboard content component
 */
export default function DashboardContent({
  user,
  isFounder,
  isUser,
  founderIdeas,
  likedIdeas,
}: DashboardContentProps) {
  // Parse social handles
  const socialHandles = safeJsonParse<Record<string, string>>(
    user?.socialHandles ? JSON.stringify(user.socialHandles) : null,
    {}
  );

  // Get social icon
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'github':
        return <Github className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  // Get social URL
  const getSocialUrl = (platform: string, handle: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return `https://twitter.com/${handle.replace('@', '')}`;
      case 'linkedin':
        return `https://linkedin.com/in/${handle}`;
      case 'github':
        return `https://github.com/${handle}`;
      default:
        return handle.startsWith('http') ? handle : `https://${handle}`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start space-x-4">
            <Avatar
              src={user?.profilePhoto}
              name={user?.name || 'User'}
              size="lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{user?.name}</h1>
              <p className="text-neutral-500">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                {isFounder && (
                  <Badge variant="primary">
                    <Lightbulb className="w-3 h-3 mr-1" />
                    Founder
                  </Badge>
                )}
                {isUser && (
                  <Badge variant="secondary">
                    <User className="w-3 h-3 mr-1" />
                    User
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Link href="/profile/edit">
            <Button variant="outline" size="sm">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* About */}
        {user?.about && (
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-500 mb-2">About</h3>
            <p className="text-neutral-700">{user.about}</p>
          </div>
        )}

        {/* Social Links */}
        {Object.keys(socialHandles).length > 0 && (
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-500 mb-3">
              Social Links
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(socialHandles).map(([platform, handle]) => (
                <a
                  key={platform}
                  href={getSocialUrl(platform, handle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-neutral-50 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  {getSocialIcon(platform)}
                  <span className="capitalize">{platform}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Tabs for all authenticated users */}
      <Tabs defaultValue={isFounder ? "founder" : "user"}>
        <TabsList className="mb-6">
          {isFounder && (
            <TabsTrigger value="founder">
              <Lightbulb className="w-4 h-4 mr-2" />
              Your Ideas
            </TabsTrigger>
          )}
          <TabsTrigger value="user">
            <Heart className="w-4 h-4 mr-2" />
            Ideas You Liked
          </TabsTrigger>
        </TabsList>

        {isFounder && (
          <TabsContent value="founder">
            <FounderSection ideas={founderIdeas} />
          </TabsContent>
        )}

        <TabsContent value="user">
          <UserSection entries={likedIdeas} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Founder section component
 */
function FounderSection({ ideas }: { ideas: Idea[] | null }) {
  if (!ideas || ideas.length === 0) {
    return (
      <Card className="text-center py-12">
        <Lightbulb className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-neutral-900 mb-2">
          No ideas yet
        </h3>
        <p className="text-neutral-600 mb-6 max-w-md mx-auto">
          You haven&apos;t listed any ideas yet. Create your first idea to start
          building your waitlist.
        </p>
        <Link href="/create">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Idea
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">
          Your Ideas ({ideas.length})
        </h2>
        <Link href="/create">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Idea
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ideas.map((idea) => (
          <Card key={idea.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="primary">{idea.sector}</Badge>
                {idea.subSector && (
                  <Badge variant="outline">{idea.subSector}</Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {idea.title}
              </h3>
              <p className="text-sm text-neutral-600 line-clamp-2 mt-1">
                {idea.ideaDescription}
              </p>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="flex items-center space-x-1 text-neutral-500 mb-1">
                  <Users className="w-4 h-4" />
                  <span>Waitlist</span>
                </div>
                <p className="text-xl font-bold text-neutral-900">
                  {idea._count.waitlistEntries}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center space-x-1 text-neutral-500 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Interest</span>
                </div>
                <p className="text-xl font-bold text-neutral-900">
                  {idea._count.reactions}
                </p>
              </div>

              <Link
                href={`/idea/${idea.slug}`}
                className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
                title="View public page"
              >
                <ExternalLink className="w-5 h-5" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * User section component
 */
function UserSection({ entries }: { entries: WaitlistEntry[] | null }) {
  if (!entries || entries.length === 0) {
    return (
      <Card className="text-center py-12">
        <Heart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-neutral-900 mb-2">
          No ideas liked yet
        </h3>
        <p className="text-neutral-600 mb-6 max-w-md mx-auto">
          You haven&apos;t joined any waitlists yet. Start discovering ideas and
          join the ones you&apos;re excited about.
        </p>
        <Link href="/discovery">
          <Button>Discover Ideas</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-neutral-900">
        Ideas You Liked ({entries.length})
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {entries.map((entry: any) => {
          if (!entry.idea) return null; // Failsafe
          return (
            <Card key={entry.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="primary">{entry.idea.sector}</Badge>
                    <span className="text-sm text-neutral-500">
                      by {entry.idea.founder?.name || 'Unknown Founder'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {entry.idea.title}
                  </h3>
                  <p className="text-sm text-neutral-600 line-clamp-2 mt-1">
                    {entry.idea.ideaDescription}
                  </p>
                  <p className="text-xs text-neutral-400 mt-2">
                    Joined on{' '}
                    {new Date(entry.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <Link
                  href={`/idea/${entry.idea.slug}`}
                  className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors ml-4"
                  title="View idea page"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
