import { prisma } from "@/lib/prisma";
import { getSession, nurseryIdOrThrow } from "@/lib/session";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function PeoplePage() {
  const session = await getSession();
  const nurseryId = nurseryIdOrThrow(session!);

  const users = await prisma.user.findMany({
    where: { nurseryId },
    include: { children: { include: { child: true } } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  const roleColor: Record<string, "brand" | "blue" | "leaf"> = {
    ADMIN: "brand",
    STAFF: "blue",
    PARENT: "leaf",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Parents &amp; Staff</h1>
          <p className="text-sm text-gray-500">{users.length} people with portal access</p>
        </div>
        <LinkButton href="/admin/people/new">+ Add person</LinkButton>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Children</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-5 py-3">
                    <Badge color={roleColor[u.role]}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3 text-gray-600">{u.phone || "—"}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {u.children.map((c) => `${c.child.firstName} ${c.child.lastName}`).join(", ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <CardBody>No people yet.</CardBody>}
      </Card>
    </div>
  );
}
