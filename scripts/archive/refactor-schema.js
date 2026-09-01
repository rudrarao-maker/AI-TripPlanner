const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'src', 'db', 'schema.ts');
let content = fs.readFileSync(schemaPath, 'utf8');

// 1. Add imports
content = content.replace(
  'import { pgTable, uuid, text, boolean, timestamp, integer, numeric, doublePrecision, index, jsonb } from "drizzle-orm/pg-core";',
  'import { pgTable, uuid, text, boolean, timestamp, integer, numeric, doublePrecision, index, jsonb, pgEnum, geometry } from "drizzle-orm/pg-core";'
);

// 2. Add enums after imports
const enums = `
export const roleEnum = pgEnum("role", ["user", "admin", "owner", "editor", "viewer"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["inactive", "active", "past_due", "canceled"]);
export const planTypeEnum = pgEnum("plan_type", ["free", "pro", "premium"]);
export const tripStatusEnum = pgEnum("trip_status", ["planned", "active", "completed", "archived"]);
export const lockStatusEnum = pgEnum("lock_status", ["unlocked", "locked"]);
export const reviewStatusEnum = pgEnum("review_status", ["pending", "approved", "rejected"]);
export const notificationStatusEnum = pgEnum("notification_status", ["unread", "read"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "cancelled", "refunded"]);
`;
content = content.replace('export const users = pgTable', enums + '\nexport const users = pgTable');

// 3. Replace text columns with enums
content = content.replace('role: text("role").default("user")', 'role: roleEnum("role").default("user")');
content = content.replace('subscriptionStatus: text("subscriptionStatus").default("inactive")', 'subscriptionStatus: subscriptionStatusEnum("subscriptionStatus").default("inactive")');
content = content.replace('planType: text("planType").default("free")', 'planType: planTypeEnum("planType").default("free")');
content = content.replace('status: text("status").default("planned")', 'status: tripStatusEnum("status").default("planned")');
content = content.replace('lockStatus: text("lockStatus").default("unlocked")', 'lockStatus: lockStatusEnum("lockStatus").default("unlocked")');
content = content.replace('status: text("status").default("pending"), // pending, approved, rejected', 'status: reviewStatusEnum("status").default("pending"),');
content = content.replace('status: text("status").default("pending"), // pending, confirmed, cancelled, refunded', 'status: bookingStatusEnum("status").default("pending"),');
content = content.replace('status: text("status").default("unread"), // unread, read', 'status: notificationStatusEnum("status").default("unread"),');

// 4. Fix Foreign Key trips.userId
content = content.replace('userId: text("userId").notNull(),', 'userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),');

// 5. Replace lat/lng with PostGIS geometry
const latLngRegex = /lat:\s*doublePrecision\("lat"\),\s*lng:\s*doublePrecision\("lng"\),/g;
content = content.replace(latLngRegex, 'location: geometry("location", { type: "Point", srid: 4326 }),');

// 6. Add Soft Deletes (deletedAt)
content = content.replace('createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),\n  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),\n});', 'createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),\n  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),\n  deletedAt: timestamp("deletedAt", { withTimezone: true }),\n});');
content = content.replace(/createdAt: timestamp\("createdAt", { withTimezone: true }\).defaultNow\(\).notNull\(\),\n\s+updatedAt: timestamp\("updatedAt", { withTimezone: true }\).defaultNow\(\).notNull\(\),\n}, \(table\)/g, 'createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),\n  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),\n  deletedAt: timestamp("deletedAt", { withTimezone: true }),\n}, (table)');
content = content.replace(/date: timestamp\("date", { withTimezone: true }\).notNull\(\),\n}, \(table\)/g, 'date: timestamp("date", { withTimezone: true }).notNull(),\n  deletedAt: timestamp("deletedAt", { withTimezone: true }),\n}, (table)');

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('schema.ts refactored successfully.');
