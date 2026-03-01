import { PrismaClient } from '@prisma/client';

// =============================================================================
// Prisma Client Singleton
// =============================================================================
// This module provides a singleton instance of the PrismaClient to prevent
// connection exhaustion in development with hot reloading.
//
// In development, Next.js hot-reloads modules which can create multiple
// instances of PrismaClient, exhausting database connections. This pattern
// stores the client on the global object to reuse it across reloads.
//
// In production, a single instance is created and reused.
// =============================================================================

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a new PrismaClient instance or reuse the existing one from global
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Log configuration - only log queries in development
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// Store the instance on global in development to survive hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Default export for convenience
export default prisma;

// =============================================================================
// Connection Management
// =============================================================================

/**
 * Explicitly connect to the database.
 * Not usually needed as Prisma connects lazily on first query,
 * but useful for health checks or warming up connections.
 */
export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

/**
 * Disconnect from the database.
 * Important to call this when shutting down the application
 * to properly close database connections.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Health check function to verify database connectivity.
 * Returns true if the database is reachable, false otherwise.
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Execute a simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}
