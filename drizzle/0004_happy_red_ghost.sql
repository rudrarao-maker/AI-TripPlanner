DROP INDEX "tripDayId_idx";--> statement-breakpoint
DROP INDEX "tripDest_tripId_idx";--> statement-breakpoint
DROP INDEX "userId_idx";--> statement-breakpoint
DROP INDEX "isPublic_idx";--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "tripCredits" integer DEFAULT 3;--> statement-breakpoint
CREATE INDEX "activity_placeId_idx" ON "Activity" USING btree ("placeId");--> statement-breakpoint
CREATE INDEX "activity_category_idx" ON "Activity" USING btree ("category");--> statement-breakpoint
CREATE INDEX "embeddingIndex" ON "KnowledgeBase" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "place_dest_idx" ON "Place" USING btree ("destination");--> statement-breakpoint
CREATE INDEX "place_category_idx" ON "Place" USING btree ("category");--> statement-breakpoint
CREATE INDEX "trip_destination_idx" ON "Trip" USING btree ("destination");--> statement-breakpoint
CREATE INDEX "tripDayId_idx" ON "Activity" USING btree ("tripDayId") WHERE "Activity"."deletedAt" IS NULL;--> statement-breakpoint
CREATE INDEX "tripDest_tripId_idx" ON "TripDestination" USING btree ("tripId") WHERE "TripDestination"."deletedAt" IS NULL;--> statement-breakpoint
CREATE INDEX "userId_idx" ON "Trip" USING btree ("userId") WHERE "Trip"."deletedAt" IS NULL;--> statement-breakpoint
CREATE INDEX "isPublic_idx" ON "Trip" USING btree ("isPublic") WHERE "Trip"."deletedAt" IS NULL;