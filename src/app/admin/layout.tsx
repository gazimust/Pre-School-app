import { requireStaff } from "@/lib/session";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();

  return (
    <AdminShell userName={session.user.name} userRole={session.user.role}>
      {children}
    </AdminShell>
  );
}
