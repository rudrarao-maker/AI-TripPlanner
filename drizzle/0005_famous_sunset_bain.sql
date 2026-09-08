CREATE TYPE "public"."partner_status" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TABLE "Partner" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"companyName" text NOT NULL,
	"type" text NOT NULL,
	"contactEmail" text NOT NULL,
	"status" "partner_status" DEFAULT 'pending',
	"details" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "partner_userId_idx" ON "Partner" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "partner_status_idx" ON "Partner" USING btree ("status");