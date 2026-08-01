import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, nurseryIdOrThrow } from "@/lib/session";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatDate, ageBandLabel } from "@/lib/utils";
import { deleteObservation } from "@/lib/actions/observations";

export default async function ObservationDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const nurseryId = nurseryIdOrThrow(session!);

  const observation = await prisma.observation.findFirst({
    where: { id: params.id, nurseryId },
    include: { child: true, staff: true, areas: { include: { eyfsArea: true } } },
  });
  if (!observation) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{observation.title}</h1>
          <p className="text-sm text-gray-500">
            {observation.child.firstName} {observation.child.lastName} · {formatDate(observation.date)} · by {observation.staff.name}
          </p>
        </div>
        <Badge color="brand">{ageBandLabel(observation.ageBand)}</Badge>
      </div>

      <Card>
        <CardHeader title="What was observed" />
        <CardBody className="space-y-4">
          <p className="whitespace-pre-wrap text-sm text-gray-700">{observation.narrative}</p>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">EYFS areas covered</p>
            <div className="flex flex-wrap gap-1">
              {observation.areas.map((a) => (
                <Badge key={a.id} color="leaf">
                  {a.eyfsArea.name}
                </Badge>
              ))}
            </div>
          </div>
          {observation.nextSteps && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Next steps</p>
              <p className="text-sm text-gray-700">{observation.nextSteps}</p>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-wrap gap-3">
          <form action={deleteObservation.bind(null, observation.id)}>
            <Button type="submit" variant="danger">
              Delete
            </Button>
          </form>
          <LinkButton href="/admin/observations" variant="ghost">
            Back to observations
          </LinkButton>
        </CardBody>
      </Card>
    </div>
  );
}
