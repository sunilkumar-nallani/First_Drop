import React, { ReactNode } from 'react';
import { Metadata } from 'next';
import { Inter, DM_Sans } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// =============================================================================
// Root Layout
// =============================================================================
// The root layout component that wraps all pages in the application.
// Includes global fonts, metadata, and common UI elements (nav, footer).
// =============================================================================

// Load Inter font for body text
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Load DM Sans font for headings
const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});

/**
 * Application metadata
 * Used for SEO and social sharing
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'FirstDrop – Validate Your Ideas',
    template: '%s | FirstDrop',
  },
  description:
    'Connect founders with early adopters. Validate your startup ideas before you build. Join waitlists, discover new products, and shape the future.',
  keywords: [
    'startup',
    'ideas',
    'validation',
    'waitlist',
    'founders',
    'early adopters',
    'product discovery',
    'startup community',
  ],
  authors: [{ name: 'FirstDrop' }],
  creator: 'FirstDrop',
  publisher: 'FirstDrop',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'FirstDrop',
    title: 'FirstDrop – Validate Your Ideas',
    description:
      'Connect founders with early adopters. Validate your startup ideas before you build.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FirstDrop - Validate Your Ideas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FirstDrop – Validate Your Ideas',
    description:
      'Connect founders with early adopters. Validate your startup ideas before you build.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

/**
 * Props for the RootLayout component
 */
interface RootLayoutProps {
  /** Child page components */
  children: ReactNode;
}

/**
 * Root layout component
 *
 * Wraps all pages with:
 * - Font configuration (Inter + DM Sans)
 * - Global providers (auth, query, toast)
 * - Navigation bar
 * - Footer
 * - Main content area
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-off-white">
        {/* Providers wrap everything that needs context */}
        <Providers>
          {/* Navigation bar */}
          <Navigation />

          {/* Main content area */}
          <main className="flex-grow">{children}</main>

          {/* Footer */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
