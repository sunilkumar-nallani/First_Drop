import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';

// =============================================================================
// Footer Component
// =============================================================================
// Simple footer component for FirstDrop.
// Shows app name, copyright, and year.
// =============================================================================

/**
 * Footer component - App footer with branding and links
 *
 * Features:
 * - Brand name and tagline
 * - Quick links
 * - Copyright notice
 * - Made with love badge
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="FirstDrop"
                width={36}
                height={36}
                className="rounded-lg"
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-neutral-500">
              Connect founders with early adopters. Validate your ideas before
              you build.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/discovery"
                  className="text-sm hover:text-white transition-colors"
                >
                  Discover Ideas
                </Link>
              </li>
              <li>
                <Link
                  href="/join"
                  className="text-sm hover:text-white transition-colors"
                >
                  Join Now
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm hover:text-white transition-colors"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* For founders */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Founders</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/create"
                  className="text-sm hover:text-white transition-colors"
                >
                  List Your Idea
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm hover:text-white transition-colors"
                >
                  Founder Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            {/* Copyright */}
            <p className="text-sm">
              &copy; {currentYear} FirstDrop. All rights reserved.
            </p>

            {/* Made with love */}
            <p className="text-sm flex items-center">
              Made with{' '}
              <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" /> for
              founders
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
