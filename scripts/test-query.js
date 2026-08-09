const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function testQuery() {
  try {
    const res = await sql`select "id", "clerkId", "email", "name", "avatar", "role", "provider", "verified", "status", "stripeCustomerId", "stripeSubscriptionId", "subscriptionStatus", "planType", "createdAt", "updatedAt" from "User" "users" where "users"."clerkId" = 'test' limit 1`;
    console.log("Success! result:", res);
  } catch (err) {
    console.error("Error exact:", err);
  } finally {
    await sql.end();
  }
}

testQuery();
