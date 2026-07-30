import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Field, Label, Input, Textarea } from "@/components/ui/Form";
import { Button, LinkButton } from "@/components/ui/Button";
import { updateNewsletter } from "@/lib/actions/newsletters";

export default async function EditNewsletterPage({ params }: { params: { id: string } }) {
  const newsletter = await prisma.newsletter.findUnique({ where: { id: params.id } });
  if (!newsletter) notFound();

  const action = updateNewsletter.bind(null, newsletter.id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Edit newsletter</h1>
      <Card>
        <CardHeader title="Content" />
        <CardBody>
          <form action={action} className="space-y-4">
            <Field>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required defaultValue={newsletter.title} />
            </Field>
            <Field>
              <Label htmlFor="coverImageUrl">Cover image URL (optional)</Label>
              <Input id="coverImageUrl" name="coverImageUrl" type="url" defaultValue={newsletter.coverImageUrl ?? ""} />
            </Field>
            <Field>
              <Label htmlFor="body">Content</Label>
              <Textarea id="body" name="body" rows={10} required defaultValue={newsletter.body} />
            </Field>
            <div className="flex gap-3">
              <Button type="submit">Save</Button>
              <LinkButton href={`/admin/newsletters/${newsletter.id}`} variant="secondary">
                Cancel
              </LinkButton>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
