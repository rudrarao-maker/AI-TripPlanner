const postgres = require('postgres');
const sql = postgres('postgresql://postgres.eghgesyqxrjwibsdqejj:Rudrarao%231234@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres', { prepare: false });

sql`SELECT 1`
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit());
