const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function checkTables() {
  try {
    const res = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
    console.log("Tables in DB:", res.map(r => r.tablename));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
  }
}

checkTables();
