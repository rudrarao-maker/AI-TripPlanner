import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims, userId } = await auth();

  // Basic check to ensure the user is logged in
  if (!userId) {
    redirect("/sign-in");
  }
  
  // Optional: check sessionClaims for role="admin" if configured in Clerk.
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") {
    // We log a warning for local testing, but rely on API wrapper for strict enforcement
    console.warn("Non-admin user tried to access /admin", userId);
  }

  return (
    <AdminLayoutShell>
      {children}
    </AdminLayoutShell>
  );
}
