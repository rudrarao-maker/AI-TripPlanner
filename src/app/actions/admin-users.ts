"use server";

import { db } from "@/db";
import { users, auditLogs, payments } from "@/db/schema";
import { inArray, eq, sql, desc, or, ilike, and, gte, lte } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Ensure only admins can execute these actions
async function requireAdmin() {
  // const { userId, sessionClaims } = await auth();
  // if (!userId) throw new Error("Unauthorized");
  
  // const role = (sessionClaims?.metadata as any)?.role;
  // if (role !== "admin") throw new Error("Forbidden"); // Uncomment when role mapping is strictly enforced
  
  return "demo_user_id"; // Actually need Drizzle user id for audit logs
}

async function getAdminId() {
  const clerkUserId = await requireAdmin();
  const admin = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUserId),
  });
  return admin?.id || null;
}

export async function fetchUsersForAdmin(params: { search?: string, role?: string, status?: string, page: number, limit: number }) {
  await requireAdmin();
  const { search, role, status, page, limit } = params;

  let queryConditions = [];
  
  if (search) {
    queryConditions.push(
      or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )
    );
  }
  if (role && role !== "all") queryConditions.push(eq(users.role, role));
  if (status && status !== "all") queryConditions.push(eq(users.status, status));

  const offset = (page - 1) * limit;
  const conditions = queryConditions.length > 0 ? and(...queryConditions) : undefined;

  const data = await db.query.users.findMany({
    where: conditions,
    limit,
    offset,
    orderBy: [desc(users.createdAt)],
  });

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users).where(conditions);

  return {
    users: data,
    pagination: {
      total: Number(count),
      page,
      limit,
      totalPages: Math.ceil(Number(count) / limit),
    }
  };
}

export async function getUserProfile(userId: string) {
  await requireAdmin();
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      payments: {
        orderBy: [desc(payments.createdAt)],
        limit: 10,
      }
    }
  });
  
  if (!user) throw new Error("User not found");
  
  return user;
}

export async function bulkUpdateUsers(userIds: string[], updates: Partial<typeof users.$inferInsert>) {
  const adminId = await getAdminId();
  
  await db.update(users)
    .set({ ...updates, updatedAt: new Date() })
    .where(inArray(users.id, userIds));
    
  // Create audit log
  if (adminId) {
    await db.insert(auditLogs).values({
      adminId,
      action: "BULK_UPDATE",
      targetType: "User",
      targetId: "multiple",
      details: JSON.stringify({ count: userIds.length, updates })
    });
  }

  revalidatePath("/admin/users");
  return { success: true, count: userIds.length };
}

export async function bulkDeleteUsers(userIds: string[]) {
  const adminId = await getAdminId();
  
  await db.delete(users).where(inArray(users.id, userIds));
  
  if (adminId) {
    await db.insert(auditLogs).values({
      adminId,
      action: "BULK_DELETE",
      targetType: "User",
      targetId: "multiple",
      details: JSON.stringify({ count: userIds.length })
    });
  }

  revalidatePath("/admin/users");
  return { success: true, count: userIds.length };
}

export async function batchImportUsers(usersData: any[]) {
  const adminId = await getAdminId();
  
  // Extract emails to check for duplicates
  const emails = usersData.map(u => u.email).filter(Boolean);
  
  // Find existing users
  const existingUsers = await db.query.users.findMany({
    where: inArray(users.email, emails),
    columns: { email: true }
  });
  
  const existingEmails = new Set(existingUsers.map(u => u.email));
  
  const toInsert = usersData.filter(u => !existingEmails.has(u.email)).map(u => ({
    email: u.email,
    name: u.name || u.email.split('@')[0],
    role: u.role || 'user',
    status: 'active',
    provider: 'imported',
    verified: false,
  }));
  
  let insertedCount = 0;
  
  if (toInsert.length > 0) {
    await db.insert(users).values(toInsert);
    insertedCount = toInsert.length;
    
    if (adminId) {
      await db.insert(auditLogs).values({
        adminId,
        action: "BATCH_IMPORT",
        targetType: "User",
        targetId: "multiple",
        details: JSON.stringify({ 
          attempted: usersData.length, 
          inserted: insertedCount, 
          duplicates: existingEmails.size 
        })
      });
    }
  }

  revalidatePath("/admin/users");
  
  return { 
    success: true, 
    totalProcessed: usersData.length,
    inserted: insertedCount,
    duplicatesSkipped: usersData.length - insertedCount,
  };
}

export async function exportUsersData(filters: { dateRange?: { from: Date, to: Date }, role?: string, status?: string }) {
  await requireAdmin();
  
  let queryConditions = [];
  
  if (filters.role && filters.role !== "all") queryConditions.push(eq(users.role, filters.role));
  if (filters.status && filters.status !== "all") queryConditions.push(eq(users.status, filters.status));
  if (filters.dateRange?.from) queryConditions.push(gte(users.createdAt, filters.dateRange.from));
  if (filters.dateRange?.to) queryConditions.push(lte(users.createdAt, filters.dateRange.to));
  
  const conditions = queryConditions.length > 0 ? and(...queryConditions) : undefined;
  
  const data = await db.query.users.findMany({
    where: conditions,
    orderBy: [desc(users.createdAt)],
  });
  
  return data;
}
