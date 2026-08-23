import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("No DATABASE_URL");
  
  console.log("Wiping database using URL:", url.substring(0, 20) + "...");
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  await db.execute(sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
  console.log("Database wiped successfully.");
  
  await client.end();
}

main().catch(console.error);
