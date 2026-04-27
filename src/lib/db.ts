/**
 * Database client — supports both SQLite (local dev) and Turso/libSQL (production on Render)
 *
 * Local dev (Z.ai sandbox):    DATABASE_URL=file:./db/custom.db
 * Production (Render + Turso): TURSO_DATABASE_URL=libsql://xxx.turso.io  + TURSO_AUTH_TOKEN=xxx
 */

import { PrismaClient } from '@prisma/client';
import path from 'node:path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

async function createPrismaClient(): Promise<PrismaClient> {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  // Production: Turso / libSQL (Render deployment)
  if (tursoUrl) {
    const { PrismaLibSQL } = await import('@prisma/adapter-libsql');
    const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken });
    return new PrismaClient({ adapter });
  }

  // Local dev: SQLite (Z.ai sandbox)
  const { PrismaBetterSQLite3 } = await import('@prisma/adapter-better-sqlite3');
  const dbPath = process.env.DATABASE_URL?.startsWith('file:')
    ? process.env.DATABASE_URL.replace(/^file:/, '')
    : path.join(process.cwd(), 'db', 'custom.db');

  const adapter = new PrismaBetterSQLite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

// Use a promise-based singleton so async init works
let dbPromise: Promise<PrismaClient> | undefined;

function getDb(): Promise<PrismaClient> {
  if (!dbPromise) {
    dbPromise = createPrismaClient();
  }
  return dbPromise;
}

// Synchronous db access (for convenience — db is pre-initialized at module load)
// This works because the promise resolves quickly and other modules import after
let cachedDb: PrismaClient | undefined;

export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!cachedDb) {
      throw new Error(
        'Database not initialized yet. Make sure to await initDb() before using db.'
      );
    }
    return (cachedDb as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/**
 * Initialize the database connection. Call this early in the app lifecycle.
 */
export async function initDb(): Promise<PrismaClient> {
  if (cachedDb) return cachedDb;
  cachedDb = await createPrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = cachedDb;
  }

  return cachedDb;
}

// Auto-initialize immediately (top-level await equivalent)
getDb().then((client) => {
  cachedDb = client;
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
});
