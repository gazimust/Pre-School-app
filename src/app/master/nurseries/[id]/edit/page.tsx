import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Field, Label, Input, Textarea, Hint } from "@/components/ui/Form";
import { Button, LinkButton } from "@/components/ui/Button";
import { updateNursery } from "@/lib/actions/master";

export default async function EditNurseryPage({ params }: { params: { id: string } }) {
  const nursery = await prisma.nursery.findUnique({ where: { id: params.id } });
  if (!nursery) notFound();

  const action = updateNursery.bind(null, nursery.id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Edit {nursery.name}</h1>
      <Card>
        <CardHeader title="Nursery details" />
        <CardBody>
          <form action={action} className="space-y-5">
            <Field>
              <Label htmlFor="name">Nursery name</Label>
              <Input id="name" name="name" required defaultValue={nursery.name} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={nursery.phone ?? ""} />
              </Field>
              <Field>
                <Label htmlFor="email">Contact email</Label>
                <Input id="email" name="email" type="email" defaultValue={nursery.email ?? ""} />
              </Field>
            </div>
            <Field>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" rows={2} defaultValue={nursery.address ?? ""} />
            </Field>
            <Field>
              <Label htmlFor="invoicePrefix">Invoice number prefix</Label>
              <Input id="invoicePrefix" name="invoicePrefix" maxLength={10} defaultValue={nursery.invoicePrefix} />
              <Hint>Used on invoice numbers for this nursery, e.g. SFN-1001.</Hint>
            </Field>
            <div className="flex gap-3">
              <Button type="submit">Save</Button>
              <LinkButton href={`/master/nurseries/${nursery.id}`} variant="secondary">
                Cancel
              </LinkButton>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
