import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ObservationForm } from "@/components/admin/ObservationForm";
import { createObservation } from "@/lib/actions/observations";

export default async function NewObservationPage({ searchParams }: { searchParams: { childId?: string } }) {
  const [children, areas] = await Promise.all([
    prisma.child.findMany({ where: { active: true }, orderBy: { firstName: "asc" } }),
    prisma.eYFSArea.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">New EYFS observation</h1>
      <Card>
        <CardHeader title="Observation" description="Record a learning moment linked to the EYFS framework." />
        <CardBody>
          <ObservationForm
            action={createObservation}
            childOptions={children.map((c) => ({ ...c, dateOfBirth: c.dateOfBirth.toISOString() }))}
            areas={areas}
            defaultChildId={searchParams.childId}
          />
        </CardBody>
      </Card>
    </div>
  );
}
