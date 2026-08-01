import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { setNurseryStatus } from "@/lib/actions/master";
import { ImpersonateButton } from "@/components/master/ImpersonateButton";
import { NurseryStatus, Role } from "@prisma/client";

export default async function NurseryDetailPage({ params }: { params: { id: string } }) {
  const nursery = await prisma.nursery.findUnique({
    where: { id: params.id },
    include: {
      users: { orderBy: [{ role: "asc" }, { name: "asc" }] },
      _count: { select: { children: true } },
    },
  });
  if (!nursery) notFound();

  const hasAdmin = nursery.users.some((u) => u.role === Role.ADMIN);
  const toggleStatus = setNurseryStatus.bind(
    null,
    nursery.id,
    nursery.status === "ACTIVE" ? NurseryStatus.SUSPENDED : NurseryStatus.ACTIVE
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{nursery.name}</h1>
            <Badge color={nursery.status === "ACTIVE" ? "green" : "red"}>{nursery.status}</Badge>
          </div>
          <p className="text-sm text-gray-500">{nursery.slug} · created {formatDate(nursery.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href={`/master/nurseries/${nursery.id}/edit`} variant="secondary">
            Edit details
          </LinkButton>
          <form action={toggleStatus}>
            <Button type="submit" variant={nursery.status === "ACTIVE" ? "danger" : "primary"}>
              {nursery.status === "ACTIVE" ? "Suspend" : "Reactivate"}
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader title="Contact details" />
        <CardBody className="space-y-2 text-sm">
          <p>
            <span className="font-medium text-gray-700">Address:</span> {nursery.address || "Not set"}
          </p>
          <p>
            <span className="font-medium text-gray-700">Phone:</span> {nursery.phone || "Not set"}
          </p>
          <p>
            <span className="font-medium text-gray-700">Email:</span> {nursery.email || "Not set"}
          </p>
          <p>
            <span className="font-medium text-gray-700">Invoice prefix:</span> {nursery.invoicePrefix}
          </p>
          <p>
            <span className="font-medium text-gray-700">Children on roll:</span> {nursery._count.children}
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Support access"
          description="Log in as this nursery's admin for troubleshooting. A banner will show while impersonating, and you can return to the platform admin at any time."
        />
        <CardBody>
          {hasAdmin ? (
            <ImpersonateButton nurseryId={nursery.id} />
          ) : (
            <p className="text-sm text-gray-500">This nursery has no admin user yet.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="People" />
        <CardBody>
          {nursery.users.length === 0 ? (
            <p className="text-sm text-gray-500">No people yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {nursery.users.map((u) => (
                <li key={u.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <Badge color="gray">{u.role}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
