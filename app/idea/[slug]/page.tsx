import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { getIdeaBySlug } from '@/services/ideaService';
import { Heart, Users, TrendingUp, ArrowLeft, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import WaitlistEmailForm from '@/components/forms/WaitlistEmailForm';
import IdeaActions from './IdeaActions';
import CopyLinkButton from '@/components/ui/CopyLinkButton';

export const dynamic = 'force-dynamic';

// =============================================================================
// Public Idea Page
// =============================================================================
// Public landing page for an idea, accessible without login.
// Shows all idea details and waitlist form for non-logged-in users.
// =============================================================================

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const idea = await getIdeaBySlug(slug);

  if (!idea) {
    return {
      title: 'Idea Not Found | FirstDrop',
    };
  }

  return {
    title: `${idea.title} | FirstDrop`,
    description: idea.ideaDescription.slice(0, 160),
    openGraph: {
      title: idea.title,
      description: idea.ideaDescription.slice(0, 160),
      type: 'article',
    },
  };
}

/**
 * Public idea page component (Server Component)
 */
export default async function IdeaPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch idea
  const idea = await getIdeaBySlug(slug);

  // 404 if not found
  if (!idea) {
    notFound();
  }

  // Check if user is logged in
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  // Render variables
  const appHost = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const shareUrl = `${appHost}/idea/${idea.slug}`;

  return (
    <div className="min-h-screen bg-neutral-50 py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link & Share */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/discovery"
            className="inline-flex items-center text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discovery
          </Link>
          <CopyLinkButton url={shareUrl} />
        </div>

        {/* Main content */}
        <div className="space-y-8">
          {/* Header Card */}
          <Card>
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="primary">{idea.sector}</Badge>
              {idea.subSector && (
                <Badge variant="outline">{idea.subSector}</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-6">
              {idea.title}
            </h1>

            {/* Founder info */}
            <div className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-xl">
              <Avatar
                src={idea.founder.profilePhoto}
                name={idea.founder.name}
                size="lg"
              />
              <div>
                <p className="font-semibold text-neutral-900">
                  {idea.founder.name}
                </p>
                {idea.isFirstTimeFounder && (
                  <Badge size="sm" variant="secondary">
                    First-time Founder
                  </Badge>
                )}
                {idea.founder.about && (
                  <p className="text-sm text-neutral-600 mt-1">
                    {idea.founder.about}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-neutral-200">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-700">
                  <strong>{idea._count.waitlistEntries}</strong> on waitlist
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-700">
                  <strong>{idea._count.reactions}</strong> interested
                </span>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              The Idea
            </h2>
            <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {idea.ideaDescription}
            </p>
          </Card>

          {/* Moat & USP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                Competitive Advantage
              </h2>
              <p className="text-neutral-700 leading-relaxed">
                {idea.moat}
              </p>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                Unique Selling Proposition
              </h2>
              <p className="text-neutral-700 leading-relaxed">
                {idea.usp}
              </p>
            </Card>
          </div>

          {/* Market & Ask */}
          {(idea.marketSize || idea.ask) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {idea.marketSize && (
                <Card>
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">
                    Market Size
                  </h2>
                  <p className="text-neutral-700">{idea.marketSize}</p>
                </Card>
              )}
              {idea.ask && (
                <Card>
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">
                    What We&apos;re Looking For
                  </h2>
                  <p className="text-neutral-700">{idea.ask}</p>
                </Card>
              )}
            </div>
          )}

          {/* Company Info */}
          {idea.companyInfo && (
            <Card>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                About the Company
              </h2>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {idea.companyInfo}
              </p>
            </Card>
          )}

          {/* Contact Info */}
          {idea.contactInfo && (
            <Card>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                Contact
              </h2>
              <p className="text-neutral-700">{idea.contactInfo}</p>
            </Card>
          )}

          {/* Media */}
          {idea.mediaUrls && idea.mediaUrls.length > 0 && (
            <Card>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                Media
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {idea.mediaUrls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-neutral-400 mr-3" />
                    <span className="text-neutral-700 truncate">{url}</span>
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* CTA Section */}
          <Card className="bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200">
            <div className="text-center py-8">
              <Heart className="w-16 h-16 text-neutral-900 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Interested in {idea.title}?
              </h2>
              <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                Join the waitlist to get early access and updates about this
                idea.
              </p>

              {isLoggedIn ? (
                <IdeaActions ideaId={idea.id} />
              ) : (
                <div className="max-w-sm mx-auto">
                  <WaitlistEmailForm ideaId={idea.id} />
                  <p className="mt-4 text-sm text-neutral-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-neutral-900 hover:text-neutral-700 font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
