import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, ageBandLabel } from "@/lib/utils";
import { REPORT_TYPE_LABEL } from "@/lib/eyfs";

export default async function ReportsPage({ searchParams }: { searchParams: { childId?: string } }) {
  const reports = await prisma.report.findMany({
    where: searchParams.childId ? { childId: searchParams.childId } : undefined,
    include: { child: true, staff: true },
    orderBy: { generatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">EYFS Reports</h1>
          <p className="text-sm text-gray-500">{reports.length} report(s) generated</p>
        </div>
        <LinkButton href="/admin/reports/new">+ New report</LinkButton>
      </div>

      <Card>
        {reports.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No reports generated yet" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Report</th>
                  <th className="px-5 py-3">Child</th>
                  <th className="px-5 py-3">Age band</th>
                  <th className="px-5 py-3">Generated</th>
                  <th className="px-5 py-3">Shared</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/reports/${r.id}`} className="font-medium text-brand-600 hover:underline">
                        {REPORT_TYPE_LABEL[r.type]} — {r.periodLabel}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {r.child.firstName} {r.child.lastName}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{ageBandLabel(r.ageBand)}</td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(r.generatedAt)}</td>
                    <td className="px-5 py-3">
                      <Badge color={r.sharedWithParentAt ? "green" : "gray"}>
                        {r.sharedWithParentAt ? "Shared" : "Not shared"}
                      </Badge>
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
