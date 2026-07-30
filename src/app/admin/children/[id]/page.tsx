import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Label, Select, Input } from "@/components/ui/Form";
import { ageLabel, formatDate } from "@/lib/utils";
import { ageBandLabel, eyfsAgeBandFor } from "@/lib/utils";
import { linkParentToChild, unlinkParentFromChild, toggleChildActive } from "@/lib/actions/children";
import { Role } from "@prisma/client";

export default async function ChildDetailPage({ params }: { params: { id: string } }) {
  const child = await prisma.child.findUnique({
    where: { id: params.id },
    include: {
      parents: { include: { parent: true } },
      observations: { orderBy: { date: "desc" }, take: 5, include: { areas: { include: { eyfsArea: true } } } },
      reports: { orderBy: { generatedAt: "desc" }, take: 5 },
      invoices: { include: { lineItems: true }, orderBy: { issueDate: "desc" }, take: 5 },
    },
  });

  if (!child) notFound();

  const availableParents = await prisma.user.findMany({
    where: { role: Role.PARENT, NOT: { children: { some: { childId: child.id } } } },
    orderBy: { name: "asc" },
  });

  const linkParentAction = linkParentToChild.bind(null, child.id);
  const toggleActive = toggleChildActive.bind(null, child.id, !child.active);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">
              {child.firstName} {child.lastName}
            </h1>
            <Badge color={child.active ? "green" : "gray"}>{child.active ? "Active" : "Inactive"}</Badge>
          </div>
          <p className="text-sm text-gray-500">
            {child.room} · {ageLabel(child.dateOfBirth)} · EYFS band: {ageBandLabel(eyfsAgeBandFor(child.dateOfBirth))}
          </p>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/admin/children/${child.id}/edit`} variant="secondary">
            Edit details
          </LinkButton>
          <form action={toggleActive}>
            <Button type="submit" variant={child.active ? "danger" : "primary"}>
              {child.active ? "Mark inactive" : "Mark active"}
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <LinkButton href={`/admin/diary?childId=${child.id}`} variant="secondary" className="justify-center">
          Daily diary
        </LinkButton>
        <LinkButton href={`/admin/observations?childId=${child.id}`} variant="secondary" className="justify-center">
          Observations
        </LinkButton>
        <LinkButton href={`/admin/reports?childId=${child.id}`} variant="secondary" className="justify-center">
          EYFS reports
        </LinkButton>
        <LinkButton href={`/admin/invoices?childId=${child.id}`} variant="secondary" className="justify-center">
          Invoices
        </LinkButton>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Care details" />
          <CardBody className="space-y-2 text-sm">
            <p>
              <span className="font-medium text-gray-700">Date of birth:</span> {formatDate(child.dateOfBirth)}
            </p>
            <p>
              <span className="font-medium text-gray-700">Started:</span> {formatDate(child.startDate)}
            </p>
            <p>
              <span className="font-medium text-gray-700">Gender:</span> {child.gender || "Not specified"}
            </p>
            <p>
              <span className="font-medium text-gray-700">Allergies:</span> {child.allergies || "None recorded"}
            </p>
            <p>
              <span className="font-medium text-gray-700">Medical notes:</span> {child.medicalNotes || "None recorded"}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Parents & guardians" />
          <CardBody className="space-y-4">
            {child.parents.length === 0 ? (
              <p className="text-sm text-gray-500">No parents linked yet.</p>
            ) : (
              <ul className="space-y-2">
                {child.parents.map((pc) => (
                  <li key={pc.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{pc.parent.name}</p>
                      <p className="text-xs text-gray-500">
                        {pc.relationship} {pc.isPrimaryContact && "· Primary contact"} · {pc.parent.email}
                      </p>
                    </div>
                    <form action={unlinkParentFromChild.bind(null, pc.id, child.id)}>
                      <Button type="submit" variant="ghost" size="sm">
                        Remove
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            {availableParents.length > 0 && (
              <form action={linkParentAction} className="space-y-3 border-t border-gray-100 pt-4">
                <Field>
                  <Label htmlFor="parentId">Link a parent</Label>
                  <Select id="parentId" name="parentId" required>
                    <option value="">Select a parent…</option>
                    {availableParents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.email})
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="flex items-end gap-3">
                  <Field className="flex-1">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input id="relationship" name="relationship" placeholder="Mother / Father / Guardian" defaultValue="Parent" />
                  </Field>
                  <label className="flex items-center gap-2 pb-2 text-sm text-gray-600">
                    <input type="checkbox" name="isPrimaryContact" className="rounded border-gray-300" />
                    Primary contact
                  </label>
                </div>
                <Button type="submit" size="sm">
                  Link parent
                </Button>
              </form>
            )}
            <p className="text-xs text-gray-400">
              Need to add a new parent account first?{" "}
              <Link href="/admin/people/new" className="text-brand-600 hover:underline">
                Add a person
              </Link>
              .
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Recent observations" />
          <CardBody>
            {child.observations.length === 0 ? (
              <p className="text-sm text-gray-500">None recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {child.observations.map((o) => (
                  <li key={o.id} className="text-sm">
                    <p className="font-medium text-gray-900">{o.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(o.date)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Recent EYFS reports" />
          <CardBody>
            {child.reports.length === 0 ? (
              <p className="text-sm text-gray-500">None generated yet.</p>
            ) : (
              <ul className="space-y-3">
                {child.reports.map((r) => (
                  <li key={r.id} className="text-sm">
                    <Link href={`/admin/reports/${r.id}`} className="font-medium text-brand-600 hover:underline">
                      {r.periodLabel}
                    </Link>
                    <p className="text-xs text-gray-500">{formatDate(r.generatedAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Recent invoices" />
          <CardBody>
            {child.invoices.length === 0 ? (
              <p className="text-sm text-gray-500">None yet.</p>
            ) : (
              <ul className="space-y-3">
                {child.invoices.map((inv) => (
                  <li key={inv.id} className="text-sm">
                    <Link href={`/admin/invoices/${inv.id}`} className="font-medium text-brand-600 hover:underline">
                      {inv.invoiceNumber}
                    </Link>
                    <p className="text-xs text-gray-500">{formatDate(inv.dueDate)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
