import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import RegisterForm from '@/components/forms/RegisterForm';
import Card from '@/components/ui/Card';

// =============================================================================
// Registration Page
// =============================================================================
// Two-column layout for user and founder registration.
// =============================================================================

export const metadata: Metadata = {
  title: 'Join FirstDrop',
  description: 'Create your FirstDrop account as a founder or early adopter.',
};

/**
 * Registration page component
 */
export default function JoinPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">
            Join FirstDrop
          </h1>
          <p className="text-base text-neutral-500 max-w-xl mx-auto">
            Create an account to start discovering ideas or list your own.
            Choose your path below.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* User registration card */}
          <Card className="h-full">
            <RegisterForm type="user" />
          </Card>

          {/* Founder registration card */}
          <Card className="h-full">
            <RegisterForm type="founder" />
          </Card>
        </div>

        {/* Login link */}
        <p className="text-center mt-12 text-neutral-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-neutral-900 hover:text-neutral-700 font-medium"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
