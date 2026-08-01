import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession, nurseryIdOrThrow } from "@/lib/session";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export default async function NewslettersPage() {
  const session = await getSession();
  const nurseryId = nurseryIdOrThrow(session!);

  const newsletters = await prisma.newsletter.findMany({
    where: { nurseryId },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Newsletters</h1>
          <p className="text-sm text-gray-500">{newsletters.length} newsletter(s)</p>
        </div>
        <LinkButton href="/admin/newsletters/new">+ New newsletter</LinkButton>
      </div>

      {newsletters.length === 0 ? (
        <Card>
          <div className="p-6">
            <EmptyState title="No newsletters yet" />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {newsletters.map((n) => (
            <Card key={n.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link href={`/admin/newsletters/${n.id}`} className="font-semibold text-gray-900 hover:text-brand-600">
                    {n.title}
                  </Link>
                  <p className="mt-1 text-xs text-gray-500">
                    By {n.author.name} · {formatDate(n.createdAt)}
                  </p>
                </div>
                <Badge color={n.publishedAt ? "green" : "gray"}>{n.publishedAt ? "Published" : "Draft"}</Badge>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-gray-600">{n.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
