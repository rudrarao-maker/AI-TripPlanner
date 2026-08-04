-- Trip Planner Supabase Initial Schema

CREATE TABLE "User" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "clerkId" TEXT UNIQUE,
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "avatar" TEXT,
  "role" TEXT DEFAULT 'user',
  "provider" TEXT DEFAULT 'clerk',
  "verified" BOOLEAN DEFAULT true,
  "status" TEXT DEFAULT 'active',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE "Trip" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES "User"("id") ON DELETE CASCADE NOT NULL,
  "title" TEXT NOT NULL,
  "origin" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "travelers" INTEGER DEFAULT 1,
  "budget" NUMERIC(12, 2) NOT NULL,
  "currency" TEXT DEFAULT 'INR',
  "travelStyle" TEXT NOT NULL,
  "transportPreference" TEXT NOT NULL,
  "hotelCategory" TEXT NOT NULL,
  "foodPreference" TEXT NOT NULL,
  "status" TEXT DEFAULT 'planned',
  "coverImage" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE "TripDay" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tripId" UUID REFERENCES "Trip"("id") ON DELETE CASCADE NOT NULL,
  "dayNumber" INTEGER NOT NULL,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE "Activity" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tripDayId" UUID REFERENCES "TripDay"("id") ON DELETE CASCADE NOT NULL,
  "time" TEXT,
  "name" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "description" TEXT,
  "duration" INTEGER,
  "estimatedCost" NUMERIC(10, 2) DEFAULT 0,
  "currency" TEXT DEFAULT 'INR',
  "category" TEXT NOT NULL,
  "imageUrl" TEXT,
  "lat" DOUBLE PRECISION,
  "lng" DOUBLE PRECISION,
  "rating" DOUBLE PRECISION,
  "isHiddenGem" BOOLEAN DEFAULT false,
  "localTip" TEXT,
  "bestTimeToVisit" TEXT,
  "orderIndex" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) policies
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Trip" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TripDay" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Activity" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own data
CREATE POLICY "Users can view their own data" ON "User" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON "User" FOR UPDATE USING (auth.uid() = id);

-- Trips policies
CREATE POLICY "Users can view their own trips" ON "Trip" FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Users can create their own trips" ON "Trip" FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Users can update their own trips" ON "Trip" FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "Users can delete their own trips" ON "Trip" FOR DELETE USING (auth.uid() = "userId");

-- TripDay policies
CREATE POLICY "Users can view days of their trips" ON "TripDay" FOR SELECT USING (EXISTS (SELECT 1 FROM "Trip" WHERE id = "TripDay"."tripId" AND "userId" = auth.uid()));
CREATE POLICY "Users can create days for their trips" ON "TripDay" FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM "Trip" WHERE id = "TripDay"."tripId" AND "userId" = auth.uid()));

-- Activity policies
CREATE POLICY "Users can view activities of their trips" ON "Activity" FOR SELECT USING (EXISTS (SELECT 1 FROM "TripDay" td JOIN "Trip" t ON td."tripId" = t.id WHERE td.id = "Activity"."tripDayId" AND t."userId" = auth.uid()));
