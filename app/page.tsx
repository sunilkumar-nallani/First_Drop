import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight, Lightbulb, Users, CheckCircle, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { prisma } from '@/lib/prisma';

// =============================================================================
// Landing Page
// =============================================================================
// The main landing page for FirstDrop.
// Features hero section, how it works, and CTAs.
// =============================================================================

export const metadata: Metadata = {
  title: 'FirstDrop – Validate Your Ideas',
  description:
    'Connect founders with early adopters. Validate your startup ideas before you build.',
};

/**
 * Landing page component
 */
export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  let ideasCount = 0;
  let waitlistCount = 0;
  let foundersCount = 0;
  let usersCount = 0;

  try {
    [ideasCount, waitlistCount, foundersCount, usersCount] = await Promise.all([
      prisma.idea.count(),
      prisma.waitlistEntry.count(),
      prisma.user.count({ where: { isFounder: true } }),
      prisma.user.count({ where: { isUser: true } }),
    ]);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white py-24 lg:py-40 overflow-hidden">
        {/* Background decoration — subtle, elegant */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/[0.03] to-transparent rounded-full" />
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/[0.08] backdrop-blur-sm rounded-full px-4 py-1.5 mb-8 border border-white/[0.08]">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-medium tracking-wide text-neutral-300 uppercase">
                The future of startup validation
              </span>
            </div>

            {/* Brand Title */}
            <div className="mb-4">
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">FirstDrop</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-heading mb-6 leading-[1.08] tracking-tight text-white">
              Idea is everything,
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">wait is it?</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-neutral-400 mb-10 max-w-xl mx-auto leading-relaxed">
              Join FirstDrop and understand the potential for your product from
              real users, even before you decide to build it.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/join">
                <Button size="lg" className="w-full sm:w-auto bg-white text-neutral-900 hover:bg-neutral-100 font-medium">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/discovery">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:border-white/30">
                  Discover Ideas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 lg:py-32 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-base text-neutral-500 max-w-xl mx-auto">
              Whether you&apos;re a founder with an idea or an early adopter looking
              for the next big thing, FirstDrop connects you.
            </p>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* For Founders */}
            <Card className="h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  For Founders
                </h3>
              </div>

              <ul className="space-y-4">
                <FeatureItem icon={<CheckCircle className="w-5 h-5" />}>
                  <strong>List your idea</strong> in minutes with our simple
                  form
                </FeatureItem>
                <FeatureItem icon={<CheckCircle className="w-5 h-5" />}>
                  <strong>Validate interest</strong> before spending time and
                  money building
                </FeatureItem>
                <FeatureItem icon={<CheckCircle className="w-5 h-5" />}>
                  <strong>Build a waitlist</strong> of early adopters who want
                  your product
                </FeatureItem>
                <FeatureItem icon={<CheckCircle className="w-5 h-5" />}>
                  <strong>Get notified</strong> instantly when someone joins
                  your waitlist
                </FeatureItem>
                <FeatureItem icon={<CheckCircle className="w-5 h-5" />}>
                  <strong>Track metrics</strong> with your founder dashboard
                </FeatureItem>
              </ul>

              <div className="mt-8">
                <Link href="/join">
                  <Button variant="outline" fullWidth>
                    Register as a Founder
                  </Button>
                </Link>
              </div>
            </Card>

            {/* For Users */}
            <Card className="h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-neutral-700" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  For Users
                </h3>
              </div>

              <ul className="space-y-4">
                <FeatureItem icon={<CheckCircle className="w-5 h-5" />}>
                  <strong>Discover ideas</strong> like swiping through cards
                </FeatureItem>
                <FeatureItem icon={<CheckCircle className="w-5 h-5" />}>
                  <strong>Join waitlists</strong> for products you&apos;re excited
                  about
                </FeatureItem>
                <FeatureItem icon={<CheckCircle className="w-5 h-5" />}>
                  <strong>Shape startups</strong> by being an early adopter
                </FeatureItem>
                <FeatureItem icon={<CheckCircle className="w-5 h-5" />}>
                  <strong>No account required</strong> to browse and discover
                </FeatureItem>
                <FeatureItem icon={<CheckCircle className="w-5 h-5" />}>
                  <strong>Track your interests</strong> in your personal
                  dashboard
                </FeatureItem>
              </ul>

              <div className="mt-8">
                <Link href="/discovery">
                  <Button variant="secondary" fullWidth>
                    Start Discovering
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatItem number={ideasCount.toString()} label="Ideas Listed" />
            <StatItem number={waitlistCount.toString()} label="Waitlist Entries" />
            <StatItem number={foundersCount.toString()} label="Founders" />
            <StatItem number={usersCount.toString()} label="Early Adopters" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-neutral-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to validate your next big idea?
          </h2>
          <p className="text-base text-neutral-400 mb-8 max-w-xl mx-auto">
            Join thousands of founders and early adopters on FirstDrop. Start
            validating today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/join">
              <Button size="lg" className="bg-white text-neutral-900 hover:bg-neutral-100">Get Started Free</Button>
            </Link>
            <Link href="/discovery">
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30">
                Browse Ideas
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Feature list item component
 */
interface FeatureItemProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

function FeatureItem({ icon, children }: FeatureItemProps) {
  return (
    <li className="flex items-start space-x-3">
      <span className="flex-shrink-0 text-neutral-400 mt-0.5">{icon}</span>
      <span className="text-neutral-600 text-sm">{children}</span>
    </li>
  );
}

/**
 * Stat item component
 */
interface StatItemProps {
  number: string;
  label: string;
}

function StatItem({ number, label }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-1">
        {number}
      </div>
      <div className="text-sm text-neutral-500">{label}</div>
    </div>
  );
}
