import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL as string, { prepare: false });
const db = drizzle(client, { schema });

async function run() {
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, 'user_3HfiLrkc6UVW822AbOOtVbdlQ9N')
    });
    console.log("Success:", user);
  } catch (err: any) {
    console.error("Drizzle failed:", err);
  } finally {
    await client.end();
  }
}

run();
