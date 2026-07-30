import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { InvoiceDocument } from "@/lib/pdf/InvoiceDocument";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { child: true, parent: true, lineItems: true },
  });
  if (!invoice) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isStaff = session.user.role === "ADMIN" || session.user.role === "STAFF";
  const isOwner = session.user.id === invoice.parentId;
  if (!isStaff && !isOwner) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const setting = await prisma.setting.findFirst();

  const pdfBuffer = await renderToBuffer(
    <InvoiceDocument
      data={{
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
        notes: invoice.notes,
        childName: `${invoice.child.firstName} ${invoice.child.lastName}`,
        parentName: invoice.parent.name,
        nurseryName: setting?.nurseryName ?? "Nursery",
        nurseryAddress: setting?.address ?? null,
        nurseryEmail: setting?.email ?? null,
        lineItems: invoice.lineItems.map((li) => ({
          description: li.description,
          quantity: Number(li.quantity),
          unitPrice: Number(li.unitPrice),
        })),
      }}
    />
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
