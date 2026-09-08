// Quick script to promote the first user in the database to admin
// Run with: cmd /c npx tsx scripts/promote-admin.ts
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

async function promoteAdmin() {
  const sql = postgres(process.env.DATABASE_URL!);

  // List all users first
  const allUsers = await sql`SELECT id, "clerkId", email, name, role FROM "User" ORDER BY "createdAt" ASC`;
  console.log("\n📋 All users in the database:");
  allUsers.forEach((u: any) => {
    console.log(`  - ${u.name} (${u.email}) | role: ${u.role} | clerkId: ${u.clerkId}`);
  });

  if (allUsers.length === 0) {
    console.log("\n❌ No users found in the database. Please log in first, then run this script again.");
    await sql.end();
    return;
  }

  // Promote the first user to admin
  const targetUser = allUsers[0];
  await sql`UPDATE "User" SET role = 'admin' WHERE id = ${targetUser.id}`;
  console.log(`\n✅ Promoted "${targetUser.name}" (${targetUser.email}) to admin!`);
  console.log("   Refresh the browser and navigate to /admin to verify.\n");

  await sql.end();
}

promoteAdmin().catch(console.error);
