"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function NavLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const pathname = usePathname();
  const active = href === "/admin" || href === "/parent" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-brand-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
