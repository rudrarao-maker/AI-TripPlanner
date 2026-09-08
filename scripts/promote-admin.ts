// Promote admin using direct pooler connection (different DNS than db.*)
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

async function promoteAdmin() {
  const dbUrl = process.env.DATABASE_URL!;
  console.log("Connecting to:", dbUrl.replace(/:[^:]*@/, ':***@'));
  
  const sql = postgres(dbUrl, { 
    connect_timeout: 15,
    idle_timeout: 5,
  });

  try {
    const allUsers = await sql`SELECT id, "clerkId", email, name, role FROM "User" ORDER BY "createdAt" ASC`;
    console.log("\n📋 All users in the database:");
    allUsers.forEach((u: any) => {
      console.log(`  - ${u.name} (${u.email}) | role: ${u.role} | clerkId: ${u.clerkId}`);
    });

    if (allUsers.length === 0) {
      console.log("\n❌ No users found. Log in first, then run this script again.");
      await sql.end();
      return;
    }

    // Promote ALL users to admin (or just the first one)
    const targetUser = allUsers[0];
    await sql`UPDATE "User" SET role = 'admin' WHERE id = ${targetUser.id}`;
    console.log(`\n✅ Promoted "${targetUser.name}" (${targetUser.email}) to admin!`);
    console.log("   Refresh the browser and navigate to /admin or try generating a trip.\n");
  } catch (err: any) {
    console.error("Error:", err.message);
    
    // If DNS fails, give user manual SQL
    if (err.code === 'ENOTFOUND') {
      console.log("\n⚠️ Network issue: can't reach the database from your machine.");
      console.log("   Go to Supabase Dashboard → SQL Editor and run:\n");
      console.log('   UPDATE "User" SET role = \'admin\' WHERE email = \'YOUR_EMAIL\';');
      console.log("");
    }
  } finally {
    await sql.end();
  }
}

promoteAdmin();
