import { pgTable, uuid, text, boolean, timestamp, integer, numeric, doublePrecision, index, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { vector } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";


export const roleEnum = pgEnum("role", ["user", "admin", "owner", "editor", "viewer"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["inactive", "active", "past_due", "canceled"]);
export const planTypeEnum = pgEnum("plan_type", ["free", "pro", "premium"]);
export const tripStatusEnum = pgEnum("trip_status", ["planned", "active", "completed", "archived"]);
export const lockStatusEnum = pgEnum("lock_status", ["unlocked", "locked"]);
export const reviewStatusEnum = pgEnum("review_status", ["pending", "approved", "rejected"]);
export const notificationStatusEnum = pgEnum("notification_status", ["unread", "read"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "cancelled", "refunded"]);
export const expertReviewStatusEnum = pgEnum("expert_review_status", ["none", "pending", "completed"]);

export const users = pgTable("User", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerkId").unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  role: roleEnum("role").default("user"),
  provider: text("provider").default("clerk"),
  verified: boolean("verified").default(true),
  status: text("status").default("active"),
  stripeCustomerId: text("stripeCustomerId"),
  stripeSubscriptionId: text("stripeSubscriptionId"),
  subscriptionStatus: subscriptionStatusEnum("subscriptionStatus").default("inactive"), // inactive, active, past_due, canceled
  planType: planTypeEnum("planType").default("free"), // free, pro, premium
  tripCredits: integer("tripCredits").default(3), // Users start with 3 free trips
  preferencesProfile: jsonb("preferencesProfile"), // e.g. { "museums": -2, "food": +5 }
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deletedAt", { withTimezone: true }),
});

export const trips = pgTable("Trip", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  startDate: timestamp("startDate", { withTimezone: true }).notNull(),
  endDate: timestamp("endDate", { withTimezone: true }).notNull(),
  travelers: integer("travelers").default(1),
  budget: numeric("budget", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("INR"),
  travelStyle: text("travelStyle").notNull(),
  transportPreference: text("transportPreference").notNull(),
  hotelCategory: text("hotelCategory").notNull(),
  foodPreference: text("foodPreference").notNull(),
  pace: text("pace").default("balanced"),
  interests: text("interests").array(),
  dietary: text("dietary").array(),
  status: tripStatusEnum("status").default("planned"),
  coverImage: text("coverImage"),
  isPublic: boolean("isPublic").default(false),
  isMultiDestination: boolean("isMultiDestination").default(false),
  isTemplate: boolean("isTemplate").default(false),
  expertReviewRequested: boolean("expertReviewRequested").default(false),
  expertReviewStatus: expertReviewStatusEnum("expertReviewStatus").default("none"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deletedAt", { withTimezone: true }),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId).where(sql`${table.deletedAt} IS NULL`),
  isPublicIdx: index("isPublic_idx").on(table.isPublic).where(sql`${table.deletedAt} IS NULL`),
  destinationIdx: index("trip_destination_idx").on(table.destination),
}));

export const tripDestinations = pgTable("TripDestination", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("tripId").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  country: text("country"),
  state: text("state"),
  order: integer("order").notNull(),
  numberOfDays: integer("numberOfDays").notNull(),
  startDate: timestamp("startDate", { withTimezone: true }),
  endDate: timestamp("endDate", { withTimezone: true }),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  customPreferences: jsonb("customPreferences"),
  transportToNext: jsonb("transportToNext"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deletedAt", { withTimezone: true }),
}, (table) => ({
  tripIdIdx: index("tripDest_tripId_idx").on(table.tripId).where(sql`${table.deletedAt} IS NULL`),
  orderIdx: index("tripDest_order_idx").on(table.tripId, table.order),
}));

export const tripDays = pgTable("TripDay", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("tripId").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  tripDestinationId: uuid("tripDestinationId").references(() => tripDestinations.id, { onDelete: "set null" }),
  dayNumber: integer("dayNumber").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  deletedAt: timestamp("deletedAt", { withTimezone: true }),
}, (table) => ({
  tripIdIdx: index("tripId_idx").on(table.tripId),
  tripDestIdIdx: index("tripDay_destId_idx").on(table.tripDestinationId),
}));

