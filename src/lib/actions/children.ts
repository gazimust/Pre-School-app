"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";

const childSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().optional(),
  room: z.string().min(1, "Room is required"),
  startDate: z.string().min(1, "Start date is required"),
  allergies: z.string().optional(),
  medicalNotes: z.string().optional(),
});

export async function createChild(formData: FormData) {
  await requireStaff();

  const data = childSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    dateOfBirth: formData.get("dateOfBirth"),
    gender: formData.get("gender") || undefined,
    room: formData.get("room"),
    startDate: formData.get("startDate"),
    allergies: formData.get("allergies") || undefined,
    medicalNotes: formData.get("medicalNotes") || undefined,
  });

  const child = await prisma.child.create({
    data: {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
      startDate: new Date(data.startDate),
    },
  });

  revalidatePath("/admin/children");
  redirect(`/admin/children/${child.id}`);
}

export async function updateChild(childId: string, formData: FormData) {
  await requireStaff();

  const data = childSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    dateOfBirth: formData.get("dateOfBirth"),
    gender: formData.get("gender") || undefined,
    room: formData.get("room"),
    startDate: formData.get("startDate"),
    allergies: formData.get("allergies") || undefined,
    medicalNotes: formData.get("medicalNotes") || undefined,
  });

  await prisma.child.update({
    where: { id: childId },
    data: {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
      startDate: new Date(data.startDate),
    },
  });

  revalidatePath("/admin/children");
  revalidatePath(`/admin/children/${childId}`);
  redirect(`/admin/children/${childId}`);
}

export async function toggleChildActive(childId: string, active: boolean) {
  await requireStaff();
  await prisma.child.update({ where: { id: childId }, data: { active } });
  revalidatePath("/admin/children");
  revalidatePath(`/admin/children/${childId}`);
}

export async function linkParentToChild(childId: string, formData: FormData) {
  await requireStaff();

  const parentId = String(formData.get("parentId") || "");
  const relationship = String(formData.get("relationship") || "Parent");
  const isPrimaryContact = formData.get("isPrimaryContact") === "on";

  if (!parentId) return;

  await prisma.parentChild.upsert({
    where: { parentId_childId: { parentId, childId } },
    update: { relationship, isPrimaryContact },
    create: { parentId, childId, relationship, isPrimaryContact },
  });

  revalidatePath(`/admin/children/${childId}`);
}

export async function unlinkParentFromChild(parentChildId: string, childId: string) {
  await requireStaff();
  await prisma.parentChild.delete({ where: { id: parentChildId } });
  revalidatePath(`/admin/children/${childId}`);
}
