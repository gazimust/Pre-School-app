import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export default async function MasterNurseriesPage() {
  const nurseries = await prisma.nursery.findMany({
    include: { _count: { select: { children: true, users: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nurseries</h1>
          <p className="text-sm text-gray-500">{nurseries.length} nursery account(s)</p>
        </div>
        <LinkButton href="/master/nurseries/new">+ Add nursery</LinkButton>
      </div>

      <Card>
        {nurseries.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No nurseries yet" description="Add the first nursery account to get started." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Nursery</th>
                  <th className="px-5 py-3">Children</th>
                  <th className="px-5 py-3">People</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {nurseries.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link href={`/master/nurseries/${n.id}`} className="font-medium text-brand-600 hover:underline">
                        {n.name}
                      </Link>
                      <p className="text-xs text-gray-500">{n.slug}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{n._count.children}</td>
                    <td className="px-5 py-3 text-gray-600">{n._count.users}</td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(n.createdAt)}</td>
                    <td className="px-5 py-3">
                      <Badge color={n.status === "ACTIVE" ? "green" : "red"}>{n.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
