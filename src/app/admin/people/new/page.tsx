import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Field, Label, Input, Select } from "@/components/ui/Form";
import { Button, LinkButton } from "@/components/ui/Button";
import { createPerson } from "@/lib/actions/people";

export default function NewPersonPage() {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Add a person</h1>
      <Card>
        <CardHeader title="Account details" description="Create a login for a parent or staff member." />
        <CardBody>
          <form action={createPerson} className="space-y-4">
            <Field>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required />
            </Field>
            <Field>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </Field>
            <Field>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" />
            </Field>
            <Field>
              <Label htmlFor="role">Role</Label>
              <Select id="role" name="role" required defaultValue="PARENT">
                <option value="PARENT">Parent</option>
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="password">Temporary password</Label>
              <Input id="password" name="password" type="text" required minLength={8} defaultValue="Welcome123" />
            </Field>
            <div className="flex gap-3">
              <Button type="submit">Create account</Button>
              <LinkButton href="/admin/people" variant="secondary">
                Cancel
              </LinkButton>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
