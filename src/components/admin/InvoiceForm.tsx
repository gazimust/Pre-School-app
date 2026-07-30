"use client";

import { useMemo, useState } from "react";
import { Field, Label, Input, Select, Textarea } from "@/components/ui/Form";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

type ChildOption = {
  id: string;
  firstName: string;
  lastName: string;
  parents: { parent: { id: string; name: string }; isPrimaryContact: boolean }[];
};

type LineItem = { description: string; quantity: string; unitPrice: string };

export function InvoiceForm({
  action,
  childOptions,
  defaultChildId,
}: {
  action: (formData: FormData) => void;
  childOptions: ChildOption[];
  defaultChildId?: string;
}) {
  const [childId, setChildId] = useState(defaultChildId ?? childOptions[0]?.id ?? "");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: "1", unitPrice: "" }]);

  const selectedChild = childOptions.find((c) => c.id === childId);
  const total = useMemo(
    () => items.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0), 0),
    [items]
  );

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <Label htmlFor="childId">Child</Label>
          <Select id="childId" name="childId" required value={childId} onChange={(e) => setChildId(e.target.value)}>
            {childOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor="parentId">Bill to</Label>
          <Select id="parentId" name="parentId" required defaultValue="">
            <option value="" disabled>
              Select parent…
            </option>
            {selectedChild?.parents.map((p) => (
              <option key={p.parent.id} value={p.parent.id}>
                {p.parent.name} {p.isPrimaryContact && "(primary)"}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor="dueDate">Due date</Label>
          <Input id="dueDate" name="dueDate" type="date" required />
        </Field>
      </div>

      <div>
        <Label>Line items</Label>
        <div className="mt-2 space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-2 sm:flex-nowrap">
              <input
                name="description"
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                placeholder="Description"
                className="min-w-[10rem] flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
              <input
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={item.quantity}
                onChange={(e) => updateItem(i, { quantity: e.target.value })}
                className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
              <input
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="£ price"
                value={item.unitPrice}
                onChange={(e) => updateItem(i, { unitPrice: e.target.value })}
                className="w-28 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-sm text-red-500 hover:underline"
                disabled={items.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, { description: "", quantity: "1", unitPrice: "" }])}
          className="mt-2 text-sm font-medium text-brand-600 hover:underline"
        >
          + Add line item
        </button>
      </div>

      <div className="flex justify-end text-sm font-semibold text-gray-900">Total: {formatCurrency(total)}</div>

      <Field>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </Field>

      <div className="flex gap-3">
        <Button type="submit">Create invoice</Button>
        <LinkButton href="/admin/invoices" variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
