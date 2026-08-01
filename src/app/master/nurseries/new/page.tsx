import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Field, Label, Input, Textarea, Hint } from "@/components/ui/Form";
import { Button, LinkButton } from "@/components/ui/Button";
import { createNursery } from "@/lib/actions/master";

export default function NewNurseryPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Add a nursery</h1>
      <Card>
        <CardHeader title="Nursery details" description="This creates a new, fully isolated nursery account." />
        <CardBody>
          <form action={createNursery} className="space-y-5">
            <Field>
              <Label htmlFor="name">Nursery name</Label>
              <Input id="name" name="name" required placeholder="e.g. Sunflower Fields Nursery" />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" />
              </Field>
              <Field>
                <Label htmlFor="email">Contact email</Label>
                <Input id="email" name="email" type="email" />
              </Field>
            </div>
            <Field>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" rows={2} />
            </Field>
            <Field>
              <Label htmlFor="invoicePrefix">Invoice number prefix</Label>
              <Input id="invoicePrefix" name="invoicePrefix" placeholder="e.g. SFN" maxLength={10} />
              <Hint>Used on invoice numbers for this nursery, e.g. SFN-1001.</Hint>
            </Field>

            <div className="border-t border-gray-100 pt-5">
              <p className="mb-3 text-sm font-semibold text-gray-700">First admin login</p>
              <div className="space-y-4">
                <Field>
                  <Label htmlFor="adminName">Admin name</Label>
                  <Input id="adminName" name="adminName" required />
                </Field>
                <Field>
                  <Label htmlFor="adminEmail">Admin email</Label>
                  <Input id="adminEmail" name="adminEmail" type="email" required />
                </Field>
                <Field>
                  <Label htmlFor="adminPassword">Temporary password</Label>
                  <Input id="adminPassword" name="adminPassword" required minLength={8} defaultValue="Welcome123" />
                </Field>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit">Create nursery</Button>
              <LinkButton href="/master/nurseries" variant="secondary">
                Cancel
              </LinkButton>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
