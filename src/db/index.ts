import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Next.js hot-reloads modules in dev, which would otherwise open a new pool per reload.
const globalForDb = globalThis as unknown as {
  connection: postgres.Sql | undefined;
};

const connection = globalForDb.connection ?? postgres(process.env.DATABASE_URL);
if (process.env.NODE_ENV !== 'production') globalForDb.connection = connection;

export const db = drizzle(connection, { schema });
