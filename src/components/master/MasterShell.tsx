import type { ReactNode } from "react";
import { NavLink } from "@/components/NavLink";
import { SignOutButton } from "@/components/SignOutButton";
import { HomeIcon, BuildingIcon } from "@/components/icons";
import { initials } from "@/lib/utils";

const NAV = [
  { href: "/master", label: "Dashboard", icon: HomeIcon },
  { href: "/master/nurseries", label: "Nurseries", icon: BuildingIcon },
];

export function MasterShell({ children, userName }: { children: ReactNode; userName: string }) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-800 bg-gray-900 md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-lg">🧭</div>
          <div>
            <p className="text-sm font-bold text-white">Platform Admin</p>
            <p className="text-xs text-gray-400">Nursery accounts</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href} icon={<item.icon className="h-5 w-5" />}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3 border-t border-gray-800 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-900 text-xs font-bold text-indigo-200">
            {initials(userName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{userName}</p>
            <p className="text-xs text-gray-400">Platform admin</p>
          </div>
        </div>
        <div className="px-3 pb-4">
          <SignOutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">🧭</div>
            <p className="text-sm font-bold text-white">Platform Admin</p>
          </div>
          <SignOutButton />
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-gray-800 bg-gray-900 px-3 py-2 md:hidden">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 bg-gray-50 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
