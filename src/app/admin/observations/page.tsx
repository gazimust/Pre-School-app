import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, ageBandLabel } from "@/lib/utils";

export default async function ObservationsPage({ searchParams }: { searchParams: { childId?: string } }) {
  const observations = await prisma.observation.findMany({
    where: searchParams.childId ? { childId: searchParams.childId } : undefined,
    include: { child: true, staff: true, areas: { include: { eyfsArea: true } } },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">EYFS Observations</h1>
          <p className="text-sm text-gray-500">{observations.length} observation(s) recorded</p>
        </div>
        <LinkButton href="/admin/observations/new">+ New observation</LinkButton>
      </div>

      {observations.length === 0 ? (
        <Card>
          <div className="p-6">
            <EmptyState title="No observations recorded yet" />
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {observations.map((o) => (
            <Card key={o.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/admin/observations/${o.id}`} className="font-semibold text-gray-900 hover:text-brand-600">
                    {o.title}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {o.child.firstName} {o.child.lastName} · {formatDate(o.date)} · by {o.staff.name}
                  </p>
                </div>
                <Badge color="brand">{ageBandLabel(o.ageBand)}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {o.areas.map((a) => (
                  <Badge key={a.id} color="leaf">
                    {a.eyfsArea.name}
                  </Badge>
                ))}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-gray-600">{o.narrative}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
