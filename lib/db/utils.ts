import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Singleton pattern to ensure we only create one database connection
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    // biome-ignore lint/style/noNonNullAssertion: Environment variable is required
    const client = postgres(process.env.POSTGRES_URL!);
    _db = drizzle(client);
  }
  return _db;
}

export const db = getDb();
