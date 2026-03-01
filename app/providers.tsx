'use client';

import React, { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// =============================================================================
// Application Providers
// =============================================================================
// This component wraps the application with all necessary context providers.
// It must be a Client Component ('use client') because it uses React context.
//
// Providers included:
// - SessionProvider: NextAuth.js session management
// - QueryClientProvider: TanStack React Query for server state
// - Toaster: react-hot-toast for notifications
// =============================================================================

/**
 * Create a QueryClient instance
 * We create it here to ensure it's only created once per session
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default stale time for queries (5 minutes)
        staleTime: 5 * 60 * 1000,
        // Default cache time (10 minutes)
        gcTime: 10 * 60 * 1000,
        // Retry failed queries 2 times
        retry: 2,
        // Refetch on window focus (good for real-time data)
        refetchOnWindowFocus: true,
      },
    },
  });
}

/**
 * Props for the Providers component
 */
interface ProvidersProps {
  /** Child components to wrap with providers */
  children: ReactNode;
}

// Global query client instance (for client-side only)
let browserQueryClient: QueryClient | undefined;

/**
 * Get or create the QueryClient instance
 * Ensures we only create one instance on the client
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return createQueryClient();
  }

  // Browser: create once
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }

  return browserQueryClient;
}

/**
 * Providers component - Wraps the app with all context providers
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <Providers>
 *   {children}
 * </Providers>
 * ```
 */
export default function Providers({ children }: ProvidersProps) {
  // Get or create the QueryClient
  const queryClient = getQueryClient();

  return (
    <SessionProvider
      // Session refetch interval (0 = disabled, rely on token expiry)
      refetchInterval={0}
      // Refetch session when window regains focus
      refetchOnWindowFocus={true}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            // Default toast duration (5 seconds)
            duration: 5000,
            // Default styles
            style: {
              background: '#1a202c',
              color: '#fff',
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
            },
            // Success toast styles
            success: {
              style: {
                background: '#10b981',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            // Error toast styles
            error: {
              style: {
                background: '#ef4444',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}
