import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession, nurseryIdOrThrow } from "@/lib/session";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChildIcon, InvoiceIcon, SparkleIcon, MegaphoneIcon } from "@/components/icons";
import { formatCurrency, formatDate, invoiceTotal, ageLabel } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await getSession();
  const nurseryId = nurseryIdOrThrow(session!);

  const [activeChildren, invoices, announcements, observations, newsletters] = await Promise.all([
    prisma.child.findMany({ where: { nurseryId, active: true } }),
    prisma.invoice.findMany({ where: { nurseryId }, include: { lineItems: true, child: true }, orderBy: { dueDate: "asc" } }),
    prisma.announcement.count({ where: { nurseryId, publishedAt: { not: null } } }),
    prisma.observation.findMany({
      where: { nurseryId },
      include: { child: true, areas: { include: { eyfsArea: true } } },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.newsletter.count({ where: { nurseryId, publishedAt: { not: null } } }),
  ]);

  const outstanding = invoices.filter((i) => i.status === "SENT" || i.status === "OVERDUE");
  const overdue = invoices.filter((i) => i.status === "OVERDUE");
  const outstandingTotal = outstanding.reduce((sum, inv) => sum + invoiceTotal(inv.lineItems), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your nursery today, {formatDate(new Date(), "EEEE d MMMM")}.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active children"
          value={activeChildren.length}
          icon={<ChildIcon className="h-5 w-5" />}
          tone="leaf"
        />
        <StatCard
          label="Outstanding invoices"
          value={formatCurrency(outstandingTotal)}
          hint={`${outstanding.length} unpaid invoice(s)`}
          icon={<InvoiceIcon className="h-5 w-5" />}
          tone="brand"
        />
        <StatCard
          label="Overdue invoices"
          value={overdue.length}
          icon={<InvoiceIcon className="h-5 w-5" />}
          tone="red"
        />
        <StatCard
          label="Published announcements"
          value={announcements}
          hint={`${newsletters} newsletter(s) published`}
          icon={<MegaphoneIcon className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent EYFS observations"
            description="Latest learning moments recorded by staff"
            action={
              <Link href="/admin/observations" className="text-sm font-medium text-brand-600 hover:underline">
                View all
              </Link>
            }
          />
          <CardBody>
            {observations.length === 0 ? (
              <EmptyState title="No observations yet" description="Recorded observations will appear here." />
            ) : (
              <ul className="space-y-4">
                {observations.map((obs) => (
                  <li key={obs.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{obs.title}</p>
                      <p className="text-xs text-gray-500">
                        {obs.child.firstName} {obs.child.lastName} · {formatDate(obs.date)}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {obs.areas.map((a) => (
                          <Badge key={a.id} color="leaf">
                            {a.eyfsArea.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Children"
            description="Currently enrolled"
            action={
              <Link href="/admin/children" className="text-sm font-medium text-brand-600 hover:underline">
                Manage
              </Link>
            }
          />
          <CardBody>
            {activeChildren.length === 0 ? (
              <EmptyState title="No children enrolled yet" />
            ) : (
              <ul className="divide-y divide-gray-100">
                {activeChildren.slice(0, 6).map((child) => (
                  <li key={child.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {child.firstName} {child.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {child.room} · {ageLabel(child.dateOfBirth)}
                      </p>
                    </div>
                    <Link href={`/admin/children/${child.id}`} className="text-xs font-medium text-brand-600 hover:underline">
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
