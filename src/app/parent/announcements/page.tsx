import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";
import type { AnnouncementPriority } from "@prisma/client";

const PRIORITY_COLOR: Record<AnnouncementPriority, "gray" | "blue" | "amber" | "red"> = {
  LOW: "gray",
  NORMAL: "blue",
  HIGH: "amber",
  URGENT: "red",
};

export default async function ParentAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    where: {
      publishedAt: { not: null },
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
    orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Announcements</h1>
        <p className="text-sm text-gray-500">Important updates from the nursery</p>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <div className="p-6">
            <EmptyState title="No current announcements" />
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900">{a.title}</h2>
                <Badge color={PRIORITY_COLOR[a.priority]}>{a.priority}</Badge>
              </div>
              <p className="mt-1 text-xs text-gray-500">{formatDateTime(a.publishedAt!)}</p>
              <p className="mt-2 text-sm text-gray-700">{a.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
