const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

// We can't easily require the TS schema. 
// Let's just create a dummy schema with drizzle-orm to test it.
const { pgTable, text, uuid, timestamp, boolean } = require('drizzle-orm/pg-core');
const { eq } = require('drizzle-orm');

const users = pgTable("User", {
  id: uuid("id").primaryKey(),
  clerkId: text("clerkId"),
});

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema: { users } });

async function testDrizzle() {
  try {
    const res = await db.query.users.findFirst({
      where: eq(users.clerkId, 'user_3HfiLrkc6UVW822AbOOtVbdlQ9N')
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Drizzle Error:", err);
  } finally {
    await client.end();
  }
}

testDrizzle();
