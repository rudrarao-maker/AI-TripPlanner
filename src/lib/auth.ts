import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let userRecord;
  try {
    userRecord = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
  } catch (err: any) {
    console.error("CRITICAL DB ERROR IN AUTH:", err);
    console.error("DATABASE_URL exists?", !!process.env.DATABASE_URL);
    throw err;
  }

  // Fallback: If webhook missed the user (e.g. local dev without ngrok), insert them now
  if (!userRecord) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      const primaryEmail = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;
      
      if (primaryEmail) {
        const [newUser] = await db.insert(users).values({
          clerkId: clerkUser.id,
          email: primaryEmail,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown User',
          avatar: clerkUser.imageUrl,
          role: "admin", // Auto-make admin for dev fallback
        })
        .onConflictDoUpdate({
          target: users.email,
          set: { clerkId: clerkUser.id }
        })
        .returning();
        userRecord = newUser;
      }
    } catch (e) {
      console.error("Failed to sync missing user from Clerk:", e);
    }
  }

  if (!userRecord || userRecord.role !== "admin") {
    // Redirect non-admin users to dashboard
    redirect("/dashboard");
  }

  return userRecord;
}
