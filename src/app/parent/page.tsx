import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession, nurseryIdOrThrow } from "@/lib/session";
import { getParentChildIds, getParentChildren } from "@/lib/parent";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ageLabel, formatCurrency, formatDate, invoiceTotal } from "@/lib/utils";

export default async function ParentHomePage() {
  const session = await getSession();
  const nurseryId = nurseryIdOrThrow(session!);
  const children = await getParentChildren(session!.user.id);
  const childIds = await getParentChildIds(session!.user.id);

  const [invoices, announcements, latestObservations] = await Promise.all([
    prisma.invoice.findMany({
      where: { OR: [{ parentId: session!.user.id }, { childId: { in: childIds } }], status: { in: ["SENT", "OVERDUE"] } },
      include: { lineItems: true, child: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.announcement.findMany({
      where: { nurseryId, publishedAt: { not: null }, OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
      orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
      take: 3,
    }),
    prisma.observation.findMany({
      where: { childId: { in: childIds } },
      include: { child: true, areas: { include: { eyfsArea: true } } },
      orderBy: { date: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Welcome back, {session!.user.name.split(" ")[0]}</h1>
        <p className="text-sm text-gray-500">{formatDate(new Date(), "EEEE d MMMM yyyy")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {children.map((child) => (
          <Card key={child.id} className="p-5">
            <p className="font-semibold text-gray-900">
              {child.firstName} {child.lastName}
            </p>
            <p className="text-sm text-gray-500">
              {child.room} · {ageLabel(child.dateOfBirth)}
            </p>
          </Card>
        ))}
        {children.length === 0 && (
          <Card className="p-5 sm:col-span-2">
            <EmptyState title="No children linked to your account yet" description="Contact the nursery office to link your child." />
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Outstanding invoices"
            action={
              <Link href="/parent/invoices" className="text-sm font-medium text-brand-600 hover:underline">
                View all
              </Link>
            }
          />
          <CardBody>
            {invoices.length === 0 ? (
              <p className="text-sm text-gray-500">You&rsquo;re all caught up — no outstanding invoices.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <Link href={`/parent/invoices/${inv.id}`} className="font-medium text-brand-600 hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {inv.child.firstName} · Due {formatDate(inv.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{formatCurrency(invoiceTotal(inv.lineItems))}</span>
                      <Badge color={inv.status === "OVERDUE" ? "red" : "blue"}>{inv.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Announcements"
            action={
              <Link href="/parent/announcements" className="text-sm font-medium text-brand-600 hover:underline">
                View all
              </Link>
            }
          />
          <CardBody>
            {announcements.length === 0 ? (
              <p className="text-sm text-gray-500">No current announcements.</p>
            ) : (
              <ul className="space-y-3">
                {announcements.map((a) => (
                  <li key={a.id} className="text-sm">
                    <p className="font-medium text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(a.publishedAt!)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Latest learning moments"
          action={
            <Link href="/parent/learning" className="text-sm font-medium text-brand-600 hover:underline">
              View learning journey
            </Link>
          }
        />
        <CardBody>
          {latestObservations.length === 0 ? (
            <p className="text-sm text-gray-500">No observations recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {latestObservations.map((o) => (
                <li key={o.id} className="text-sm">
                  <p className="font-medium text-gray-900">{o.title}</p>
                  <p className="text-xs text-gray-500">
                    {o.child.firstName} · {formatDate(o.date)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
