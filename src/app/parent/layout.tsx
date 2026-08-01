import { requireParent, nurseryIdOrThrow } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ParentShell } from "@/components/parent/ParentShell";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireParent();
  const nurseryId = nurseryIdOrThrow(session);

  const nursery = await prisma.nursery.findUnique({ where: { id: nurseryId } });

  return (
    <ParentShell userName={session.user.name} nurseryName={nursery?.name ?? "Nursery"}>
      {children}
    </ParentShell>
  );
}
