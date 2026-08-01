import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, nurseryIdOrThrow } from "@/lib/session";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ChildForm } from "@/components/admin/ChildForm";
import { updateChild } from "@/lib/actions/children";

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function EditChildPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const nurseryId = nurseryIdOrThrow(session!);

  const child = await prisma.child.findFirst({ where: { id: params.id, nurseryId } });
  if (!child) notFound();

  const action = updateChild.bind(null, child.id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">
        Edit {child.firstName} {child.lastName}
      </h1>
      <Card>
        <CardHeader title="Child details" />
        <CardBody>
          <ChildForm
            action={action}
            cancelHref={`/admin/children/${child.id}`}
            defaults={{
              firstName: child.firstName,
              lastName: child.lastName,
              dateOfBirth: toDateInput(child.dateOfBirth),
              gender: child.gender,
              room: child.room,
              startDate: toDateInput(child.startDate),
              allergies: child.allergies,
              medicalNotes: child.medicalNotes,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
