import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession, nurseryIdOrThrow } from "@/lib/session";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate, invoiceTotal } from "@/lib/utils";
import type { InvoiceStatus } from "@prisma/client";

const STATUS_COLOR: Record<InvoiceStatus, "gray" | "blue" | "green" | "red" | "amber"> = {
  DRAFT: "gray",
  SENT: "blue",
  PAID: "green",
  OVERDUE: "red",
  CANCELLED: "amber",
};

export default async function InvoicesPage({ searchParams }: { searchParams: { childId?: string } }) {
  const session = await getSession();
  const nurseryId = nurseryIdOrThrow(session!);

  const invoices = await prisma.invoice.findMany({
    where: { nurseryId, ...(searchParams.childId ? { childId: searchParams.childId } : {}) },
    include: { child: true, parent: true, lineItems: true },
    orderBy: { issueDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Invoicing</h1>
          <p className="text-sm text-gray-500">{invoices.length} invoice(s)</p>
        </div>
        <LinkButton href="/admin/invoices/new">+ New invoice</LinkButton>
      </div>

      <Card>
        {invoices.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No invoices yet" description="Create your first invoice to bill a family." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Child</th>
                  <th className="px-5 py-3">Billed to</th>
                  <th className="px-5 py-3">Due</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/invoices/${inv.id}`} className="font-medium text-brand-600 hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {inv.child.firstName} {inv.child.lastName}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{inv.parent.name}</td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(inv.dueDate)}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{formatCurrency(invoiceTotal(inv.lineItems))}</td>
                    <td className="px-5 py-3">
                      <Badge color={STATUS_COLOR[inv.status]}>{inv.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
