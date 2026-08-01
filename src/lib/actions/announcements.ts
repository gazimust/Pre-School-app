"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AnnouncementPriority } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStaff, nurseryIdOrThrow } from "@/lib/session";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Content is required"),
  priority: z.nativeEnum(AnnouncementPriority),
  expiresAt: z.string().optional(),
});

export async function createAnnouncement(formData: FormData) {
  const session = await requireStaff();
  const nurseryId = nurseryIdOrThrow(session);

  const data = schema.parse({
    title: formData.get("title"),
    body: formData.get("body"),
    priority: formData.get("priority"),
    expiresAt: formData.get("expiresAt") || undefined,
  });

  await prisma.announcement.create({
    data: {
      nurseryId,
      title: data.title,
      body: data.body,
      priority: data.priority,
      authorId: session.user.id,
      publishedAt: new Date(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  revalidatePath("/admin/announcements");
  redirect("/admin/announcements");
}

export async function deleteAnnouncement(announcementId: string) {
  const session = await requireStaff();
  const nurseryId = nurseryIdOrThrow(session);

  await prisma.announcement.deleteMany({ where: { id: announcementId, nurseryId } });
  revalidatePath("/admin/announcements");
  revalidatePath("/parent/announcements");
}
