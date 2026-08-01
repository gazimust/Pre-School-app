"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EYFSAgeBand } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStaff, nurseryIdOrThrow } from "@/lib/session";

export async function createObservation(formData: FormData) {
  const session = await requireStaff();
  const nurseryId = nurseryIdOrThrow(session);

  const childId = String(formData.get("childId") || "");
  const date = String(formData.get("date") || "");
  const title = String(formData.get("title") || "");
  const narrative = String(formData.get("narrative") || "");
  const ageBand = formData.get("ageBand") as EYFSAgeBand;
  const nextSteps = String(formData.get("nextSteps") || "") || null;
  const areaIds = formData.getAll("areaIds").map(String);

  if (!childId || !date || !title || !narrative || areaIds.length === 0) {
    throw new Error("Please fill in all required fields and select at least one EYFS area.");
  }

  const child = await prisma.child.findFirst({ where: { id: childId, nurseryId } });
  if (!child) throw new Error("Child not found.");

  const observation = await prisma.observation.create({
    data: {
      nurseryId,
      childId,
      staffId: session.user.id,
      date: new Date(date),
      title,
      narrative,
      ageBand,
      nextSteps,
      areas: { create: areaIds.map((eyfsAreaId) => ({ eyfsAreaId })) },
    },
  });

  revalidatePath("/admin/observations");
  revalidatePath("/parent/learning");
  redirect(`/admin/observations/${observation.id}`);
}

export async function deleteObservation(observationId: string) {
  const session = await requireStaff();
  const nurseryId = nurseryIdOrThrow(session);

  await prisma.observation.deleteMany({ where: { id: observationId, nurseryId } });
  revalidatePath("/admin/observations");
  revalidatePath("/parent/learning");
  redirect("/admin/observations");
}
