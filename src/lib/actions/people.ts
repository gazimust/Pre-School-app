"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff, nurseryIdOrThrow } from "@/lib/session";

const NURSERY_ROLES = ["ADMIN", "STAFF", "PARENT"] as const;

const personSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  role: z.enum(NURSERY_ROLES),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function createPerson(formData: FormData) {
  const session = await requireStaff();
  const nurseryId = nurseryIdOrThrow(session);

  const data = personSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role"),
    password: formData.get("password"),
  });

  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
  if (existing) {
    throw new Error("A user with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      role: data.role,
      nurseryId,
      passwordHash,
    },
  });

  revalidatePath("/admin/people");
  redirect("/admin/people");
}

export async function updatePerson(userId: string, formData: FormData) {
  const session = await requireStaff();
  const nurseryId = nurseryIdOrThrow(session);

  const name = String(formData.get("name") || "");
  const phone = String(formData.get("phone") || "") || null;

  if (!name) throw new Error("Name is required");

  const { count } = await prisma.user.updateMany({ where: { id: userId, nurseryId }, data: { name, phone } });
  if (count === 0) throw new Error("Person not found.");

  revalidatePath("/admin/people");
}
