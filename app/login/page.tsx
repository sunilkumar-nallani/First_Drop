import React from 'react';
import { Metadata } from 'next';
import LoginForm from '@/components/forms/LoginForm';
import Card from '@/components/ui/Card';

// =============================================================================
// Login Page
// =============================================================================
// Centered card layout for user login.
// =============================================================================

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your FirstDrop account.',
};

/**
 * Login page component
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12 lg:py-20">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <React.Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
            <LoginForm />
          </React.Suspense>
        </Card>
      </div>
    </div>
  );
}
