import NextAuth, { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// =============================================================================
// NextAuth.js Configuration
// =============================================================================
// This file configures NextAuth.js for FirstDrop authentication.
//
// Features:
// - Credentials-based authentication (email + password)
// - Prisma adapter for database persistence
// - JWT session strategy (stateless, serverless-friendly)
// - Custom session and JWT callbacks for role data
//
// Docs: https://next-auth.js.org/configuration/options
// =============================================================================

export const authOptions: AuthOptions = {
  // Use Prisma adapter for database integration
  adapter: PrismaAdapter(prisma),

  // Configure authentication providers
  providers: [
    CredentialsProvider({
      name: 'credentials',

      // Fields shown on the sign-in form
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'you@example.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },

      // Authorize function - validates credentials against database
      async authorize(credentials) {
        // Validate input presence
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase().trim(),
          },
        });

        // User not found
        if (!user) {
          return null;
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        // Password doesn't match
        if (!isPasswordValid) {
          return null;
        }

        // Return user object (will be encoded in JWT)
        // IMPORTANT: Never include passwordHash in the returned object
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isFounder: user.isFounder,
          isUser: user.isUser,
        };
      },
    }),
  ],

  // Session configuration - use JWT for stateless sessions
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom pages - use our custom login page
  pages: {
    signIn: '/login',
    error: '/login', // Error codes passed in query string
  },

  // Callbacks for customizing JWT and session
  callbacks: {
    /**
     * JWT Callback - called when JWT is created or updated
     * Adds custom user fields to the token
     */
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.isFounder = user.isFounder;
        token.isUser = user.isUser;
      }

      // Handle session update (e.g., when user updates profile)
      if (trigger === 'update' && session) {
        token.name = session.name ?? token.name;
        token.isFounder = session.isFounder ?? token.isFounder;
        token.isUser = session.isUser ?? token.isUser;
      }

      return token;
    },

    /**
     * Session Callback - called when session is checked
     * Adds token data to the session object (available client-side)
     */
    async session({ session, token }) {
      // Add custom fields from token to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isFounder = token.isFounder as boolean;
        session.user.isUser = token.isUser as boolean;
      }

      return session;
    },
  },

  // Events for logging and analytics (optional)
  events: {
    async signIn({ user, isNewUser }) {
      console.log(`User signed in: ${user.email} (new: ${isNewUser})`);
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token.email}`);
    },
  },

  // Debug mode - enable in development
  debug: process.env.NODE_ENV === 'development',

  // Secret for signing tokens (MUST be set in production)
  secret: process.env.NEXTAUTH_SECRET,
};

// Create the NextAuth handler
const handler = NextAuth(authOptions);

// Export handlers for GET and POST requests
export { handler as GET, handler as POST };
