import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, nurseryIdOrThrow } from "@/lib/session";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatCurrency, formatDate, invoiceTotal } from "@/lib/utils";
import { updateInvoiceStatus, deleteInvoice } from "@/lib/actions/invoices";
import { InvoiceStatus } from "@prisma/client";

const STATUS_COLOR: Record<InvoiceStatus, "gray" | "blue" | "green" | "red" | "amber"> = {
  DRAFT: "gray",
  SENT: "blue",
  PAID: "green",
  OVERDUE: "red",
  CANCELLED: "amber",
};

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const nurseryId = nurseryIdOrThrow(session!);

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, nurseryId },
    include: { child: true, parent: true, lineItems: true },
  });
  if (!invoice) notFound();

  const total = invoiceTotal(invoice.lineItems);

  const markSent = updateInvoiceStatus.bind(null, invoice.id, InvoiceStatus.SENT);
  const markPaid = updateInvoiceStatus.bind(null, invoice.id, InvoiceStatus.PAID);
  const markOverdue = updateInvoiceStatus.bind(null, invoice.id, InvoiceStatus.OVERDUE);
  const markCancelled = updateInvoiceStatus.bind(null, invoice.id, InvoiceStatus.CANCELLED);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <p className="text-sm text-gray-500">
            {invoice.child.firstName} {invoice.child.lastName} · Billed to {invoice.parent.name}
          </p>
        </div>
        <Badge color={STATUS_COLOR[invoice.status]}>{invoice.status}</Badge>
      </div>

      <Card>
        <CardHeader
          title="Line items"
          action={
            <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm">
                Download PDF
              </Button>
            </a>
          }
        />
        <CardBody>
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Unit price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.lineItems.map((li) => (
                <tr key={li.id}>
                  <td className="py-2">{li.description}</td>
                  <td className="py-2 text-right">{Number(li.quantity)}</td>
                  <td className="py-2 text-right">{formatCurrency(Number(li.unitPrice))}</td>
                  <td className="py-2 text-right">{formatCurrency(Number(li.quantity) * Number(li.unitPrice))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-sm">
            <span className="text-gray-500">Issue date: {formatDate(invoice.issueDate)}</span>
            <span className="text-gray-500">Due date: {formatDate(invoice.dueDate)}</span>
          </div>
          <div className="mt-2 flex justify-end text-lg font-bold text-gray-900">{formatCurrency(total)}</div>
          {invoice.notes && <p className="mt-3 text-sm text-gray-600">Notes: {invoice.notes}</p>}
          {invoice.paidAt && <p className="mt-1 text-sm text-leaf-700">Paid on {formatDate(invoice.paidAt)}</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Actions" />
        <CardBody className="flex flex-wrap gap-3">
          {invoice.status === "DRAFT" && (
            <form action={markSent}>
              <Button type="submit">Mark as sent</Button>
            </form>
          )}
          {(invoice.status === "SENT" || invoice.status === "OVERDUE") && (
            <form action={markPaid}>
              <Button type="submit">Mark as paid</Button>
            </form>
          )}
          {invoice.status === "SENT" && (
            <form action={markOverdue}>
              <Button type="submit" variant="secondary">
                Mark overdue
              </Button>
            </form>
          )}
          {invoice.status !== "CANCELLED" && invoice.status !== "PAID" && (
            <form action={markCancelled}>
              <Button type="submit" variant="secondary">
                Cancel invoice
              </Button>
            </form>
          )}
          <form action={deleteInvoice.bind(null, invoice.id)}>
            <Button type="submit" variant="danger">
              Delete
            </Button>
          </form>
          <LinkButton href="/admin/invoices" variant="ghost">
            Back to invoices
          </LinkButton>
        </CardBody>
      </Card>
    </div>
  );
}
