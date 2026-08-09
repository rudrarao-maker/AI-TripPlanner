import { config } from "dotenv";
config({ path: ".env" }); // Try .env first
config({ path: ".env.local" }); // Override with .env.local if exists

import { db } from "../src/db";
import { users } from "../src/db/schema";

async function makeAdmin() {
  try {
    console.log("Updating users to Admin role...");
    
    // Update all users to Admin in dev environment
    const result = await db.update(users).set({ role: "admin" }).returning();
    
    if (result.length > 0) {
      console.log(`Successfully promoted ${result.length} user(s) to ADMIN!`);
      result.forEach(u => console.log(`- ${u.email} is now ${u.role}`));
    } else {
      console.log("No users found in the database. Please sign in via Clerk first so the webhook inserts your user, then run this again.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error updating user:", error);
    process.exit(1);
  }
}

makeAdmin();
