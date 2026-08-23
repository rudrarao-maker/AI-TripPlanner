const fs = require('fs');
let f = 'src/app/api/trips/[id]/expenses/route.ts';
let c = fs.readFileSync(f, 'utf8');
c = c.replace('import { expenses, expenseSplits, trips, users } from "@/db/schema";', 'import { expenses, expenseSplits, trips, users } from "@/db/schema";\nimport { safeUserSelect } from "@/db/utils";');
c = c.replace(/user: true/g, 'user: { columns: safeUserSelect }');
fs.writeFileSync(f, c);
