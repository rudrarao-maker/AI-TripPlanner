CREATE TABLE "AIExecution" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tripId" uuid,
	"model" text,
	"promptVersion" text,
	"inputTokens" integer,
	"outputTokens" integer,
	"executionTime" integer,
	"status" text DEFAULT 'success',
	"error" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ExpenseSplit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expenseId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Place" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"destination" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"lat" double precision,
	"lng" double precision,
	"address" text,
	"openingHours" jsonb,
	"estimatedVisitDuration" integer,
	"estimatedCost" numeric(10, 2),
	"rating" numeric(2, 1),
	"imageUrl" text,
	"source" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TripRevision" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tripId" uuid NOT NULL,
	"version" integer NOT NULL,
	"itineraryData" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Activity" ADD COLUMN "placeId" uuid;--> statement-breakpoint
ALTER TABLE "Activity" ADD COLUMN "startTime" text;--> statement-breakpoint
ALTER TABLE "Activity" ADD COLUMN "endTime" text;--> statement-breakpoint
ALTER TABLE "Activity" ADD COLUMN "travelTimeMinutes" integer;--> statement-breakpoint
ALTER TABLE "Activity" ADD COLUMN "transportation" text;--> statement-breakpoint
ALTER TABLE "Activity" ADD COLUMN "priority" text DEFAULT 'recommended';--> statement-breakpoint
ALTER TABLE "Activity" ADD COLUMN "bookingRequired" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "Trip" ADD COLUMN "pace" text DEFAULT 'balanced';--> statement-breakpoint
ALTER TABLE "Trip" ADD COLUMN "interests" text[];--> statement-breakpoint
ALTER TABLE "Trip" ADD COLUMN "dietary" text[];--> statement-breakpoint
ALTER TABLE "AIExecution" ADD CONSTRAINT "AIExecution_tripId_Trip_id_fk" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ExpenseSplit" ADD CONSTRAINT "ExpenseSplit_expenseId_Expense_id_fk" FOREIGN KEY ("expenseId") REFERENCES "public"."Expense"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ExpenseSplit" ADD CONSTRAINT "ExpenseSplit_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TripRevision" ADD CONSTRAINT "TripRevision_tripId_Trip_id_fk" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "split_expenseId_idx" ON "ExpenseSplit" USING btree ("expenseId");--> statement-breakpoint
CREATE INDEX "split_userId_idx" ON "ExpenseSplit" USING btree ("userId");