import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("⚠️ DATABASE_URL not set. Database queries will fail at runtime.");
}

// Production-ready connection pool configuration
const client = connectionString
  ? postgres(connectionString, {
      prepare: false,
      max: 10,                    // Maximum 10 connections in pool
      idle_timeout: 20,           // Close idle connections after 20s
      connect_timeout: 10,        // Fail connection attempts after 10s
      max_lifetime: 60 * 30,      // Recycle connections every 30 minutes
      onnotice: () => {},         // Suppress NOTICE messages in production
    })
  : ({} as any);

export const db = drizzle(client, { schema });
