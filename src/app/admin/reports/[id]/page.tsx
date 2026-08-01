import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, nurseryIdOrThrow } from "@/lib/session";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatDate, ageBandLabel } from "@/lib/utils";
import { REPORT_TYPE_LABEL, DEVELOPMENT_LEVEL_LABEL, DEVELOPMENT_LEVEL_COLOR } from "@/lib/eyfs";
import { shareReportWithParent, deleteReport } from "@/lib/actions/reports";

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const nurseryId = nurseryIdOrThrow(session!);

  const report = await prisma.report.findFirst({
    where: { id: params.id, nurseryId },
    include: { child: true, staff: true, entries: { include: { eyfsArea: true } } },
  });
  if (!report) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {REPORT_TYPE_LABEL[report.type]} — {report.periodLabel}
          </h1>
          <p className="text-sm text-gray-500">
            {report.child.firstName} {report.child.lastName} · {formatDate(report.generatedAt)} · Prepared by {report.staff.name}
          </p>
        </div>
        <Badge color="brand">{ageBandLabel(report.ageBand)}</Badge>
      </div>

      <Card>
        <CardHeader
          title="Summary"
          action={
            <a href={`/api/reports/${report.id}/pdf`} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm">
                Download PDF
              </Button>
            </a>
          }
        />
        <CardBody className="space-y-4">
          <p className="whitespace-pre-wrap text-sm text-gray-700">{report.summary}</p>

          <div className="space-y-3">
            {report.entries.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-800">{entry.eyfsArea.name}</p>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${DEVELOPMENT_LEVEL_COLOR[entry.level]}`}
                  >
                    {DEVELOPMENT_LEVEL_LABEL[entry.level]}
                  </span>
                </div>
                {entry.comment && <p className="mt-1 text-sm text-gray-600">{entry.comment}</p>}
              </div>
            ))}
          </div>

          {report.nextSteps && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Next steps</p>
              <p className="text-sm text-gray-700">{report.nextSteps}</p>
            </div>
          )}

          {report.sharedWithParentAt && (
            <p className="text-sm text-leaf-700">Shared with parent on {formatDate(report.sharedWithParentAt)}</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-wrap gap-3">
          {!report.sharedWithParentAt && (
            <form action={shareReportWithParent.bind(null, report.id)}>
              <Button type="submit">Share with parent</Button>
            </form>
          )}
          <form action={deleteReport.bind(null, report.id)}>
            <Button type="submit" variant="danger">
              Delete
            </Button>
          </form>
          <LinkButton href="/admin/reports" variant="ghost">
            Back to reports
          </LinkButton>
        </CardBody>
      </Card>
    </div>
  );
}
