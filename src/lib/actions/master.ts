"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NurseryStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/session";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const nurserySchema = z.object({
  name: z.string().min(1, "Nursery name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  invoicePrefix: z.string().min(1).max(10).optional(),
});

const adminSchema = z.object({
  adminName: z.string().min(1, "Admin name is required"),
  adminEmail: z.string().email("Enter a valid email"),
  adminPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function createNursery(formData: FormData) {
  await requirePlatformAdmin();

  const data = nurserySchema.parse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || "",
    invoicePrefix: formData.get("invoicePrefix") || undefined,
  });
  const admin = adminSchema.parse({
    adminName: formData.get("adminName"),
    adminEmail: formData.get("adminEmail"),
    adminPassword: formData.get("adminPassword"),
  });

  const existingUser = await prisma.user.findUnique({ where: { email: admin.adminEmail.toLowerCase().trim() } });
  if (existingUser) throw new Error("A user with that admin email already exists.");

  let slug = slugify(data.name);
  if (!slug) slug = `nursery-${Date.now()}`;
  const existingSlug = await prisma.nursery.findUnique({ where: { slug } });
  if (existingSlug) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const passwordHash = await bcrypt.hash(admin.adminPassword, 10);

  const nursery = await prisma.nursery.create({
    data: {
      name: data.name,
      slug,
      address: data.address,
      phone: data.phone,
      email: data.email || undefined,
      invoicePrefix: data.invoicePrefix || "INV",
      users: {
        create: {
          name: admin.adminName,
          email: admin.adminEmail.toLowerCase().trim(),
          passwordHash,
          role: Role.ADMIN,
        },
      },
    },
  });

  revalidatePath("/master/nurseries");
  redirect(`/master/nurseries/${nursery.id}`);
}

export async function updateNursery(nurseryId: string, formData: FormData) {
  await requirePlatformAdmin();

  const data = nurserySchema.parse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || "",
    invoicePrefix: formData.get("invoicePrefix") || undefined,
  });

  await prisma.nursery.update({
    where: { id: nurseryId },
    data: {
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email || null,
      invoicePrefix: data.invoicePrefix || "INV",
    },
  });

  revalidatePath("/master/nurseries");
  revalidatePath(`/master/nurseries/${nurseryId}`);
  redirect(`/master/nurseries/${nurseryId}`);
}

export async function setNurseryStatus(nurseryId: string, status: NurseryStatus) {
  await requirePlatformAdmin();

  await prisma.nursery.update({ where: { id: nurseryId }, data: { status } });

  revalidatePath("/master/nurseries");
  revalidatePath(`/master/nurseries/${nurseryId}`);
}
