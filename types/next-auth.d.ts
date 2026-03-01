import 'next-auth';
import { JWT } from 'next-auth/jwt';

// =============================================================================
// NextAuth.js Type Extensions
// =============================================================================
// This file extends the default NextAuth.js types to include custom fields
// for FirstDrop's dual-role user system.
//
// These extensions ensure TypeScript knows about:
// - isFounder and isUser fields on User, Session, and JWT
// - id field on Session user
//
// Without these extensions, TypeScript would complain when accessing
// session.user.isFounder or token.isUser.
// =============================================================================

declare module 'next-auth' {
  /**
   * Extend the User interface returned by authorize() and adapter methods
   */
  interface User {
    /** User's unique identifier */
    id: string;
    /** User's display name */
    name: string;
    /** User's email address */
    email: string;
    /** Whether the user can list ideas as a founder */
    isFounder: boolean;
    /** Whether the user can discover ideas as a user */
    isUser: boolean;
  }

  /**
   * Extend the Session interface returned by useSession() and getSession()
   */
  interface Session {
    user: {
      /** User's unique identifier */
      id: string;
      /** User's display name */
      name: string;
      /** User's email address */
      email: string;
      /** User's profile image URL (optional) */
      image?: string | null;
      /** Whether the user can list ideas as a founder */
      isFounder: boolean;
      /** Whether the user can discover ideas as a user */
      isUser: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extend the JWT interface
   */
  interface JWT {
    /** User's unique identifier */
    id: string;
    /** User's display name */
    name: string;
    /** User's email address */
    email: string;
    /** Whether the user can list ideas as a founder */
    isFounder: boolean;
    /** Whether the user can discover ideas as a user */
    isUser: boolean;
  }
}
