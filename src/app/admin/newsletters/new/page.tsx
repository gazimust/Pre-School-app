import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Field, Label, Input, Textarea } from "@/components/ui/Form";
import { Button, LinkButton } from "@/components/ui/Button";
import { createNewsletter } from "@/lib/actions/newsletters";

export default function NewNewsletterPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">New newsletter</h1>
      <Card>
        <CardHeader title="Compose" />
        <CardBody>
          <form action={createNewsletter} className="space-y-4">
            <Field>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </Field>
            <Field>
              <Label htmlFor="coverImageUrl">Cover image URL (optional)</Label>
              <Input id="coverImageUrl" name="coverImageUrl" type="url" placeholder="https://…" />
            </Field>
            <Field>
              <Label htmlFor="body">Content</Label>
              <Textarea id="body" name="body" rows={10} required />
            </Field>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" name="publish" className="rounded border-gray-300" defaultChecked />
              Publish immediately (visible to parents)
            </label>
            <div className="flex gap-3">
              <Button type="submit">Save</Button>
              <LinkButton href="/admin/newsletters" variant="secondary">
                Cancel
              </LinkButton>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
