import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_POOL_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("⚠️ DATABASE_URL not set. Database queries will fail at runtime.");
}

// Production-ready connection pool configuration
// Prevent connection exhaustion during HMR in development
const globalForDb = globalThis as unknown as {
  postgresClient: ReturnType<typeof postgres> | undefined;
};

const client = globalForDb.postgresClient ?? (connectionString
  ? postgres(connectionString, {
      prepare: false,
      max: process.env.NODE_ENV === 'production' ? 1 : 10, // Maximum 1 in prod for serverless scale
      idle_timeout: 20,           // Close idle connections after 20s
      connect_timeout: 10,        // Fail connection attempts after 10s
      max_lifetime: 60 * 30,      // Recycle connections every 30 minutes
      onnotice: () => {},         // Suppress NOTICE messages in production
    })
  : ({} as any));

if (process.env.NODE_ENV !== 'production' && connectionString) {
  globalForDb.postgresClient = client;
}

export const db = drizzle(client, { schema });
