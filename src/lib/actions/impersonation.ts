"use server";

import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin, getSession } from "@/lib/session";
import { setSessionCookieFor } from "@/lib/impersonation";

/**
 * Returns the URL the client should hard-navigate to. A plain `redirect()` here would be a
 * soft, client-router-driven navigation, which can race with queued Link-prefetch requests
 * from the page we're leaving and end up applying a stale cookie. Forcing a real
 * `window.location` navigation (done by the calling client component) avoids that entirely.
 */
export async function impersonateNursery(nurseryId: string): Promise<string> {
  const session = await requirePlatformAdmin();

  const admin = await prisma.user.findFirst({
    where: { nurseryId, role: Role.ADMIN },
    orderBy: { createdAt: "asc" },
  });
  if (!admin) throw new Error("This nursery has no admin user to log in as.");

  await setSessionCookieFor({
    id: admin.id,
    role: admin.role,
    nurseryId: admin.nurseryId,
    name: admin.name,
    email: admin.email,
    impersonatorId: session.user.id,
  });

  return "/admin";
}

export async function stopImpersonating(): Promise<string> {
  const session = await getSession();
  const impersonatorId = session?.user.impersonatorId;
  if (!impersonatorId) return "/admin";

  const platformAdmin = await prisma.user.findUnique({ where: { id: impersonatorId } });
  if (!platformAdmin || platformAdmin.role !== Role.PLATFORM_ADMIN) return "/admin";

  await setSessionCookieFor({
    id: platformAdmin.id,
    role: platformAdmin.role,
    nurseryId: platformAdmin.nurseryId,
    name: platformAdmin.name,
    email: platformAdmin.email,
    impersonatorId: null,
  });

  return "/master";
}
