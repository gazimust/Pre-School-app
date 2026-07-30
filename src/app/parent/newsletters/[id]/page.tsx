import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default async function ParentNewsletterDetailPage({ params }: { params: { id: string } }) {
  const newsletter = await prisma.newsletter.findUnique({ where: { id: params.id }, include: { author: true } });
  if (!newsletter || !newsletter.publishedAt) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{newsletter.title}</h1>
        <p className="text-sm text-gray-500">
          {newsletter.author.name} · {formatDate(newsletter.publishedAt)}
        </p>
      </div>
      <Card>
        <CardBody>
          {newsletter.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={newsletter.coverImageUrl} alt="" className="mb-4 max-h-72 w-full rounded-lg object-cover" />
          )}
          <p className="whitespace-pre-wrap text-sm text-gray-700">{newsletter.body}</p>
        </CardBody>
      </Card>
      <LinkButton href="/parent/newsletters" variant="ghost">
        Back to newsletters
      </LinkButton>
    </div>
  );
}
