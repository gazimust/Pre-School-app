import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

function homeFor(role: string | undefined) {
  if (role === "PLATFORM_ADMIN") return "/master";
  if (role === "PARENT") return "/parent";
  return "/admin";
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role;

    const inRightArea =
      (path.startsWith("/admin") && (role === "ADMIN" || role === "STAFF")) ||
      (path.startsWith("/parent") && role === "PARENT") ||
      (path.startsWith("/master") && role === "PLATFORM_ADMIN");

    if (!inRightArea) {
      return NextResponse.redirect(new URL(homeFor(role), req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/parent/:path*", "/master/:path*"],
};
