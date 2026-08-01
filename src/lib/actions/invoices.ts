"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { InvoiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStaff, nurseryIdOrThrow } from "@/lib/session";

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
});

async function nextInvoiceNumber(nurseryId: string) {
  const nursery = await prisma.nursery.findUnique({ where: { id: nurseryId } });
  const count = await prisma.invoice.count({ where: { nurseryId } });
  const prefix = nursery?.invoicePrefix ?? "INV";
  return `${prefix}-${1000 + count + 1}`;
}

export async function createInvoice(formData: FormData) {
  const session = await requireStaff();
  const nurseryId = nurseryIdOrThrow(session);

  const childId = String(formData.get("childId") || "");
  const dueDate = String(formData.get("dueDate") || "");
  const notes = String(formData.get("notes") || "") || undefined;

  if (!childId || !dueDate) throw new Error("Child and due date are required.");

  const child = await prisma.child.findFirst({
    where: { id: childId, nurseryId },
    include: { parents: { where: { isPrimaryContact: true }, include: { parent: true } } },
  });
  if (!child) throw new Error("Child not found.");

  const primaryParent = child.parents[0];
  const parentId = String(formData.get("parentId") || primaryParent?.parentId || "");
  if (!parentId) throw new Error("This child has no parent to bill. Link a parent first.");

  const parent = await prisma.user.findFirst({ where: { id: parentId, nurseryId, role: "PARENT" } });
  if (!parent) throw new Error("Parent not found in this nursery.");

  const descriptions = formData.getAll("description");
  const quantities = formData.getAll("quantity");
  const unitPrices = formData.getAll("unitPrice");

  const lineItems = descriptions
    .map((_, i) => ({
      description: String(descriptions[i] || ""),
      quantity: quantities[i],
      unitPrice: unitPrices[i],
    }))
    .filter((item) => item.description.trim().length > 0)
    .map((item) => lineItemSchema.parse(item));

  if (lineItems.length === 0) throw new Error("Add at least one line item.");

  const invoiceNumber = await nextInvoiceNumber(nurseryId);

  const invoice = await prisma.invoice.create({
    data: {
      nurseryId,
      invoiceNumber,
      childId,
      parentId,
      dueDate: new Date(dueDate),
      notes,
      status: InvoiceStatus.DRAFT,
      lineItems: { create: lineItems },
    },
  });

  revalidatePath("/admin/invoices");
  redirect(`/admin/invoices/${invoice.id}`);
}

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  const session = await requireStaff();
  const nurseryId = nurseryIdOrThrow(session);

  await prisma.invoice.updateMany({
    where: { id: invoiceId, nurseryId },
    data: {
      status,
      paidAt: status === InvoiceStatus.PAID ? new Date() : null,
    },
  });

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath("/parent/invoices");
}

export async function deleteInvoice(invoiceId: string) {
  const session = await requireStaff();
  const nurseryId = nurseryIdOrThrow(session);

  await prisma.invoice.deleteMany({ where: { id: invoiceId, nurseryId } });
  revalidatePath("/admin/invoices");
  redirect("/admin/invoices");
}
