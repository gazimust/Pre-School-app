import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ChildForm } from "@/components/admin/ChildForm";
import { createChild } from "@/lib/actions/children";

export default function NewChildPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Add a child</h1>
      <Card>
        <CardHeader title="Child details" />
        <CardBody>
          <ChildForm action={createChild} cancelHref="/admin/children" />
        </CardBody>
      </Card>
    </div>
  );
}
