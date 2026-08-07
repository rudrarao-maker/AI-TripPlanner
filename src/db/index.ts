import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// Prevent Next.js from crashing on boot if the connection string is missing or invalid.
// It will only fail when an actual database query is executed.
const client = connectionString 
  ? postgres(connectionString, { prepare: false }) 
  : ({} as any); 

export const db = drizzle(client, { schema });
