"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Content is required"),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
});

export async function createNewsletter(formData: FormData) {
  const session = await requireStaff();

  const data = schema.parse({
    title: formData.get("title"),
    body: formData.get("body"),
    coverImageUrl: formData.get("coverImageUrl") || "",
  });

  const publish = formData.get("publish") === "on";

  const newsletter = await prisma.newsletter.create({
    data: {
      title: data.title,
      body: data.body,
      coverImageUrl: data.coverImageUrl || undefined,
      authorId: session.user.id,
      publishedAt: publish ? new Date() : null,
    },
  });

  revalidatePath("/admin/newsletters");
  redirect(`/admin/newsletters/${newsletter.id}`);
}

export async function updateNewsletter(newsletterId: string, formData: FormData) {
  await requireStaff();

  const data = schema.parse({
    title: formData.get("title"),
    body: formData.get("body"),
    coverImageUrl: formData.get("coverImageUrl") || "",
  });

  await prisma.newsletter.update({
    where: { id: newsletterId },
    data: { title: data.title, body: data.body, coverImageUrl: data.coverImageUrl || null },
  });

  revalidatePath("/admin/newsletters");
  revalidatePath(`/admin/newsletters/${newsletterId}`);
  redirect(`/admin/newsletters/${newsletterId}`);
}

export async function togglePublishNewsletter(newsletterId: string, publish: boolean) {
  await requireStaff();
  await prisma.newsletter.update({
    where: { id: newsletterId },
    data: { publishedAt: publish ? new Date() : null },
  });
  revalidatePath("/admin/newsletters");
  revalidatePath(`/admin/newsletters/${newsletterId}`);
  revalidatePath("/parent/newsletters");
}

export async function deleteNewsletter(newsletterId: string) {
  await requireStaff();
  await prisma.newsletter.delete({ where: { id: newsletterId } });
  revalidatePath("/admin/newsletters");
  redirect("/admin/newsletters");
}
