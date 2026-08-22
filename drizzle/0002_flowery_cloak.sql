CREATE TABLE "TripDestination" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tripId" uuid NOT NULL,
	"name" text NOT NULL,
	"country" text,
	"state" text,
	"order" integer NOT NULL,
	"numberOfDays" integer NOT NULL,
	"startDate" timestamp with time zone,
	"endDate" timestamp with time zone,
	"lat" double precision,
	"lng" double precision,
	"customPreferences" jsonb,
	"transportToNext" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "TripDay" ADD COLUMN "tripDestinationId" uuid;--> statement-breakpoint
ALTER TABLE "Trip" ADD COLUMN "isMultiDestination" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "TripDestination" ADD CONSTRAINT "TripDestination_tripId_Trip_id_fk" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tripDest_tripId_idx" ON "TripDestination" USING btree ("tripId");--> statement-breakpoint
CREATE INDEX "tripDest_order_idx" ON "TripDestination" USING btree ("tripId","order");--> statement-breakpoint
ALTER TABLE "TripDay" ADD CONSTRAINT "TripDay_tripDestinationId_TripDestination_id_fk" FOREIGN KEY ("tripDestinationId") REFERENCES "public"."TripDestination"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tripDay_destId_idx" ON "TripDay" USING btree ("tripDestinationId");