const fs = require('fs');

function replaceFile(path, regex, replacement) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(path, content, 'utf8');
}

// 1. Revert schema.ts
let schemaContent = fs.readFileSync('src/db/schema.ts', 'utf8');
schemaContent = schemaContent.replace(/coordinates: geometry\("location", \{ type: "Point", srid: 4326 \}\),/g, 'lat: doublePrecision("lat"),\n  lng: doublePrecision("lng"),');
schemaContent = schemaContent.replace('import { pgTable, uuid, text, boolean, timestamp, integer, numeric, doublePrecision, index, jsonb, pgEnum, geometry } from "drizzle-orm/pg-core";', 'import { pgTable, uuid, text, boolean, timestamp, integer, numeric, doublePrecision, index, jsonb, pgEnum } from "drizzle-orm/pg-core";');
fs.writeFileSync('src/db/schema.ts', schemaContent, 'utf8');

// 2. Revert place-cache.ts
let placeCache = fs.readFileSync('src/lib/place-cache.ts', 'utf8');
placeCache = placeCache.replace(/lat: row\.coordinates \? row\.coordinates\[1\] : undefined,/g, 'lat: row.lat || undefined,');
placeCache = placeCache.replace(/lng: row\.coordinates \? row\.coordinates\[0\] : undefined,/g, 'lng: row.lng || undefined,');
placeCache = placeCache.replace(/coordinates: \(p\.lat && p\.lng\) \? \{ type: 'Point', coordinates: \[p\.lng, p\.lat\] \} : null,/g, 'lat: p.lat || null,\n        lng: p.lng || null,');
fs.writeFileSync('src/lib/place-cache.ts', placeCache, 'utf8');

// 3. Revert clone route
let cloneRoute = fs.readFileSync('src/app/api/trips/[id]/clone/route.ts', 'utf8');
cloneRoute = cloneRoute.replace(/coordinates: act\.coordinates,/g, 'lat: act.lat,\n              lng: act.lng,');
fs.writeFileSync('src/app/api/trips/[id]/clone/route.ts', cloneRoute, 'utf8');

// 4. Revert destinations route
let destRoute = fs.readFileSync('src/app/api/trips/[id]/destinations/route.ts', 'utf8');
destRoute = destRoute.replace(/coordinates: \(body\.lat && body\.lng\) \? \{ type: "Point", coordinates: \[body\.lng, body\.lat\] \} : null,/g, 'lat: body.lat || null,\n      lng: body.lng || null,');
fs.writeFileSync('src/app/api/trips/[id]/destinations/route.ts', destRoute, 'utf8');

console.log("Reverted geometry to lat/lng.");
