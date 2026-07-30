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
