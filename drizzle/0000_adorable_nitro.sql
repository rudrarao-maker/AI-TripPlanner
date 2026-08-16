CREATE TABLE "Activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tripDayId" uuid NOT NULL,
	"time" text,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"description" text,
	"duration" integer,
	"estimatedCost" numeric(10, 2) DEFAULT '0',
	"currency" text DEFAULT 'INR',
	"category" text NOT NULL,
	"imageUrl" text,
	"travelTime" text,
	"lockStatus" text DEFAULT 'unlocked',
	"lat" double precision,
	"lng" double precision,
	"rating" double precision,
	"isHiddenGem" boolean DEFAULT false,
	"localTip" text,
	"bestTimeToVisit" text,
	"orderIndex" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AISetting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "AISetting_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "AuditLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"adminId" uuid,
	"action" text NOT NULL,
	"targetType" text NOT NULL,
	"targetId" text,
	"details" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tripId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending',
	"provider" text,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'INR',
	"referenceId" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tripId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"activityId" uuid,
	"content" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Destination" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"state" text,
	"city" text,
	"description" text,
	"heroImage" text,
	"gallery" text[],
	"bestTime" text,
	"status" text DEFAULT 'active',
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Expense" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tripId" uuid NOT NULL,
	"userId" uuid,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'INR',
	"category" text NOT NULL,
	"description" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Hotel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destinationId" uuid,
	"name" text NOT NULL,
	"images" text[],
	"rating" numeric(2, 1),
	"price" numeric(12, 2),
	"address" text,
	"website" text,
	"amenities" text[],
	"bookingLink" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "KnowledgeBase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(768),
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'unread',
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"bookingId" uuid,
	"stripeTransactionId" text,
	"amount" numeric(12, 2) NOT NULL,
	"status" text DEFAULT 'succeeded',
	"receiptUrl" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"tripId" uuid,
	"rating" integer NOT NULL,
	"content" text,
	"status" text DEFAULT 'pending',
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SavedPlace" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tripId" uuid NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"lat" double precision,
	"lng" double precision,
	"placeId" text,
	"category" text,
	"notes" text,
	"openingHours" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TripCollaborator" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tripId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" text DEFAULT 'editor',
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TripDay" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tripId" uuid NOT NULL,
	"dayNumber" integer NOT NULL,
	"date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Trip" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"startDate" timestamp with time zone NOT NULL,
	"endDate" timestamp with time zone NOT NULL,
	"travelers" integer DEFAULT 1,
	"budget" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'INR',
	"travelStyle" text NOT NULL,
	"transportPreference" text NOT NULL,
	"hotelCategory" text NOT NULL,
	"foodPreference" text NOT NULL,
	"status" text DEFAULT 'planned',
	"coverImage" text,
	"isPublic" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerkId" text,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"avatar" text,
	"role" text DEFAULT 'user',
	"provider" text DEFAULT 'clerk',
	"verified" boolean DEFAULT true,
	"status" text DEFAULT 'active',
	"stripeCustomerId" text,
	"stripeSubscriptionId" text,
	"subscriptionStatus" text DEFAULT 'inactive',
	"planType" text DEFAULT 'free',
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "User_clerkId_unique" UNIQUE("clerkId"),
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_tripDayId_TripDay_id_fk" FOREIGN KEY ("tripDayId") REFERENCES "public"."TripDay"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_User_id_fk" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tripId_Trip_id_fk" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_tripId_Trip_id_fk" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_activityId_Activity_id_fk" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_tripId_Trip_id_fk" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_destinationId_Destination_id_fk" FOREIGN KEY ("destinationId") REFERENCES "public"."Destination"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_Booking_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_tripId_Trip_id_fk" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SavedPlace" ADD CONSTRAINT "SavedPlace_tripId_Trip_id_fk" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TripCollaborator" ADD CONSTRAINT "TripCollaborator_tripId_Trip_id_fk" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TripCollaborator" ADD CONSTRAINT "TripCollaborator_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TripDay" ADD CONSTRAINT "TripDay_tripId_Trip_id_fk" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tripDayId_idx" ON "Activity" USING btree ("tripDayId");--> statement-breakpoint
CREATE INDEX "audit_adminId_idx" ON "AuditLog" USING btree ("adminId");--> statement-breakpoint
CREATE INDEX "audit_createdAt_idx" ON "AuditLog" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "booking_userId_idx" ON "Booking" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "booking_tripId_idx" ON "Booking" USING btree ("tripId");--> statement-breakpoint
CREATE INDEX "booking_status_idx" ON "Booking" USING btree ("status");--> statement-breakpoint
CREATE INDEX "comment_tripId_idx" ON "Comment" USING btree ("tripId");--> statement-breakpoint
CREATE INDEX "dest_country_idx" ON "Destination" USING btree ("country");--> statement-breakpoint
CREATE INDEX "dest_status_idx" ON "Destination" USING btree ("status");--> statement-breakpoint
CREATE INDEX "expense_tripId_idx" ON "Expense" USING btree ("tripId");--> statement-breakpoint
CREATE INDEX "hotel_destId_idx" ON "Hotel" USING btree ("destinationId");--> statement-breakpoint
CREATE INDEX "notif_userId_idx" ON "Notification" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "notif_status_idx" ON "Notification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_userId_idx" ON "Payment" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "payment_bookingId_idx" ON "Payment" USING btree ("bookingId");--> statement-breakpoint
CREATE INDEX "payment_status_idx" ON "Payment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "review_userId_idx" ON "Review" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "review_tripId_idx" ON "Review" USING btree ("tripId");--> statement-breakpoint
CREATE INDEX "review_status_idx" ON "Review" USING btree ("status");--> statement-breakpoint
CREATE INDEX "place_tripId_idx" ON "SavedPlace" USING btree ("tripId");--> statement-breakpoint
CREATE INDEX "collab_tripId_idx" ON "TripCollaborator" USING btree ("tripId");--> statement-breakpoint
CREATE INDEX "collab_userId_idx" ON "TripCollaborator" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "tripId_idx" ON "TripDay" USING btree ("tripId");--> statement-breakpoint
CREATE INDEX "userId_idx" ON "Trip" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "isPublic_idx" ON "Trip" USING btree ("isPublic");