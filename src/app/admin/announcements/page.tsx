import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { LinkButton, Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";
import { deleteAnnouncement } from "@/lib/actions/announcements";
import type { AnnouncementPriority } from "@prisma/client";

const PRIORITY_COLOR: Record<AnnouncementPriority, "gray" | "blue" | "amber" | "red"> = {
  LOW: "gray",
  NORMAL: "blue",
  HIGH: "amber",
  URGENT: "red",
};

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500">{announcements.length} announcement(s)</p>
        </div>
        <LinkButton href="/admin/announcements/new">+ New announcement</LinkButton>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <div className="p-6">
            <EmptyState title="No announcements yet" />
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-900">{a.title}</h2>
                    <Badge color={PRIORITY_COLOR[a.priority]}>{a.priority}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    By {a.author.name} · {formatDateTime(a.createdAt)}
                    {a.expiresAt && ` · Expires ${formatDateTime(a.expiresAt)}`}
                  </p>
                  <p className="mt-2 text-sm text-gray-700">{a.body}</p>
                </div>
                <form action={deleteAnnouncement.bind(null, a.id)}>
                  <Button type="submit" variant="ghost" size="sm">
                    Delete
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
