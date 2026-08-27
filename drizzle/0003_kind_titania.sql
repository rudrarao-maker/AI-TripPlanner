CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."expert_review_status" AS ENUM('none', 'pending', 'completed');--> statement-breakpoint
CREATE TYPE "public"."lock_status" AS ENUM('unlocked', 'locked');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('unread', 'read');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('free', 'pro', 'premium');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'owner', 'editor', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('inactive', 'active', 'past_due', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('planned', 'active', 'completed', 'archived');--> statement-breakpoint
ALTER TABLE "Activity" ALTER COLUMN "lockStatus" SET DEFAULT 'unlocked'::"public"."lock_status";--> statement-breakpoint
ALTER TABLE "Activity" ALTER COLUMN "lockStatus" SET DATA TYPE "public"."lock_status" USING "lockStatus"::"public"."lock_status";--> statement-breakpoint
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."booking_status";--> statement-breakpoint
ALTER TABLE "Booking" ALTER COLUMN "status" SET DATA TYPE "public"."booking_status" USING "status"::"public"."booking_status";--> statement-breakpoint
ALTER TABLE "Notification" ALTER COLUMN "status" SET DEFAULT 'unread'::"public"."notification_status";--> statement-breakpoint
ALTER TABLE "Notification" ALTER COLUMN "status" SET DATA TYPE "public"."notification_status" USING "status"::"public"."notification_status";--> statement-breakpoint
ALTER TABLE "Review" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."review_status";--> statement-breakpoint
ALTER TABLE "Review" ALTER COLUMN "status" SET DATA TYPE "public"."review_status" USING "status"::"public"."review_status";--> statement-breakpoint
ALTER TABLE "Trip" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "Trip" ALTER COLUMN "status" SET DEFAULT 'planned'::"public"."trip_status";--> statement-breakpoint
ALTER TABLE "Trip" ALTER COLUMN "status" SET DATA TYPE "public"."trip_status" USING "status"::"public"."trip_status";--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."role";--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "subscriptionStatus" SET DEFAULT 'inactive'::"public"."subscription_status";--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "subscriptionStatus" SET DATA TYPE "public"."subscription_status" USING "subscriptionStatus"::"public"."subscription_status";--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "planType" SET DEFAULT 'free'::"public"."plan_type";--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "planType" SET DATA TYPE "public"."plan_type" USING "planType"::"public"."plan_type";--> statement-breakpoint
ALTER TABLE "Activity" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Booking" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Destination" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Hotel" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "TripDay" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "TripDestination" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Trip" ADD COLUMN "isTemplate" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "Trip" ADD COLUMN "expertReviewRequested" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "Trip" ADD COLUMN "expertReviewStatus" "expert_review_status" DEFAULT 'none';--> statement-breakpoint
ALTER TABLE "Trip" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "preferencesProfile" jsonb;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;