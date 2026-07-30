import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export default async function ParentNewslettersPage() {
  const newsletters = await prisma.newsletter.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Newsletters</h1>
        <p className="text-sm text-gray-500">News and updates from the nursery</p>
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
            <Link key={n.id} href={`/parent/newsletters/${n.id}`}>
              <Card className="h-full p-5 transition-shadow hover:shadow-md">
                <p className="text-xs text-gray-500">{formatDate(n.publishedAt!)}</p>
                <h2 className="mt-1 font-semibold text-gray-900">{n.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-gray-600">{n.body}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
