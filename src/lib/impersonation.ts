import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days, matches NextAuth's default JWT session length

function isSecureCookie() {
  return process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
}

export function sessionCookieName() {
  return isSecureCookie() ? "__Secure-next-auth.session-token" : "next-auth.session-token";
}

/**
 * Mints a fresh NextAuth session cookie for the given user, bypassing the credentials
 * login flow. Used only by the platform-admin impersonation routes.
 */
export async function setSessionCookieFor(payload: {
  id: string;
  role: Role;
  nurseryId: string | null;
  name: string;
  email: string;
  impersonatorId?: string | null;
}) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not configured.");

  const token = await encode({
    token: {
      sub: payload.id,
      id: payload.id,
      role: payload.role,
      nurseryId: payload.nurseryId,
      impersonatorId: payload.impersonatorId ?? null,
      name: payload.name,
      email: payload.email,
    },
    secret,
    maxAge: MAX_AGE_SECONDS,
  });

  cookies().set(sessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}
