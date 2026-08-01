import { prisma } from "@/lib/prisma";
import { getSession, nurseryIdOrThrow } from "@/lib/session";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { InvoiceForm } from "@/components/admin/InvoiceForm";
import { createInvoice } from "@/lib/actions/invoices";

export default async function NewInvoicePage({ searchParams }: { searchParams: { childId?: string } }) {
  const session = await getSession();
  const nurseryId = nurseryIdOrThrow(session!);

  const children = await prisma.child.findMany({
    where: { nurseryId, active: true },
    include: { parents: { include: { parent: true } } },
    orderBy: { firstName: "asc" },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">New invoice</h1>
      <Card>
        <CardHeader title="Invoice details" />
        <CardBody>
          <InvoiceForm action={createInvoice} childOptions={children} defaultChildId={searchParams.childId} />
        </CardBody>
      </Card>
    </div>
  );
}
