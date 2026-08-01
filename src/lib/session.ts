import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Role } from "@prisma/client";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireRole(...roles: Role[]) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  if (!roles.includes(session.user.role)) {
    redirect("/");
  }
  return session;
}

export async function requireStaff() {
  return requireRole("ADMIN", "STAFF");
}

export async function requireParent() {
  return requireRole("PARENT");
}

export async function requirePlatformAdmin() {
  return requireRole("PLATFORM_ADMIN");
}

/**
 * ADMIN/STAFF/PARENT users always have a nurseryId (only PLATFORM_ADMIN does not);
 * this narrows the type and fails loudly if that invariant is ever broken.
 */
export function nurseryIdOrThrow(session: { user: { nurseryId: string | null } }): string {
  if (!session.user.nurseryId) {
    throw new Error("Expected an authenticated nursery user, but session has no nurseryId.");
  }
  return session.user.nurseryId;
}
