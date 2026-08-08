/**
 * Admin Seed Script
 * 
 * Usage: npx tsx scripts/seed-admin.ts
 * 
 * Seeds the first admin user for fresh deployments.
 * Safe to run multiple times — uses upsert logic.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL not set in .env.local");
    process.exit(1);
  }

  const client = postgres(dbUrl, { prepare: false });
  const db = drizzle(client, { schema });

  // Default admin — change these values for your deployment
  const adminEmail = process.env.ADMIN_EMAIL || "admin@tripcraft.ai";
  const adminName = process.env.ADMIN_NAME || "Admin User";
  const adminClerkId = process.env.ADMIN_CLERK_ID || "";

  console.log(`🔍 Checking for existing admin: ${adminEmail}`);

  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, adminEmail),
  });

  if (existing) {
    if (existing.role === "admin" || existing.role === "super_admin") {
      console.log(`✅ Admin already exists: ${existing.email} (role: ${existing.role})`);
    } else {
      // Upgrade to admin
      await db
        .update(schema.users)
        .set({ role: "super_admin" })
        .where(eq(schema.users.id, existing.id));
      console.log(`⬆️  Upgraded ${existing.email} to super_admin`);
    }
  } else {
    // Create new admin
    const [newAdmin] = await db
      .insert(schema.users)
      .values({
        email: adminEmail,
        name: adminName,
        clerkId: adminClerkId || undefined,
        role: "super_admin",
        status: "active",
        verified: true,
        provider: "seed",
      })
      .returning();

    console.log(`✅ Created super_admin: ${newAdmin.email} (id: ${newAdmin.id})`);
  }

  // Also seed default AI settings
  const defaultSettings = [
    { key: "ai_model", value: "gemini-1.5-pro", description: "Default AI model for trip generation" },
    { key: "max_generation_days", value: "30", description: "Maximum number of days for AI trip generation" },
    { key: "max_daily_generations", value: "10", description: "Max AI generations per user per day" },
  ];

  for (const setting of defaultSettings) {
    const exists = await db.query.aiSettings.findFirst({
      where: eq(schema.aiSettings.key, setting.key),
    });

    if (!exists) {
      await db.insert(schema.aiSettings).values(setting);
      console.log(`⚙️  Seeded AI setting: ${setting.key} = ${setting.value}`);
    }
  }

  console.log("\n🎉 Admin seed completed!");
  await client.end();
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
