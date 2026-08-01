import { requireStaff, nurseryIdOrThrow } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  const nurseryId = nurseryIdOrThrow(session);

  const nursery = await prisma.nursery.findUnique({ where: { id: nurseryId } });

  return (
    <AdminShell
      userName={session.user.name}
      userRole={session.user.role}
      nurseryName={nursery?.name ?? "Nursery"}
      impersonating={!!session.user.impersonatorId}
    >
      {children}
    </AdminShell>
  );
}
