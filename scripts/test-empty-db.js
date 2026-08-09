const { drizzle } = require('drizzle-orm/postgres-js');
const { pgTable, text, uuid } = require('drizzle-orm/pg-core');
const { eq } = require('drizzle-orm');

const users = pgTable("User", {
  id: uuid("id").primaryKey(),
  clerkId: text("clerkId"),
});

const client = {};
const db = drizzle(client, { schema: { users } });

async function testEmptyDb() {
  try {
    const res = await db.query.users.findFirst({
      where: eq(users.clerkId, 'user_123')
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Drizzle Error:", err);
  }
}

testEmptyDb();