export const activities = pgTable("Activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripDayId: uuid("tripDayId").references(() => tripDays.id, { onDelete: "cascade" }).notNull(),
  time: text("time"),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  duration: integer("duration"),
  estimatedCost: numeric("estimatedCost", { precision: 10, scale: 2 }).default('0'),
  currency: text("currency").default("INR"),
  category: text("category").notNull(),
  placeId: uuid("placeId"),
  startTime: text("startTime"),
  endTime: text("endTime"),
  travelTimeMinutes: integer("travelTimeMinutes"),
  transportation: text("transportation"),
  priority: text("priority").default("recommended"),
  bookingRequired: boolean("bookingRequired").default(false),
  imageUrl: text("imageUrl"),
  travelTime: text("travelTime"),
  lockStatus: lockStatusEnum("lockStatus").default("unlocked"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  rating: doublePrecision("rating"),
  isHiddenGem: boolean("isHiddenGem").default(false),
  localTip: text("localTip"),
  bestTimeToVisit: text("bestTimeToVisit"),
  orderIndex: integer("orderIndex").default(0),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deletedAt", { withTimezone: true }),
}, (table) => ({
  tripDayIdIdx: index("tripDayId_idx").on(table.tripDayId).where(sql`${table.deletedAt} IS NULL`),
  placeIdIdx: index("activity_placeId_idx").on(table.placeId),
  categoryIdx: index("activity_category_idx").on(table.category),
}));

export const tripCollaborators = pgTable("TripCollaborator", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("tripId").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: text("role").default("editor"), // owner, editor, viewer
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tripIdIdx: index("collab_tripId_idx").on(table.tripId),
  userIdIdx: index("collab_userId_idx").on(table.userId),
}));

export const expenses = pgTable("Expense", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("tripId").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("userId").references(() => users.id, { onDelete: "set null" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("INR"),
  category: text("category").notNull(),
  description: text("description").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tripIdIdx: index("expense_tripId_idx").on(table.tripId),
}));

export const expenseSplits = pgTable("ExpenseSplit", {
  id: uuid("id").primaryKey().defaultRandom(),
  expenseId: uuid("expenseId").references(() => expenses.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  expenseIdIdx: index("split_expenseId_idx").on(table.expenseId),
  userIdIdx: index("split_userId_idx").on(table.userId),
}));

export const savedPlaces = pgTable("SavedPlace", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("tripId").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  address: text("address"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  placeId: text("placeId"),
  category: text("category"),
  notes: text("notes"),
  openingHours: text("openingHours"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tripIdIdx: index("place_tripId_idx").on(table.tripId),
}));

export const comments = pgTable("Comment", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("tripId").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  activityId: uuid("activityId").references(() => activities.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tripIdIdx: index("comment_tripId_idx").on(table.tripId),
}));

