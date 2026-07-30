import type { ReactNode } from "react";
import { NavLink } from "@/components/NavLink";
import { SignOutButton } from "@/components/SignOutButton";
import {
  HomeIcon,
  InvoiceIcon,
  NewsletterIcon,
  MegaphoneIcon,
  DiaryIcon,
  SparkleIcon,
} from "@/components/icons";
import { initials } from "@/lib/utils";

const NAV = [
  { href: "/parent", label: "Home", icon: HomeIcon },
  { href: "/parent/invoices", label: "Invoices", icon: InvoiceIcon },
  { href: "/parent/newsletters", label: "Newsletters", icon: NewsletterIcon },
  { href: "/parent/announcements", label: "Announcements", icon: MegaphoneIcon },
  { href: "/parent/diary", label: "Daily Diary", icon: DiaryIcon },
  { href: "/parent/learning", label: "Learning Journey", icon: SparkleIcon },
];

export function ParentShell({
  children,
  userName,
}: {
  children: ReactNode;
  userName: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg">🌱</div>
            <div>
              <p className="text-sm font-bold text-gray-900">Little Sprouts Nursery</p>
              <p className="text-xs text-gray-500">Parent Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf-100 text-xs font-bold text-leaf-800">
                {initials(userName)}
              </div>
              <p className="text-sm font-medium text-gray-900">{userName}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href} icon={<item.icon className="h-4 w-4" />}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
