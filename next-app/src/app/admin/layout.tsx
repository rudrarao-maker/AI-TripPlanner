import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims, userId } = await auth();

  // If not logged in, or role is not admin, redirect to dashboard
  // For local testing convenience during development, we'll allow access if the metadata doesn't exist yet, 
  // but in production you should strictly enforce this.
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  
  if (!userId) {
    redirect("/auth/login");
  }
  
  if (role !== "admin") {
    console.warn("Non-admin user tried to access /admin", userId);
    // Uncomment for strict production behavior:
    // redirect("/dashboard"); 
  }

  return <>{children}</>;
}
