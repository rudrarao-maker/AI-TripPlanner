const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function checkColumns() {
  try {
    const res = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User'
    `;
    console.log("Columns in User table:", res.map(r => r.column_name));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
  }
}

checkColumns();
