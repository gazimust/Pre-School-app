"use client";

import { useMemo, useState } from "react";
import { Field, Label, Input, Select, Textarea } from "@/components/ui/Form";
import { Button, LinkButton } from "@/components/ui/Button";

type ChildOption = { id: string; firstName: string; lastName: string; dateOfBirth: string };
type AreaOption = { id: string; name: string; type: "PRIME" | "SPECIFIC"; description: string | null };

function ageBandFor(dob: string): "BIRTH_TO_THREE" | "THREE_TO_FOUR" {
  const months =
    (new Date().getFullYear() - new Date(dob).getFullYear()) * 12 +
    (new Date().getMonth() - new Date(dob).getMonth());
  return months < 36 ? "BIRTH_TO_THREE" : "THREE_TO_FOUR";
}

export function ObservationForm({
  action,
  childOptions,
  areas,
  defaultChildId,
}: {
  action: (formData: FormData) => void;
  childOptions: ChildOption[];
  areas: AreaOption[];
  defaultChildId?: string;
}) {
  const [childId, setChildId] = useState(defaultChildId ?? childOptions[0]?.id ?? "");
  const selectedChild = childOptions.find((c) => c.id === childId);
  const suggestedBand = selectedChild ? ageBandFor(selectedChild.dateOfBirth) : "BIRTH_TO_THREE";

  const prime = useMemo(() => areas.filter((a) => a.type === "PRIME"), [areas]);
  const specific = useMemo(() => areas.filter((a) => a.type === "SPECIFIC"), [areas]);

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
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
        </Field>
        <Field>
          <Label htmlFor="ageBand">EYFS age band</Label>
          <Select id="ageBand" name="ageBand" required key={suggestedBand} defaultValue={suggestedBand}>
            <option value="BIRTH_TO_THREE">Birth to Three</option>
            <option value="THREE_TO_FOUR">Three and Four-Year-Olds</option>
          </Select>
        </Field>
      </div>

      <Field>
        <Label htmlFor="title">Observation title</Label>
        <Input id="title" name="title" required placeholder="e.g. Building a tower with friends" />
      </Field>

      <Field>
        <Label htmlFor="narrative">What did you observe?</Label>
        <Textarea id="narrative" name="narrative" rows={4} required placeholder="Describe what the child did, said, and how they engaged…" />
      </Field>

      <div>
        <Label>EYFS areas of learning covered</Label>
        <p className="mb-2 text-xs text-gray-500">Select all areas this observation demonstrates progress in.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-brand-600">Prime areas</p>
            <div className="space-y-2">
              {prime.map((area) => (
                <label key={area.id} className="flex items-start gap-2 text-sm text-gray-700">
                  <input type="checkbox" name="areaIds" value={area.id} className="mt-0.5 rounded border-gray-300" />
                  <span>{area.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-leaf-600">Specific areas</p>
            <div className="space-y-2">
              {specific.map((area) => (
                <label key={area.id} className="flex items-start gap-2 text-sm text-gray-700">
                  <input type="checkbox" name="areaIds" value={area.id} className="mt-0.5 rounded border-gray-300" />
                  <span>{area.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Field>
        <Label htmlFor="nextSteps">Next steps</Label>
        <Textarea id="nextSteps" name="nextSteps" rows={3} placeholder="What will staff plan next to support this child's development?" />
      </Field>

      <div className="flex gap-3">
        <Button type="submit">Save observation</Button>
        <LinkButton href="/admin/observations" variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
