/**
 * Database client — supports both SQLite (local dev) and Turso/libSQL (production on Render)
 *
 * Local dev (Z.ai sandbox):    DATABASE_URL=file:./db/custom.db
 * Production (Render + Turso): TURSO_DATABASE_URL=libsql://xxx.turso.io  + TURSO_AUTH_TOKEN=xxx
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  // Production: Turso / libSQL (Render deployment)
  if (tursoUrl) {
    // Dynamic require for Turso adapter — only loaded when needed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require('@prisma/adapter-libsql');
    const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken });
    return new PrismaClient({ adapter });
  }

  // Local dev: SQLite (Z.ai sandbox)
  const path = require('node:path');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const dbPath = process.env.DATABASE_URL?.startsWith('file:')
    ? process.env.DATABASE_URL.replace(/^file:/, '')
    : path.join(process.cwd(), 'db', 'custom.db');

  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
