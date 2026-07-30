import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getParentChildIds } from "@/lib/parent";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, ageBandLabel } from "@/lib/utils";
import { REPORT_TYPE_LABEL } from "@/lib/eyfs";

export default async function ParentLearningPage() {
  const session = await getSession();
  const childIds = await getParentChildIds(session!.user.id);

  const [observations, reports] = await Promise.all([
    prisma.observation.findMany({
      where: { childId: { in: childIds } },
      include: { child: true, areas: { include: { eyfsArea: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.report.findMany({
      where: { childId: { in: childIds }, sharedWithParentAt: { not: null } },
      include: { child: true },
      orderBy: { generatedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Learning Journey</h1>
        <p className="text-sm text-gray-500">Observations and EYFS progress reports for your child(ren)</p>
      </div>

      <Card>
        <CardHeader title="EYFS reports" description="Termly summaries, progress checks and transition reports" />
        <CardBody>
          {reports.length === 0 ? (
            <EmptyState title="No reports shared yet" />
          ) : (
            <ul className="divide-y divide-gray-100">
              {reports.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link href={`/parent/learning/reports/${r.id}`} className="font-medium text-brand-600 hover:underline">
                      {REPORT_TYPE_LABEL[r.type]} — {r.periodLabel}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {r.child.firstName} {r.child.lastName} · {formatDate(r.generatedAt)} · {ageBandLabel(r.ageBand)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Recent observations" description="Learning moments captured by your child's key person" />
        <CardBody>
          {observations.length === 0 ? (
            <EmptyState title="No observations recorded yet" />
          ) : (
            <ul className="space-y-4">
              {observations.map((o) => (
                <li key={o.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{o.title}</p>
                      <p className="text-xs text-gray-500">
                        {o.child.firstName} {o.child.lastName} · {formatDate(o.date)}
                      </p>
                    </div>
                    <Badge color="brand">{ageBandLabel(o.ageBand)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{o.narrative}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {o.areas.map((a) => (
                      <Badge key={a.id} color="leaf">
                        {a.eyfsArea.name}
                      </Badge>
                    ))}
                  </div>
                  {o.nextSteps && <p className="mt-2 text-xs text-gray-500">Next steps: {o.nextSteps}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
