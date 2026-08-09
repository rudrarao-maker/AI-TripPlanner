import { requireAdmin } from "@/lib/auth";
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // strict RBAC enforcement via our database schema
  await requireAdmin();

  return (
    <AdminLayoutShell>
      {children}
    </AdminLayoutShell>
  );
}
