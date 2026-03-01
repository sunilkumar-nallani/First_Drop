'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, Plus, LayoutDashboard, Compass, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './ui/Button';

// =============================================================================
// Navigation Component
// =============================================================================
// Main navigation bar for FirstDrop.
// Shows different links based on authentication status and user role.
// Responsive with mobile hamburger menu.
// =============================================================================

/**
 * Navigation component - Main app navigation bar
 *
 * Features:
 * - Logo/brand on the left
 * - Navigation links in the center (desktop)
 * - Auth buttons on the right
 * - Mobile hamburger menu with slide-out drawer
 * - Role-aware navigation (founder vs user links)
 */
export default function Navigation() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthenticated = status === 'authenticated';
  const isFounder = session?.user?.isFounder ?? false;

  // Toggle mobile menu
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Close mobile menu
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Handle sign out
  const handleSignOut = async () => {
    closeMobileMenu();
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center"
              onClick={closeMobileMenu}
            >
              <Image
                src="/logo.png"
                alt="FirstDrop"
                width={32}
                height={32}
                className="rounded-lg"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Always show Discovery */}
            <NavLink href="/discovery" icon={<Compass className="w-4 h-4" />}>
              Discovery
            </NavLink>

            {isAuthenticated ? (
              <>
                {/* Dashboard link */}
                <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />}>
                  Dashboard
                </NavLink>

                {/* Create Idea link (founders only) */}
                {isFounder && (
                  <NavLink href="/create" icon={<Plus className="w-4 h-4" />}>
                    Create Idea
                  </NavLink>
                )}

                {/* Sign Out button */}
                <div className="ml-4 pl-4 border-l border-neutral-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Login link */}
                <NavLink href="/login" icon={<User className="w-4 h-4" />}>
                  Login
                </NavLink>

                {/* Join Now button */}
                <div className="ml-4">
                  <Link href="/join">
                    <Button size="sm">Join Now</Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-navy-600 hover:text-neutral-900 hover:bg-navy-100 transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden border-t border-black/5 bg-white/95 backdrop-blur-xl',
          isMobileMenuOpen ? 'block' : 'hidden'
        )}
      >
        <div className="px-4 py-3 space-y-2">
          {/* Discovery link */}
          <MobileNavLink href="/discovery" onClick={closeMobileMenu}>
            <Compass className="w-5 h-5 mr-3" />
            Discovery
          </MobileNavLink>

          {isAuthenticated ? (
            <>
              {/* Dashboard link */}
              <MobileNavLink href="/dashboard" onClick={closeMobileMenu}>
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </MobileNavLink>

              {/* Create Idea link (founders only) */}
              {isFounder && (
                <MobileNavLink href="/create" onClick={closeMobileMenu}>
                  <Plus className="w-5 h-5 mr-3" />
                  Create Idea
                </MobileNavLink>
              )}

              {/* Divider */}
              <div className="border-t border-neutral-200 my-2 pt-2">
                {/* User info */}
                <div className="px-3 py-2 text-sm text-neutral-600">
                  Signed in as <strong>{session.user?.name}</strong>
                </div>

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-3 py-3 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Login link */}
              <MobileNavLink href="/login" onClick={closeMobileMenu}>
                <User className="w-5 h-5 mr-3" />
                Login
              </MobileNavLink>

              {/* Join Now */}
              <div className="pt-2">
                <Link href="/join" onClick={closeMobileMenu}>
                  <Button fullWidth>Join Now</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/**
 * Desktop navigation link component
 */
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function NavLink({ href, children, icon }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:text-neutral-900 hover:bg-black/5 transition-all duration-150 font-medium"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

/**
 * Mobile navigation link component
 */
interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

function MobileNavLink({ href, children, onClick }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center px-3 py-3 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors font-medium"
    >
      {children}
    </Link>
  );
}
