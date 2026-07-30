import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { togglePublishNewsletter, deleteNewsletter } from "@/lib/actions/newsletters";

export default async function NewsletterDetailPage({ params }: { params: { id: string } }) {
  const newsletter = await prisma.newsletter.findUnique({ where: { id: params.id }, include: { author: true } });
  if (!newsletter) notFound();

  const toggle = togglePublishNewsletter.bind(null, newsletter.id, !newsletter.publishedAt);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{newsletter.title}</h1>
          <p className="text-sm text-gray-500">
            By {newsletter.author.name} · {formatDate(newsletter.createdAt)}
          </p>
        </div>
        <Badge color={newsletter.publishedAt ? "green" : "gray"}>
          {newsletter.publishedAt ? "Published" : "Draft"}
        </Badge>
      </div>

      <Card>
        <CardBody>
          {newsletter.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={newsletter.coverImageUrl} alt="" className="mb-4 max-h-64 w-full rounded-lg object-cover" />
          )}
          <p className="whitespace-pre-wrap text-sm text-gray-700">{newsletter.body}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Actions" />
        <CardBody className="flex flex-wrap gap-3">
          <form action={toggle}>
            <Button type="submit">{newsletter.publishedAt ? "Unpublish" : "Publish"}</Button>
          </form>
          <LinkButton href={`/admin/newsletters/${newsletter.id}/edit`} variant="secondary">
            Edit
          </LinkButton>
          <form action={deleteNewsletter.bind(null, newsletter.id)}>
            <Button type="submit" variant="danger">
              Delete
            </Button>
          </form>
          <LinkButton href="/admin/newsletters" variant="ghost">
            Back
          </LinkButton>
        </CardBody>
      </Card>
    </div>
  );
}
