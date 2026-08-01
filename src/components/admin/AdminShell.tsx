import type { ReactNode } from "react";
import { NavLink } from "@/components/NavLink";
import { SignOutButton } from "@/components/SignOutButton";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
import {
  HomeIcon,
  ChildIcon,
  UsersIcon,
  InvoiceIcon,
  NewsletterIcon,
  MegaphoneIcon,
  DiaryIcon,
  SparkleIcon,
  ReportIcon,
} from "@/components/icons";
import { initials } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon },
  { href: "/admin/children", label: "Children", icon: ChildIcon },
  { href: "/admin/people", label: "Parents & Staff", icon: UsersIcon },
  { href: "/admin/invoices", label: "Invoicing", icon: InvoiceIcon },
  { href: "/admin/newsletters", label: "Newsletters", icon: NewsletterIcon },
  { href: "/admin/announcements", label: "Announcements", icon: MegaphoneIcon },
  { href: "/admin/diary", label: "Daily Diary", icon: DiaryIcon },
  { href: "/admin/observations", label: "EYFS Observations", icon: SparkleIcon },
  { href: "/admin/reports", label: "EYFS Reports", icon: ReportIcon },
];

export function AdminShell({
  children,
  userName,
  userRole,
  nurseryName,
  impersonating,
}: {
  children: ReactNode;
  userName: string;
  userRole: string;
  nurseryName: string;
  impersonating?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {impersonating && <ImpersonationBanner nurseryName={nurseryName} />}
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
          <div className="flex items-center gap-2 px-5 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg">🌱</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">{nurseryName}</p>
              <p className="text-xs text-gray-500">Staff Portal</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-2">
            {NAV.map((item) => (
              <NavLink key={item.href} href={item.href} icon={<item.icon className="h-5 w-5" />}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 border-t border-gray-100 px-4 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-100 text-xs font-bold text-leaf-800">
              {initials(userName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs capitalize text-gray-500">{userRole.toLowerCase()}</p>
            </div>
          </div>
          <div className="px-3 pb-4">
            <SignOutButton />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">🌱</div>
              <p className="truncate text-sm font-bold text-gray-900">{nurseryName}</p>
            </div>
            <SignOutButton />
          </header>
          <nav className="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 md:hidden">
            {NAV.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