// --- New Admin Tables ---
export const bookings = pgTable("Booking", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("tripId").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // flight, hotel, train, etc.
  status: bookingStatusEnum("status").default("pending"),
  provider: text("provider"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("INR"),
  referenceId: text("referenceId"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deletedAt", { withTimezone: true }),
}, (table) => ({
  userIdIdx: index("booking_userId_idx").on(table.userId),
  tripIdIdx: index("booking_tripId_idx").on(table.tripId),
  statusIdx: index("booking_status_idx").on(table.status),
}));

export const destinations = pgTable("Destination", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  state: text("state"),
  city: text("city"),
  description: text("description"),
  heroImage: text("heroImage"),
  gallery: text("gallery").array(),
  bestTime: text("bestTime"),
  status: text("status").default("active"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deletedAt", { withTimezone: true }),
}, (table) => ({
  countryIdx: index("dest_country_idx").on(table.country),
  statusIdx: index("dest_status_idx").on(table.status),
}));

export const hotels = pgTable("Hotel", {
  id: uuid("id").primaryKey().defaultRandom(),
  destinationId: uuid("destinationId").references(() => destinations.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  images: text("images").array(),
  rating: numeric("rating", { precision: 2, scale: 1 }),
  price: numeric("price", { precision: 12, scale: 2 }),
  address: text("address"),
  website: text("website"),
  amenities: text("amenities").array(),
  bookingLink: text("bookingLink"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deletedAt", { withTimezone: true }),
}, (table) => ({
  destIdIdx: index("hotel_destId_idx").on(table.destinationId),
}));

export const auditLogs = pgTable("AuditLog", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("adminId").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  targetType: text("targetType").notNull(),
  targetId: text("targetId"),
  details: text("details"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  adminIdIdx: index("audit_adminId_idx").on(table.adminId),
  createdAtIdx: index("audit_createdAt_idx").on(table.createdAt),
}));

export const payments = pgTable("Payment", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId").references(() => users.id, { onDelete: "set null" }),
  bookingId: uuid("bookingId").references(() => bookings.id, { onDelete: "set null" }),
  stripeTransactionId: text("stripeTransactionId"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("succeeded"),
  receiptUrl: text("receiptUrl"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("payment_userId_idx").on(table.userId),
  bookingIdIdx: index("payment_bookingId_idx").on(table.bookingId),
  statusIdx: index("payment_status_idx").on(table.status),
}));

export const reviews = pgTable("Review", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  tripId: uuid("tripId").references(() => trips.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  content: text("content"),
  status: reviewStatusEnum("status").default("pending"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("review_userId_idx").on(table.userId),
  tripIdIdx: index("review_tripId_idx").on(table.tripId),
  statusIdx: index("review_status_idx").on(table.status),
}));

export const aiSettings = pgTable("AISetting", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export const notifications = pgTable("Notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  status: notificationStatusEnum("status").default("unread"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("notif_userId_idx").on(table.userId),
  statusIdx: index("notif_status_idx").on(table.status),
}));

// --- Relations ---

export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
  collaborations: many(tripCollaborators),
  comments: many(comments),
  bookings: many(bookings),
  auditLogs: many(auditLogs),
  payments: many(payments),
  reviews: many(reviews),
  notifications: many(notifications),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  tripDays: many(tripDays),
  tripDestinations: many(tripDestinations),
  collaborators: many(tripCollaborators),
  expenses: many(expenses),
  savedPlaces: many(savedPlaces),
  comments: many(comments),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const tripDestinationsRelations = relations(tripDestinations, ({ one, many }) => ({
  trip: one(trips, {
    fields: [tripDestinations.tripId],
    references: [trips.id],
  }),
  tripDays: many(tripDays),
}));

export const tripDaysRelations = relations(tripDays, ({ one, many }) => ({
  trip: one(trips, {
    fields: [tripDays.tripId],
    references: [trips.id],
  }),
  tripDestination: one(tripDestinations, {
    fields: [tripDays.tripDestinationId],
    references: [tripDestinations.id],
  }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  tripDay: one(tripDays, {
    fields: [activities.tripDayId],
    references: [tripDays.id],
  }),
  place: one(places, {
    fields: [activities.placeId],
    references: [places.id],
  }),
  comments: many(comments),
}));

export const tripCollaboratorsRelations = relations(tripCollaborators, ({ one }) => ({
  trip: one(trips, {
    fields: [tripCollaborators.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [tripCollaborators.userId],
    references: [users.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  trip: one(trips, {
    fields: [expenses.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  splits: many(expenseSplits),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id],
  }),
  user: one(users, {
    fields: [expenseSplits.userId],
    references: [users.id],
  }),
}));

export const savedPlacesRelations = relations(savedPlaces, ({ one }) => ({
  trip: one(trips, {
    fields: [savedPlaces.tripId],
    references: [trips.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  trip: one(trips, {
    fields: [comments.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  activity: one(activities, {
    fields: [comments.activityId],
    references: [activities.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  trip: one(trips, {
    fields: [bookings.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  payments: many(payments),
}));

export const destinationsRelations = relations(destinations, ({ many }) => ({
  hotels: many(hotels),
}));

export const hotelsRelations = relations(hotels, ({ one }) => ({
  destination: one(destinations, {
    fields: [hotels.destinationId],
    references: [destinations.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(users, {
    fields: [auditLogs.adminId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  trip: one(trips, {
    fields: [reviews.tripId],
    references: [trips.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// --- RAG Pipeline Tables ---
export const knowledgeBase = pgTable("KnowledgeBase", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 768 }), // Gemini text-embedding-004 is 768 dims
  metadata: jsonb("metadata"), // e.g. { source: "guide", location: "Paris" }
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  embeddingIndex: index("embeddingIndex").using("hnsw", table.embedding.op("vector_cosine_ops")),
}));

export const places = pgTable("Place", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  destination: text("destination").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  address: text("address"),
  openingHours: jsonb("openingHours"),
  estimatedVisitDuration: integer("estimatedVisitDuration"), // minutes
  estimatedCost: numeric("estimatedCost", { precision: 10, scale: 2 }),
  rating: numeric("rating", { precision: 2, scale: 1 }),
  imageUrl: text("imageUrl"),
  source: text("source"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  destinationIdx: index("place_dest_idx").on(table.destination),
  categoryIdx: index("place_category_idx").on(table.category),
}));

export const aiExecutions = pgTable("AIExecution", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("tripId").references(() => trips.id, { onDelete: "cascade" }),
  model: text("model"),
  promptVersion: text("promptVersion"),
  inputTokens: integer("inputTokens"),
  outputTokens: integer("outputTokens"),
  executionTime: integer("executionTime"), // ms
  status: text("status").default("success"),
  error: text("error"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export const tripRevisions = pgTable("TripRevision", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("tripId").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  version: integer("version").notNull(),
  itineraryData: jsonb("itineraryData").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export const placesRelations = relations(places, ({ many }) => ({
  activities: many(activities),
}));

export const aiExecutionsRelations = relations(aiExecutions, ({ one }) => ({
  trip: one(trips, {
    fields: [aiExecutions.tripId],
    references: [trips.id],
  }),
}));

export const tripRevisionsRelations = relations(tripRevisions, ({ one }) => ({
  trip: one(trips, {
    fields: [tripRevisions.tripId],
    references: [trips.id],
  }),
}));
