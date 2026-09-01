import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Enabling pg_trgm extension...");
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    console.log("pg_trgm enabled successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to enable pg_trgm:", error);
    process.exit(1);
  }
}

main();
