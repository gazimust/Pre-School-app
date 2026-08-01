import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { BuildingIcon, ChildIcon } from "@/components/icons";
import { formatDate } from "@/lib/utils";

export default async function MasterDashboardPage() {
  const [nurseries, totalChildren, totalUsers] = await Promise.all([
    prisma.nursery.findMany({
      include: { _count: { select: { children: true, users: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.child.count(),
    prisma.user.count({ where: { role: { not: "PLATFORM_ADMIN" } } }),
  ]);

  const activeCount = nurseries.filter((n) => n.status === "ACTIVE").length;
  const suspendedCount = nurseries.filter((n) => n.status === "SUSPENDED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="text-sm text-gray-500">Overview across all nursery accounts</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Nurseries" value={nurseries.length} icon={<BuildingIcon className="h-5 w-5" />} tone="brand" />
        <StatCard label="Active" value={activeCount} icon={<BuildingIcon className="h-5 w-5" />} tone="leaf" />
        <StatCard label="Suspended" value={suspendedCount} icon={<BuildingIcon className="h-5 w-5" />} tone="red" />
        <StatCard
          label="Children / people"
          value={`${totalChildren} / ${totalUsers}`}
          icon={<ChildIcon className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <Card>
        <CardHeader
          title="Nurseries"
          action={
            <Link href="/master/nurseries/new" className="text-sm font-medium text-brand-600 hover:underline">
              + Add nursery
            </Link>
          }
        />
        <CardBody>
          {nurseries.length === 0 ? (
            <EmptyState title="No nurseries yet" description="Add the first nursery account to get started." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {nurseries.slice(0, 8).map((n) => (
                <li key={n.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link href={`/master/nurseries/${n.id}`} className="font-medium text-brand-600 hover:underline">
                      {n.name}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {n._count.children} children · {n._count.users} people · created {formatDate(n.createdAt)}
                    </p>
                  </div>
                  <Badge color={n.status === "ACTIVE" ? "green" : "red"}>{n.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
