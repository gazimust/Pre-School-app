import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ageLabel, formatDate } from "@/lib/utils";

export default async function ChildrenPage() {
  const children = await prisma.child.findMany({
    include: { parents: { include: { parent: true } } },
    orderBy: [{ active: "desc" }, { firstName: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Children</h1>
          <p className="text-sm text-gray-500">{children.length} children on roll</p>
        </div>
        <LinkButton href="/admin/children/new">+ Add child</LinkButton>
      </div>

      <Card>
        {children.length === 0 ? (
          <CardBody>
            <EmptyState title="No children yet" description="Add your first child to get started." />
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Room</th>
                  <th className="px-5 py-3">Age</th>
                  <th className="px-5 py-3">Parents</th>
                  <th className="px-5 py-3">Started</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {children.map((child) => (
                  <tr key={child.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/children/${child.id}`} className="font-medium text-brand-600 hover:underline">
                        {child.firstName} {child.lastName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{child.room}</td>
                    <td className="px-5 py-3 text-gray-600">{ageLabel(child.dateOfBirth)}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {child.parents.map((p) => p.parent.name).join(", ") || "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(child.startDate)}</td>
                    <td className="px-5 py-3">
                      <Badge color={child.active ? "green" : "gray"}>{child.active ? "Active" : "Inactive"}</Badge>
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
