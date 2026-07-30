import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ReportForm } from "@/components/admin/ReportForm";
import { createReport } from "@/lib/actions/reports";

export default async function NewReportPage({ searchParams }: { searchParams: { childId?: string } }) {
  const [children, areas] = await Promise.all([
    prisma.child.findMany({ where: { active: true }, orderBy: { firstName: "asc" } }),
    prisma.eYFSArea.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">New EYFS report</h1>
      <Card>
        <CardHeader title="Report" description="Summarise a child's progress against the EYFS areas of learning." />
        <CardBody>
          <ReportForm action={createReport} childOptions={children} areas={areas} defaultChildId={searchParams.childId} />
        </CardBody>
      </Card>
    </div>
  );
}
